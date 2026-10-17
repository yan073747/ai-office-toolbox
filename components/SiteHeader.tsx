"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { label: "能做什么", href: "/#services" },
  { label: "做过的", href: "/#cases" },
  { label: "免费工具", href: "/tools" },
  { label: "技术演示", href: "/demos" }
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // 打开抽屉时锁 body 滚动，Esc 可关
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function isActive(href: string) {
    if (href.startsWith("/#")) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="site-header sticky top-0 z-50 border-b border-wline bg-paper">
      <div className="mx-auto flex h-[66px] max-w-site items-center justify-between gap-5 px-5">
        <Link href="/" className="flex flex-none items-center gap-[10px]" aria-label="AI WorkBox 首页">
          <span className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[3px] bg-accent text-[14px] font-bold leading-none text-white">
            W
          </span>
          <span>
            <span className="block text-[15px] font-semibold leading-[1.15] tracking-[0.01em] text-inkd">AI WorkBox</span>
            <span className="mt-[3px] block text-[11px] leading-[1.4] text-mute">企业 AI 落地 · 佛山顺德</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="主导航">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`border-b pb-0.5 text-[14px] leading-[1.6] transition ${
                isActive(item.href)
                  ? "border-accent text-inkd"
                  : "border-transparent text-ink2 hover:border-accent hover:text-inkd"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-none items-center gap-2">
          <Link
            href="/contact"
            className="hover-lift hidden h-10 items-center justify-center rounded-[3px] bg-deep px-5 text-[14px] font-semibold text-paper transition hover:bg-black md:inline-flex"
          >
            聊一聊
          </Link>
          <button
            type="button"
            aria-label={open ? "关闭菜单" : "打开菜单"}
            aria-expanded={open}
            aria-controls="site-mobile-menu"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-10 w-10 flex-col items-center justify-center gap-[4px] rounded-[3px] border border-wline text-inkd md:hidden"
          >
            <span aria-hidden="true" className="block h-[1.5px] w-4 bg-current" />
            <span aria-hidden="true" className="block h-[1.5px] w-4 bg-current" />
            <span aria-hidden="true" className="block h-[1.5px] w-4 bg-current" />
          </button>
        </div>
      </div>

      {open ? (
        <div id="site-mobile-menu" className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            aria-label="关闭菜单"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full bg-deep/35"
          />
          <div className="absolute right-0 top-0 flex h-full w-[min(78vw,320px)] flex-col border-l border-wline bg-paper px-4 pb-6 pt-4 shadow-2xl">
            <div className="mb-2 flex items-center justify-between border-b border-wline2 pb-3 text-[11px] tracking-[0.08em] text-mute">
              <span>菜单</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="关闭菜单"
                className="text-[18px] leading-none text-inkd"
              >
                ×
              </button>
            </div>

            <nav aria-label="移动端导航" className="flex-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-wline2 py-3 text-[15px] font-medium text-inkd"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="block rounded-[3px] bg-deep py-3 text-center text-[15px] font-semibold text-paper"
            >
              聊一聊
            </Link>
            <Link href="/login" onClick={() => setOpen(false)} className="mt-3 block text-center text-[12px] text-mute">
              已有账户？登录
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
