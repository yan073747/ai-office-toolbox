import { NextResponse } from "next/server";
import { PLAN_DEFINITIONS, getPlanDefinition } from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { getCurrentServerUser } from "@/lib/server-auth";

export async function POST(request: Request) {
  const user = await getCurrentServerUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "请先登录后购买套餐。" }, { status: 401 });
  }
  if (!user.isVerified) {
    return NextResponse.json({ ok: false, message: "请先完成邮箱验证后再购买套餐。" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const plan = getPlanDefinition(String(body.plan || body.planId || ""));
  if (!plan) {
    return NextResponse.json(
      {
        ok: false,
        message: "套餐不存在。",
        plans: PLAN_DEFINITIONS.map((item) => ({ id: item.id, name: item.name, price: item.price, credits: item.credits }))
      },
      { status: 400 }
    );
  }

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      userEmail: user.email,
      planName: plan.name,
      planPrice: plan.price,
      planCount: plan.credits,
      status: "pending",
      amount: plan.price,
      quotaAmount: plan.credits,
      paymentProvider: "manual",
      paymentStatus: "pending"
    }
  });

  return NextResponse.json({
    ok: true,
    order: {
      id: order.id,
      userEmail: order.userEmail,
      planName: order.planName,
      planPrice: order.planPrice,
      planCount: order.planCount,
      status: order.status,
      createdAt: order.createdAt.toISOString()
    },
    paymentUrl: `/payment/${order.id}`,
    message: "订单已创建，请扫码付款后提交付款信息。"
  });
}
