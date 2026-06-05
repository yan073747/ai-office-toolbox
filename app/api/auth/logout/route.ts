import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit-log";
import { clearSession, getSessionUserId } from "@/lib/server-auth";

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  await writeAuditLog({
    request,
    userId,
    event: "auth.logout.success"
  });
  await clearSession();
  return NextResponse.json({ ok: true });
}
