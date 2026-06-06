import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { hashAuditValue, writeAuditLog } from "@/lib/audit-log";
import { clearSession, hashPassword } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import { clearRateLimitEvents, getIpHash, getRateLimitKey, isRateLimited, recordRateLimitEvent } from "@/lib/rate-limit";

const VERIFY_FAILED_ACTION = "auth.password_reset.verify_failed";
const VERIFY_FAILED_WINDOW_MS = 10 * 60 * 1000;
const VERIFY_FAILED_EMAIL_MAX = 5;
const VERIFY_FAILED_IP_MAX = 10;
const VERIFY_LIMIT_MESSAGE = "验证码错误次数过多，请稍后再试。";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashResetCode(email: string, code: string) {
  return createHash("sha256").update(`${email}:${code}`).digest("hex");
}

async function recordVerifyFailure(emailKey: string, ipKey: string) {
  await Promise.all([
    recordRateLimitEvent(emailKey, VERIFY_FAILED_ACTION),
    recordRateLimitEvent(ipKey, VERIFY_FAILED_ACTION)
  ]);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const token = String(body.token || "");
  const email = normalizeEmail(String(body.email || ""));
  const code = String(body.code || "").trim();
  const password = String(body.password || "");
  const confirmPassword = String(body.confirmPassword || password);
  const isCodeFlow = Boolean(email || code);
  const emailHash = hashAuditValue(email);
  const ipHash = getIpHash(request);
  const emailKey = getRateLimitKey("email", email);
  const ipKey = getRateLimitKey("ip", ipHash);

  if (!token && !isCodeFlow) {
    await writeAuditLog({
      request,
      event: "auth.password_reset.token_invalid",
      level: "warn",
      metadata: { reason: "missing" }
    });
    return NextResponse.json({ ok: false, message: "请输入验证码。" }, { status: 400 });
  }
  if (isCodeFlow && !code) {
    await writeAuditLog({
      request,
      event: "auth.password_reset.token_invalid",
      level: "warn",
      metadata: { reason: "missing_code" }
    });
    return NextResponse.json({ ok: false, message: "请输入验证码。" }, { status: 400 });
  }
  if (isCodeFlow) {
    const [emailLimit, ipLimit] = await Promise.all([
      isRateLimited({
        key: emailKey,
        action: VERIFY_FAILED_ACTION,
        windowMs: VERIFY_FAILED_WINDOW_MS,
        max: VERIFY_FAILED_EMAIL_MAX
      }),
      isRateLimited({
        key: ipKey,
        action: VERIFY_FAILED_ACTION,
        windowMs: VERIFY_FAILED_WINDOW_MS,
        max: VERIFY_FAILED_IP_MAX
      })
    ]);

    if (emailLimit.limited || ipLimit.limited) {
      await writeAuditLog({
        request,
        event: "auth.password_reset.verify_rate_limited",
        level: "warn",
        message: VERIFY_LIMIT_MESSAGE,
        metadata: {
          emailHash,
          ipHash,
          status: 429,
          limitedBy: emailLimit.limited ? "email" : "ip"
        }
      });
      return NextResponse.json({ ok: false, message: VERIFY_LIMIT_MESSAGE }, { status: 429 });
    }
  }
  if (isCodeFlow && !/^\d{6}$/.test(code)) {
    await recordVerifyFailure(emailKey, ipKey);
    await writeAuditLog({
      request,
      event: "auth.password_reset.token_invalid",
      level: "warn",
      metadata: { emailHash, reason: "invalid_code_format" }
    });
    return NextResponse.json({ ok: false, message: "验证码错误请重新输入。" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ ok: false, message: "密码至少需要 6 位。" }, { status: 400 });
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ ok: false, message: "两次输入的密码不一致。" }, { status: 400 });
  }

  const user = isCodeFlow
    ? await prisma.user.findUnique({
        where: { email },
        select: { id: true }
      })
    : null;

  if (isCodeFlow && !user) {
    await recordVerifyFailure(emailKey, ipKey);
    await writeAuditLog({
      request,
      event: "auth.password_reset.token_invalid",
      level: "warn",
      metadata: { emailHash, reason: "email_not_found" }
    });
    return NextResponse.json({ ok: false, message: "该邮箱未注册，请先去注册。" }, { status: 404 });
  }

  const tokenHash = isCodeFlow ? hashResetCode(email, code) : hashToken(token);
  const resetToken = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      ...(isCodeFlow ? { userId: user?.id || "__missing_user__" } : {}),
      usedAt: null
    },
    select: { id: true, userId: true, expiresAt: true }
  });

  if (!resetToken) {
    if (isCodeFlow) {
      await recordVerifyFailure(emailKey, ipKey);
    }
    await writeAuditLog({
      request,
      event: "auth.password_reset.token_invalid",
      level: "warn",
      metadata: { emailHash, reason: "invalid_or_expired" }
    });
    return NextResponse.json({ ok: false, message: isCodeFlow ? "验证码错误请重新输入。" : "重置链接无效或已过期。" }, { status: 400 });
  }

  if (resetToken.expiresAt <= new Date()) {
    if (isCodeFlow) {
      await recordVerifyFailure(emailKey, ipKey);
    }
    await writeAuditLog({
      request,
      userId: resetToken.userId,
      event: "auth.password_reset.token_invalid",
      level: "warn",
      metadata: { emailHash, reason: "expired" }
    });
    return NextResponse.json({ ok: false, message: isCodeFlow ? "验证码已过期，请重新获取新的验证码。" : "重置链接无效或已过期。" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash: await hashPassword(password) }
    }),
    prisma.passwordResetToken.updateMany({
      where: {
        userId: resetToken.userId,
        usedAt: null
      },
      data: {
        usedAt: new Date()
      }
    })
  ]);

  await writeAuditLog({
    request,
    userId: resetToken.userId,
    event: "auth.password_reset.success"
  });

  if (isCodeFlow) {
    await clearRateLimitEvents([emailKey, ipKey], VERIFY_FAILED_ACTION);
  }

  await clearSession();
  return NextResponse.json({ ok: true, message: "密码已重置，请重新登录。" });
}
