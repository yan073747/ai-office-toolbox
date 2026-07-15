import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

export type AuditLogLevel = "info" | "warn" | "error";

export type AuditLogInput = {
  request?: Request;
  userId?: string | null;
  event: string;
  level?: AuditLogLevel;
  message?: string;
  metadata?: Record<string, unknown>;
};

export function hashAuditValue(value: string | null | undefined) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return undefined;
  return createHash("sha256").update(normalized).digest("hex");
}

function readClientIp(request?: Request) {
  if (!request) return undefined;
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || undefined;
  return request.headers.get("x-real-ip") || request.headers.get("cf-connecting-ip") || undefined;
}

function sanitizeMetadata(metadata?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!metadata) return undefined;
  const sanitized = Object.fromEntries(
    Object.entries(metadata).filter(([key, value]) => {
      if (value === undefined) return false;
      return !/(password|token|secret|apiKey|api_key|fileContent)/i.test(key);
    })
  );
  return JSON.parse(JSON.stringify(sanitized)) as Record<string, unknown>;
}

export async function writeAuditLog(input: AuditLogInput) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId || null,
        event: input.event,
        level: input.level || "info",
        ip: readClientIp(input.request),
        userAgent: input.request?.headers.get("user-agent") || undefined,
        message: input.message,
        metadata: sanitizeMetadata(input.metadata)
      }
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Audit log write failed:", error instanceof Error ? error.message : "unknown");
    }
  }
}
