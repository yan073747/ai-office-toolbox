import { FREE_USES_PER_TOOL, TOOL_DEFINITIONS, getPlanDefinition, getToolDefinition } from "@/lib/plans";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const FREE_LIMIT_REACHED_CODE = "FREE_LIMIT_REACHED";
export const FREE_LIMIT_REACHED_MESSAGE = "免费次数已用完，请购买套餐继续使用";
export const SUBSCRIPTION_QUOTA_REACHED_MESSAGE = "套餐余额不足，请充值";

export type ServerQuota = {
  userId: string;
  totalQuota: number;
  usedQuota: number;
  remainingQuota: number;
  updatedAt: string;
};

export type ServerToolInfo = {
  toolId: string;
  toolName: string;
  inputType: string;
};

export type ToolFreeUsage = {
  toolId: string;
  toolName: string;
  used: number;
  total: number;
  remaining: number;
};

export type ActiveSubscriptionSummary = {
  id: string;
  plan: string;
  planName: string;
  status: string;
  credits: number;
  unlimited: boolean;
  expiresAt: string | null;
};

export type ToolAccessSource = "free" | "subscription";

export type ServerToolAccess = {
  source: ToolAccessSource;
  subscriptionId?: string;
  unlimited?: boolean;
};

export type ServerToolUseCheck = {
  canUse: boolean;
  reason: "not_logged_in" | "email_not_verified" | "free_limit_reached" | "subscription_quota_reached" | "ok";
  code?: string;
  message: string;
  quota?: ServerQuota;
  freeUsage?: ToolFreeUsage[];
  subscription?: ActiveSubscriptionSummary | null;
  access?: ServerToolAccess;
};

export type ServerOrderInfo = {
  orderId: string;
  paymentProvider: "wechat" | "alipay" | "manual" | string;
  paymentTradeNo?: string;
};

type ToolUsageGroup = {
  toolId: string;
  _count: {
    _all: number;
  };
};

const NOT_LOGGED_IN_MESSAGE = "请先登录后使用";
const EMAIL_NOT_VERIFIED_MESSAGE = "请先完成邮箱验证后再使用工具。";

function nowIso() {
  return new Date().toISOString();
}

function toSubscriptionSummary(subscription: {
  id: string;
  plan: string;
  status: string;
  credits: number;
  expiresAt: Date | null;
}): ActiveSubscriptionSummary {
  const plan = getPlanDefinition(subscription.plan);
  return {
    id: subscription.id,
    plan: subscription.plan,
    planName: plan?.name || subscription.plan,
    status: subscription.status,
    credits: subscription.credits,
    unlimited: false,
    expiresAt: subscription.expiresAt ? subscription.expiresAt.toISOString() : null
  };
}

export async function getToolFreeUsage(userId: string): Promise<ToolFreeUsage[]> {
  const toolIds = TOOL_DEFINITIONS.map((tool) => tool.toolId);
  const grouped = await prisma.usageRecord.groupBy({
    by: ["toolId"],
    where: {
      userId,
      status: "success",
      toolId: {
        in: toolIds
      }
    },
    _count: {
      _all: true
    }
  });
  const countByTool = new Map<string, number>((grouped as ToolUsageGroup[]).map((item) => [item.toolId, item._count._all]));

  return TOOL_DEFINITIONS.map((tool) => {
    const used = Math.min(countByTool.get(tool.toolId) || 0, FREE_USES_PER_TOOL);
    return {
      toolId: tool.toolId,
      toolName: tool.toolName,
      used,
      total: FREE_USES_PER_TOOL,
      remaining: Math.max(0, FREE_USES_PER_TOOL - used)
    };
  });
}

export async function getActiveSubscription(userId: string) {
  const now = new Date();
  return prisma.subscription.findFirst({
    where: {
      userId,
      status: "active",
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }]
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function getActiveSubscriptionSummary(userId: string) {
  const subscription = await getActiveSubscription(userId);
  return subscription ? toSubscriptionSummary(subscription) : null;
}

export async function getServerQuota(userId: string): Promise<ServerQuota> {
  const [freeUsage, subscription, successfulCount] = await Promise.all([
    getToolFreeUsage(userId),
    getActiveSubscription(userId),
    prisma.usageRecord.count({
      where: {
        userId,
        status: "success"
      }
    })
  ]);

  const freeTotal = freeUsage.reduce((total, item) => total + item.total, 0);
  const freeRemaining = freeUsage.reduce((total, item) => total + item.remaining, 0);
  const subscriptionCredits = subscription?.credits || 0;

  return {
    userId,
    totalQuota: freeTotal + subscriptionCredits,
    usedQuota: successfulCount,
    remainingQuota: freeRemaining + subscriptionCredits,
    updatedAt: nowIso()
  };
}

export async function canUseToolServer(userId: string | null, toolInfo?: ServerToolInfo): Promise<ServerToolUseCheck> {
  if (!userId) {
    return {
      canUse: false,
      reason: "not_logged_in",
      message: NOT_LOGGED_IN_MESSAGE
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isVerified: true }
  });
  if (!user || !user.isVerified) {
    return {
      canUse: false,
      reason: "email_not_verified",
      code: "EMAIL_NOT_VERIFIED",
      message: EMAIL_NOT_VERIFIED_MESSAGE
    };
  }

  const [quota, freeUsage, subscription] = await Promise.all([
    getServerQuota(userId),
    getToolFreeUsage(userId),
    getActiveSubscription(userId)
  ]);
  const requestedTool = getToolDefinition(toolInfo?.toolId) || toolInfo;
  const currentFreeUsage = requestedTool ? freeUsage.find((item) => item.toolId === requestedTool.toolId) : freeUsage.find((item) => item.remaining > 0);

  if (currentFreeUsage && currentFreeUsage.remaining > 0) {
    return {
      canUse: true,
      reason: "ok",
      message: "可以使用",
      quota,
      freeUsage,
      subscription: subscription ? toSubscriptionSummary(subscription) : null,
      access: {
        source: "free"
      }
    };
  }

  if (subscription && subscription.credits > 0) {
    return {
      canUse: true,
      reason: "ok",
      message: "可以使用",
      quota,
      freeUsage,
      subscription: toSubscriptionSummary(subscription),
      access: {
        source: "subscription",
        subscriptionId: subscription.id,
        unlimited: false
      }
    };
  }

  return {
    canUse: false,
    reason: subscription ? "subscription_quota_reached" : "free_limit_reached",
    code: FREE_LIMIT_REACHED_CODE,
    message: subscription ? SUBSCRIPTION_QUOTA_REACHED_MESSAGE : FREE_LIMIT_REACHED_MESSAGE,
    quota,
    freeUsage,
    subscription: subscription ? toSubscriptionSummary(subscription) : null
  };
}

export async function consumeQuotaAfterToolSuccess(userId: string, toolInfo: ServerToolInfo, access?: ServerToolAccess) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    if (access?.source === "subscription" && access.subscriptionId) {
      const updated = await tx.subscription.updateMany({
        where: {
          id: access.subscriptionId,
          userId,
          status: "active",
          credits: { gt: 0 },
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }]
        },
        data: {
          credits: { decrement: 1 }
        }
      });

      if (updated.count === 0) {
        throw new Error("Subscription credits are not available.");
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          remainingQuota: {
            decrement: 1
          }
        }
      });
    }

    return tx.usageRecord.create({
      data: {
        userId,
        toolId: toolInfo.toolId,
        toolName: toolInfo.toolName,
        inputType: toolInfo.inputType,
        status: "success",
        quotaUsed: 1
      }
    });
  });
}

export async function addQuotaAfterPayment(userId: string, amount: number, orderInfo: ServerOrderInfo) {
  if (amount <= 0) {
    throw new Error("Quota amount must be greater than 0.");
  }

  const subscription = await prisma.subscription.create({
    data: {
      userId,
      plan: "manual",
      status: "active",
      credits: amount
    }
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      currentPlan: "manual",
      remainingQuota: amount,
      planExpiry: null
    }
  });

  return {
    subscription: toSubscriptionSummary(subscription),
    orderInfo
  };
}
