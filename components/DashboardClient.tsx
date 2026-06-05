"use client";

import {
  BarChart3,
  ClipboardList,
  CreditCard,
  Download,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageCheck,
  Settings,
  Sparkles,
  UserCircle,
  X
} from "lucide-react";
import { AUTHOR_DOUYIN_ID, AUTHOR_EMAIL, CONTACT_MAILTO } from "@/lib/contact-info";
import { logoutUser } from "@/lib/user-store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { LocalUser, UsageRecord } from "@/lib/user-store";

type TabId = "overview" | "quota" | "records" | "orders" | "settings";
type RangeDays = 7 | 30 | 90 | "all";
type RecordRange = RangeDays;

type NavItem = {
  id: TabId;
  label: string;
  icon: LucideIcon;
};

type TrendItem = {
  date: string;
  total: number;
  success: number;
  failed: number;
  quotaUsed: number;
};

type ToolStat = {
  toolId: string;
  toolName: string;
  count: number;
  quotaUsed: number;
};

type DashboardSummary = {
  user: {
    id: string;
    email: string;
    planName: "免费体验版";
  };
  quota: {
    totalQuota: number;
    usedQuota: number;
    remainingQuota: number;
  };
  totals: {
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    quotaUsed: number;
  };
  latestRecord: UsageRecord | null;
  trend: TrendItem[];
  byTool: ToolStat[];
};

type RecordsResponse = {
  items: UsageRecord[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

const navItems: NavItem[] = [
  { id: "overview", label: "概览", icon: LayoutDashboard },
  { id: "quota", label: "我的额度", icon: PackageCheck },
  { id: "records", label: "使用记录", icon: ClipboardList },
  { id: "orders", label: "我的订单", icon: CreditCard },
  { id: "settings", label: "账号设置", icon: Settings }
];

const rangeOptions: Array<{ label: string; value: RangeDays }> = [
  { label: "近 7 天", value: 7 },
  { label: "近 30 天", value: 30 },
  { label: "近 90 天", value: 90 },
  { label: "全部", value: "all" }
];

const recordRangeOptions: Array<{ label: string; value: RecordRange }> = [
  { label: "近 7 天", value: 7 },
  { label: "近 30 天", value: 30 },
  { label: "近 90 天", value: 90 },
  { label: "全部", value: "all" }
];

const recordsPageSize = 8;

export default function DashboardClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [rangeDays, setRangeDays] = useState<RangeDays>(30);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recordsData, setRecordsData] = useState<RecordsResponse>({
    items: [],
    page: 1,
    pageSize: recordsPageSize,
    total: 0,
    totalPages: 1
  });
  const [recordPage, setRecordPage] = useState(1);
  const [recordToolId, setRecordToolId] = useState("all");
  const [recordRangeDays, setRecordRangeDays] = useState<RecordRange>(30);
  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const activeItem = navItems.find((item) => item.id === activeTab) || navItems[0];

  const user: LocalUser | null = summary
    ? {
        id: summary.user.id,
        email: summary.user.email,
        freeQuota: summary.quota.remainingQuota,
        planName: summary.user.planName
      }
    : null;

  const toolOptions = useMemo(() => [{ toolId: "all", toolName: "全部工具" }, ...(summary?.byTool || [])], [summary?.byTool]);

  const overviewStats = useMemo(
    () => [
      { label: "当前套餐", value: summary?.user.planName || "免费体验版", note: "可升级个人套餐" },
      { label: "总额度", value: `${summary?.quota.totalQuota ?? 0} 次`, note: "云端数据库保存" },
      { label: "剩余额度", value: `${summary?.quota.remainingQuota ?? 0} 次`, note: "可继续调用次数" },
      { label: "最近一次使用工具", value: summary?.latestRecord?.toolName || "暂无", note: "成功调用后自动记录" }
    ],
    [summary]
  );

  const quotaItems = useMemo(
    () => [
      { label: "总额度", value: `${summary?.quota.totalQuota ?? 0} 次`, note: "注册后默认 5 次免费体验" },
      { label: "已使用额度", value: `${summary?.quota.usedQuota ?? 0} 次`, note: "工具成功调用后扣减" },
      { label: "剩余额度", value: `${summary?.quota.remainingQuota ?? 0} 次`, note: "云端实时保存" },
      { label: "本周期调用", value: `${summary?.totals.totalCalls ?? 0} 次`, note: `${rangeLabel(rangeDays)}统计` }
    ],
    [rangeDays, summary]
  );

  const loadSummary = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/dashboard/summary?range=${rangeDays}`, { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.ok === false) {
        setSummary(null);
        return;
      }
      setSummary(data as DashboardSummary);
    } finally {
      setLoading(false);
    }
  }, [rangeDays]);

  const loadRecords = useCallback(async () => {
    setRecordsLoading(true);
    try {
      const dateFrom = getDateFrom(recordRangeDays);
      const params = new URLSearchParams({
        page: String(recordPage),
        pageSize: String(recordsPageSize)
      });
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (recordToolId !== "all") params.set("toolId", recordToolId);
      const response = await fetch(`/api/usage-records?${params.toString()}`, { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.ok === false) {
        setRecordsData({ items: [], page: 1, pageSize: recordsPageSize, total: 0, totalPages: 1 });
        return;
      }
      setRecordsData({
        items: (data.items || data.records || []).map((record: UsageRecord) => ({
          ...record,
          createdAt: new Date(record.createdAt).toISOString()
        })),
        page: data.page || recordPage,
        pageSize: data.pageSize || recordsPageSize,
        total: data.total || 0,
        totalPages: data.totalPages || 1
      });
    } finally {
      setRecordsLoading(false);
    }
  }, [recordPage, recordRangeDays, recordToolId]);

  useEffect(() => {
    loadSummary();

    function handleUserUpdate() {
      loadSummary();
      loadRecords();
    }

    window.addEventListener("ai-toolbox-user-updated", handleUserUpdate);
    return () => window.removeEventListener("ai-toolbox-user-updated", handleUserUpdate);
  }, [loadRecords, loadSummary]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  function selectTab(tab: TabId) {
    setActiveTab(tab);
    setDrawerOpen(false);
  }

  function updateRange(value: RangeDays) {
    setRangeDays(value);
    setRecordPage(1);
  }

  function updateRecordTool(toolId: string) {
    setRecordToolId(toolId);
    setRecordPage(1);
  }

  function updateRecordRange(value: RecordRange) {
    setRecordRangeDays(value);
    setRecordPage(1);
  }

  const usageExportHref = useMemo(() => {
    const params = new URLSearchParams({ format: "csv" });
    const dateFrom = getDateFrom(recordRangeDays);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (recordToolId !== "all") params.set("toolId", recordToolId);
    return `/api/usage-records/export?${params.toString()}`;
  }, [recordRangeDays, recordToolId]);

  async function handleLogout() {
    await logoutUser();
    setSummary(null);
    setRecordsData({ items: [], page: 1, pageSize: recordsPageSize, total: 0, totalPages: 1 });
    router.push("/");
  }

  if (loading && !summary) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-12 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <UserCircle className="mx-auto h-12 w-12 text-slate-400" />
          <h1 className="mt-5 text-2xl font-semibold text-slate-950">正在加载用户数据</h1>
          <p className="mt-3 text-sm leading-7 text-slate-500">请稍候。</p>
        </div>
      </main>
    );
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
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600">AI办公工具箱</p>
                <h1 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">{activeItem.label}</h1>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <RangeSelector value={rangeDays} onChange={updateRange} />
                <Link
                  href="/tools"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  去使用工具
                </Link>
              </div>
            </div>

            <div className="pt-6">
              {activeTab === "overview" && summary ? (
                <OverviewPanel
                  stats={overviewStats}
                  summary={summary}
                  rangeDays={rangeDays}
                  onRangeChange={updateRange}
                  onOpenRecords={() => selectTab("records")}
                  onOpenUpgrade={() => setPaymentOpen(true)}
                />
              ) : null}
              {activeTab === "quota" ? <QuotaPanel quotaItems={quotaItems} onOpenUpgrade={() => setPaymentOpen(true)} /> : null}
              {activeTab === "records" ? (
                <RecordsPanel
                  recordsData={recordsData}
                  loading={recordsLoading}
                  toolOptions={toolOptions}
                  selectedToolId={recordToolId}
                  selectedRange={recordRangeDays}
                  exportHref={usageExportHref}
                  onToolChange={updateRecordTool}
                  onRangeChange={updateRecordRange}
                  onPageChange={setRecordPage}
                />
              ) : null}
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

function RangeSelector({ value, onChange }: { value: RangeDays; onChange: (value: RangeDays) => void }) {
  return (
    <div className="inline-flex h-11 rounded-xl border border-slate-200 bg-slate-50 p-1">
      {rangeOptions.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={
            value === item.value
              ? "rounded-lg bg-white px-3 text-sm font-semibold text-slate-950 shadow-sm"
              : "rounded-lg px-3 text-sm font-semibold text-slate-500 transition hover:text-slate-950"
          }
        >
          {item.label}
        </button>
      ))}
    </div>
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
            <p className="truncate text-sm font-semibold text-slate-950">当前用户</p>
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
  summary,
  rangeDays,
  onRangeChange,
  onOpenRecords,
  onOpenUpgrade
}: {
  stats: Array<{ label: string; value: string; note: string }>;
  summary: DashboardSummary;
  rangeDays: RangeDays;
  onRangeChange: (value: RangeDays) => void;
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

      <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <h2 className="font-semibold text-slate-950">调用趋势</h2>
            </div>
            <RangeSelector value={rangeDays} onChange={onRangeChange} />
          </div>
          <UsageTrendChart trend={summary.trend} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="font-semibold text-slate-950">工具分类统计</h2>
          <ToolStatsList stats={summary.byTool} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold text-slate-950">使用概览</h2>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <MiniStat label="成功调用" value={`${summary.totals.successfulCalls} 次`} />
            <MiniStat label="失败调用" value={`${summary.totals.failedCalls} 次`} />
            <MiniStat label="统计范围" value={rangeLabel(rangeDays)} />
          </div>
          <button
            type="button"
            onClick={onOpenRecords}
            className="mt-5 inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            查看分页记录
          </button>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white">
          <h2 className="font-semibold">下一步建议</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">你可以继续体验工具，生成成功后会自动扣减额度并写入使用记录。</p>
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

function UsageTrendChart({ trend }: { trend: TrendItem[] }) {
  const totals = trend.reduce(
    (acc, item) => ({
      total: acc.total + item.total,
      success: acc.success + item.success,
      failed: acc.failed + item.failed
    }),
    { total: 0, success: 0, failed: 0 }
  );
  const maxValue = Math.max(1, ...trend.flatMap((item) => [item.total, item.success, item.failed]));
  const width = 680;
  const height = 220;
  const padding = { top: 18, right: 18, bottom: 30, left: 34 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  function pointFor(item: TrendItem, index: number, key: "total" | "success" | "failed") {
    const x = padding.left + (trend.length <= 1 ? chartWidth / 2 : (index / (trend.length - 1)) * chartWidth);
    const y = padding.top + chartHeight - (item[key] / maxValue) * chartHeight;
    return `${x},${y}`;
  }

  function polyline(key: "total" | "success" | "failed") {
    return trend.map((item, index) => pointFor(item, index, key)).join(" ");
  }

  return (
    <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <MiniStat label="总调用次数" value={`${totals.total} 次`} />
        <MiniStat label="成功次数" value={`${totals.success} 次`} />
        <MiniStat label="失败次数" value={`${totals.failed} 次`} />
      </div>
      {trend.some((item) => item.total > 0) ? (
        <div className="mt-4 overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height}`} className="h-64 min-w-[640px] rounded-xl bg-white">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = padding.top + chartHeight * ratio;
              return <line key={ratio} x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#e2e8f0" strokeWidth="1" />;
            })}
            <polyline fill="none" stroke="#2563eb" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" points={polyline("total")} />
            <polyline fill="none" stroke="#059669" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" points={polyline("success")} />
            <polyline fill="none" stroke="#dc2626" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" points={polyline("failed")} />
            {trend.map((item, index) => {
              const showLabel = trend.length <= 7 || index === 0 || index === trend.length - 1 || index % Math.ceil(trend.length / 6) === 0;
              return showLabel ? (
                <text key={item.date} x={pointFor(item, index, "total").split(",")[0]} y={height - 8} textAnchor="middle" className="fill-slate-400 text-[10px]">
                  {item.date.slice(5)}
                </text>
              ) : null;
            })}
          </svg>
          <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
            <span className="inline-flex items-center gap-2"><i className="h-2 w-5 rounded-full bg-blue-600" />总调用</span>
            <span className="inline-flex items-center gap-2"><i className="h-2 w-5 rounded-full bg-emerald-600" />成功</span>
            <span className="inline-flex items-center gap-2"><i className="h-2 w-5 rounded-full bg-red-600" />失败</span>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex h-48 items-center justify-center rounded-xl bg-white text-center text-sm text-slate-500">当前时间范围内暂无调用记录</div>
      )}
    </div>
  );
}

function ToolStatsList({ stats }: { stats: ToolStat[] }) {
  const maxCount = Math.max(1, ...stats.map((item) => item.count));

  if (!stats.length) {
    return <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">暂无工具调用统计</div>;
  }

  return (
    <div className="mt-5 space-y-3">
      {stats.map((item) => (
        <div key={item.toolId} className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm font-semibold text-slate-950">{item.toolName}</p>
            <p className="shrink-0 text-sm font-semibold text-slate-700">{item.count} 次</p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-slate-950" style={{ width: `${(item.count / maxCount) * 100}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-500">消耗额度 {item.quotaUsed} 次</p>
        </div>
      ))}
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

function RecordsPanel({
  recordsData,
  loading,
  toolOptions,
  selectedToolId,
  selectedRange,
  exportHref,
  onToolChange,
  onRangeChange,
  onPageChange
}: {
  recordsData: RecordsResponse;
  loading: boolean;
  toolOptions: Array<{ toolId: string; toolName: string }>;
  selectedToolId: string;
  selectedRange: RecordRange;
  exportHref: string;
  onToolChange: (toolId: string) => void;
  onRangeChange: (range: RecordRange) => void;
  onPageChange: (page: number) => void;
}) {
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleExportCsv() {
    setExporting(true);
    setExportMessage(null);
    try {
      const response = await fetch(exportHref, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("export_failed");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const disposition = response.headers.get("content-disposition") || "";
      const filenameMatch = disposition.match(/filename="([^"]+)"/);
      link.href = url;
      link.download = filenameMatch?.[1] || `usage-records-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setExportMessage({ type: "success", text: "导出成功，CSV 文件已开始下载。" });
    } catch {
      setExportMessage({ type: "error", text: "导出失败，请稍后重试。" });
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">历史记录详情页</h2>
          <p className="mt-1 text-sm text-slate-500">分页查询当前登录用户的云端使用记录。</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            value={selectedRange}
            onChange={(event) => onRangeChange(event.target.value === "all" ? "all" : (Number(event.target.value) as RangeDays))}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
          >
            {recordRangeOptions.map((range) => (
              <option key={String(range.value)} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          <select
            value={selectedToolId}
            onChange={(event) => onToolChange(event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
          >
            {toolOptions.map((tool) => (
              <option key={tool.toolId} value={tool.toolId}>
                {tool.toolName}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={exporting}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            <Download className="h-4 w-4" />
            {exporting ? "导出中..." : "导出 CSV"}
          </button>
        </div>
      </div>
      {exportMessage ? (
        <div className={exportMessage.type === "success" ? "rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700" : "rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"}>
          {exportMessage.text}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">正在加载使用记录...</div>
      ) : recordsData.items.length ? (
        <>
          <DataTable
            headers={["调用时间", "工具名称", "状态", "消耗额度", "错误信息"]}
            rows={recordsData.items.map((record) => [
              formatDateTime(record.createdAt),
              record.toolName,
              <StatusBadge key="status" status={record.status === "success" ? "已完成" : "失败"} />,
              `${record.quotaUsed} 次`,
              record.errorMessage ? <span className="text-red-600">{record.errorMessage}</span> : null
            ])}
          />
          <Pagination page={recordsData.page} totalPages={recordsData.totalPages} total={recordsData.total} onPageChange={onPageChange} />
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
          <p className="text-lg font-semibold text-slate-950">暂无使用记录，先去体验一个工具吧。</p>
          <Link href="/tools" className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white">
            去体验
          </Link>
        </div>
      )}
    </div>
  );
}

function Pagination({ page, totalPages, total, onPageChange }: { page: number; totalPages: number; total: number; onPageChange: (page: number) => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
      <p>
        共 <span className="font-semibold text-slate-950">{total}</span> 条记录，第 {page} / {totalPages} 页
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="h-9 rounded-xl border border-slate-200 px-4 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300"
        >
          上一页
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="h-9 rounded-xl border border-slate-200 px-4 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300"
        >
          下一页
        </button>
      </div>
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
          <ReadonlyField label="昵称" value="当前用户" />
          <ReadonlyField label="当前套餐" value={user.planName} />
          <ReadonlyField label="邮箱" value={user.email} />
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-lg font-semibold text-slate-950">安全设置</h2>
        <p className="mt-3 text-sm leading-7 text-slate-500">你的账户额度、使用记录和工具调用结果已由云端数据库保存。你可以在不同设备登录并查看历史使用情况。</p>
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

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-950">{value}</p>
    </div>
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
  const success = status === "已完成";
  return <span className={success ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700" : "rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"}>{status}</span>;
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
  const [copied, setCopied] = useState<"email" | "douyin" | null>(null);

  async function copyText(value: string, target: "email" | "douyin") {
    await navigator.clipboard.writeText(value);
    setCopied(target);
    window.setTimeout(() => setCopied(null), 1600);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <Sparkles className="h-5 w-5" />
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <h2 className="mt-5 text-xl font-semibold text-slate-950">支付系统暂未接入</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          支付系统暂未接入。如需继续体验、开通更多额度或定制专属 AI 工具，请通过联系页、邮箱或抖音联系作者。
        </p>
        <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          <p>邮箱：<span className="font-semibold text-slate-950">{AUTHOR_EMAIL}</span></p>
          <p className="mt-1">抖音号：<span className="font-semibold text-slate-950">{AUTHOR_DOUYIN_ID}</span></p>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link href="/contact" className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 text-sm font-semibold text-white">
            联系定制
          </Link>
          <a href={CONTACT_MAILTO} className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-slate-800">
            发送邮件
          </a>
          <button type="button" onClick={() => copyText(AUTHOR_EMAIL, "email")} className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-slate-800">
            {copied === "email" ? "已复制" : "复制邮箱"}
          </button>
          <button type="button" onClick={() => copyText(AUTHOR_DOUYIN_ID, "douyin")} className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-slate-800">
            {copied === "douyin" ? "已复制" : "复制抖音号"}
          </button>
        </div>
        <button type="button" onClick={onClose} className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50">
          关闭
        </button>
      </div>
    </div>
  );
}

function getDateFrom(rangeDays: RecordRange) {
  if (rangeDays === "all") return "";
  const date = new Date();
  date.setDate(date.getDate() - rangeDays + 1);
  return date.toISOString().slice(0, 10);
}

function rangeLabel(rangeDays: RangeDays) {
  if (rangeDays === "all") return "全部";
  return `近 ${rangeDays} 天`;
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
