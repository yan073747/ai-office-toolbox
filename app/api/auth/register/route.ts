import { NextResponse } from "next/server";
import { hashAuditValue, writeAuditLog } from "@/lib/audit-log";
import { registerUserServer } from "@/lib/server-auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = await registerUserServer(body);

  if (!result.ok) {
    return NextResponse.json({ ok: false, message: result.message }, { status: result.status });
  }

  await writeAuditLog({
    request,
    userId: result.user?.id,
    event: "auth.register.success",
    metadata: {
      emailHash: hashAuditValue(typeof body.email === "string" ? body.email : "")
    }
  });

  return NextResponse.json({
    ok: true,
    user: result.user
  });
}
