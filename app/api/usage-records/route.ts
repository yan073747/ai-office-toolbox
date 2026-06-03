import { NextResponse } from "next/server";
import { getCurrentServerUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentServerUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "请先登录后查看使用记录。" }, { status: 401 });
  }

  const records = await prisma.usageRecord.findMany({
    where: { userId: user.id },
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
  });

  return NextResponse.json({
    ok: true,
    records
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
