import { NextResponse } from "next/server";
import { registerUserServer } from "@/lib/server-auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = await registerUserServer(body);

  if (!result.ok) {
    return NextResponse.json({ ok: false, message: result.message }, { status: result.status });
  }

  return NextResponse.json({
    ok: true,
    user: result.user
  });
}
