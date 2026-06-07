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
    return NextResponse.json({ ok: false, message: "请选择要删除的联系表单。" }, { status: 400 });
  }

  const result = await prisma.contactSubmission.deleteMany({
    where: { id: { in: uniqueIds } }
  });

  return NextResponse.json({
    ok: true,
    deleted: result.count,
    message: `已删除 ${result.count} 条本地联系表单记录，飞书多维表格数据不会受影响。`
  });
}
