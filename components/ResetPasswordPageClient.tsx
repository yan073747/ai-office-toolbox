"use client";

import { Loader2, LockKeyhole, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

export default function ResetPasswordPageClient() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!token) {
      setError("重置链接无效或已过期。");
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

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.ok === false) {
        setError(typeof data?.message === "string" ? data.message : "重置失败，请重新申请。");
        return;
      }
      setMessage("密码已重置，请重新登录。");
      window.setTimeout(() => router.push("/login"), 1200);
    } catch {
      setError("重置失败，请重新申请。");
    } finally {
      setIsLoading(false);
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
            <h1 className="text-3xl font-semibold tracking-normal text-slate-950">重置密码</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">请设置一个新的登录密码。</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <PasswordField label="新密码" value={password} onChange={setPassword} />
            <PasswordField label="确认新密码" value={confirmPassword} onChange={setConfirmPassword} />

            {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">{error}</div> : null}
            {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">{message}</div> : null}

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
              {isLoading ? "重置中..." : "重置密码"}
            </button>
          </form>
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
