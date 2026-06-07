"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";

type SubscriptionBrief = {
  plan: string;
  planName?: string;
  status: string;
  credits: number;
  expiresAt: string | null;
};

type AdminUser = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  subscriptions: SubscriptionBrief[];
};

type AdminContact = {
  id: string;
  name: string;
  company: string | null;
  phone: string | null;
  wechat: string | null;
  email: string | null;
  industry: string;
  budget: string;
  createdAt: string;
};

type AdminOrder = {
  id: string;
  userId: string;
  userEmail: string;
  planName: string;
  planPrice: number;
  planCount: number;
  status: string;
  amount: string;
  quotaAmount: number;
  paymentStatus: string;
  paymentProvider: string;
  paymentMethod: string | null;
  paymentTime: string | null;
  paymentScreenshot: string | null;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
};

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
  users: AdminUser[];
  contacts: AdminContact[];
  orders: AdminOrder[];
};

type ToolFreeUsage = {
  toolId: string;
  toolName: string;
  used: number;
  total: number;
  remaining: number;
};

type UserUsageRecord = {
  id: string;
  toolId: string;
  toolName: string;
  status: string;
  quotaUsed: number;
  errorMessage: string | null;
  createdAt: string;
};

type UserUsageDetail = {
  ok: boolean;
  message?: string;
  user: {
    id: string;
    email: string;
  };
  freeUsage: ToolFreeUsage[];
  subscription: SubscriptionBrief | null;
  records: UserUsageRecord[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

const previewLimit = 7;

const exportLinks = [
  { label: "导出用户", href: "/api/admin/export?type=users" },
  { label: "导出联系表单", href: "/api/admin/export?type=contacts" },
  { label: "导出使用记录", href: "/api/admin/export?type=usage" },
  { label: "导出订单", href: "/api/admin/export?type=orders" }
];

const statusLabels: Record<string, string> = {
  pending: "待付款",
  claimed_paid: "用户已提交付款",
  paid: "已确认收款"
};

export default function AdminPageClient() {
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usersExpanded, setUsersExpanded] = useState(false);
  const [contactsExpanded, setContactsExpanded] = useState(false);
  const [orderFilter, setOrderFilter] = useState("pending_review");
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [deletingOrders, setDeletingOrders] = useState(false);
  const [deletingContacts, setDeletingContacts] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userUsage, setUserUsage] = useState<UserUsageDetail | null>(null);
  const [userUsageLoading, setUserUsageLoading] = useState(false);
  const [userUsageError, setUserUsageError] = useState("");
  const [grantEmail, setGrantEmail] = useState("");
  const [grantPlan, setGrantPlan] = useState("basic");
  const [grantMessage, setGrantMessage] = useState("");
  const [granting, setGranting] = useState(false);
  const [confirmingOrderId, setConfirmingOrderId] = useState("");

  const visibleUsers = useMemo(() => (usersExpanded ? summary?.users || [] : (summary?.users || []).slice(0, previewLimit)), [summary?.users, usersExpanded]);
  const visibleContacts = useMemo(() => (contactsExpanded ? summary?.contacts || [] : (summary?.contacts || []).slice(0, previewLimit)), [contactsExpanded, summary?.contacts]);
  const filteredOrders = useMemo(() => {
    const orders = summary?.orders || [];
    if (orderFilter === "all") return orders;
    if (orderFilter === "pending_review") return orders.filter((order) => order.status === "pending" || order.status === "claimed_paid");
    return orders.filter((order) => order.status === orderFilter);
  }, [orderFilter, summary?.orders]);

  useEffect(() => {
    setSelectedOrderIds((ids) => ids.filter((id) => filteredOrders.some((order) => order.id === id && order.status === "pending")));
  }, [filteredOrders]);

  useEffect(() => {
    setSelectedContactIds((ids) => ids.filter((id) => visibleContacts.some((contact) => contact.id === id)));
  }, [visibleContacts]);

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

  async function loadUserUsage(userId: string, page = 1) {
    setSelectedUserId(userId);
    setUserUsageLoading(true);
    setUserUsageError("");
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/usage?page=${page}&pageSize=12`, { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.ok === false) {
        setUserUsage(null);
        setUserUsageError(data?.message || "用户使用记录加载失败。");
        return;
      }
      setUserUsage(data);
    } finally {
      setUserUsageLoading(false);
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
        if (selectedUserId) await loadUserUsage(selectedUserId);
      }
    } finally {
      setGranting(false);
    }
  }

  async function confirmOrder(orderId: string) {
    setConfirmingOrderId(orderId);
    setGrantMessage("");
    try {
      const response = await fetch("/api/admin/subscriptions/grant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId })
      });
      const data = await response.json().catch(() => ({}));
      setGrantMessage(data?.message || (response.ok ? "已确认收款。" : "确认失败。"));
      if (response.ok && data?.ok !== false) {
        await loadSummary();
        if (selectedUserId) await loadUserUsage(selectedUserId);
      }
    } finally {
      setConfirmingOrderId("");
    }
  }

  async function deleteSelectedOrders() {
    if (!selectedOrderIds.length) return;
    setDeletingOrders(true);
    setGrantMessage("");
    try {
      const response = await fetch("/api/admin/orders/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedOrderIds })
      });
      const data = await response.json().catch(() => ({}));
      setGrantMessage(data?.message || (response.ok ? "订单已删除。" : "订单删除失败。"));
      if (response.ok && data?.ok !== false) {
        setSelectedOrderIds([]);
        await loadSummary();
      }
    } finally {
      setDeletingOrders(false);
    }
  }

  async function deleteSelectedContacts() {
    if (!selectedContactIds.length) return;
    setDeletingContacts(true);
    setGrantMessage("");
    try {
      const response = await fetch("/api/admin/contacts/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedContactIds })
      });
      const data = await response.json().catch(() => ({}));
      setGrantMessage(data?.message || (response.ok ? "联系表单已删除。" : "联系表单删除失败。"));
      if (response.ok && data?.ok !== false) {
        setSelectedContactIds([]);
        await loadSummary();
      }
    } finally {
      setDeletingContacts(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">AI办公工具箱</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">管理员后台</h1>
            <p className="mt-2 text-sm text-slate-500">查看用户、联系表单、订单、套餐和使用数据。</p>
          </div>
          <Link href="/dashboard" className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800">
            返回个人中心
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

            {grantMessage ? <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm font-semibold text-blue-800">{grantMessage}</div> : null}

            <Section title="订单管理" description="优先处理待付款和用户已提交付款的订单。只有待付款订单可以批量删除，已提交付款和已确认订单不会被删除。">
              <div className="mb-4 flex flex-wrap gap-2">
                {[
                  ["pending_review", "待处理"],
                  ["pending", "待付款"],
                  ["claimed_paid", "已提交付款"],
                  ["paid", "已确认"],
                  ["all", "全部"]
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setOrderFilter(value)}
                    className={orderFilter === value ? "h-9 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white" : "h-9 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <BulkToolbar
                count={selectedOrderIds.length}
                buttonText={deletingOrders ? "删除中..." : "删除选中待付款订单"}
                disabled={!selectedOrderIds.length || deletingOrders}
                onDelete={deleteSelectedOrders}
              />
              <OrderTable
                orders={filteredOrders}
                selectedIds={selectedOrderIds}
                onSelectionChange={setSelectedOrderIds}
                confirmingOrderId={confirmingOrderId}
                onConfirm={confirmOrder}
              />
            </Section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">手动开通套餐</h2>
              <p className="mt-1 text-sm text-slate-500">用于线下沟通或特殊情况开通，不绑定订单。</p>
              <form onSubmit={grantSubscription} className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_auto]">
                <input
                  value={grantEmail}
                  onChange={(event) => setGrantEmail(event.target.value)}
                  placeholder="用户邮箱"
                  className="h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-400"
                />
                <select value={grantPlan} onChange={(event) => setGrantPlan(event.target.value)} className="h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-400">
                  <option value="basic">体验套餐 20 次</option>
                  <option value="standard">标准套餐 50 次</option>
                  <option value="pro">高级套餐 150 次</option>
                </select>
                <button disabled={granting} className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white disabled:opacity-60">
                  {granting ? "开通中..." : "开通"}
                </button>
              </form>
            </section>

            <Section
              title="用户管理"
              description={`默认显示最近 ${previewLimit} 个用户，点击用户右侧入口查看个人使用记录。`}
              action={summary.users.length > previewLimit ? <ToggleButton expanded={usersExpanded} onClick={() => setUsersExpanded((value) => !value)} /> : null}
            >
              <UserTable users={visibleUsers} selectedUserId={selectedUserId} onInspect={(userId) => void loadUserUsage(userId)} />
            </Section>

            {selectedUserId ? (
              <Section title="用户使用详情" description="展示该用户的工具使用情况、剩余免费次数和最近调用记录。">
                {userUsageLoading ? <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">正在加载用户使用记录...</div> : null}
                {userUsageError ? <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">{userUsageError}</div> : null}
                {userUsage ? <UserUsageDetailPanel detail={userUsage} onPageChange={(page) => void loadUserUsage(userUsage.user.id, page)} /> : null}
              </Section>
            ) : null}

            <Section
              title="联系表单"
              description={`默认显示最近 ${previewLimit} 条联系记录，可展开查看已加载的历史记录。删除只影响本地 Neon 数据，不会删除飞书多维表格中的记录。`}
              action={summary.contacts.length > previewLimit ? <ToggleButton expanded={contactsExpanded} onClick={() => setContactsExpanded((value) => !value)} /> : null}
            >
              <BulkToolbar
                count={selectedContactIds.length}
                buttonText={deletingContacts ? "删除中..." : "删除选中联系表单"}
                disabled={!selectedContactIds.length || deletingContacts}
                onDelete={deleteSelectedContacts}
              />
              <ContactTable contacts={visibleContacts} selectedIds={selectedContactIds} onSelectionChange={setSelectedContactIds} />
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

function Section({ title, description, action, children }: { title: string; description?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
          {description ? <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="mt-4 overflow-x-auto">{children}</div>
    </section>
  );
}

function BulkToolbar({ count, buttonText, disabled, onDelete }: { count: number; buttonText: string; disabled: boolean; onDelete: () => void }) {
  return (
    <div className="mb-3 flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
      <span>已选中 {count} 条</span>
      <button type="button" disabled={disabled} onClick={onDelete} className="inline-flex h-9 items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
        {buttonText}
      </button>
    </div>
  );
}

function ToggleButton({ expanded, onClick }: { expanded: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
      {expanded ? "收起" : "查看更多"}
    </button>
  );
}

function UserTable({ users, selectedUserId, onInspect }: { users: AdminUser[]; selectedUserId: string; onInspect: (userId: string) => void }) {
  return (
    <SimpleTable headers={["邮箱", "角色", "套餐", "剩余次数", "注册时间", "操作"]}>
      {users.length ? (
        users.map((user) => {
          const subscription = user.subscriptions[0];
          return (
            <tr key={user.id} className={selectedUserId === user.id ? "border-b border-blue-100 bg-blue-50/50 last:border-b-0" : "border-b border-slate-100 last:border-b-0"}>
              <td className="py-3 pr-4 font-semibold text-slate-900">{user.email}</td>
              <td className="py-3 pr-4 text-slate-700">{user.role}</td>
              <td className="py-3 pr-4 text-slate-700">{subscription?.plan || "-"}</td>
              <td className="py-3 pr-4 text-slate-700">{subscription?.credits ?? "-"}</td>
              <td className="py-3 pr-4 text-slate-700">{formatDate(user.createdAt)}</td>
              <td className="py-3 pr-4">
                <button type="button" onClick={() => onInspect(user.id)} className="inline-flex h-9 items-center justify-center rounded-xl bg-slate-950 px-3 text-xs font-semibold text-white">
                  查看使用记录
                </button>
              </td>
            </tr>
          );
        })
      ) : (
        <EmptyRow colSpan={6} />
      )}
    </SimpleTable>
  );
}

function ContactTable({ contacts, selectedIds, onSelectionChange }: { contacts: AdminContact[]; selectedIds: string[]; onSelectionChange: (ids: string[]) => void }) {
  const allIds = contacts.map((item) => item.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));

  function toggleAll(checked: boolean) {
    onSelectionChange(checked ? allIds : []);
  }

  function toggleOne(id: string, checked: boolean) {
    onSelectionChange(checked ? Array.from(new Set([...selectedIds, id])) : selectedIds.filter((item) => item !== id));
  }

  return (
    <SimpleTable
      headers={[
        <input key="select" type="checkbox" checked={allSelected} onChange={(event) => toggleAll(event.target.checked)} aria-label="全选联系表单" />,
        "时间",
        "姓名",
        "公司",
        "手机",
        "微信",
        "邮箱",
        "行业",
        "预算"
      ]}
    >
      {contacts.length ? (
        contacts.map((item) => (
          <tr key={item.id} className="border-b border-slate-100 last:border-b-0">
            <td className="py-3 pr-4">
              <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={(event) => toggleOne(item.id, event.target.checked)} aria-label={`选择联系表单 ${item.name}`} />
            </td>
            <td className="py-3 pr-4 text-slate-700">{formatDate(item.createdAt)}</td>
            <td className="py-3 pr-4 font-semibold text-slate-900">{item.name}</td>
            <td className="py-3 pr-4 text-slate-700">{item.company || "-"}</td>
            <td className="py-3 pr-4 text-slate-700">{item.phone || "-"}</td>
            <td className="py-3 pr-4 text-slate-700">{item.wechat || "-"}</td>
            <td className="py-3 pr-4 text-slate-700">{item.email || "-"}</td>
            <td className="py-3 pr-4 text-slate-700">{item.industry}</td>
            <td className="py-3 pr-4 text-slate-700">{item.budget}</td>
          </tr>
        ))
      ) : (
        <EmptyRow colSpan={9} />
      )}
    </SimpleTable>
  );
}

function UserUsageDetailPanel({ detail, onPageChange }: { detail: UserUsageDetail; onPageChange: (page: number) => void }) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">当前用户</p>
            <p className="mt-1 text-base font-semibold text-slate-950">{detail.user.email}</p>
          </div>
          <div className="text-sm font-semibold text-slate-700">
            套餐：{detail.subscription?.planName || "免费体验版"}
            {detail.subscription ? `（剩余 ${detail.subscription.credits} 次）` : ""}
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {detail.freeUsage.map((item) => (
          <div key={item.toolId} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-950">{item.toolName}</p>
            <p className="mt-2 text-sm text-slate-500">免费次数 {item.used}/{item.total}</p>
            <p className="mt-1 text-sm text-slate-500">剩余 {item.remaining} 次</p>
          </div>
        ))}
      </div>

      <SimpleTable headers={["时间", "工具名称", "状态", "消耗次数", "错误信息"]}>
        {detail.records.length ? (
          detail.records.map((record) => (
            <tr key={record.id} className="border-b border-slate-100 last:border-b-0">
              <td className="py-3 pr-4 text-slate-700">{formatDate(record.createdAt)}</td>
              <td className="py-3 pr-4 font-semibold text-slate-900">{record.toolName}</td>
              <td className="py-3 pr-4 text-slate-700">{record.status === "success" ? "成功" : "失败"}</td>
              <td className="py-3 pr-4 text-slate-700">{record.quotaUsed}</td>
              <td className="py-3 pr-4 text-slate-700">{record.errorMessage || "-"}</td>
            </tr>
          ))
        ) : (
          <EmptyRow colSpan={5} />
        )}
      </SimpleTable>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">共 {detail.total} 条，第 {detail.page}/{detail.totalPages} 页</p>
        <div className="flex gap-2">
          <button type="button" disabled={detail.page <= 1} onClick={() => onPageChange(detail.page - 1)} className="h-9 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">
            上一页
          </button>
          <button type="button" disabled={detail.page >= detail.totalPages} onClick={() => onPageChange(detail.page + 1)} className="h-9 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">
            下一页
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderTable({
  orders,
  selectedIds,
  onSelectionChange,
  confirmingOrderId,
  onConfirm
}: {
  orders: AdminOrder[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  confirmingOrderId: string;
  onConfirm: (orderId: string) => void;
}) {
  const selectableIds = orders.filter((order) => order.status === "pending").map((order) => order.id);
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds.includes(id));

  function toggleAll(checked: boolean) {
    onSelectionChange(checked ? selectableIds : []);
  }

  function toggleOne(id: string, checked: boolean) {
    onSelectionChange(checked ? Array.from(new Set([...selectedIds, id])) : selectedIds.filter((item) => item !== id));
  }

  return (
    <SimpleTable
      headers={[
        <input key="select" type="checkbox" checked={allSelected} disabled={!selectableIds.length} onChange={(event) => toggleAll(event.target.checked)} aria-label="全选待付款订单" />,
        "创建订单时间",
        "付款时间",
        "用户邮箱",
        "套餐",
        "金额",
        "状态",
        "付款方式",
        "付款截图",
        "操作"
      ]}
    >
      {orders.length ? (
        orders.map((order) => {
          const selectable = order.status === "pending";
          return (
            <tr key={order.id} className="border-b border-slate-100 last:border-b-0">
              <td className="py-3 pr-4">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(order.id)}
                  disabled={!selectable}
                  onChange={(event) => toggleOne(order.id, event.target.checked)}
                  aria-label={`选择订单 ${order.id}`}
                />
              </td>
              <td className="py-3 pr-4 text-slate-700">{formatDate(order.createdAt)}</td>
              <td className="py-3 pr-4 text-slate-700">{order.paymentTime ? formatDate(order.paymentTime) : "-"}</td>
              <td className="py-3 pr-4 font-semibold text-slate-900">{order.userEmail}</td>
              <td className="py-3 pr-4 text-slate-700">
                {order.planName} / {order.planCount} 次
              </td>
              <td className="py-3 pr-4 text-slate-700">¥ {Number(order.planPrice).toFixed(1)}</td>
              <td className="py-3 pr-4 text-slate-700">
                <StatusBadge status={order.status} />
              </td>
              <td className="py-3 pr-4 text-slate-700">{formatPaymentMethod(order.paymentMethod || order.paymentProvider)}</td>
              <td className="py-3 pr-4 text-slate-700">
                {order.paymentScreenshot ? (
                  <a href={order.paymentScreenshot} target="_blank" rel="noreferrer" className="font-semibold text-blue-700 hover:underline">
                    查看截图
                  </a>
                ) : (
                  "-"
                )}
              </td>
              <td className="py-3 pr-4">
                {order.status === "paid" ? (
                  <span className="text-sm font-semibold text-emerald-700">已开通</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onConfirm(order.id)}
                    disabled={confirmingOrderId === order.id}
                    className="inline-flex h-9 items-center justify-center rounded-xl bg-slate-950 px-3 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    {confirmingOrderId === order.id ? "确认中..." : "确认收款"}
                  </button>
                )}
              </td>
            </tr>
          );
        })
      ) : (
        <EmptyRow colSpan={10} />
      )}
    </SimpleTable>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label = statusLabels[status] || status;
  const className =
    status === "paid"
      ? "bg-emerald-50 text-emerald-700"
      : status === "claimed_paid"
        ? "bg-blue-50 text-blue-700"
        : "bg-amber-50 text-amber-700";
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}>{label}</span>;
}

function SimpleTable({ headers, children }: { headers: ReactNode[]; children: ReactNode }) {
  return (
    <table className="w-full min-w-[900px] border-collapse text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-left text-slate-500">
          {headers.map((header, index) => (
            <th key={typeof header === "string" ? header : index} className="py-3 pr-4 font-semibold">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children || <EmptyRow colSpan={headers.length} />}</tbody>
    </table>
  );
}

function EmptyRow({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td className="py-6 text-slate-500" colSpan={colSpan}>
        暂无数据
      </td>
    </tr>
  );
}

function formatPaymentMethod(value: string | null | undefined) {
  if (value === "wechat") return "微信";
  if (value === "alipay") return "支付宝";
  if (value === "manual") return "人工";
  return value || "-";
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
