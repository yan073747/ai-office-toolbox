import SiteHeader from "@/components/SiteHeader";
import {
  ArrowRight,
  BarChart3,
  Blocks,
  Bot,
  CheckCircle2,
  Code2,
  Gauge,
  GitPullRequest,
  Layers3,
  Search,
  ShieldCheck,
  Sparkles,
  Workflow
} from "lucide-react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export const metadata = {
  title: "关于项目 | AI办公工具箱",
  description: "了解 AI办公工具箱从办公工具到 RAG、评测、多 Agent 与 MCP 项目的产品设计和工程实现。"
};

const engineeringAreas = [
  {
    title: "应用产品化",
    description: "把模型能力拆解成明确输入、过程反馈、结构化输出与可恢复状态。",
    icon: Layers3
  },
  {
    title: "RAG 与知识检索",
    description: "完成文档入库、向量检索、来源引用、置信度控制和人工兜底。",
    icon: Search
  },
  {
    title: "Agent 工作流",
    description: "用角色分工、状态流转和工具调用处理一次问答无法完成的复杂任务。",
    icon: Workflow
  },
  {
    title: "评测与可靠性",
    description: "通过测试集、版本对比、自动评分、日志和失败案例持续改进效果。",
    icon: Gauge
  }
];

const stackLayers = [
  { title: "界面与交互", detail: "Next.js / React / TypeScript / Tailwind CSS", icon: Code2 },
  { title: "服务与数据", detail: "FastAPI / Node.js / SQLite / Redis", icon: Blocks },
  { title: "AI 应用工程", detail: "RAG / Prompt 评测 / LangGraph / MCP", icon: Bot },
  { title: "质量与交付", detail: "测试 / Docker / 日志 / 降级与兜底", icon: ShieldCheck }
];

const principles = [
  "先定义真实任务和成功标准，再选择模型与技术方案",
  "让输入要求、处理状态和结果边界对用户保持清晰",
  "记录检索来源、Agent Trace 与工具调用，保证过程可观察",
  "用测试、评测和失败兜底验证稳定性，而非只展示理想结果"
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <SiteHeader />

      <section className="overflow-hidden border-b border-slate-200 bg-[linear-gradient(180deg,#F8FAFC_0%,#FFFFFF_100%)] px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              <Sparkles className="h-4 w-4 text-blue-600" />
              关于这个作品集
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight tracking-normal sm:text-6xl">
              从可用工具到完整的 AI 应用工程
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              AI办公工具箱是一组面向真实办公任务的产品与工程实践。它不仅展示模型能做什么，也呈现需求拆解、交互设计、后端服务、可靠性控制和部署交付如何组成完整系统。
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/demos" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800">
                查看 Agent 作品 <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="https://github.com/yan073747/ai-office-toolbox" target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50">
                <Code2 className="h-4 w-4" /> 查看源代码
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_28px_90px_rgba(15,23,42,0.1)]">
            <div className="rounded-2xl bg-slate-950 p-6 text-white">
              <div className="flex items-center justify-between gap-4">
                <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">Engineering Map</p><h2 className="mt-3 text-2xl font-semibold">端到端实现范围</h2></div>
                <GitPullRequest className="h-7 w-7 text-blue-200" />
              </div>
              <div className="mt-6 space-y-3">
                {["产品流程与响应式交互", "服务端接口与数据持久化", "模型、RAG 与 Agent 编排", "测试、评测与部署验证"].map((item, index) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-sm font-semibold text-blue-100">0{index + 1}</span>
                    <span className="text-sm font-semibold text-slate-100">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="能力结构" title="围绕 AI 应用落地组织工程能力" description="从单点办公效率工具逐步延伸到有检索、有评测、有编排、有工具协议的复杂系统。" />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {engineeringAreas.map((item) => <FeatureCard key={item.title} item={item} />)}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold text-blue-600">技术与交付</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">从前端体验到模型编排的完整链路</h2>
            <p className="mt-5 text-base leading-8 text-slate-600">技术选型服务于具体问题，并在作品详情中说明业务场景、实现方式和可验证结果。</p>
            <Link href="/tools" className="mt-7 inline-flex h-11 items-center gap-2 text-sm font-semibold text-slate-950 transition hover:text-blue-700">先体验办公工具 <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {stackLayers.map(({ title, detail, icon: Icon }) => (
              <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Icon className="h-5 w-5" /></span>
                <h3 className="mt-5 text-base font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-slate-950 p-7 text-white shadow-[0_28px_90px_rgba(15,23,42,0.16)] sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div><p className="text-sm font-semibold text-blue-200">实现原则</p><h2 className="mt-3 text-3xl font-semibold tracking-normal">让 AI 系统可用、可观察、可复核</h2><p className="mt-5 text-sm leading-7 text-slate-300">关注实际使用中的边界与失败路径，避免只围绕一次成功回答设计产品。</p></div>
            <div className="grid gap-3">
              {principles.map((item) => <div key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" /><p className="text-sm leading-7 text-slate-200">{item}</p></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <h2 className="mt-5 text-3xl font-semibold tracking-normal sm:text-4xl">继续查看可运行的项目证据</h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">每个 Agent 项目都包含业务问题、技术栈、执行流程、工程亮点与在线演示状态。</p>
          <Link href="/demos" className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800">进入 Agent 作品集 <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ item }: { item: { title: string; description: string; icon: LucideIcon } }) {
  const Icon = item.icon;
  return <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_24px_70px_rgba(15,23,42,0.08)]"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><Icon className="h-5 w-5" /></span><h3 className="mt-5 text-lg font-semibold">{item.title}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p></article>;
}

function SectionHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return <div className="mx-auto max-w-3xl text-center">{eyebrow ? <p className="text-sm font-semibold text-blue-600">{eyebrow}</p> : null}<h2 className="mt-3 text-2xl font-semibold tracking-normal sm:text-4xl">{title}</h2>{description ? <p className="mt-4 text-base leading-8 text-slate-600">{description}</p> : null}</div>;
}
