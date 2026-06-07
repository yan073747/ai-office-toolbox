import { NextResponse } from "next/server";
import { getCurrentServerUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const user = await getCurrentServerUser();
  if (!user) return NextResponse.json({ ok: false, message: "请先登录。" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ ok: false, message: "无权导出管理员数据。" }, { status: 403 });
  return null;
}

function escapeCsv(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function toCsv(headers: string[], rows: unknown[][]) {
  return `\uFEFF${[headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\r\n")}`;
}

export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const type = new URL(request.url).searchParams.get("type") || "users";
  let filename = "admin-export.csv";
  let csv = "";

  if (type === "contacts") {
    const rows = await prisma.contactSubmission.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
    filename = "contact-submissions.csv";
    csv = toCsv(
      ["时间", "姓名", "公司", "手机", "微信", "邮箱", "行业", "预算", "需求描述"],
      rows.map((row) => [row.createdAt.toISOString(), row.name, row.company, row.phone, row.wechat, row.email, row.industry, row.budget, row.description])
    );
  } else if (type === "usage") {
    const rows = await prisma.usageRecord.findMany({ orderBy: { createdAt: "desc" }, take: 1000 });
    filename = "usage-records-admin.csv";
    csv = toCsv(
      ["时间", "用户ID", "工具ID", "工具名称", "状态", "消耗额度", "错误信息"],
      rows.map((row) => [row.createdAt.toISOString(), row.userId, row.toolId, row.toolName, row.status, row.quotaUsed, row.errorMessage])
    );
  } else if (type === "orders") {
    const rows = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
    filename = "orders-admin.csv";
    csv = toCsv(
      ["时间", "订单号", "用户ID", "用户邮箱", "套餐", "金额", "次数", "订单状态", "付款方式", "用户付款时间", "确认收款时间"],
      rows.map((row) => [
        row.createdAt.toISOString(),
        row.id,
        row.userId,
        row.userEmail,
        row.planName,
        row.planPrice,
        row.planCount,
        row.status,
        row.paymentMethod || row.paymentProvider,
        row.paymentTime?.toISOString(),
        row.paidAt?.toISOString()
      ])
    );
  } else {
    const rows = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        subscriptions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { plan: true, status: true, credits: true, expiresAt: true }
        }
      }
    });
    filename = "users-admin.csv";
    csv = toCsv(
      ["注册时间", "用户ID", "邮箱", "角色", "套餐", "套餐状态", "剩余次数", "到期时间"],
      rows.map((row) => {
        const subscription = row.subscriptions[0];
        return [
          row.createdAt.toISOString(),
          row.id,
          row.email,
          row.role,
          subscription?.plan,
          subscription?.status,
          subscription?.credits,
          subscription?.expiresAt?.toISOString()
        ];
      })
    );
  }

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`
    }
  });
}
