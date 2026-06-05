import { prisma } from "@/lib/prisma";
import { hashAuditValue } from "@/lib/audit-log";

export const LOGIN_RATE_LIMIT_MESSAGE = "连续失败次数过多，请稍后再试。";

type RateLimitCheckInput = {
  key: string;
  action: string;
  windowMs: number;
  max: number;
};

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || request.headers.get("cf-connecting-ip") || "unknown";
}

export function getRateLimitKey(scope: "email" | "ip" | "user" | "tool", value: string | null | undefined) {
  return `${scope}:${hashAuditValue(value) || "unknown"}`;
}

export function getIpHash(request: Request) {
  return hashAuditValue(getClientIp(request));
}

export async function countRateLimitEvents({ key, action, windowMs }: Omit<RateLimitCheckInput, "max">) {
  const createdAfter = new Date(Date.now() - windowMs);
  try {
    return await prisma.rateLimitEvent.count({
      where: {
        key,
        action,
        createdAt: { gte: createdAfter }
      }
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Rate limit count failed:", error instanceof Error ? error.message : "unknown");
    }
    return 0;
  }
}

export async function isRateLimited(input: RateLimitCheckInput) {
  const count = await countRateLimitEvents(input);
  return {
    limited: count >= input.max,
    count
  };
}

export async function recordRateLimitEvent(key: string, action: string) {
  try {
    await prisma.rateLimitEvent.create({
      data: {
        key,
        action
      }
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Rate limit record failed:", error instanceof Error ? error.message : "unknown");
    }
  }
}

export async function clearRateLimitEvents(keys: string[], action: string) {
  try {
    await prisma.rateLimitEvent.deleteMany({
      where: {
        key: { in: keys },
        action
      }
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Rate limit clear failed:", error instanceof Error ? error.message : "unknown");
    }
  }
}
