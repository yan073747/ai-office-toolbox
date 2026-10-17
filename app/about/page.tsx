import Link from "next/link";
import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "关于我｜AI WorkBox",
  description:
    "AI WorkBox 是一个人做的小工作室，在佛山顺德。过去一年把 6 个 AI 应用从需求梳理做到上线部署，覆盖知识库问答、客服自动化、多 Agent 工作流与企业工具调用。"
};

const facts = [
  ["6 个", "已上线系统，全部可点开"],
  ["1 个人", "从需求到部署，不转包"],
  ["1–3 周", "常见交付周期"],
  ["顺德", "本地可上门，外地可远程"]
];

const boundaries = [
  {
    title: "知识检索（RAG）",
    desc: "文档清洗入库、切片建索引、答案带出处、置信度判断、拿不准转人工。这些不是「接个大模型就行」，每一条都要单独调。"
  },
  {
    title: "Agent 编排",
    desc: "一件事需要好几步才能做完时，把计划、执行、检查拆给不同角色，中间状态可追溯，某一步失败能重来。"
  },
  {
    title: "评测与可靠性",
    desc: "上线前用测试集批量跑一遍打分，比两个版本哪个更好。出了问题能查日志、能定位到哪一步、能降级兜底。"
  },
  {
    title: "企业工具接入（MCP）",
    desc: "把公司的客户、订单、报价、待办接给 AI，同时做角色权限——销售和经理能做的事不一样，越权自动拦截。"
  }
];

const stack = [
  ["界面", "Next.js / React / TypeScript / Tailwind CSS"],
  ["服务", "FastAPI / Node.js / SQLite / Redis"],
  ["AI 应用工程", "RAG / Prompt 评测 / LangGraph / MCP"],
  ["交付", "测试 / Docker / 日志 / 降级与兜底"]
];

const projects = [
  { name: "知识库工单助手", url: "https://rag-ticket.aiworkbox.cn", note: "42 个测试用例全过" },
  { name: "多 AI 文档工作流", url: "https://docflow.aiworkbox.cn", note: "432 条记录可回溯" },
  { name: "接公司数据的助手", url: "https://mcp.aiworkbox.cn", note: "5 类工具 · 权限拦截" },
  { name: "AI 效果评测平台", url: "https://promptops.aiworkbox.cn", note: "上线前批量打分" },
  { name: "跨境商品文案优化", url: "https://listing.aiworkbox.cn", note: "多语言 + SEO 打分" },
  { name: "企业内部数字化中台", url: "", note: "飞书 · 内部系统" }
];

export default function AboutPage() {
  return (
    <div className="bg-paper text-inkd">
      <SiteHeader />

      <section className="px-5 pb-8 pt-9 md:pt-11">
        <div className="mx-auto max-w-site">
          <p className="inline-block border-b border-[#E0C4B4] pb-0.5 text-[12.5px] font-semibold tracking-[0.04em] text-accent">
            关于我
          </p>
          <h1 className="mt-3.5 max-w-[620px] text-[26px] font-semibold leading-[1.42] tracking-[-0.012em] text-inkd md:text-[34px]">
            一个人，一年，六个能跑起来的系统
          </h1>
          <div className="mt-4 grid max-w-[680px] gap-2.5 text-[15px] leading-[1.95] text-ink2">
            <p>AI WorkBox 是我一个人做的小工作室，在佛山顺德。</p>
            <p>
              过去一年，我把 6 个 AI 应用从需求梳理做到上线部署，覆盖知识库问答、客服自动化、多 AI 协作工作流和企业工具调用。
              每一个现在都还开着，你可以直接点进去用。
            </p>
            <p className="font-semibold text-inkd">
              我不卖概念，也不卖课。我卖的是能跑起来的东西——而且你可以先看演示再决定。
            </p>
          </div>
        </div>
      </section>

      {/* 四格事实 */}
      <div className="border-y border-wline">
        <div className="mx-auto grid max-w-site grid-cols-2 px-5 md:grid-cols-4">
          {facts.map(([value, label], index) => (
            <div
              key={label}
              className={[
                "py-4 md:py-5",
                index % 2 === 1 ? "pl-4" : "",
                index > 1 ? "border-t border-wline2 md:border-t-0" : "",
                index > 0 ? "md:border-l md:border-wline2 md:pl-6" : ""
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <b className="block text-[19px] font-semibold leading-[1.3] text-inkd md:text-[21px]">{value}</b>
              <span className="text-[12px] leading-[1.6] text-mute">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 能做到什么程度 */}
      <section className="border-b border-wline px-5 py-9 md:py-12">
        <div className="mx-auto max-w-site">
          <p className="text-[11.5px] font-semibold tracking-[0.03em] text-accent">能做到什么程度</p>
          <h2 className="mt-1 text-[21px] font-semibold tracking-[-0.005em] text-inkd">四个地方，我抠得比较细</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2 md:gap-x-10 md:gap-y-7">
            {boundaries.map((item) => (
              <div key={item.title} className="border-t-2 border-deep pt-3.5">
                <b className="block text-[14.5px] font-semibold text-inkd">{item.title}</b>
                <p className="mt-1.5 text-[13px] leading-[1.9] text-ink2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 技术栈 */}
      <section className="border-b border-wline px-5 py-9 md:py-12">
        <div className="mx-auto max-w-site">
          <p className="text-[11.5px] font-semibold tracking-[0.03em] text-accent">用什么做</p>
          <h2 className="mt-1 text-[21px] font-semibold tracking-[-0.005em] text-inkd">技术栈</h2>
          <div className="mt-5 border-t border-wline">
            {stack.map(([label, detail]) => (
              <div key={label} className="grid gap-1 border-b border-wline2 py-3 md:grid-cols-[110px_1fr] md:items-baseline md:gap-5">
                <span className="text-[12.5px] text-mute">{label}</span>
                <span className="text-[13.5px] leading-[1.8] text-ink2">{detail}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 项目 */}
      <section className="border-b border-wline px-5 py-9 md:py-12">
        <div className="mx-auto max-w-site">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <div>
              <p className="text-[11.5px] font-semibold tracking-[0.03em] text-accent">做过的</p>
              <h2 className="mt-1 text-[21px] font-semibold tracking-[-0.005em] text-inkd">六个，都能点开</h2>
            </div>
            <Link href="/demos" className="border-b border-[#DFC3B2] pb-0.5 text-[13.5px] font-semibold text-accent">
              看详细说明 →
            </Link>
          </div>
          <div className="mt-5 border-t border-wline">
            {projects.map((item) => (
              <div key={item.name} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-wline2 py-3">
                <span className="text-[14.5px] font-medium text-inkd">{item.name}</span>
                <span className="text-[12px] text-mute">{item.note}</span>
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12.5px] font-semibold text-accent"
                  >
                    打开 →
                  </a>
                ) : (
                  <span className="text-[12px] text-mute">内部系统</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-deep px-5 py-10 md:py-12">
        <div className="mx-auto flex max-w-site flex-wrap items-center justify-between gap-7">
          <div>
            <h2 className="text-[22px] font-semibold leading-[1.5] text-paper md:text-[24px]">想看看它能不能用在你的业务上</h2>
            <p className="mt-2 max-w-[420px] text-[13px] leading-[1.8] text-[#B7AE9B]">
              源码在 GitHub 上全部公开，不用信我说的话，自己看。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <a
              href="https://github.com/yan073747/ai-office-toolbox"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13.5px] font-semibold text-paper underline decoration-[#7A7264] underline-offset-4"
            >
              github.com/yan073747/ai-office-toolbox
            </a>
            <Link
              href="/contact"
              className="hover-lift inline-flex h-12 items-center justify-center rounded-[3px] bg-accent px-6 text-[15px] font-semibold text-white transition hover:bg-[#9C4525]"
            >
              说说你的情况 →
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
