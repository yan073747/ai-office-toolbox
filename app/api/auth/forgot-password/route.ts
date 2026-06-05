import { NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { hashAuditValue, writeAuditLog } from "@/lib/audit-log";
import { getAppBaseUrl, getEmailConfigStatus, sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { getIpHash, getRateLimitKey, isRateLimited, recordRateLimitEvent } from "@/lib/rate-limit";

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;
const RESET_RESEND_COOLDOWN_MS = 60 * 1000;
const GENERIC_MESSAGE = "如果该邮箱已注册，我们会发送重置密码邮件。";
const PASSWORD_RESET_ACTION = "auth.password_reset.requested";
const EMAIL_RESET_WINDOW_MS = 60 * 1000;
const IP_RESET_WINDOW_MS = 10 * 60 * 1000;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = normalizeEmail(String(body.email || ""));

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
  }
  const emailHash = hashAuditValue(email);
  const ipHash = getIpHash(request);
  const emailKey = getRateLimitKey("email", email);
  const ipKey = getRateLimitKey("ip", ipHash);
  const [emailLimit, ipLimit] = await Promise.all([
    isRateLimited({
      key: emailKey,
      action: PASSWORD_RESET_ACTION,
      windowMs: EMAIL_RESET_WINDOW_MS,
      max: 1
    }),
    isRateLimited({
      key: ipKey,
      action: PASSWORD_RESET_ACTION,
      windowMs: IP_RESET_WINDOW_MS,
      max: 10
    })
  ]);

  if (emailLimit.limited || ipLimit.limited) {
    await writeAuditLog({
      request,
      event: "auth.password_reset.rate_limited",
      level: "warn",
      metadata: {
        emailHash,
        ipHash,
        limitedBy: emailLimit.limited ? "email" : "ip",
        status: 200
      }
    });
    return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
  }

  await Promise.all([
    recordRateLimitEvent(emailKey, PASSWORD_RESET_ACTION),
    recordRateLimitEvent(ipKey, PASSWORD_RESET_ACTION)
  ]);

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true }
  });

  await writeAuditLog({
    request,
    userId: user?.id,
    event: "auth.password_reset.requested",
    metadata: { emailHash }
  });

  if (!user) {
    return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
  }

  const emailConfig = getEmailConfigStatus();
  if (!emailConfig.ready) {
    console.warn("Password reset email is not configured:", emailConfig.missing.join(", "));
    await writeAuditLog({
      request,
      userId: user.id,
      event: "auth.password_reset.email_failed",
      level: "error",
      message: "Password reset email is not configured.",
      metadata: {
        emailHash,
        reason: "email_config"
      }
    });
    return NextResponse.json({ ok: false, message: "邮件服务暂时不可用，请稍后重试。" }, { status: 500 });
  }

  const recentToken = await prisma.passwordResetToken.findFirst({
    where: {
      userId: user.id,
      usedAt: null,
      createdAt: { gt: new Date(Date.now() - RESET_RESEND_COOLDOWN_MS) }
    },
    select: { id: true }
  });

  if (recentToken) {
    return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
  }

  const token = randomBytes(32).toString("base64url");
  const resetUrl = `${getAppBaseUrl()}/reset-password?token=${encodeURIComponent(token)}`;

  await prisma.passwordResetToken.updateMany({
    where: {
      userId: user.id,
      usedAt: null
    },
    data: {
      usedAt: new Date()
    }
  });

  const resetToken = await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS)
    }
  });

  try {
    await sendEmail({
      to: user.email,
      subject: "AI办公工具箱密码重置",
      text: `请在 30 分钟内打开以下链接重置密码：${resetUrl}`,
      html: `<p>请在 30 分钟内打开以下链接重置密码：</p><p><a href="${resetUrl}">重置密码</a></p><p>如果不是你本人操作，可以忽略这封邮件。</p>`
    });
  } catch (error) {
    console.error("Password reset email failed:", error instanceof Error ? error.message : "unknown");
    await writeAuditLog({
      request,
      userId: user.id,
      event: "auth.password_reset.email_failed",
      level: "error",
      message: error instanceof Error ? error.message : "unknown",
      metadata: {
        emailHash,
        reason: "send_failed"
      }
    });
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() }
    });
    return NextResponse.json({ ok: false, message: "邮件服务暂时不可用，请稍后重试。" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
}
