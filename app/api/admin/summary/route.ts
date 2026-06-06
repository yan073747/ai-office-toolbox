import { NextResponse } from "next/server";
import { getCurrentServerUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const user = await getCurrentServerUser();
  if (!user) return { user: null, response: NextResponse.json({ ok: false, message: "请先登录。" }, { status: 401 }) };
  if (user.role !== "admin") return { user: null, response: NextResponse.json({ ok: false, message: "无权访问管理员后台。" }, { status: 403 }) };
  return { user, response: null };
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const [userCount, contactCount, usageCount, orderCount, subscriptionCount, users, contacts, usageRecords, orders, subscriptions] = await Promise.all([
    prisma.user.count(),
    prisma.contactSubmission.count(),
    prisma.usageRecord.count(),
    prisma.order.count(),
    prisma.subscription.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        subscriptions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            plan: true,
            status: true,
            credits: true,
            expiresAt: true
          }
        }
      }
    }),
    prisma.contactSubmission.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        name: true,
        company: true,
        phone: true,
        wechat: true,
        email: true,
        industry: true,
        budget: true,
        createdAt: true
      }
    }),
    prisma.usageRecord.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        userId: true,
        toolId: true,
        toolName: true,
        status: true,
        quotaUsed: true,
        errorMessage: true,
        createdAt: true
      }
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        userId: true,
        planName: true,
        amount: true,
        quotaAmount: true,
        paymentStatus: true,
        paymentProvider: true,
        createdAt: true,
        paidAt: true
      }
    }),
    prisma.subscription.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        userId: true,
        plan: true,
        status: true,
        credits: true,
        expiresAt: true,
        createdAt: true
      }
    })
  ]);

  return NextResponse.json({
    ok: true,
    totals: {
      users: userCount,
      contacts: contactCount,
      usageRecords: usageCount,
      orders: orderCount,
      subscriptions: subscriptionCount
    },
    users,
    contacts,
    usageRecords,
    orders: orders.map((order) => ({ ...order, amount: order.amount.toString() })),
    subscriptions
  });
}
