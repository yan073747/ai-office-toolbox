import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { createHash, createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { Prisma } from "@prisma/client";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

// Server-side auth uses hashed passwords and httpOnly signed cookies.
// Payment webhooks and quota changes must stay server-side.

export const SESSION_COOKIE_NAME = "office_ai_session";
const SHORT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;
const REMEMBER_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const DEFAULT_FREE_QUOTA = 0;
const EMAIL_VERIFICATION_TTL_MS = 15 * 60 * 1000;

export type ServerUser = {
  id: string;
  email: string;
  role: string;
  isVerified: boolean;
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
  email?: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function createVerificationCode() {
  return String(randomInt(100000, 1000000));
}

function hashVerificationCode(email: string, code: string) {
  return createHash("sha256").update(`${normalizeEmail(email)}:${code}`).digest("hex");
}

async function sendVerificationEmail(email: string, code: string) {
  await sendEmail({
    to: email,
    subject: "AI办公工具箱邮箱验证码",
    text: `你的邮箱验证码是：${code}。验证码 15 分钟内有效。如果不是你本人操作，可以忽略这封邮件。`,
    html: `<p>你的邮箱验证码是：</p><p style="font-size:24px;font-weight:700;letter-spacing:4px;">${code}</p><p>验证码 15 分钟内有效。如果不是你本人操作，可以忽略这封邮件。</p>`
  });
}

function getSessionSecret() {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SESSION_SECRET is required in production.");
  }
  // Local development fallback only. Production must set AUTH_SESSION_SECRET.
  return "local-dev-session-secret-change-before-production";
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
    select: { id: true, email: true, role: true, isVerified: true }
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
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, isVerified: true }
    });

    if (existingUser?.isVerified) {
      return { ok: false, status: 409, message: "该邮箱已注册，请直接登录。" };
    }

    const passwordHash = await hashPassword(password);
    const code = createVerificationCode();
    const verificationExpiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);
    const verificationCodeHash = hashVerificationCode(email, code);
    const user = existingUser
      ? await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            passwordHash,
            verificationCodeHash,
            verificationExpiresAt
          },
          select: {
            id: true,
            email: true,
            role: true,
            isVerified: true
          }
        })
      : await prisma.$transaction(async (tx) => {
          const nextUser = await tx.user.create({
            data: {
              email,
              passwordHash,
              isVerified: false,
              verificationCodeHash,
              verificationExpiresAt
            },
            select: {
              id: true,
              email: true,
              role: true,
              isVerified: true
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

    try {
      await sendVerificationEmail(user.email, code);
    } catch (error) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationCodeHash: null,
          verificationExpiresAt: null
        }
      });
      if (process.env.NODE_ENV !== "production") {
        console.error("Registration verification email failed:", error instanceof Error ? error.message : "unknown");
      }
      return { ok: false, status: 500, message: "验证码邮件发送失败，请稍后重试。" };
    }

    return {
      ok: true,
      status: 200,
      message: "验证码已发送，请查收邮件。",
      user,
      email: user.email
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, status: 409, message: "该邮箱已注册，请直接登录。" };
    }
    return { ok: false, status: 500, message: "注册失败，请稍后重试。" };
  }
}

export async function verifyRegisteredUserServer(input: { email?: string; code?: string }): Promise<AuthResult> {
  const email = normalizeEmail(input.email || "");
  const code = String(input.code || "").trim();

  if (!email || !isValidEmail(email)) {
    return { ok: false, status: 400, message: "请输入有效的邮箱。" };
  }
  if (!/^\d{6}$/.test(code)) {
    return { ok: false, status: 400, message: "验证码错误请重新输入。" };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      role: true,
      isVerified: true,
      verificationCodeHash: true,
      verificationExpiresAt: true
    }
  });

  if (!user) {
    return { ok: false, status: 404, message: "该邮箱未注册，请先注册。" };
  }
  if (user.isVerified) {
    await createSession(user.id, true);
    return {
      ok: true,
      status: 200,
      message: "邮箱已验证。",
      user: { id: user.id, email: user.email, role: user.role, isVerified: true }
    };
  }
  if (!user.verificationCodeHash || !user.verificationExpiresAt || user.verificationExpiresAt <= new Date()) {
    return { ok: false, status: 400, message: "验证码已过期，请重新获取新的验证码。" };
  }
  if (user.verificationCodeHash !== hashVerificationCode(email, code)) {
    return { ok: false, status: 400, message: "验证码错误请重新输入。" };
  }

  const verifiedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verificationCodeHash: null,
      verificationExpiresAt: null
    },
    select: { id: true, email: true, role: true, isVerified: true }
  });

  await createSession(verifiedUser.id, true);
  return { ok: true, status: 200, message: "邮箱验证成功。", user: verifiedUser };
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
    select: { id: true, email: true, role: true, passwordHash: true, isVerified: true }
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { ok: false, status: 401, message: "邮箱或密码错误。" };
  }
  if (!user.isVerified) {
    return { ok: false, status: 403, message: "请先完成邮箱验证后再登录。" };
  }

  await createSession(user.id, Boolean(input.rememberMe));
  return {
    ok: true,
    status: 200,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    }
  };
}

export async function getServerSessionUser(_request?: Request): Promise<ServerUser | null> {
  return getCurrentServerUser();
}
