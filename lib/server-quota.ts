import { prisma } from "@/lib/prisma";

// Production tool execution checks quota on the server before calling Dify, then
// consumes quota on the server only after a successful tool result. Payment
// success must come from verified backend webhooks, never from frontend state.

const DEFAULT_FREE_QUOTA = 5;
const QUOTA_EMPTY_MESSAGE = "你已使用完 5 次免费体验。想继续体验、开通更多额度或定制专属 AI 工具，请联系作者。";

export type ServerQuota = {
  userId: string;
  totalQuota: number;
  usedQuota: number;
  remainingQuota: number;
  updatedAt: string;
};

export type ServerToolUseCheck = {
  canUse: boolean;
  reason: "not_logged_in" | "quota_empty" | "ok";
  message: string;
  quota?: ServerQuota;
};

export type ServerToolInfo = {
  toolId: string;
  toolName: string;
  inputType: string;
};

export type ServerOrderInfo = {
  orderId: string;
  paymentProvider: "wechat" | "alipay" | "manual" | string;
  paymentTradeNo?: string;
};

function toServerQuota(quota: {
  userId: string;
  totalQuota: number;
  usedQuota: number;
  remainingQuota: number;
  updatedAt: Date;
}): ServerQuota {
  return {
    userId: quota.userId,
    totalQuota: quota.totalQuota,
    usedQuota: quota.usedQuota,
    remainingQuota: quota.remainingQuota,
    updatedAt: quota.updatedAt.toISOString()
  };
}

export async function getServerQuota(userId: string): Promise<ServerQuota> {
  const quota = await prisma.userQuota.upsert({
    where: { userId },
    create: {
      userId,
      totalQuota: DEFAULT_FREE_QUOTA,
      usedQuota: 0,
      remainingQuota: DEFAULT_FREE_QUOTA
    },
    update: {}
  });

  return toServerQuota(quota);
}

export async function canUseToolServer(userId: string | null): Promise<ServerToolUseCheck> {
  if (!userId) {
    return {
      canUse: false,
      reason: "not_logged_in",
      message: "请先登录后使用"
    };
  }

  const quota = await getServerQuota(userId);
  if (quota.remainingQuota <= 0) {
    return {
      canUse: false,
      reason: "quota_empty",
      message: QUOTA_EMPTY_MESSAGE,
      quota
    };
  }

  return {
    canUse: true,
    reason: "ok",
    message: "可以使用",
    quota
  };
}

export async function consumeQuotaAfterToolSuccess(userId: string, toolInfo: ServerToolInfo) {
  // Keep this transaction server-side to prevent frontend tampering and
  // concurrent double spending.
  return prisma.$transaction(async (tx) => {
    const quota = await tx.userQuota.findUnique({ where: { userId } });
    if (!quota || quota.remainingQuota <= 0) {
      throw new Error("Quota is not available.");
    }

    await tx.userQuota.update({
      where: { userId },
      data: {
        usedQuota: { increment: 1 },
        remainingQuota: { decrement: 1 }
      }
    });

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
  // Payment placeholder. Only call this from a verified payment webhook or
  // trusted admin operation. Real callbacks must verify signatures and enforce
  // idempotency by paymentTradeNo/orderId in the same database transaction.
  if (amount <= 0) {
    throw new Error("Quota amount must be greater than 0.");
  }

  const quota = await prisma.userQuota.upsert({
    where: { userId },
    create: {
      userId,
      totalQuota: amount,
      usedQuota: 0,
      remainingQuota: amount
    },
    update: {
      totalQuota: { increment: amount },
      remainingQuota: { increment: amount }
    }
  });

  return {
    quota: toServerQuota(quota),
    orderInfo
  };
}
