import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit-log";
import { getCurrentServerUser } from "@/lib/server-auth";
import { getServerQuota } from "@/lib/server-quota";
import { prisma } from "@/lib/prisma";

type SummaryRange = 7 | 30 | 90 | "all";
type SummaryRecord = {
  createdAt: Date;
  toolId: string;
  toolName: string;
  status: string;
  quotaUsed: number;
};

const allowedRanges = new Set(["7", "30", "90", "all"]);

function parseRangeDays(url: string): SummaryRange {
  const value = new URL(url).searchParams.get("range") || "30";
  if (value === "all") return "all";
  return allowedRanges.has(value) ? (Number(value) as 7 | 30 | 90) : 30;
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function buildTrendBuckets(rangeDays: number) {
  const today = startOfDay(new Date());
  const buckets: Array<{ date: string; total: number; success: number; failed: number; quotaUsed: number }> = [];

  for (let index = rangeDays - 1; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    buckets.push({
      date: toDateKey(date),
      total: 0,
      success: 0,
      failed: 0,
      quotaUsed: 0
    });
  }

  return buckets;
}

function buildAllTrendBuckets(records: SummaryRecord[]) {
  if (!records.length) return [];
  const today = startOfDay(new Date());
  const earliest = records.reduce((min, record) => {
    const day = startOfDay(record.createdAt);
    return day < min ? day : min;
  }, startOfDay(records[0].createdAt));
  const buckets: Array<{ date: string; total: number; success: number; failed: number; quotaUsed: number }> = [];

  for (let date = new Date(earliest); date <= today; date.setDate(date.getDate() + 1)) {
    buckets.push({
      date: toDateKey(date),
      total: 0,
      success: 0,
      failed: 0,
      quotaUsed: 0
    });
  }

  return buckets;
}

export async function GET(request: Request) {
  let userId: string | undefined;
  try {
    const user = await getCurrentServerUser();
    userId = user?.id;
    if (!user) {
      return NextResponse.json({ ok: false, message: "请先登录后查看使用概览。" }, { status: 401 });
    }

    const rangeDays = parseRangeDays(request.url);
    const startDate = rangeDays === "all" ? undefined : startOfDay(new Date());
    if (startDate && typeof rangeDays === "number") {
      startDate.setDate(startDate.getDate() - rangeDays + 1);
    }

    const [quota, records] = await Promise.all([
      getServerQuota(user.id),
      prisma.usageRecord.findMany({
        where: {
          userId: user.id,
          ...(startDate
            ? {
                createdAt: {
                  gte: startDate
                }
              }
            : {})
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          toolId: true,
          toolName: true,
          inputType: true,
          status: true,
          quotaUsed: true,
          createdAt: true
        }
      })
    ]);

    const trend = rangeDays === "all" ? buildAllTrendBuckets(records) : buildTrendBuckets(rangeDays);
    const trendByDate = new Map(trend.map((item) => [item.date, item]));
    const byTool = new Map<string, { toolId: string; toolName: string; count: number; quotaUsed: number }>();

    for (const record of records) {
      const dateKey = toDateKey(record.createdAt);
      const bucket = trendByDate.get(dateKey);
      if (bucket) {
        bucket.total += 1;
        bucket.quotaUsed += record.quotaUsed;
        if (record.status === "success") {
          bucket.success += 1;
        } else {
          bucket.failed += 1;
        }
      }

      const current = byTool.get(record.toolId) || {
        toolId: record.toolId,
        toolName: record.toolName,
        count: 0,
        quotaUsed: 0
      };
      current.count += 1;
      current.quotaUsed += record.quotaUsed;
      byTool.set(record.toolId, current);
    }

    const totalCalls = records.length;
    const successfulCalls = records.filter((record) => record.status === "success").length;
    const failedCalls = totalCalls - successfulCalls;
    const latestRecord = records[0] || null;

    return NextResponse.json({
      ok: true,
      rangeDays,
      user: {
        id: user.id,
        email: user.email,
        planName: "免费体验版"
      },
      quota: {
        totalQuota: quota.totalQuota,
        usedQuota: quota.usedQuota,
        remainingQuota: quota.remainingQuota
      },
      totals: {
        totalCalls,
        successfulCalls,
        failedCalls,
        quotaUsed: records.reduce((total, record) => total + record.quotaUsed, 0)
      },
      latestRecord,
      trend,
      byTool: Array.from(byTool.values()).sort((left, right) => right.count - left.count)
    });
  } catch (error) {
    await writeAuditLog({
      request,
      userId,
      event: "dashboard.summary.failed",
      level: "error",
      message: error instanceof Error ? error.message : "unknown",
      metadata: {
        errorType: error instanceof Error ? error.name : "unknown",
        status: 500
      }
    });
    return NextResponse.json({ ok: false, message: "使用概览加载失败，请稍后重试。" }, { status: 500 });
  }
}
