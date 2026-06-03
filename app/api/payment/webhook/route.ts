import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const rawBody = await request.text();

  // Webhook placeholder only. Real payment webhooks must verify provider
  // signatures, reject replayed events, enforce idempotency, and only then mark
  // orders paid and add quota on the server. Never trust frontend payment status.
  return NextResponse.json({
    ok: true,
    mode: "payment-webhook-placeholder",
    receivedBytes: rawBody.length,
    note: "Webhook skeleton only. Real payment success must come from verified backend callbacks."
  });
}
