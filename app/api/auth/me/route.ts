import { NextResponse } from "next/server";
import { getCurrentServerUser } from "@/lib/server-auth";
import { getActiveSubscriptionSummary, getServerQuota } from "@/lib/server-quota";

export async function GET() {
  const user = await getCurrentServerUser();

  if (!user) {
    return NextResponse.json({
      ok: false,
      user: null
    });
  }

  const [quota, subscription] = await Promise.all([
    getServerQuota(user.id),
    getActiveSubscriptionSummary(user.id)
  ]);

  return NextResponse.json({
    ok: true,
    user: {
      ...user,
      planName: subscription?.planName || "免费体验版",
      freeQuota: quota.remainingQuota
    },
    subscription
  });
}
