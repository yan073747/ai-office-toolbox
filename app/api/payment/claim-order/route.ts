import { NextResponse } from "next/server";
import { getCurrentServerUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";

const MAX_SCREENSHOT_BYTES = 2 * 1024 * 1024;
const allowedPaymentMethods = new Set(["wechat", "alipay"]);

function normalizePaymentMethod(value: string) {
  const next = value.trim().toLowerCase();
  if (next === "微信") return "wechat";
  if (next === "支付宝") return "alipay";
  return next;
}

async function fileToDataUrl(file: File, orderId: string) {
  if (!file.size) return null;
  if (file.size > MAX_SCREENSHOT_BYTES) {
    throw new Error("付款截图不能超过 2MB。");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("付款截图仅支持图片格式。");
  }

  const extension = file.type.split("/")[1] || "jpg";
  const bytes = Buffer.from(await file.arrayBuffer());
  const safeName = `${orderId}-${Date.now()}.${extension}`;
  return `data:${file.type};name=${encodeURIComponent(safeName)};base64,${bytes.toString("base64")}`;
}

export async function POST(request: Request) {
  const user = await getCurrentServerUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "请先登录后提交付款信息。" }, { status: 401 });
  }

  const formData = await request.formData();
  const orderId = String(formData.get("orderId") || "").trim();
  const userEmail = String(formData.get("userEmail") || "").trim().toLowerCase();
  const paymentMethod = normalizePaymentMethod(String(formData.get("paymentMethod") || ""));
  const screenshot = formData.get("paymentScreenshot");

  if (!orderId) {
    return NextResponse.json({ ok: false, message: "缺少订单号。" }, { status: 400 });
  }
  if (!userEmail || userEmail !== user.email.toLowerCase()) {
    return NextResponse.json({ ok: false, message: "付款邮箱与当前登录账号不一致。" }, { status: 400 });
  }
  if (!allowedPaymentMethods.has(paymentMethod)) {
    return NextResponse.json({ ok: false, message: "请选择付款方式。" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, userId: true, userEmail: true, status: true }
  });
  if (!order) {
    return NextResponse.json({ ok: false, message: "订单不存在。" }, { status: 404 });
  }
  if (order.userId !== user.id) {
    return NextResponse.json({ ok: false, message: "无权提交该订单付款信息。" }, { status: 403 });
  }
  if (order.status === "paid") {
    return NextResponse.json({ ok: false, message: "订单已确认收款，无需重复提交。" }, { status: 409 });
  }

  let paymentScreenshot: string | null = null;
  try {
    if (screenshot instanceof File && screenshot.size > 0) {
      paymentScreenshot = await fileToDataUrl(screenshot, order.id);
    }
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "付款截图处理失败。" }, { status: 400 });
  }

  const paymentTime = new Date();
  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "claimed_paid",
      paymentStatus: "claimed_paid",
      paymentProvider: paymentMethod,
      paymentMethod,
      paymentTime,
      ...(paymentScreenshot ? { paymentScreenshot } : {})
    },
    select: {
      id: true,
      status: true,
      paymentMethod: true,
      paymentTime: true,
      updatedAt: true
    }
  });

  return NextResponse.json({
    ok: true,
    order: {
      ...updated,
      paymentTime: updated.paymentTime?.toISOString() || null,
      updatedAt: updated.updatedAt.toISOString()
    },
    message: "付款信息已提交，请等待管理员确认收款。"
  });
}
