"use client";

export type LocalUser = {
  id: string;
  email: string;
  freeQuota: number;
  createdAt?: string;
  planName: "免费体验版";
};

export type UsageRecord = {
  id: string;
  userId?: string;
  toolId: string;
  toolName: string;
  createdAt: string;
  inputType: string;
  status: "success" | "failed" | string;
  quotaUsed: number;
  errorMessage?: string | null;
};

export type ToolUseCheck = {
  canUse: boolean;
  reason: "not_logged_in" | "quota_empty" | "ok";
  message: string;
};

export type ToolUsageInfo = {
  toolId: string;
  toolName: string;
  inputType: string;
};

const QUOTA_EMPTY_MESSAGE = "你已使用完 5 次免费体验。想继续体验、开通更多额度或定制专属 AI 工具，请联系作者。";
const USER_UPDATED_EVENT = "ai-toolbox-user-updated";

function emitUserUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(USER_UPDATED_EVENT));
  }
}

async function readJsonResponse<T>(response: Response): Promise<T & { ok?: boolean; message?: string }> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.ok === false) {
    throw new Error(typeof data?.message === "string" ? data.message : "操作失败，请稍后重试。");
  }
  return data;
}

export async function getCurrentUser() {
  const response = await fetch("/api/auth/me", { cache: "no-store" });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.ok || !data?.user) return null;
  return data.user as LocalUser;
}

export async function registerUser(email: string, password: string, confirmPassword = password) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, confirmPassword })
  });
  const data = await readJsonResponse<{ user: LocalUser }>(response);
  emitUserUpdated();
  return data.user;
}

export async function loginUser(email: string, password: string, rememberMe = false) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, rememberMe })
  });
  const data = await readJsonResponse<{ user: LocalUser }>(response);
  emitUserUpdated();
  return data.user;
}

export async function logoutUser() {
  await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
  emitUserUpdated();
}

export async function getUsageRecords() {
  const response = await fetch("/api/usage-records", { cache: "no-store" });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.ok) return [];
  return (data.records || []).map((record: UsageRecord & { createdAt: string | Date }) => ({
    ...record,
    createdAt: new Date(record.createdAt).toISOString()
  })) as UsageRecord[];
}

export async function canUseTool(): Promise<ToolUseCheck> {
  const response = await fetch("/api/quota/me", { cache: "no-store" });
  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    return {
      canUse: false,
      reason: "not_logged_in",
      message: "请先登录后使用"
    };
  }

  if (!response.ok || !data?.ok) {
    return {
      canUse: false,
      reason: "not_logged_in",
      message: typeof data?.message === "string" ? data.message : "请先登录后使用"
    };
  }

  if ((data.quota?.remainingQuota || 0) <= 0) {
    return {
      canUse: false,
      reason: "quota_empty",
      message: QUOTA_EMPTY_MESSAGE
    };
  }

  return {
    canUse: true,
    reason: "ok",
    message: "可以使用"
  };
}

export async function consumeQuotaAfterSuccess(_tool: ToolUsageInfo) {
  // Quota and usage records are now written by /api/toolbox/office after a
  // successful Dify response. This client function only refreshes subscribed UI.
  emitUserUpdated();
}

export async function recordSuccessfulToolUsage(tool: ToolUsageInfo) {
  return consumeQuotaAfterSuccess(tool);
}
