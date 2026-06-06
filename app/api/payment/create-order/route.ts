import { NextResponse } from "next/server";
import { PLAN_DEFINITIONS, getPlanDefinition } from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { getCurrentServerUser } from "@/lib/server-auth";

export async function POST(request: Request) {
  const user = await getCurrentServerUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "请先登录后购买套餐。" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const plan = getPlanDefinition(String(body.plan || body.planId || ""));
  if (!plan) {
    return NextResponse.json(
      {
        ok: false,
        message: "套餐不存在。",
        plans: PLAN_DEFINITIONS.map((item) => ({ id: item.id, name: item.name, price: item.price }))
      },
      { status: 400 }
    );
  }

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      planName: plan.name,
      amount: plan.price,
      quotaAmount: plan.unlimited ? 0 : plan.credits,
      paymentProvider: "manual",
      paymentStatus: "pending"
    }
  });

  return NextResponse.json({
    ok: true,
    mode: "payment-provider-not-connected",
    order: {
      id: order.id,
      planName: order.planName,
      amount: order.amount.toString(),
      quotaAmount: order.quotaAmount,
      paymentProvider: order.paymentProvider,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt.toISOString()
    },
    message: "订单已创建。当前版本尚未接入真实支付回调，请联系作者开通套餐。"
  });
}
