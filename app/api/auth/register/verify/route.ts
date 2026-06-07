import { NextResponse } from "next/server";
import { hashAuditValue, writeAuditLog } from "@/lib/audit-log";
import { clearRateLimitEvents, getIpHash, getRateLimitKey, isRateLimited, recordRateLimitEvent } from "@/lib/rate-limit";
import { verifyRegisteredUserServer } from "@/lib/server-auth";

const VERIFY_FAILED_ACTION = "auth.register.verify_failed";
const VERIFY_FAILED_WINDOW_MS = 10 * 60 * 1000;
const VERIFY_FAILED_EMAIL_MAX = 5;
const VERIFY_FAILED_IP_MAX = 10;
const VERIFY_LIMIT_MESSAGE = "验证码错误次数过多，请稍后再试。";

async function recordVerifyFailure(emailKey: string, ipKey: string) {
  await Promise.all([
    recordRateLimitEvent(emailKey, VERIFY_FAILED_ACTION),
    recordRateLimitEvent(ipKey, VERIFY_FAILED_ACTION)
  ]);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";
  const emailHash = hashAuditValue(email);
  const ipHash = getIpHash(request);
  const emailKey = getRateLimitKey("email", email);
  const ipKey = getRateLimitKey("ip", ipHash);

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
      event: "auth.register.verify_rate_limited",
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

  const result = await verifyRegisteredUserServer({ email, code });

  if (!result.ok) {
    if (result.status === 400) {
      await recordVerifyFailure(emailKey, ipKey);
    }
    await writeAuditLog({
      request,
      event: "auth.register.verify_failed",
      level: "warn",
      message: result.message,
      metadata: {
        emailHash,
        ipHash,
        status: result.status
      }
    });
    return NextResponse.json({ ok: false, message: result.message }, { status: result.status });
  }

  await clearRateLimitEvents([emailKey, ipKey], VERIFY_FAILED_ACTION);
  await writeAuditLog({
    request,
    userId: result.user?.id,
    event: "auth.register.verify_success",
    metadata: {
      emailHash
    }
  });

  return NextResponse.json({
    ok: true,
    message: result.message || "邮箱验证成功。",
    user: result.user
  });
}
