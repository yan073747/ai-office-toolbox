"use client";

export type LocalUser = {
  id: string;
  email: string;
  // V1 local demo only: production must store password hashes on the server, never plaintext in localStorage.
  password: string;
  freeQuota: number;
  createdAt: string;
  planName: "免费体验版";
};

export type UsageRecord = {
  id: string;
  userId: string;
  toolId: string;
  toolName: string;
  createdAt: string;
  inputType: string;
  status: "success";
  quotaUsed: 1;
};

const USERS_KEY = "ai_toolbox_users_v1";
const CURRENT_USER_KEY = "ai_toolbox_current_user_id_v1";
const USAGE_RECORDS_KEY = "ai_toolbox_usage_records_v1";
const DEFAULT_FREE_QUOTA = 5;

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

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("ai-toolbox-user-updated"));
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function validateEmail(email: string) {
  if (!email) {
    throw new Error("请输入邮箱。");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("请输入有效的邮箱。");
  }
}

function validatePassword(password: string) {
  if (!password.trim()) {
    throw new Error("请输入密码。");
  }
  if (password.length < 6) {
    throw new Error("密码至少需要 6 位。");
  }
}

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function getUsers() {
  return readJson<LocalUser[]>(USERS_KEY, []);
}

function saveUsers(users: LocalUser[]) {
  writeJson(USERS_KEY, users);
}

export function getCurrentUser() {
  if (!canUseStorage()) return null;
  const currentUserId = window.localStorage.getItem(CURRENT_USER_KEY);
  if (!currentUserId) return null;
  return getUsers().find((user) => user.id === currentUserId) || null;
}

export function registerUser(email: string, password: string, confirmPassword = password) {
  const normalizedEmail = normalizeEmail(email);
  validateEmail(normalizedEmail);
  validatePassword(password);
  if (password !== confirmPassword) {
    throw new Error("两次输入的密码不一致。");
  }
  const users = getUsers();

  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error("该邮箱已注册，请直接登录。");
  }

  const user: LocalUser = {
    id: createId("user"),
    email: normalizedEmail,
    password,
    freeQuota: DEFAULT_FREE_QUOTA,
    createdAt: new Date().toISOString(),
    planName: "免费体验版"
  };

  saveUsers([...users, user]);
  if (canUseStorage()) {
    window.localStorage.setItem(CURRENT_USER_KEY, user.id);
    window.dispatchEvent(new Event("ai-toolbox-user-updated"));
  }
  return user;
}

export function loginUser(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  validateEmail(normalizedEmail);
  if (!password.trim()) {
    throw new Error("请输入密码。");
  }

  const user = getUsers().find((item) => item.email === normalizedEmail);

  if (!user) {
    throw new Error("该邮箱尚未注册，请先创建账号。");
  }

  if (user.password !== password) {
    throw new Error("密码不正确，请检查后重试。");
  }

  if (canUseStorage()) {
    window.localStorage.setItem(CURRENT_USER_KEY, user.id);
    window.dispatchEvent(new Event("ai-toolbox-user-updated"));
  }
  return user;
}

export function logoutUser() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(CURRENT_USER_KEY);
  window.dispatchEvent(new Event("ai-toolbox-user-updated"));
}

export function updateUserQuota(freeQuota: number) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error("请先登录后使用。");
  }

  const nextQuota = Math.max(0, freeQuota);
  const users = getUsers().map((user) => (user.id === currentUser.id ? { ...user, freeQuota: nextQuota } : user));
  saveUsers(users);
  return users.find((user) => user.id === currentUser.id) || null;
}

export function getQuota() {
  return getCurrentUser()?.freeQuota ?? 0;
}

export function addQuota(amount: number) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error("请先登录后使用。");
  }

  const safeAmount = Math.floor(amount);
  if (safeAmount <= 0) {
    throw new Error("增加额度必须大于 0。");
  }
  return updateUserQuota(currentUser.freeQuota + safeAmount);
}

export function updateUserQuotaAfterPayment(amount: number) {
  // Placeholder for future real payment callbacks. Production must verify payment on the server before adding quota.
  return addQuota(amount);
}

export function addUsageRecord(record: Omit<UsageRecord, "id" | "userId" | "createdAt" | "status" | "quotaUsed">) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error("请先登录后使用。");
  }

  const nextRecord: UsageRecord = {
    id: createId("usage"),
    userId: currentUser.id,
    createdAt: new Date().toISOString(),
    status: "success",
    quotaUsed: 1,
    ...record
  };

  const records = readJson<UsageRecord[]>(USAGE_RECORDS_KEY, []);
  writeJson(USAGE_RECORDS_KEY, [nextRecord, ...records]);
  return nextRecord;
}

export function getUsageRecords() {
  const currentUser = getCurrentUser();
  if (!currentUser) return [];

  return readJson<UsageRecord[]>(USAGE_RECORDS_KEY, [])
    .filter((record) => record.userId === currentUser.id)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

export function canUseTool(): ToolUseCheck {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return {
      canUse: false,
      reason: "not_logged_in",
      message: "请先登录后使用"
    };
  }

  if (currentUser.freeQuota <= 0) {
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

export function consumeQuotaAfterSuccess(tool: ToolUsageInfo) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error("请先登录后使用。");
  }
  if (currentUser.freeQuota <= 0) {
    throw new Error(QUOTA_EMPTY_MESSAGE);
  }

  updateUserQuota(currentUser.freeQuota - 1);
  addUsageRecord(tool);
}

export function recordSuccessfulToolUsage(tool: ToolUsageInfo) {
  return consumeQuotaAfterSuccess(tool);
}
