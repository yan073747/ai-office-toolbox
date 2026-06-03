"use client";

import { Menu, Sparkles, X } from "lucide-react";
import { getCurrentUser, logoutUser } from "@/lib/user-store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { LocalUser } from "@/lib/user-store";

const navItems = [
  { label: "首页", href: "/" },
  { label: "工具箱", href: "/tools" },
  { label: "行业方案", href: "/solutions" },
  { label: "定价", href: "/pricing" },
  { label: "联系定制", href: "/contact" }
];

export default function SiteHeader() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<LocalUser | null>(null);

  useEffect(() => {
    refreshUser();

    function handleUserUpdate() {
      refreshUser();
    }

    window.addEventListener("storage", handleUserUpdate);
    window.addEventListener("ai-toolbox-user-updated", handleUserUpdate);
    return () => {
      window.removeEventListener("storage", handleUserUpdate);
      window.removeEventListener("ai-toolbox-user-updated", handleUserUpdate);
    };
  }, []);

  function refreshUser() {
    setUser(getCurrentUser());
  }

  function handleLogout() {
    logoutUser();
    setUser(null);
    setOpen(false);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-base font-semibold tracking-normal text-slate-950">AI办公工具箱</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-slate-600 transition hover:text-slate-950">
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link href="/dashboard" className="inline-flex h-10 max-w-52 items-center justify-center truncate rounded-xl px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                {user.email || "用户中心"}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                退出登录
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                登录
              </Link>
              <Link
                href="/register"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                免费体验
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={open ? "关闭菜单" : "打开菜单"}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open ? (
        <div className="border-t border-slate-200 bg-white px-5 py-4 shadow-lg md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
              >
                {item.label}
              </Link>
            ))}
            {user ? (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-slate-700"
                >
                  用户中心
                </Link>
                <button type="button" onClick={handleLogout} className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 text-sm font-semibold text-white">
                  退出登录
                </button>
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-slate-700"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 text-sm font-semibold text-white"
                >
                  免费体验
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
