import { NextResponse } from "next/server";
import { getCurrentServerUser } from "@/lib/server-auth";

export async function GET() {
  const user = await getCurrentServerUser();

  if (!user) {
    return NextResponse.json({
      ok: false,
      user: null
    });
  }

  return NextResponse.json({
    ok: true,
    user
  });
}
