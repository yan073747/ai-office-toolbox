import { NextResponse } from "next/server";
import { hashAuditValue, writeAuditLog } from "@/lib/audit-log";
import { clearRateLimitEvents, getIpHash, getRateLimitKey, isRateLimited, LOGIN_RATE_LIMIT_MESSAGE, recordRateLimitEvent } from "@/lib/rate-limit";
import { loginUserServer } from "@/lib/server-auth";

const LOGIN_FAILED_ACTION = "auth.login.failed";
const LOGIN_FAILED_WINDOW_MS = 10 * 60 * 1000;
const LOGIN_FAILED_MAX = 5;

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
      action: LOGIN_FAILED_ACTION,
      windowMs: LOGIN_FAILED_WINDOW_MS,
      max: LOGIN_FAILED_MAX
    }),
    isRateLimited({
      key: ipKey,
      action: LOGIN_FAILED_ACTION,
      windowMs: LOGIN_FAILED_WINDOW_MS,
      max: LOGIN_FAILED_MAX
    })
  ]);

  if (emailLimit.limited || ipLimit.limited) {
    await writeAuditLog({
      request,
      event: "auth.login.rate_limited",
      level: "warn",
      message: LOGIN_RATE_LIMIT_MESSAGE,
      metadata: {
        emailHash,
        ipHash,
        status: 429,
        limitedBy: emailLimit.limited ? "email" : "ip"
      }
    });
    return NextResponse.json({ ok: false, message: LOGIN_RATE_LIMIT_MESSAGE }, { status: 429 });
  }

  const result = await loginUserServer(body);

  if (!result.ok) {
    await Promise.all([
      recordRateLimitEvent(emailKey, LOGIN_FAILED_ACTION),
      recordRateLimitEvent(ipKey, LOGIN_FAILED_ACTION)
    ]);
    await writeAuditLog({
      request,
      event: "auth.login.failed",
      level: "warn",
      message: result.message,
      metadata: {
        emailHash,
        status: result.status
      }
    });
    return NextResponse.json({ ok: false, message: result.message }, { status: result.status });
  }

  await clearRateLimitEvents([emailKey, ipKey], LOGIN_FAILED_ACTION);
  await writeAuditLog({
    request,
    userId: result.user?.id,
    event: "auth.login.success",
    metadata: {
      rememberMe: Boolean(body.rememberMe)
    }
  });

  return NextResponse.json({
    ok: true,
    user: result.user
  });
}
