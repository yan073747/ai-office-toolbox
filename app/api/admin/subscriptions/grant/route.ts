import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { PLAN_DEFINITIONS, getPlanDefinition } from "@/lib/plans";
import { getCurrentServerUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const user = await getCurrentServerUser();
  if (!user) return NextResponse.json({ ok: false, message: "请先登录。" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ ok: false, message: "无权开通套餐。" }, { status: 403 });
  return null;
}

function getPlanExpiry(durationDays: number) {
  return new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json().catch(() => ({}));
  const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";

  if (orderId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        userEmail: true,
        planName: true,
        planCount: true,
        status: true,
        paymentMethod: true
      }
    });
    if (!order) {
      return NextResponse.json({ ok: false, message: "订单不存在。" }, { status: 404 });
    }
    if (order.status === "paid") {
      return NextResponse.json({ ok: false, message: "订单已确认收款，请勿重复开通。" }, { status: 409 });
    }
    if (order.status !== "claimed_paid" && order.status !== "pending") {
      return NextResponse.json({ ok: false, message: "订单状态不可确认收款。" }, { status: 400 });
    }

    const plan = PLAN_DEFINITIONS.find((item) => item.name === order.planName && item.credits === order.planCount) || PLAN_DEFINITIONS.find((item) => item.credits === order.planCount);
    if (!plan) {
      return NextResponse.json({ ok: false, message: "订单套餐无法匹配，请检查套餐配置。" }, { status: 400 });
    }

    const expiresAt = getPlanExpiry(plan.durationDays);
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const subscription = await tx.subscription.create({
        data: {
          userId: order.userId,
          plan: plan.id,
          status: "active",
          credits: plan.credits,
          expiresAt
        }
      });

      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: "paid",
          paymentStatus: "paid",
          paidAt: new Date()
        }
      });

      await tx.user.update({
        where: { id: order.userId },
        data: {
          currentPlan: plan.id,
          remainingQuota: plan.credits,
          planExpiry: expiresAt
        }
      });

      return { subscription, order: updatedOrder };
    });

    return NextResponse.json({
      ok: true,
      message: "已确认收款，套餐已开通。",
      order: {
        id: result.order.id,
        status: result.order.status,
        paidAt: result.order.paidAt?.toISOString() || null
      },
      subscription: {
        id: result.subscription.id,
        userId: result.subscription.userId,
        plan: result.subscription.plan,
        status: result.subscription.status,
        credits: result.subscription.credits,
        expiresAt: result.subscription.expiresAt?.toISOString() || null
      }
    });
  }

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

  const expiresAt = getPlanExpiry(plan.durationDays);
  const subscription = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const nextSubscription = await tx.subscription.create({
      data: {
        userId: targetUser.id,
        plan: plan.id,
        status: "active",
        credits: plan.credits,
        expiresAt
      }
    });
    await tx.user.update({
      where: { id: targetUser.id },
      data: {
        currentPlan: plan.id,
        remainingQuota: plan.credits,
        planExpiry: expiresAt
      }
    });
    return nextSubscription;
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
