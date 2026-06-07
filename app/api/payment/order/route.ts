import { NextResponse } from "next/server";
import { getCurrentServerUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";

function toOrderPayload(order: NonNullable<Awaited<ReturnType<typeof findOrderForResponse>>>) {
  return {
    id: order.id,
    userId: order.userId,
    userEmail: order.userEmail,
    planName: order.planName,
    planPrice: order.planPrice,
    planCount: order.planCount,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentTime: order.paymentTime?.toISOString() || null,
    paymentScreenshot: order.paymentScreenshot,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    paidAt: order.paidAt?.toISOString() || null
  };
}

async function findOrderForResponse(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      userId: true,
      userEmail: true,
      planName: true,
      planPrice: true,
      planCount: true,
      status: true,
      paymentMethod: true,
      paymentTime: true,
      paymentScreenshot: true,
      createdAt: true,
      updatedAt: true,
      paidAt: true
    }
  });
}

export async function GET(request: Request) {
  const user = await getCurrentServerUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "请先登录。" }, { status: 401 });
  }

  const orderId = new URL(request.url).searchParams.get("orderId") || "";
  if (!orderId) {
    return NextResponse.json({ ok: false, message: "缺少订单号。" }, { status: 400 });
  }

  const order = await findOrderForResponse(orderId);
  if (!order) {
    return NextResponse.json({ ok: false, message: "订单不存在。" }, { status: 404 });
  }
  if (order.userId !== user.id && user.role !== "admin") {
    return NextResponse.json({ ok: false, message: "无权查看该订单。" }, { status: 403 });
  }

  return NextResponse.json({ ok: true, order: toOrderPayload(order) });
}
