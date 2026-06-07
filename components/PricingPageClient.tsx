"use client";

import { ArrowRight, CheckCircle2, HelpCircle, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import SmartEntryLink from "@/components/SmartEntryLink";

type Plan = {
  id: "basic" | "standard" | "pro";
  name: string;
  price: string;
  count: string;
  description: string;
  features: string[];
  featured?: boolean;
};

const plans: Plan[] = [
  {
    id: "basic",
    name: "体验套餐",
    price: "9.9 元",
    count: "20 次",
    description: "适合偶尔处理文件和临时办公任务。",
    features: ["20 次工具调用", "支持全部 7 个工具", "支持历史记录", "30 天有效"]
  },
  {
    id: "standard",
    name: "标准套餐",
    price: "19.9 元",
    count: "50 次",
    description: "适合稳定使用 AI 办公工具的个人或小团队。",
    features: ["50 次工具调用", "支持全部 7 个工具", "支持个人中心统计", "30 天有效"],
    featured: true
  },
  {
    id: "pro",
    name: "高级套餐",
    price: "49.9 元",
    count: "150 次",
    description: "适合高频使用和连续处理办公任务。",
    features: ["150 次工具调用", "支持全部 7 个工具", "适合高频文档处理", "30 天有效"]
  }
];

const faqs = [
  {
    question: "免费次数怎么计算？",
    answer: "新用户每个工具默认赠送 1 次免费体验。某个工具的免费次数用完后，需要购买套餐继续使用。"
  },
  {
    question: "套餐次数是否跨工具通用？",
    answer: "是。购买套餐后，套餐次数在全部 7 个工具之间通用，每次成功调用消耗 1 次。"
  },
  {
    question: "现在是否是自动支付？",
    answer: "当前是人工支付确认流程：创建订单后扫码付款，提交付款信息，管理员确认收款后自动开通套餐。"
  },
  {
    question: "可以做企业定制吗？",
    answer: "可以。你可以通过联系定制页面提交需求，表单会同步到飞书需求表并保存到数据库。"
  }
];

export default function PricingPageClient() {
  const router = useRouter();
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
      router.push(data.paymentUrl || `/payment/${data.order.id}`);
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
            首次免费，套餐按次购买
          </div>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-6xl">AI 办公工具箱套餐</h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            新用户每个工具可免费体验 1 次。免费次数用完后，可购买套餐继续使用。当前采用人工支付确认，付款后管理员确认即可开通。
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
              <p className={plan.featured ? "mt-2 text-sm font-semibold text-blue-200" : "mt-2 text-sm font-semibold text-blue-700"}>{plan.count}</p>
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
        {orderMessage ? <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm leading-6 text-red-700">{orderMessage}</div> : null}
      </section>

      <section className="border-y border-slate-200 bg-slate-50 px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <SectionHeader title="套餐对比" description="三个套餐均为 30 天有效，不设不限次数套餐。次数在全部工具之间通用。" />
          <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
                  <th className="px-5 py-4 font-semibold">套餐</th>
                  <th className="px-5 py-4 font-semibold">价格</th>
                  <th className="px-5 py-4 font-semibold">次数</th>
                  <th className="px-5 py-4 font-semibold">适合人群</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-5 py-4 font-semibold">{plan.name}</td>
                    <td className="px-5 py-4">{plan.price}</td>
                    <td className="px-5 py-4">{plan.count}</td>
                    <td className="px-5 py-4">{plan.description}</td>
                  </tr>
                ))}
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
