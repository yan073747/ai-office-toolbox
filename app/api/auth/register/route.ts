import { NextResponse } from "next/server";
import { hashAuditValue, writeAuditLog } from "@/lib/audit-log";
import { getEmailConfigStatus } from "@/lib/email";
import { getIpHash, getRateLimitKey, isRateLimited, recordRateLimitEvent } from "@/lib/rate-limit";
import { registerUserServer } from "@/lib/server-auth";

const REGISTER_ACTION = "auth.register.verification_sent";
const REGISTER_WINDOW_MS = 10 * 60 * 1000;
const REGISTER_EMAIL_WINDOW_MS = 60 * 1000;
const REGISTER_EMAIL_MAX = 1;
const REGISTER_IP_MAX = 10;
const REGISTER_LIMIT_MESSAGE = "验证码发送过于频繁，请稍后再试。";
const EMAIL_SERVICE_MESSAGE = "邮件服务暂时不可用，请稍后重试。";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, message: "请输入有效的邮箱。" }, { status: 400 });
  }
  const password = typeof body.password === "string" ? body.password : "";
  const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : password;
  if (password.length < 6) {
    return NextResponse.json({ ok: false, message: "密码至少需要 6 位。" }, { status: 400 });
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ ok: false, message: "两次输入的密码不一致。" }, { status: 400 });
  }

  const emailHash = hashAuditValue(email);
  const ipHash = getIpHash(request);
  const emailKey = getRateLimitKey("email", email);
  const ipKey = getRateLimitKey("ip", ipHash);
  const emailConfig = getEmailConfigStatus();

  if (!emailConfig.ready) {
    await writeAuditLog({
      request,
      event: "auth.register.email_unavailable",
      level: "error",
      message: "Registration email is not configured.",
      metadata: {
        emailHash,
        missing: emailConfig.missing
      }
    });
    return NextResponse.json({ ok: false, message: EMAIL_SERVICE_MESSAGE }, { status: 500 });
  }

  const [emailLimit, ipLimit] = await Promise.all([
    isRateLimited({
      key: emailKey,
      action: REGISTER_ACTION,
      windowMs: REGISTER_EMAIL_WINDOW_MS,
      max: REGISTER_EMAIL_MAX
    }),
    isRateLimited({
      key: ipKey,
      action: REGISTER_ACTION,
      windowMs: REGISTER_WINDOW_MS,
      max: REGISTER_IP_MAX
    })
  ]);

  if (emailLimit.limited || ipLimit.limited) {
    await writeAuditLog({
      request,
      event: "auth.register.rate_limited",
      level: "warn",
      message: REGISTER_LIMIT_MESSAGE,
      metadata: {
        emailHash,
        ipHash,
        status: 429,
        limitedBy: emailLimit.limited ? "email" : "ip"
      }
    });
    return NextResponse.json({ ok: false, message: REGISTER_LIMIT_MESSAGE }, { status: 429 });
  }

  await Promise.all([
    recordRateLimitEvent(emailKey, REGISTER_ACTION),
    recordRateLimitEvent(ipKey, REGISTER_ACTION)
  ]);

  const result = await registerUserServer(body);

  if (!result.ok) {
    await writeAuditLog({
      request,
      event: "auth.register.failed",
      level: result.status >= 500 ? "error" : "warn",
      message: result.message,
      metadata: {
        emailHash,
        ipHash,
        status: result.status
      }
    });
    return NextResponse.json({ ok: false, message: result.message }, { status: result.status });
  }

  await writeAuditLog({
    request,
    userId: result.user?.id,
    event: "auth.register.verification_sent",
    metadata: {
      emailHash
    }
  });

  return NextResponse.json({
    ok: true,
    message: result.message || "验证码已发送，请查收邮件。",
    email: result.email,
    user: result.user
  });
}
