import { NextResponse } from "next/server";
import { createHash, randomInt } from "node:crypto";
import { hashAuditValue, writeAuditLog } from "@/lib/audit-log";
import { getEmailConfigStatus, sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { getIpHash, getRateLimitKey, isRateLimited, recordRateLimitEvent } from "@/lib/rate-limit";

const RESET_CODE_TTL_MS = 15 * 60 * 1000;
const RESET_RESEND_COOLDOWN_MS = 60 * 1000;
const CODE_SENT_MESSAGE = "已发送验证码";
const PASSWORD_RESET_ACTION = "auth.password_reset.requested";
const EMAIL_RESET_WINDOW_MS = 60 * 1000;
const IP_RESET_WINDOW_MS = 10 * 60 * 1000;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function createResetCode() {
  return String(randomInt(100000, 1000000));
}

function hashResetCode(email: string, code: string) {
  return createHash("sha256").update(`${email}:${code}`).digest("hex");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = normalizeEmail(String(body.email || ""));

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ ok: false, message: "请输入有效的邮箱。" }, { status: 400 });
  }
  const emailHash = hashAuditValue(email);
  const ipHash = getIpHash(request);
  const emailKey = getRateLimitKey("email", email);
  const ipKey = getRateLimitKey("ip", ipHash);

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
    return NextResponse.json({ ok: false, message: "该邮箱未注册，请先去注册。" }, { status: 404 });
  }

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
      userId: user.id,
      metadata: {
        emailHash,
        ipHash,
        limitedBy: emailLimit.limited ? "email" : "ip",
        status: 200
      }
    });
    return NextResponse.json({ ok: true, message: CODE_SENT_MESSAGE });
  }

  await Promise.all([
    recordRateLimitEvent(emailKey, PASSWORD_RESET_ACTION),
    recordRateLimitEvent(ipKey, PASSWORD_RESET_ACTION)
  ]);

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
    return NextResponse.json({ ok: true, message: CODE_SENT_MESSAGE });
  }

  const code = createResetCode();

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
      tokenHash: hashResetCode(user.email, code),
      expiresAt: new Date(Date.now() + RESET_CODE_TTL_MS)
    }
  });

  try {
    await sendEmail({
      to: user.email,
      subject: "AI办公工具箱密码重置验证码",
      text: `你的密码重置验证码是：${code}。验证码 15 分钟内有效。如果不是你本人操作，可以忽略这封邮件。`,
      html: `<p>你的密码重置验证码是：</p><p style="font-size:24px;font-weight:700;letter-spacing:4px;">${code}</p><p>验证码 15 分钟内有效。如果不是你本人操作，可以忽略这封邮件。</p>`
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

  return NextResponse.json({ ok: true, message: CODE_SENT_MESSAGE });
}
