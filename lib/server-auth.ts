import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Server-side auth uses hashed passwords and httpOnly signed cookies.
// Payment webhooks and quota changes must stay server-side.

export const SESSION_COOKIE_NAME = "office_ai_session";
const SHORT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;
const REMEMBER_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const DEFAULT_FREE_QUOTA = 5;

export type ServerUser = {
  id: string;
  email: string;
};

export type RegisterInput = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export type LoginInput = {
  email?: string;
  password?: string;
  rememberMe?: boolean;
};

export type AuthResult = {
  ok: boolean;
  status: number;
  message?: string;
  user?: ServerUser;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getSessionSecret() {
  // Local development fallback only. Production should set AUTH_SESSION_SECRET
  // and ideally use encrypted/signed sessions, JWT rotation, or Auth.js/NextAuth.
  return process.env.AUTH_SESSION_SECRET || "local-dev-session-secret-change-before-production";
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

function createSessionToken(userId: string, maxAgeSeconds: number) {
  const payload = encodeBase64Url(
    JSON.stringify({
      userId,
      expiresAt: Date.now() + maxAgeSeconds * 1000
    })
  );
  return `${payload}.${signPayload(payload)}`;
}

function verifySessionToken(token: string) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = signPayload(payload);
  const actualBuffer = Buffer.from(signature, "base64url");
  const expectedBuffer = Buffer.from(expected, "base64url");
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const session = JSON.parse(decodeBase64Url(payload)) as {
      userId?: string;
      expiresAt?: number;
    };
    if (!session.userId || !session.expiresAt || session.expiresAt < Date.now()) {
      return null;
    }
    return session.userId;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string) {
  // Passwords must never be stored in plaintext. bcryptjs is used here for
  // Windows-friendly local development; argon2/bcrypt native can be evaluated later.
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string, rememberMe = false) {
  const cookieStore = await cookies();
  const maxAge = rememberMe ? REMEMBER_SESSION_MAX_AGE_SECONDS : SHORT_SESSION_MAX_AGE_SECONDS;
  cookieStore.set(SESSION_COOKIE_NAME, createSessionToken(userId, maxAge), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge,
    secure: process.env.NODE_ENV === "production"
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production"
  });
}

export async function getSessionUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function getCurrentServerUser(): Promise<ServerUser | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true }
  });
}

export async function registerUserServer(input: RegisterInput): Promise<AuthResult> {
  const email = normalizeEmail(input.email || "");
  const password = input.password || "";
  const confirmPassword = input.confirmPassword ?? password;

  if (!email || !isValidEmail(email)) {
    return { ok: false, status: 400, message: "请输入有效的邮箱。" };
  }
  if (password.length < 6) {
    return { ok: false, status: 400, message: "密码至少需要 6 位。" };
  }
  if (password !== confirmPassword) {
    return { ok: false, status: 400, message: "两次输入的密码不一致。" };
  }

  try {
    const passwordHash = await hashPassword(password);
    const user = await prisma.$transaction(async (tx) => {
      const nextUser = await tx.user.create({
        data: {
          email,
          passwordHash
        },
        select: {
          id: true,
          email: true
        }
      });

      await tx.userQuota.create({
        data: {
          userId: nextUser.id,
          totalQuota: DEFAULT_FREE_QUOTA,
          usedQuota: 0,
          remainingQuota: DEFAULT_FREE_QUOTA
        }
      });

      return nextUser;
    });

    await createSession(user.id, true);
    return { ok: true, status: 200, user };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, status: 409, message: "该邮箱已注册，请直接登录。" };
    }
    return { ok: false, status: 500, message: "注册失败，请稍后重试。" };
  }
}

export async function loginUserServer(input: LoginInput): Promise<AuthResult> {
  const email = normalizeEmail(input.email || "");
  const password = input.password || "";

  if (!email || !password) {
    return { ok: false, status: 400, message: "请输入邮箱和密码。" };
  }
  if (!isValidEmail(email)) {
    return { ok: false, status: 400, message: "请输入有效的邮箱。" };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, passwordHash: true }
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { ok: false, status: 401, message: "邮箱或密码错误。" };
  }

  await createSession(user.id, Boolean(input.rememberMe));
  return {
    ok: true,
    status: 200,
    user: {
      id: user.id,
      email: user.email
    }
  };
}

export async function getServerSessionUser(_request?: Request): Promise<ServerUser | null> {
  return getCurrentServerUser();
}
