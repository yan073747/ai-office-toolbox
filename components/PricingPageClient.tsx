"use client";

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
    description: "偶尔处理文件和临时办公任务。",
    features: ["20 次工具调用", "支持全部 7 个工具", "支持历史记录", "30 天有效"]
  },
  {
    id: "standard",
    name: "标准套餐",
    price: "19.9 元",
    count: "50 次",
    description: "稳定使用的个人或小团队。",
    features: ["50 次工具调用", "支持全部 7 个工具", "支持个人中心统计", "30 天有效"],
    featured: true
  },
  {
    id: "pro",
    name: "高级套餐",
    price: "49.9 元",
    count: "150 次",
    description: "高频使用、连续处理文档。",
    features: ["150 次工具调用", "支持全部 7 个工具", "适合高频文档处理", "30 天有效"]
  }
];

const faqs = [
  {
    question: "免费次数怎么算？",
    answer: "每个工具新用户默认送 1 次。某个工具的免费次数用完后，需要买套餐才能继续用。"
  },
  {
    question: "次数是所有工具通用的吗？",
    answer: "是。套餐次数在全部 7 个工具之间通用，每成功调用一次扣 1 次。"
  },
  {
    question: "是自动扣款吗？",
    answer: "不是。现在是人工确认：下单后扫码付款，把付款信息提交上来，我确认到账就给你开通。不自动续费，也不会重复扣。"
  },
  {
    question: "能做企业定制吗？",
    answer: "能，而且这通常比买套餐划算——如果你每天都有活要处理，做成自动化比按次买便宜得多。走联系页说需求就行。"
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
        setOrderMessage(typeof data?.message === "string" ? data.message : "订单没建成，稍后再试一次。");
        return;
      }
      router.push(data.paymentUrl || `/payment/${data.order.id}`);
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <main className="bg-paper text-inkd">
      <section className="border-b border-wline px-5 pb-7 pt-9 md:pb-9 md:pt-11">
        <div className="mx-auto max-w-site">
          <p className="inline-block border-b border-[#E0C4B4] pb-0.5 text-[12.5px] font-semibold tracking-[0.04em] text-accent">
            工具套餐
          </p>
          <h1 className="mt-3.5 max-w-[600px] text-[26px] font-semibold leading-[1.42] tracking-[-0.012em] text-inkd md:text-[34px]">
            几块钱一次的事，按次买就行
          </h1>
          <div className="mt-4 grid max-w-[660px] gap-2.5 text-[15px] leading-[1.95] text-ink2">
            <p>每个工具新用户先送 1 次，用完了再决定要不要买。不自动续费，不绑卡，不会每个月悄悄扣钱。</p>
            <p className="text-[13.5px] leading-[1.9] text-mute">
              如果你每天都有同样的活要处理，别买套餐 —— 直接找我做成自动化更便宜。
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-wline px-5 py-8 md:py-10">
        <div className="mx-auto max-w-site">
          <div className="grid border-t border-wline md:grid-cols-3">
            {plans.map((plan, index) => (
              <article
                key={plan.id}
                className={`flex flex-col py-5 md:py-6 ${
                  index === plans.length - 1 ? "" : "border-b border-wline2 md:border-b-0 md:border-r"
                } ${index === 0 ? "md:pr-5" : "md:px-5"} ${index === plans.length - 1 ? "md:pl-5 md:pr-0" : ""}`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-[15px] font-semibold text-inkd">{plan.name}</h2>
                  {plan.featured ? (
                    <span className="text-[11.5px] font-semibold tracking-[0.03em] text-accent">多数人买这个</span>
                  ) : null}
                </div>
                <p className="mt-3 text-[28px] font-semibold leading-none tabular-nums text-inkd">
                  {plan.price}
                  <span className="ml-1.5 text-[12.5px] font-normal text-mute">/ {plan.count}</span>
                </p>
                <p className="mt-2 text-[12.5px] leading-[1.75] text-mute">{plan.description}</p>

                <ul className="mt-4 border-t border-wline2 pt-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2 py-1 text-[12.5px] leading-[1.8] text-ink2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-5">
                  <button
                    type="button"
                    onClick={() => createOrder(plan)}
                    disabled={loadingPlan === plan.id}
                    className={`inline-flex h-11 w-full items-center justify-center rounded-[3px] text-[14px] font-semibold transition disabled:cursor-not-allowed disabled:bg-paper2 disabled:text-mute ${
                      plan.featured
                        ? "bg-accent text-white hover:bg-[#9C4525]"
                        : "border border-inkd text-inkd hover:bg-inkd hover:text-paper"
                    }`}
                  >
                    {loadingPlan === plan.id ? "正在建单…" : "买这个"}
                  </button>
                </div>
              </article>
            ))}
          </div>

          {orderMessage ? (
            <div className="mt-5 border-l-2 border-[#9C3B22] bg-[#FBF0EA] px-4 py-3 text-[13px] leading-[1.8] text-[#9C3B22]">
              {orderMessage}
            </div>
          ) : null}

          <p className="mt-6 text-[13px] leading-[1.8] text-mute">
            三个套餐都是 30 天有效，次数在 7 个工具之间通用。没有「不限次数」这种套餐 —— 那玩意儿最后一定限速。
          </p>
        </div>
      </section>

      <section className="border-b border-wline px-5 py-8 md:py-10">
        <div className="mx-auto max-w-site">
          <p className="text-[11.5px] font-semibold tracking-[0.03em] text-accent">对比</p>
          <h2 className="mt-1 text-[21px] font-semibold tracking-[-0.005em] text-inkd">三个套餐差在哪</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead>
                <tr className="border-y border-wline text-[11.5px] text-mute">
                  <th className="py-2.5 pr-4 font-semibold">套餐</th>
                  <th className="py-2.5 pr-4 font-semibold">价格</th>
                  <th className="py-2.5 pr-4 font-semibold">次数</th>
                  <th className="py-2.5 font-semibold">适合</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.id} className="border-b border-wline2 text-[13px]">
                    <td className="py-3 pr-4 font-semibold text-inkd">{plan.name}</td>
                    <td className="py-3 pr-4 tabular-nums text-inkd">{plan.price}</td>
                    <td className="py-3 pr-4 tabular-nums text-ink2">{plan.count}</td>
                    <td className="py-3 text-ink2">{plan.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="border-b border-wline px-5 py-8 md:py-10">
        <div className="mx-auto max-w-site">
          <p className="text-[11.5px] font-semibold tracking-[0.03em] text-accent">常见问题</p>
          <h2 className="mt-1 text-[21px] font-semibold tracking-[-0.005em] text-inkd">买之前大概会问的</h2>
          <div className="mt-4 border-t border-wline2">
            {faqs.map((faq) => (
              <details key={faq.question} className="group border-b border-wline2 py-3.5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[14px] font-semibold text-inkd">
                  {faq.question}
                  <span className="text-mute transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 max-w-[640px] text-[13px] leading-[1.9] text-ink2">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-deep px-5 py-10 md:py-12">
        <div className="mx-auto flex max-w-site flex-wrap items-center justify-between gap-7">
          <div>
            <h2 className="text-[22px] font-semibold leading-[1.5] text-paper md:text-[25px]">拿不定主意就别买</h2>
            <p className="mt-2 max-w-[440px] text-[13px] leading-[1.8] text-[#B7AE9B]">
              先用免费的试。真不够用，再来跟我说你每天要处理多少份。
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <SmartEntryLink className="hover-lift inline-flex h-12 items-center justify-center whitespace-nowrap rounded-[3px] bg-accent px-6 text-[15px] font-semibold text-white transition hover:bg-[#9C4525]">
              先免费试用 →
            </SmartEntryLink>
            <Link
              href="/contact"
              className="hover-lift inline-flex h-12 items-center justify-center whitespace-nowrap rounded-[3px] border border-white/25 px-5 text-[14px] font-semibold text-paper transition hover:bg-white/10"
            >
              聊聊定制
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
