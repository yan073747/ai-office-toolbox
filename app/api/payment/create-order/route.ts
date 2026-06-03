import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  // Payment placeholder only. No real WeChat Pay or Alipay integration is active.
  // Production must create an order server-side and return provider payment data.
  return NextResponse.json({
    ok: true,
    mode: "payment-placeholder",
    order: {
      id: "mock_order_pending_payment_provider",
      planName: body.planName || "custom",
      amount: body.amount || 0,
      quotaAmount: body.quotaAmount || 0,
      paymentProvider: body.paymentProvider || "manual",
      paymentStatus: "pending",
      createdAt: new Date().toISOString()
    },
    note: "Payment is not connected. Contact custom service or wire WeChat Pay/Alipay in V1.1."
  });
}
