import { NextResponse } from "next/server";
import { PLAN_DEFINITIONS, getPlanDefinition } from "@/lib/plans";
import { getCurrentServerUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const user = await getCurrentServerUser();
  if (!user) return NextResponse.json({ ok: false, message: "请先登录。" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ ok: false, message: "无权开通套餐。" }, { status: 403 });
  return null;
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const plan = getPlanDefinition(String(body.plan || ""));
  if (!email || !plan) {
    return NextResponse.json(
      {
        ok: false,
        message: "请填写用户邮箱并选择有效套餐。",
        plans: PLAN_DEFINITIONS.map((item) => ({ id: item.id, name: item.name }))
      },
      { status: 400 }
    );
  }

  const targetUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true }
  });
  if (!targetUser) {
    return NextResponse.json({ ok: false, message: "用户不存在。" }, { status: 404 });
  }

  const expiresAt = plan.durationDays ? new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000) : null;
  const subscription = await prisma.subscription.create({
    data: {
      userId: targetUser.id,
      plan: plan.id,
      status: "active",
      credits: plan.unlimited ? -1 : plan.credits,
      expiresAt
    }
  });

  return NextResponse.json({
    ok: true,
    message: "套餐已开通。",
    subscription: {
      id: subscription.id,
      userId: subscription.userId,
      plan: subscription.plan,
      status: subscription.status,
      credits: subscription.credits,
      expiresAt: subscription.expiresAt?.toISOString() || null
    }
  });
}
