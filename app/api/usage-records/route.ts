import { NextResponse } from "next/server";
import { getCurrentServerUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";

function readPositiveInt(value: string | null, fallback: number, max: number) {
  const numberValue = Number(value);
  if (!Number.isInteger(numberValue) || numberValue <= 0) return fallback;
  return Math.min(numberValue, max);
}

function parseDate(value: string | null, endOfDay = false) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }
  return date;
}

export async function GET(request: Request) {
  const user = await getCurrentServerUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "请先登录后查看使用记录。" }, { status: 401 });
  }

  const searchParams = new URL(request.url).searchParams;
  const page = readPositiveInt(searchParams.get("page"), 1, 10000);
  const pageSize = readPositiveInt(searchParams.get("pageSize"), 10, 50);
  const toolId = searchParams.get("toolId") || "";
  const dateFrom = parseDate(searchParams.get("dateFrom"));
  const dateTo = parseDate(searchParams.get("dateTo"), true);
  const where = {
    userId: user.id,
    ...(toolId && toolId !== "all" ? { toolId } : {}),
    ...(dateFrom || dateTo
      ? {
          createdAt: {
            ...(dateFrom ? { gte: dateFrom } : {}),
            ...(dateTo ? { lte: dateTo } : {})
          }
        }
      : {})
  };

  const [total, records] = await Promise.all([
    prisma.usageRecord.count({ where }),
    prisma.usageRecord.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        toolId: true,
        toolName: true,
        inputType: true,
        status: true,
        quotaUsed: true,
        errorMessage: true,
        createdAt: true
      }
    })
  ]);

  return NextResponse.json({
    ok: true,
    records,
    items: records,
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize))
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  // Usage records should normally be written by the server-side tool execution
  // flow after a successful Dify result, not directly trusted from frontend.
  return NextResponse.json({
    ok: true,
    mode: "production-skeleton",
    received: body,
    note: "Usage record write skeleton only; frontend-submitted records must not be trusted in production."
  });
}
