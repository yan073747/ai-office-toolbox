import { NextResponse } from "next/server";
import { hashAuditValue, writeAuditLog } from "@/lib/audit-log";
import { getIpHash, getRateLimitKey, isRateLimited, recordRateLimitEvent } from "@/lib/rate-limit";
import { registerUserServer } from "@/lib/server-auth";

const REGISTER_ACTION = "auth.register.requested";
const REGISTER_WINDOW_MS = 10 * 60 * 1000;
const REGISTER_EMAIL_MAX = 3;
const REGISTER_IP_MAX = 5;
const REGISTER_LIMIT_MESSAGE = "注册请求过于频繁，请稍后再试。";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const emailHash = hashAuditValue(email);
  const ipHash = getIpHash(request);
  const emailKey = getRateLimitKey("email", email);
  const ipKey = getRateLimitKey("ip", ipHash);
  const [emailLimit, ipLimit] = await Promise.all([
    isRateLimited({
      key: emailKey,
      action: REGISTER_ACTION,
      windowMs: REGISTER_WINDOW_MS,
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
    return NextResponse.json({ ok: false, message: result.message }, { status: result.status });
  }

  await writeAuditLog({
    request,
    userId: result.user?.id,
    event: "auth.register.success",
    metadata: {
      emailHash
    }
  });

  return NextResponse.json({
    ok: true,
    user: result.user
  });
}
