import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { writeAuditLog } from "@/lib/audit-log";
import { clearSession, hashPassword } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashResetCode(email: string, code: string) {
  return createHash("sha256").update(`${email}:${code}`).digest("hex");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const token = String(body.token || "");
  const email = normalizeEmail(String(body.email || ""));
  const code = String(body.code || "").trim();
  const password = String(body.password || "");
  const confirmPassword = String(body.confirmPassword || password);
  const isCodeFlow = Boolean(email || code);

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
  if (isCodeFlow && !/^\d{6}$/.test(code)) {
    await writeAuditLog({
      request,
      event: "auth.password_reset.token_invalid",
      level: "warn",
      metadata: { reason: "invalid_code_format" }
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
    await writeAuditLog({
      request,
      event: "auth.password_reset.token_invalid",
      level: "warn",
      metadata: { reason: "email_not_found" }
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
    await writeAuditLog({
      request,
      event: "auth.password_reset.token_invalid",
      level: "warn",
      metadata: { reason: "invalid_or_expired" }
    });
    return NextResponse.json({ ok: false, message: isCodeFlow ? "验证码错误请重新输入。" : "重置链接无效或已过期。" }, { status: 400 });
  }

  if (resetToken.expiresAt <= new Date()) {
    await writeAuditLog({
      request,
      userId: resetToken.userId,
      event: "auth.password_reset.token_invalid",
      level: "warn",
      metadata: { reason: "expired" }
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

  await clearSession();
  return NextResponse.json({ ok: true, message: "密码已重置，请重新登录。" });
}
