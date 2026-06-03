"use client";

import {
  BarChart3,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageCheck,
  Settings,
  Sparkles,
  UserCircle,
  X
} from "lucide-react";
import { getCurrentUser, getUsageRecords, logoutUser } from "@/lib/user-store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { LocalUser, UsageRecord } from "@/lib/user-store";

type TabId = "overview" | "quota" | "records" | "orders" | "settings";

type NavItem = {
  id: TabId;
  label: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { id: "overview", label: "概览", icon: LayoutDashboard },
  { id: "quota", label: "我的额度", icon: PackageCheck },
  { id: "records", label: "使用记录", icon: ClipboardList },
  { id: "orders", label: "我的订单", icon: CreditCard },
  { id: "settings", label: "账号设置", icon: Settings }
];

export default function DashboardClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState<LocalUser | null>(null);
  const [records, setRecords] = useState<UsageRecord[]>([]);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const activeItem = navItems.find((item) => item.id === activeTab) || navItems[0];
  const usedCount = records.reduce((total, record) => total + record.quotaUsed, 0);
  const latestRecord = records[0];

  const overviewStats = useMemo(
    () => [
      { label: "当前套餐", value: user?.planName || "免费体验版", note: "可升级个人套餐" },
      { label: "剩余额度", value: `${user?.freeQuota ?? 0} 次`, note: "本地免费额度" },
      { label: "已使用次数", value: `${usedCount} 次`, note: "本地使用统计" },
      { label: "最近一次使用工具", value: latestRecord?.toolName || "暂无", note: "成功调用后自动记录" }
    ],
    [latestRecord?.toolName, usedCount, user?.freeQuota, user?.planName]
  );

  const quotaItems = useMemo(
    () => [
      { label: "免费体验额度", value: `${user?.freeQuota ?? 0} 次`, note: "注册后赠送 5 次" },
      { label: "已使用额度", value: `${usedCount} 次`, note: "成功调用后扣减" },
      { label: "套餐额度", value: "未开通", note: "个人套餐或企业套餐" },
      { label: "到期时间", value: "-", note: "套餐开通后显示" }
    ],
    [usedCount, user?.freeQuota]
  );

  useEffect(() => {
    refreshUserState();

    function handleUserUpdate() {
      refreshUserState();
    }

    window.addEventListener("storage", handleUserUpdate);
    window.addEventListener("ai-toolbox-user-updated", handleUserUpdate);
    return () => {
      window.removeEventListener("storage", handleUserUpdate);
      window.removeEventListener("ai-toolbox-user-updated", handleUserUpdate);
    };
  }, []);

  function refreshUserState() {
    setUser(getCurrentUser());
    setRecords(getUsageRecords());
  }

  function selectTab(tab: TabId) {
    setActiveTab(tab);
    setDrawerOpen(false);
  }

  function handleLogout() {
    logoutUser();
    setUser(null);
    setRecords([]);
    router.push("/");
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-12 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <UserCircle className="mx-auto h-12 w-12 text-slate-400" />
          <h1 className="mt-5 text-2xl font-semibold text-slate-950">请先登录</h1>
          <p className="mt-3 text-sm leading-7 text-slate-500">登录后可以查看免费额度、使用记录和账号信息。</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/login" className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white">
              去登录
            </Link>
            <Link href="/register" className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-800">
              注册账号
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 sm:px-6 lg:flex-row lg:gap-5 lg:px-8">
        <aside className="hidden w-72 shrink-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:block">
          <SidebarContent activeTab={activeTab} user={user} onSelect={selectTab} />
        </aside>

        <div className="lg:hidden">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700"
              >
                <Menu className="h-4 w-4" />
                菜单
              </button>
              <div className="min-w-0 flex-1 text-right">
                <p className="truncate text-sm font-semibold text-slate-950">{activeItem.label}</p>
                <p className="text-xs text-slate-500">用户中心</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectTab(item.id)}
                  className={
                    activeTab === item.id
                      ? "h-9 shrink-0 rounded-xl bg-slate-950 px-3 text-xs font-semibold text-white"
                      : "h-9 shrink-0 rounded-xl bg-slate-100 px-3 text-xs font-semibold text-slate-600"
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <section className="mt-4 min-w-0 flex-1 lg:mt-0">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600">AI办公工具箱</p>
                <h1 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">{activeItem.label}</h1>
              </div>
              <Link
                href="/tools"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                去使用工具
              </Link>
            </div>

            <div className="pt-6">
              {activeTab === "overview" ? (
                <OverviewPanel stats={overviewStats} onOpenRecords={() => selectTab("records")} onOpenUpgrade={() => setPaymentOpen(true)} />
              ) : null}
              {activeTab === "quota" ? <QuotaPanel quotaItems={quotaItems} onOpenUpgrade={() => setPaymentOpen(true)} /> : null}
              {activeTab === "records" ? <RecordsPanel records={records} /> : null}
              {activeTab === "orders" ? <OrdersPanel /> : null}
              {activeTab === "settings" ? <SettingsPanel user={user} onLogout={handleLogout} /> : null}
            </div>
          </div>
        </section>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/40 lg:hidden">
          <div className="h-full w-80 max-w-[86vw] bg-white p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-semibold text-slate-950">用户中心</p>
              <button type="button" onClick={() => setDrawerOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <SidebarContent activeTab={activeTab} user={user} onSelect={selectTab} compact />
          </div>
        </div>
      ) : null}

      {paymentOpen ? <PaymentPlaceholderModal onClose={() => setPaymentOpen(false)} /> : null}
    </main>
  );
}

function SidebarContent({
  activeTab,
  user,
  onSelect,
  compact = false
}: {
  activeTab: TabId;
  user: LocalUser;
  onSelect: (tab: TabId) => void;
  compact?: boolean;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className={compact ? "mb-4" : "mb-8 border-b border-slate-200 pb-5"}>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <UserCircle className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950">本地用户</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
      </div>

      <nav className="space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={
                active
                  ? "flex h-11 w-full items-center gap-3 rounded-xl bg-slate-950 px-3 text-sm font-semibold text-white"
                  : "flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function OverviewPanel({
  stats,
  onOpenRecords,
  onOpenUpgrade
}: {
  stats: Array<{ label: string; value: string; note: string }>;
  onOpenRecords: () => void;
  onOpenUpgrade: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <StatCard key={item.label} label={item.label} value={item.value} note={item.note} />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold text-slate-950">使用概览</h2>
          </div>
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm leading-7 text-slate-500">
            当前版本使用 localStorage 保存额度和记录。后续接入真实数据库后，这里可以展示更完整的用量趋势和工具分布。
          </div>
          <button
            type="button"
            onClick={onOpenRecords}
            className="mt-5 inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            历史记录详情页
          </button>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white">
          <h2 className="font-semibold">下一步建议</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">你可以先体验一个工具，生成结果后会在使用记录中展示。</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link href="/tools" className="inline-flex h-10 items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-slate-950">
              查看工具
            </Link>
            <button
              type="button"
              onClick={onOpenUpgrade}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-white/15 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              升级套餐
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuotaPanel({ quotaItems, onOpenUpgrade }: { quotaItems: Array<{ label: string; value: string; note: string }>; onOpenUpgrade: () => void }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quotaItems.map((item) => (
          <StatCard key={item.label} label={item.label} value={item.value} note={item.note} />
        ))}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={onOpenUpgrade} className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white">
          升级套餐
        </button>
        <Link href="/contact" className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800">
          联系定制
        </Link>
      </div>
    </div>
  );
}

function RecordsPanel({ records }: { records: UsageRecord[] }) {
  const [toolFilter, setToolFilter] = useState("全部工具");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const toolOptions = useMemo(() => ["全部工具", ...Array.from(new Set(records.map((record) => record.toolName)))], [records]);
  const filteredRecords = useMemo(() => {
    return records
      .filter((record) => toolFilter === "全部工具" || record.toolName === toolFilter)
      .sort((left, right) => {
        const leftTime = new Date(left.createdAt).getTime();
        const rightTime = new Date(right.createdAt).getTime();
        return sortOrder === "desc" ? rightTime - leftTime : leftTime - rightTime;
      });
  }, [records, sortOrder, toolFilter]);

  if (!records.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
        <p className="text-lg font-semibold text-slate-950">暂无使用记录，去体验一个工具吧。</p>
        <Link href="/tools" className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white">
          去体验
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">历史记录详情页</h2>
          <p className="mt-1 text-sm text-slate-500">仅展示当前登录用户的本地使用记录。</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={toolFilter}
            onChange={(event) => setToolFilter(event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
          >
            {toolOptions.map((toolName) => (
              <option key={toolName} value={toolName}>
                {toolName}
              </option>
            ))}
          </select>
          <select
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value === "asc" ? "asc" : "desc")}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
          >
            <option value="desc">时间从新到旧</option>
            <option value="asc">时间从旧到新</option>
          </select>
        </div>
      </div>

      {filteredRecords.length ? (
        <DataTable
          headers={["时间", "工具名称", "输入类型", "状态", "消耗额度"]}
          rows={filteredRecords.map((record) => [
            formatDateTime(record.createdAt),
            record.toolName,
            record.inputType,
            <StatusBadge key="status" status="已完成" />,
            `${record.quotaUsed} 次`
          ])}
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
          <p className="text-base font-semibold text-slate-950">当前筛选条件下暂无记录</p>
        </div>
      )}
    </div>
  );
}

function OrdersPanel() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
      <p className="text-lg font-semibold text-slate-950">暂无订单</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">支付功能尚未上线，后续会在这里展示真实订单。</p>
    </div>
  );
}

function SettingsPanel({ user, onLogout }: { user: LocalUser; onLogout: () => void }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-950">账号信息</h2>
        <div className="mt-5 space-y-4">
          <ReadonlyField label="昵称" value="本地用户" />
          <ReadonlyField label="当前套餐" value={user.planName} />
          <ReadonlyField label="邮箱" value={user.email} />
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-lg font-semibold text-slate-950">安全设置</h2>
        <p className="mt-3 text-sm leading-7 text-slate-500">当前账号数据仅保存在本机浏览器 localStorage 中。</p>
        <button
          type="button"
          onClick={onLogout}
          className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-semibold text-white"
        >
          <LogOut className="h-4 w-4" />
          退出登录
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{note}</p>
    </article>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: Array<Array<ReactNode>> }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
              {headers.map((header) => (
                <th key={header} className="px-5 py-4 font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-slate-100 last:border-b-0">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-5 py-4 text-slate-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{status}</span>;
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-800">{label}</label>
      <div className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">{value}</div>
    </div>
  );
}

function PaymentPlaceholderModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <Sparkles className="h-5 w-5" />
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <h2 className="mt-5 text-xl font-semibold text-slate-950">支付系统暂未接入</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">支付系统暂未接入，如需增加额度，请联系定制服务。</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link href="/contact" className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 text-sm font-semibold text-white">
            联系定制
          </Link>
          <button type="button" onClick={onClose} className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-slate-800">
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}
