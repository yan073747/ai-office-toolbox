"use client";

import { ArrowRight, CheckCircle2, HelpCircle, Loader2, Sparkles, X } from "lucide-react";
import { AUTHOR_DOUYIN_ID, AUTHOR_EMAIL, CONTACT_MAILTO } from "@/lib/contact-info";
import SmartEntryLink from "@/components/SmartEntryLink";
import Link from "next/link";
import { useState } from "react";

type Plan = {
  id: "basic" | "standard" | "pro";
  name: string;
  price: string;
  description: string;
  features: string[];
  featured?: boolean;
};

const plans: Plan[] = [
  {
    id: "basic",
    name: "基础版",
    price: "9.9 元",
    description: "适合偶尔处理文件和临时办公任务。",
    features: ["20 次工具调用", "支持全部 7 个工具", "支持历史记录", "适合低频个人使用"]
  },
  {
    id: "standard",
    name: "标准版",
    price: "29.9 元",
    description: "适合稳定使用 AI 办公工具的个人或小团队。",
    features: ["100 次工具调用", "支持全部 7 个工具", "支持 Dashboard 统计", "更适合持续办公场景"],
    featured: true
  },
  {
    id: "pro",
    name: "高级版",
    price: "99 元",
    description: "适合高频使用和连续处理任务。",
    features: ["30 天内不限次调用", "支持全部 7 个工具", "适合高频文档处理", "可咨询定制工作流"]
  }
];

const faqs = [
  {
    question: "免费次数怎么计算？",
    answer: "新用户每个工具默认赠送 1 次免费体验。某个工具的免费次数用完后，需要购买套餐或联系作者继续使用。"
  },
  {
    question: "套餐次数是否跨工具通用？",
    answer: "基础版和标准版的调用次数在全部 7 个工具之间通用。高级版在有效期内不限次使用。"
  },
  {
    question: "现在是否已经接入自动支付？",
    answer: "当前版本已支持创建订单和套餐数据结构，但真实支付回调仍需接入微信、支付宝或其他支付服务后才能自动开通。"
  },
  {
    question: "可以做企业定制吗？",
    answer: "可以。你可以通过联系定制页面提交需求，表单会同步到飞书需求表。"
  }
];

export default function PricingPageClient() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [orderMessage, setOrderMessage] = useState("");

  async function createOrder(plan: Plan) {
    setLoadingPlan(plan.id);
    setOrderMessage("");
    try {
      const response = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: plan.id })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.ok === false) {
        setOrderMessage(typeof data?.message === "string" ? data.message : "订单创建失败，请稍后重试。");
        return;
      }
      setSelectedPlan(plan);
      setOrderMessage(data?.message || "订单已创建，请联系作者开通套餐。");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#F8FAFC_0%,#FFFFFF_100%)] px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            <Sparkles className="h-4 w-4 text-blue-600" />
            首次免费，后续按需购买
          </div>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-6xl">
            AI 办公工具箱套餐
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            新用户每个工具可免费体验 1 次。免费次数用完后，可购买套餐继续使用，或联系作者定制专属 AI 工具。
          </p>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={
                plan.featured
                  ? "relative rounded-3xl border border-slate-950 bg-slate-950 p-6 text-white shadow-[0_30px_90px_rgba(15,23,42,0.2)]"
                  : "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_24px_70px_rgba(15,23,42,0.08)]"
              }
            >
              {plan.featured ? <span className="absolute right-5 top-5 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white">推荐</span> : null}
              <h2 className={plan.featured ? "text-xl font-semibold text-white" : "text-xl font-semibold text-slate-950"}>{plan.name}</h2>
              <p className={plan.featured ? "mt-3 text-sm leading-6 text-slate-300" : "mt-3 text-sm leading-6 text-slate-500"}>{plan.description}</p>
              <p className={plan.featured ? "mt-6 text-4xl font-semibold text-white" : "mt-6 text-4xl font-semibold text-slate-950"}>{plan.price}</p>
              <div className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className={plan.featured ? "flex gap-3 text-sm text-slate-200" : "flex gap-3 text-sm text-slate-700"}>
                    <CheckCircle2 className={plan.featured ? "mt-0.5 h-4 w-4 shrink-0 text-blue-300" : "mt-0.5 h-4 w-4 shrink-0 text-blue-600"} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => createOrder(plan)}
                disabled={loadingPlan === plan.id}
                className={
                  plan.featured
                    ? "mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-slate-950 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-70"
                    : "mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                }
              >
                {loadingPlan === plan.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                购买套餐
              </button>
            </article>
          ))}
        </div>
        {orderMessage ? (
          <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm leading-6 text-blue-900">{orderMessage}</div>
        ) : null}
      </section>

      <section className="border-y border-slate-200 bg-slate-50 px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <SectionHeader title="套餐对比" description="基础版、标准版按次数消耗，高级版在有效期内不限次调用。" />
          <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
                  <th className="px-5 py-4 font-semibold">套餐</th>
                  <th className="px-5 py-4 font-semibold">价格</th>
                  <th className="px-5 py-4 font-semibold">额度</th>
                  <th className="px-5 py-4 font-semibold">适合人群</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="px-5 py-4 font-semibold">基础版</td>
                  <td className="px-5 py-4">9.9 元</td>
                  <td className="px-5 py-4">20 次</td>
                  <td className="px-5 py-4">低频个人使用</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-5 py-4 font-semibold">标准版</td>
                  <td className="px-5 py-4">29.9 元</td>
                  <td className="px-5 py-4">100 次</td>
                  <td className="px-5 py-4">稳定办公场景</td>
                </tr>
                <tr>
                  <td className="px-5 py-4 font-semibold">高级版</td>
                  <td className="px-5 py-4">99 元</td>
                  <td className="px-5 py-4">30 天不限次</td>
                  <td className="px-5 py-4">高频处理任务</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <SectionHeader title="常见问题" />
          <div className="mt-10 divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-white px-6 shadow-sm">
            {faqs.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-slate-950">
                  <span className="flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-blue-600" />
                    {faq.question}
                  </span>
                  <span className="text-slate-400 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-7 text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_28px_90px_rgba(15,23,42,0.18)] sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-normal sm:text-4xl">不确定选哪个套餐？</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">可以先免费体验，也可以告诉我你的使用频率和业务场景，我会推荐更合适的方案。</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/contact" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-blue-50">
                联系定制
                <ArrowRight className="h-4 w-4" />
              </Link>
              <SmartEntryLink className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/15 px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10">
                先免费体验
                <ArrowRight className="h-4 w-4" />
              </SmartEntryLink>
            </div>
          </div>
        </div>
      </section>

      {selectedPlan ? <OrderContactModal plan={selectedPlan} message={orderMessage} onClose={() => setSelectedPlan(null)} /> : null}
    </main>
  );
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <h2 className="text-2xl font-semibold tracking-normal text-slate-950 sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-8 text-slate-600">{description}</p> : null}
    </div>
  );
}

function OrderContactModal({ plan, message, onClose }: { plan: Plan; message: string; onClose: () => void }) {
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
        <h2 className="mt-5 text-xl font-semibold text-slate-950">已选择 {plan.name}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">{message || "订单已创建，请联系作者开通套餐。"}</p>
        <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          <p>
            邮箱：<span className="font-semibold text-slate-950">{AUTHOR_EMAIL}</span>
          </p>
          <p className="mt-1">
            抖音号：<span className="font-semibold text-slate-950">{AUTHOR_DOUYIN_ID}</span>
          </p>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <a href={CONTACT_MAILTO} className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 text-sm font-semibold text-white">
            发送邮件
          </a>
          <Link href="/contact" className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-slate-800">
            联系定制
          </Link>
        </div>
      </div>
    </div>
  );
}
