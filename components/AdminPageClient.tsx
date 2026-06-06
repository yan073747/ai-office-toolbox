"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";

type AdminSummary = {
  ok: boolean;
  message?: string;
  totals: {
    users: number;
    contacts: number;
    usageRecords: number;
    orders: number;
    subscriptions: number;
  };
  users: Array<{ id: string; email: string; role: string; createdAt: string; subscriptions: Array<{ plan: string; status: string; credits: number; expiresAt: string | null }> }>;
  contacts: Array<{ id: string; name: string; company: string | null; phone: string | null; wechat: string | null; email: string | null; industry: string; budget: string; createdAt: string }>;
  usageRecords: Array<{ id: string; userId: string; toolId: string; toolName: string; status: string; quotaUsed: number; errorMessage: string | null; createdAt: string }>;
  orders: Array<{ id: string; userId: string; planName: string; amount: string; quotaAmount: number; paymentStatus: string; paymentProvider: string; createdAt: string; paidAt: string | null }>;
  subscriptions: Array<{ id: string; userId: string; plan: string; status: string; credits: number; expiresAt: string | null; createdAt: string }>;
};

const exportLinks = [
  { label: "导出用户", href: "/api/admin/export?type=users" },
  { label: "导出联系表单", href: "/api/admin/export?type=contacts" },
  { label: "导出使用记录", href: "/api/admin/export?type=usage" },
  { label: "导出订单", href: "/api/admin/export?type=orders" }
];

export default function AdminPageClient() {
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [grantEmail, setGrantEmail] = useState("");
  const [grantPlan, setGrantPlan] = useState("basic");
  const [grantMessage, setGrantMessage] = useState("");
  const [granting, setGranting] = useState(false);

  async function loadSummary() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/summary", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.ok === false) {
        setError(data?.message || "管理员数据加载失败。");
        return;
      }
      setSummary(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSummary();
  }, []);

  async function grantSubscription(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGranting(true);
    setGrantMessage("");
    try {
      const response = await fetch("/api/admin/subscriptions/grant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: grantEmail, plan: grantPlan })
      });
      const data = await response.json().catch(() => ({}));
      setGrantMessage(data?.message || (response.ok ? "套餐已开通。" : "开通失败。"));
      if (response.ok && data?.ok !== false) {
        setGrantEmail("");
        await loadSummary();
      }
    } finally {
      setGranting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">AI办公工具箱</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">管理员后台</h1>
            <p className="mt-2 text-sm text-slate-500">查看用户、联系表单、使用记录、订单和套餐数据。</p>
          </div>
          <Link href="/dashboard" className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800">
            返回 Dashboard
          </Link>
        </div>

        {loading ? <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">正在加载管理员数据...</div> : null}
        {error ? <div className="mt-8 rounded-3xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">{error}</div> : null}

        {summary ? (
          <div className="mt-8 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Stat label="用户" value={summary.totals.users} />
              <Stat label="联系表单" value={summary.totals.contacts} />
              <Stat label="使用记录" value={summary.totals.usageRecords} />
              <Stat label="订单" value={summary.totals.orders} />
              <Stat label="套餐" value={summary.totals.subscriptions} />
            </div>

            <div className="flex flex-wrap gap-3">
              {exportLinks.map((item) => (
                <a key={item.href} href={item.href} className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white">
                  {item.label}
                </a>
              ))}
            </div>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">手动开通套餐</h2>
              <form onSubmit={grantSubscription} className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_auto]">
                <input
                  value={grantEmail}
                  onChange={(event) => setGrantEmail(event.target.value)}
                  placeholder="用户邮箱"
                  className="h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-400"
                />
                <select value={grantPlan} onChange={(event) => setGrantPlan(event.target.value)} className="h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-400">
                  <option value="basic">基础版 20 次</option>
                  <option value="standard">标准版 100 次</option>
                  <option value="pro">高级版 30 天不限次</option>
                </select>
                <button disabled={granting} className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white disabled:opacity-60">
                  {granting ? "开通中..." : "开通"}
                </button>
              </form>
              {grantMessage ? <p className="mt-3 text-sm text-slate-600">{grantMessage}</p> : null}
            </section>

            <Section title="用户管理">
              <SimpleTable
                headers={["邮箱", "角色", "套餐", "剩余次数", "注册时间"]}
                rows={summary.users.map((user) => {
                  const subscription = user.subscriptions[0];
                  return [user.email, user.role, subscription?.plan || "-", subscription?.credits ?? "-", formatDate(user.createdAt)];
                })}
              />
            </Section>

            <Section title="联系表单">
              <SimpleTable
                headers={["时间", "姓名", "公司", "手机", "微信", "邮箱", "行业", "预算"]}
                rows={summary.contacts.map((item) => [formatDate(item.createdAt), item.name, item.company || "-", item.phone || "-", item.wechat || "-", item.email || "-", item.industry, item.budget])}
              />
            </Section>

            <Section title="使用记录">
              <SimpleTable
                headers={["时间", "工具", "状态", "消耗", "错误"]}
                rows={summary.usageRecords.map((record) => [formatDate(record.createdAt), record.toolName, record.status, record.quotaUsed, record.errorMessage || "-"])}
              />
            </Section>

            <Section title="支付记录与套餐">
              <SimpleTable
                headers={["时间", "套餐", "金额", "额度", "状态", "支付方式"]}
                rows={summary.orders.map((order) => [formatDate(order.createdAt), order.planName, order.amount, order.quotaAmount, order.paymentStatus, order.paymentProvider])}
              />
            </Section>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <div className="mt-4 overflow-x-auto">{children}</div>
    </section>
  );
}

function SimpleTable({ headers, rows }: { headers: string[]; rows: Array<Array<string | number>> }) {
  return (
    <table className="w-full min-w-[720px] border-collapse text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-left text-slate-500">
          {headers.map((header) => (
            <th key={header} className="py-3 pr-4 font-semibold">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length ? (
          rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-slate-100 last:border-b-0">
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`} className="py-3 pr-4 text-slate-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td className="py-6 text-slate-500" colSpan={headers.length}>
              暂无数据
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}
