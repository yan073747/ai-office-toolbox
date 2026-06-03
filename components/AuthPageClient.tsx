"use client";

import { CheckCircle2, Loader2, LockKeyhole, Sparkles } from "lucide-react";
import { loginUser, registerUser } from "@/lib/user-store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

type AuthMode = "login" | "register";

type FormValues = {
  account: string;
  password: string;
  confirmPassword: string;
};

type FormErrors = Partial<Record<keyof FormValues | "form", string>>;

const benefits = ["免费额度 5 次", "支持全部办公工具", "可查看历史记录"];

export default function AuthPageClient({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const isLogin = mode === "login";
  const [values, setValues] = useState<FormValues>({
    account: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const title = useMemo(() => (isLogin ? "登录账号" : "创建账号"), [isLogin]);
  const subtitle = useMemo(
    () => (isLogin ? "登录后可继续使用工具额度和历史记录。" : "注册后可获得 5 次免费额度。"),
    [isLogin]
  );

  function updateValue(name: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined, form: undefined }));
    setSuccessMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage("");

    const nextErrors = validateForm(mode, values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsLoading(true);
    await wait(300);

    try {
      if (isLogin) {
        loginUser(values.account, values.password);
      } else {
        registerUser(values.account, values.password, values.confirmPassword);
      }
      setSuccessMessage(isLogin ? "登录成功，正在进入用户中心。" : "注册成功，正在进入用户中心。");
      router.push("/dashboard");
    } catch (error) {
      setErrors({
        form: error instanceof Error ? error.message : "操作失败，请稍后重试。"
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#F8FAFC_0%,#FFFFFF_100%)] px-5 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.1)] lg:grid-cols-[0.95fr_1.05fr]">
          <aside className="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <Link href="/" className="inline-flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-blue-200">
                  <Sparkles className="h-5 w-5" />
                </span>
                <span className="font-semibold">AI办公工具箱</span>
              </Link>

              <div className="mt-16">
                <h1 className="text-4xl font-semibold leading-tight tracking-normal">欢迎使用 AI办公工具箱</h1>
                <p className="mt-5 text-base leading-8 text-slate-300">
                  登录后可使用免费额度，查看历史生成记录，并管理你的工具使用额度。
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-300" />
                  <span className="text-sm font-medium text-slate-100">{benefit}</span>
                </div>
              ))}
            </div>
          </aside>

          <section className="p-6 sm:p-10">
            <div className="mx-auto max-w-md">
              <div className="mb-8 text-center lg:text-left">
                <Link href="/" className="mb-8 inline-flex items-center gap-2.5 lg:hidden">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <span className="font-semibold text-slate-950">AI办公工具箱</span>
                </Link>
                <h2 className="text-3xl font-semibold tracking-normal text-slate-950">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">{subtitle}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Field
                  label="邮箱"
                  value={values.account}
                  placeholder="请输入邮箱"
                  error={errors.account}
                  onChange={(value) => updateValue("account", value)}
                />

                <Field
                  label="密码"
                  type="password"
                  value={values.password}
                  placeholder="请输入密码"
                  error={errors.password}
                  onChange={(value) => updateValue("password", value)}
                />

                {!isLogin ? (
                  <Field
                    label="确认密码"
                    type="password"
                    value={values.confirmPassword}
                    placeholder="请再次输入密码"
                    error={errors.confirmPassword}
                    onChange={(value) => updateValue("confirmPassword", value)}
                  />
                ) : null}

                {isLogin ? (
                  <div className="flex items-center justify-between text-sm">
                    <label className="inline-flex items-center gap-2 text-slate-500">
                      <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                      记住我
                    </label>
                    <Link href="/login" className="font-semibold text-slate-700 transition hover:text-blue-700">
                      忘记密码
                    </Link>
                  </div>
                ) : null}

                {errors.form ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                    {errors.form}
                  </div>
                ) : null}

                {successMessage ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">
                    {successMessage}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
                  {isLoading ? "处理中..." : isLogin ? "登录" : "注册"}
                </button>

              </form>

              <p className="mt-7 text-center text-sm text-slate-500">
                {isLogin ? "没有账号？" : "已有账号？"}
                <Link href={isLogin ? "/register" : "/login"} className="ml-1 font-semibold text-slate-950 transition hover:text-blue-700">
                  {isLogin ? "立即注册" : "去登录"}
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  error,
  type = "text"
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  type?: "text" | "password";
}) {
  const id = label.replace(/\s+/g, "-");
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-800">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={
          error
            ? "h-12 w-full rounded-xl border border-red-300 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-4 focus:ring-red-100"
            : "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
        }
      />
      {error ? <p className="mt-2 text-xs leading-5 text-red-600">{error}</p> : null}
    </div>
  );
}

function validateForm(mode: AuthMode, values: FormValues) {
  const errors: FormErrors = {};
  const accountError = validateAccount(values.account);
  if (accountError) errors.account = accountError;

  if (!values.password.trim()) {
    errors.password = "请输入密码。";
  } else if (values.password.length < 6) {
    errors.password = "密码至少需要 6 位。";
  }

  if (mode === "register") {
    if (!values.confirmPassword.trim()) {
      errors.confirmPassword = "请再次输入密码。";
    } else if (values.confirmPassword !== values.password) {
      errors.confirmPassword = "两次输入的密码不一致。";
    }
  }

  return errors;
}

function validateAccount(account: string) {
  const value = account.trim();
  if (!value) return "请输入邮箱。";

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  if (!isEmail) return "请输入有效的邮箱。";

  return "";
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
