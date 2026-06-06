import { NextResponse } from "next/server";
import { getActiveSubscriptionSummary, getToolFreeUsage } from "@/lib/server-quota";
import { getCurrentServerUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";

function readPositiveInt(value: string | null, fallback: number, max: number) {
  const numberValue = Number(value);
  if (!Number.isInteger(numberValue) || numberValue <= 0) return fallback;
  return Math.min(numberValue, max);
}

async function requireAdmin() {
  const user = await getCurrentServerUser();
  if (!user) return NextResponse.json({ ok: false, message: "请先登录。" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ ok: false, message: "无权访问管理员数据。" }, { status: 403 });
  return null;
}

export async function GET(request: Request, context: { params: Promise<{ userId: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { userId } = await context.params;
  const searchParams = new URL(request.url).searchParams;
  const page = readPositiveInt(searchParams.get("page"), 1, 10000);
  const pageSize = readPositiveInt(searchParams.get("pageSize"), 12, 50);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true }
  });
  if (!user) {
    return NextResponse.json({ ok: false, message: "用户不存在。" }, { status: 404 });
  }

  const [freeUsage, subscription, total, records] = await Promise.all([
    getToolFreeUsage(user.id),
    getActiveSubscriptionSummary(user.id),
    prisma.usageRecord.count({ where: { userId: user.id } }),
    prisma.usageRecord.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        toolId: true,
        toolName: true,
        status: true,
        quotaUsed: true,
        errorMessage: true,
        createdAt: true
      }
    })
  ]);

  return NextResponse.json({
    ok: true,
    user,
    freeUsage,
    subscription,
    records,
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize))
  });
}
