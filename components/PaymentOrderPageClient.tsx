"use client";

import { CheckCircle2, Clock3, Loader2, UploadCloud } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type PaymentMethod = "wechat" | "alipay";

type PaymentOrder = {
  id: string;
  userEmail: string;
  planName: string;
  planPrice: number;
  planCount: number;
  status: string;
  paymentMethod: string | null;
  paymentTime: string | null;
  paymentScreenshot: string | null;
  createdAt: string;
  paidAt: string | null;
};

const statusLabels: Record<string, string> = {
  pending: "待付款",
  claimed_paid: "已提交付款，待确认",
  paid: "已确认收款"
};

const paymentMethods: Array<{
  id: PaymentMethod;
  label: string;
  title: string;
  description: string;
  image: string;
  tone: "green" | "blue";
}> = [
  {
    id: "wechat",
    label: "微信支付",
    title: "微信收款码",
    description: "请使用微信扫一扫，按订单金额付款。",
    image: "/payment/wechat-pay.jpg",
    tone: "green"
  },
  {
    id: "alipay",
    label: "支付宝",
    title: "支付宝收款码",
    description: "请使用支付宝扫一扫，按订单金额付款。",
    image: "/payment/alipay-pay.jpg",
    tone: "blue"
  }
];

export default function PaymentOrderPageClient({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("wechat");
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const selectedPayment = paymentMethods.find((item) => item.id === paymentMethod) || paymentMethods[0];

  async function loadOrder() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/payment/order?orderId=${encodeURIComponent(orderId)}`, { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.ok === false) {
        setError(data?.message || "订单加载失败。");
        return;
      }
      setOrder(data.order);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOrder();
  }, [orderId]);

  async function submitClaim(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!order) return;
    setSubmitting(true);
    setMessage("");
    setError("");
    try {
      const formData = new FormData();
      formData.set("orderId", order.id);
      formData.set("userEmail", order.userEmail);
      formData.set("paymentMethod", paymentMethod);
      if (screenshot) formData.set("paymentScreenshot", screenshot);

      const response = await fetch("/api/payment/claim-order", {
        method: "POST",
        body: formData
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.ok === false) {
        setError(data?.message || "付款信息提交失败。");
        return;
      }
      setMessage(data?.message || "付款信息已提交，请等待管理员确认。");
      await loadOrder();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">AI办公工具箱</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">订单支付</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">请选择付款方式并扫码付款，付款后提交确认信息等待管理员核对。</p>
          </div>
          <Link href="/dashboard" className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800">
            返回个人中心
          </Link>
        </div>

        {loading ? <Notice tone="neutral" text="正在加载订单..." /> : null}
        {error ? <Notice tone="error" text={error} /> : null}
        {message ? <Notice tone="success" text={message} /> : null}

        {order ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-slate-950">订单信息</h2>
                <StatusBadge status={order.status} />
              </div>
              <dl className="mt-6 space-y-4 text-sm">
                <InfoRow label="订单号" value={order.id} strong />
                <InfoRow label="用户邮箱" value={order.userEmail} />
                <InfoRow label="套餐" value={`${order.planName} / ${order.planCount} 次`} />
                <InfoRow label="金额" value={`¥ ${order.planPrice.toFixed(1)}`} strong />
                <InfoRow label="创建订单时间" value={formatDate(order.createdAt)} />
                {order.paymentMethod ? <InfoRow label="付款方式" value={formatPaymentMethod(order.paymentMethod)} /> : null}
                {order.paymentTime ? <InfoRow label="付款时间" value={formatDate(order.paymentTime)} /> : null}
              </dl>
              {order.status === "paid" ? (
                <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm leading-6 text-emerald-700">
                  <CheckCircle2 className="mb-2 h-5 w-5" />
                  管理员已确认收款，套餐已开通。你可以返回个人中心查看剩余额度。
                </div>
              ) : null}
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">扫码付款</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">先选择付款方式，再使用对应二维码付款。页面不会自动扣款。</p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={
                      paymentMethod === method.id
                        ? "h-12 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white"
                        : "h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    }
                  >
                    {method.label}
                  </button>
                ))}
              </div>

              <PaymentQr title={selectedPayment.title} description={selectedPayment.description} src={selectedPayment.image} tone={selectedPayment.tone} />

              <form onSubmit={submitClaim} className="mt-6 space-y-4">
                <label className="block rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <UploadCloud className="h-4 w-4" />
                    付款截图，可选
                  </span>
                  <input type="file" accept="image/*" onChange={(event) => setScreenshot(event.target.files?.[0] || null)} className="mt-3 block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white" />
                  <span className="mt-2 block text-xs text-slate-500">最多 2MB。文件会随订单保存，用于管理员核对。</span>
                </label>
                <button disabled={submitting || order.status === "paid"} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock3 className="h-4 w-4" />}
                  {order.status === "paid" ? "订单已完成" : "我已付款，提交确认"}
                </button>
                <p className="text-xs leading-5 text-slate-500">点击提交时，系统会自动记录当前付款提交时间，并显示在管理员订单详情中。</p>
              </form>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function PaymentQr({ title, description, src, tone }: { title: string; description: string; src: string; tone: "green" | "blue" }) {
  return (
    <div className={tone === "green" ? "mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4" : "mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4"}>
      <p className={tone === "green" ? "text-sm font-semibold text-emerald-800" : "text-sm font-semibold text-blue-800"}>{title}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      <div className="mx-auto mt-3 max-w-sm overflow-hidden rounded-xl bg-white">
        <Image src={src} width={520} height={720} alt={`${title}收款码`} className="h-auto w-full" priority={false} />
      </div>
    </div>
  );
}

function InfoRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className={strong ? "break-all text-right font-semibold text-slate-950" : "break-all text-right text-slate-700"}>{value}</dd>
    </div>
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

function Notice({ tone, text }: { tone: "neutral" | "success" | "error"; text: string }) {
  const className =
    tone === "success"
      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
      : tone === "error"
        ? "border-red-100 bg-red-50 text-red-700"
        : "border-slate-200 bg-white text-slate-600";
  return <div className={`mt-6 rounded-2xl border px-5 py-4 text-sm font-semibold ${className}`}>{text}</div>;
}

function formatPaymentMethod(value: string) {
  if (value === "wechat") return "微信";
  if (value === "alipay") return "支付宝";
  return value;
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
