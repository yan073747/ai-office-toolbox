"use client";

import { Loader2, LockKeyhole, Mail, Sparkles } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPageClient() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSendCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("请输入邮箱。");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.ok === false) {
        setError(typeof data?.message === "string" ? data.message : "邮件服务暂时不可用，请稍后重试。");
        setCodeSent(false);
        return;
      }
      setMessage(typeof data?.message === "string" ? data.message : "已发送验证码");
      setCodeSent(true);
    } catch {
      setError("邮件服务暂时不可用，请稍后重试。");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("请输入邮箱。");
      return;
    }
    if (!code.trim()) {
      setError("请输入验证码。");
      return;
    }
    if (!/^\d{6}$/.test(code.trim())) {
      setError("验证码错误请重新输入。");
      return;
    }
    if (password.length < 6) {
      setError("密码至少需要 6 位。");
      return;
    }
    if (password !== confirmPassword) {
      setError("两次输入的密码不一致。");
      return;
    }

    setIsResetting(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password, confirmPassword })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.ok === false) {
        setError(typeof data?.message === "string" ? data.message : "验证码错误请重新输入。");
        return;
      }
      setMessage("密码已重置，请返回登录。");
      setCode("");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("重置失败，请稍后重试。");
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#F8FAFC_0%,#FFFFFF_100%)] px-5 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl items-center justify-center">
        <section className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.1)] sm:p-10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="font-semibold text-slate-950">AI办公工具箱</span>
          </Link>

          <div className="mt-10">
            <h1 className="text-3xl font-semibold tracking-normal text-slate-950">忘记密码</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">输入注册邮箱，我们会发送 6 位验证码。验证码通过后即可设置新密码。</p>
          </div>

          <form onSubmit={handleSendCode} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-800">
                邮箱
              </label>
              <input
                id="email"
                type="email"
                value={email}
                placeholder="请输入邮箱"
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                  setMessage("");
                }}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">{error}</div> : null}
            {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">{message}</div> : null}

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              {isLoading ? "发送中..." : codeSent ? "重新发送验证码" : "发送验证码"}
            </button>
          </form>

          {codeSent ? (
            <form onSubmit={handleResetPassword} className="mt-6 space-y-5 border-t border-slate-200 pt-6">
              <div>
                <label htmlFor="code" className="mb-2 block text-sm font-semibold text-slate-800">
                  验证码
                </label>
                <input
                  id="code"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  placeholder="请输入 6 位验证码"
                  onChange={(event) => {
                    setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                    setError("");
                  }}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                />
              </div>
              <PasswordField label="新密码" value={password} onChange={setPassword} />
              <PasswordField label="确认新密码" value={confirmPassword} onChange={setConfirmPassword} />
              <button
                type="submit"
                disabled={isResetting}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isResetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
                {isResetting ? "重置中..." : "提交新密码"}
              </button>
            </form>
          ) : null}

          <p className="mt-7 text-center text-sm text-slate-500">
            想起密码了？
            <Link href="/login" className="ml-1 font-semibold text-slate-950 transition hover:text-blue-700">
              返回登录
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}

function PasswordField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-800">{label}</label>
      <input
        type="password"
        value={value}
        placeholder="请输入密码"
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}
