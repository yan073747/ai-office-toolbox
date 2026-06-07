import { NextResponse } from "next/server";
import { getCurrentServerUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentServerUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "请先登录后查看订单。" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      planName: true,
      planPrice: true,
      planCount: true,
      status: true,
      paymentMethod: true,
      paymentTime: true,
      createdAt: true,
      paidAt: true
    }
  });

  return NextResponse.json({
    ok: true,
    orders: orders.map((order) => ({
      ...order,
      paymentTime: order.paymentTime?.toISOString() || null,
      createdAt: order.createdAt.toISOString(),
      paidAt: order.paidAt?.toISOString() || null
    }))
  });
}
