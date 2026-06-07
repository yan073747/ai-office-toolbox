import { NextResponse } from "next/server";
import { getCurrentServerUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const user = await getCurrentServerUser();
  if (!user) return NextResponse.json({ ok: false, message: "请先登录。" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ ok: false, message: "无权操作管理员后台。" }, { status: 403 });
  return null;
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json().catch(() => ({}));
  const ids: string[] = Array.isArray(body.ids)
    ? body.ids.map((id: unknown) => String(id).trim()).filter((id: string) => id.length > 0)
    : [];
  const uniqueIds = Array.from(new Set(ids));

  if (!uniqueIds.length) {
    return NextResponse.json({ ok: false, message: "请选择要删除的订单。" }, { status: 400 });
  }

  const existing = await prisma.order.findMany({
    where: { id: { in: uniqueIds } },
    select: { id: true, status: true }
  });
  const deletableIds = existing.filter((order) => order.status === "pending").map((order) => order.id);
  const skipped = existing.length - deletableIds.length;

  if (!deletableIds.length) {
    return NextResponse.json({ ok: false, message: "没有可删除的待付款订单。已提交付款或已确认订单不能删除。" }, { status: 400 });
  }

  const result = await prisma.order.deleteMany({
    where: {
      id: { in: deletableIds },
      status: "pending"
    }
  });

  return NextResponse.json({
    ok: true,
    deleted: result.count,
    skipped,
    message: skipped > 0 ? `已删除 ${result.count} 条待付款订单，跳过 ${skipped} 条不可删除订单。` : `已删除 ${result.count} 条待付款订单。`
  });
}
