import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { writeAuditLog } from "@/lib/audit-log";
import { clearSession, hashPassword } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const token = String(body.token || "");
  const password = String(body.password || "");
  const confirmPassword = String(body.confirmPassword || password);

  if (!token) {
    await writeAuditLog({
      request,
      event: "auth.password_reset.token_invalid",
      level: "warn",
      metadata: { reason: "missing" }
    });
    return NextResponse.json({ ok: false, message: "重置链接无效或已过期。" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ ok: false, message: "密码至少需要 6 位。" }, { status: 400 });
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ ok: false, message: "两次输入的密码不一致。" }, { status: 400 });
  }

  const resetToken = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash: hashToken(token),
      usedAt: null,
      expiresAt: { gt: new Date() }
    },
    select: { id: true, userId: true }
  });

  if (!resetToken) {
    await writeAuditLog({
      request,
      event: "auth.password_reset.token_invalid",
      level: "warn",
      metadata: { reason: "invalid_or_expired" }
    });
    return NextResponse.json({ ok: false, message: "重置链接无效或已过期。" }, { status: 400 });
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
