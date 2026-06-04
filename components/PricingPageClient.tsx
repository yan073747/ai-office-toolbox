"use client";

import { ArrowRight, CheckCircle2, HelpCircle, Sparkles, X } from "lucide-react";
import { AUTHOR_DOUYIN_ID, AUTHOR_EMAIL, CONTACT_MAILTO } from "@/lib/contact-info";
import SmartEntryLink from "@/components/SmartEntryLink";
import Link from "next/link";
import { useState } from "react";

type Plan = {
  name: string;
  price: string;
  description: string;
  features: string[];
  button: string;
  action: "trial" | "pay" | "contact";
  featured?: boolean;
};

const plans: Plan[] = [
  {
    name: "免费体验",
    price: "¥0",
    description: "适合首次体验 AI 办公工具效果。",
    features: ["免费使用 1 次", "可体验任意一个工具", "支持基础生成结果", "不支持批量处理"],
    button: "立即体验",
    action: "trial"
  },
  {
    name: "按次使用",
    price: "¥9.9 起",
    description: "适合偶尔处理文件和临时办公任务。",
    features: ["适合偶尔使用", "单次购买额度", "支持 Excel / PDF / 文本工具", "生成结果可复制"],
    button: "购买额度",
    action: "pay"
  },
  {
    name: "个人套餐",
    price: "¥39 / 月",
    description: "适合稳定使用 AI 办公工具的个人用户。",
    features: ["每月固定额度", "支持全部 7 个工具", "支持历史记录", "支持结果下载"],
    button: "开通套餐",
    action: "pay",
    featured: true
  },
  {
    name: "企业定制",
    price: "¥499 起",
    description: "适合把固定业务流程做成专属 AI 助手。",
    features: ["定制专属 AI 工作流", "支持企业业务场景", "支持私有流程配置", "支持交付文档"],
    button: "联系定制",
    action: "contact"
  }
];

const compareRows = [
  ["免费次数", "1 次", "按购买额度", "每月固定额度", "按方案配置"],
  ["支持工具数量", "任意 1 个", "Excel / PDF / 文本工具", "全部 7 个工具", "按业务定制"],
  ["是否支持文件上传", "支持", "支持", "支持", "支持"],
  ["是否支持历史记录", "不支持", "不支持", "支持", "可定制"],
  ["是否支持结果下载", "不支持", "基础支持", "支持", "支持"],
  ["是否支持企业定制", "不支持", "不支持", "不支持", "支持"]
];

const faqs = [
  {
    question: "免费体验可以用几次？",
    answer: "新用户可免费体验 1 次，可用于任意一个工具，方便先验证生成效果。"
  },
  {
    question: "购买后额度会过期吗？",
    answer: "按次额度和套餐额度的有效期会在正式支付功能上线后明确展示，当前页面仅作方案展示。"
  },
  {
    question: "支持微信支付吗？",
    answer: "后续会优先支持微信支付等常用方式。当前支付功能尚未上线，可先联系定制或免费体验。"
  },
  {
    question: "可以开发专属工具吗？",
    answer: "可以。企业定制支持根据你的表格、文档、汇报模板和业务流程开发专属 AI 工具。"
  },
  {
    question: "企业定制怎么收费？",
    answer: "企业定制会根据工具数量、流程复杂度、是否需要文件处理和交付范围报价，基础方案 ¥499 起。"
  }
];

export default function PricingPageClient() {
  const [paymentOpen, setPaymentOpen] = useState(false);

  function handlePlanClick(plan: Plan) {
    if (plan.action === "pay") {
      setPaymentOpen(true);
    }
  }

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#F8FAFC_0%,#FFFFFF_100%)] px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            <Sparkles className="h-4 w-4 text-blue-600" />
            灵活付费，按需使用
          </div>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-6xl">
            灵活定价，先体验再付费
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            新用户可免费体验 1 次，适合个人、小团队和企业定制使用。
          </p>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan, planIndex) => (
            <article
              key={`${plan.name}-${planIndex}`}
              className={
                plan.featured
                  ? "relative rounded-3xl border border-slate-950 bg-slate-950 p-6 text-white shadow-[0_30px_90px_rgba(15,23,42,0.2)]"
                  : "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_24px_70px_rgba(15,23,42,0.08)]"
              }
            >
              {plan.featured ? (
                <span className="absolute right-5 top-5 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white">
                  推荐
                </span>
              ) : null}
              <h2 className={plan.featured ? "text-xl font-semibold text-white" : "text-xl font-semibold text-slate-950"}>{plan.name}</h2>
              <p className={plan.featured ? "mt-3 text-sm leading-6 text-slate-300" : "mt-3 text-sm leading-6 text-slate-500"}>
                {plan.description}
              </p>
              <p className={plan.featured ? "mt-6 text-4xl font-semibold text-white" : "mt-6 text-4xl font-semibold text-slate-950"}>
                {plan.price}
              </p>
              <div className="mt-6 space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <div key={`${plan.name}-${featureIndex}`} className={plan.featured ? "flex gap-3 text-sm text-slate-200" : "flex gap-3 text-sm text-slate-700"}>
                    <CheckCircle2 className={plan.featured ? "mt-0.5 h-4 w-4 shrink-0 text-blue-300" : "mt-0.5 h-4 w-4 shrink-0 text-blue-600"} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {plan.action === "trial" ? (
                <SmartEntryLink className="mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800">
                  {plan.button}
                  <ArrowRight className="h-4 w-4" />
                </SmartEntryLink>
              ) : plan.action === "contact" ? (
                <Link href="/contact" className="mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800">
                  {plan.button}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => handlePlanClick(plan)}
                  className={
                    plan.featured
                      ? "mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-slate-950 transition hover:bg-blue-50"
                      : "mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-50"
                  }
                >
                  {plan.button}
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader title="套餐对比" description="从免费体验到企业定制，按使用频率和业务复杂度选择合适方案。" />
          <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
                    <th className="px-5 py-4 font-semibold">对比项</th>
                    <th className="px-5 py-4 font-semibold">免费体验</th>
                    <th className="px-5 py-4 font-semibold">按次使用</th>
                    <th className="px-5 py-4 font-semibold">个人套餐</th>
                    <th className="px-5 py-4 font-semibold">企业定制</th>
                  </tr>
                </thead>
                <tbody>
                  {compareRows.map((row, rowIndex) => (
                    <tr key={`${row[0]}-${rowIndex}`} className="border-b border-slate-100 last:border-b-0">
                      {row.map((cell, index) => (
                        <td key={`${row[0]}-${index}`} className={index === 0 ? "px-5 py-4 font-semibold text-slate-950" : "px-5 py-4 text-slate-600"}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <SectionHeader title="常见问题" />
          <div className="mt-10 divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-white px-6 shadow-sm">
            {faqs.map((faq, faqIndex) => (
              <details key={`${faq.question}-${faqIndex}`} className="group py-5">
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
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                你可以先免费体验，也可以告诉我们你的使用频率和业务场景，我们会推荐更合适的方案。
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/contact" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-blue-50">
                联系我们
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

      {paymentOpen ? <PaymentModal onClose={() => setPaymentOpen(false)} /> : null}
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

function PaymentModal({ onClose }: { onClose: () => void }) {
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
        <h2 className="mt-5 text-xl font-semibold text-slate-950">支付功能即将上线</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          当前阶段暂未接入真实支付接口。想继续体验、开通更多额度或定制专属 AI 工具，请通过联系页、邮箱或抖音联系作者。
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
      </div>
    </div>
  );
}
