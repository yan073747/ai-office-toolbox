import { NextResponse } from "next/server";
import { getCurrentServerUser } from "@/lib/server-auth";
import { getServerQuota } from "@/lib/server-quota";

export async function GET() {
  const user = await getCurrentServerUser();

  if (!user) {
    return NextResponse.json({
      ok: false,
      user: null
    });
  }

  const quota = await getServerQuota(user.id);

  return NextResponse.json({
    ok: true,
    user: {
      ...user,
      planName: "免费体验版",
      freeQuota: quota.remainingQuota
    }
  });
}
