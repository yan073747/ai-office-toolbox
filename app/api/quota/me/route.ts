import { NextResponse } from "next/server";
import { getCurrentServerUser } from "@/lib/server-auth";
import { getServerQuota } from "@/lib/server-quota";

export async function GET() {
  const user = await getCurrentServerUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "请先登录后查看额度。" }, { status: 401 });
  }

  const quota = await getServerQuota(user.id);

  return NextResponse.json({
    ok: true,
    quota: {
      totalQuota: quota.totalQuota,
      usedQuota: quota.usedQuota,
      remainingQuota: quota.remainingQuota
    }
  });
}
