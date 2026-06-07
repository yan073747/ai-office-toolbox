import { NextResponse } from "next/server";
import { getCurrentServerUser } from "@/lib/server-auth";
import { getActiveSubscriptionSummary, getServerQuota, getToolFreeUsage } from "@/lib/server-quota";

export async function GET() {
  const user = await getCurrentServerUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "请先登录后查看额度。" }, { status: 401 });
  }
  if (!user.isVerified) {
    return NextResponse.json({ ok: false, message: "请先完成邮箱验证后查看额度。" }, { status: 403 });
  }

  const [quota, freeUsage, subscription] = await Promise.all([
    getServerQuota(user.id),
    getToolFreeUsage(user.id),
    getActiveSubscriptionSummary(user.id)
  ]);

  return NextResponse.json({
    ok: true,
    quota: {
      totalQuota: quota.totalQuota,
      usedQuota: quota.usedQuota,
      remainingQuota: quota.remainingQuota
    },
    freeUsage,
    subscription
  });
}
