import SiteHeader from "@/components/SiteHeader";
import SmartEntryLink from "@/components/SmartEntryLink";
import { agentDemos } from "@/lib/agent-demos";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  FileText,
  GitBranch,
  Layers3,
  MailCheck,
  MessageSquareText,
  Presentation,
  ShieldCheck,
  Sparkles,
  Target,
  UploadCloud
} from "lucide-react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type ToolCard = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

const tools: ToolCard[] = [
  { id: "excel", title: "Excel 数据分析", description: "上传表格，自动识别结构、异常、趋势并给出分析建议。", icon: BarChart3 },
  { id: "pdf", title: "PDF 智能总结", description: "读取长文档，提炼摘要、关键结论与值得关注的信息。", icon: FileText },
  { id: "contract", title: "合同重点提取", description: "提取主体、金额、期限、权利义务与潜在风险点。", icon: FileCheck2 },
  { id: "report", title: "日报周报月报", description: "将零散工作记录整理为结构清晰的正式汇报。", icon: ClipboardList },
  { id: "ppt", title: "PPT 大纲大师", description: "根据主题、页数与风格生成完整的演示结构。", icon: Presentation },
  { id: "meeting", title: "会议纪要整理", description: "把会议记录整理为结论、行动项与负责人清单。", icon: MessageSquareText },
  { id: "polish", title: "邮件通知润色", description: "把普通表达改写为清楚、得体的邮件或正式通知。", icon: MailCheck }
];

const capabilities = [
  { title: "真实任务输入", description: "围绕文件上传、表单输入与业务数据设计，不停留在静态页面。", icon: UploadCloud },
  { title: "结构化结果", description: "把模型输出整理为摘要、指标、清单和可继续使用的交付物。", icon: Layers3 },
  { title: "完整工程链路", description: "覆盖前端交互、服务端处理、模型调用、状态管理与部署验证。", icon: GitBranch },
  { title: "可靠性设计", description: "通过校验、评测、降级与人工兜底控制 AI 应用的不确定性。", icon: ShieldCheck }
];

const steps = [
  { title: "选择任务", description: "从数据分析、文档理解、内容生成等办公场景进入。", icon: Target },
  { title: "提交内容", description: "上传文件或填写必要信息，界面会明确展示输入要求。", icon: UploadCloud },
  { title: "获得结果", description: "AI 完成处理并输出可阅读、可复核、可继续使用的结果。", icon: CheckCircle2 }
];

const faqs = [
  {
    question: "这些项目是页面原型还是可运行应用？",
    answer: "工具和 Agent 项目均按真实应用链路组织，包含交互界面、服务端逻辑、模型能力与运行状态；可在线的项目会提供直接入口。"
  },
  {
    question: "项目中使用了哪些 AI 工程方法？",
    answer: "作品覆盖 RAG 检索与引用、Prompt 版本评测、多 Agent 工作流、MCP 工具调用、结构化输出以及失败兜底等方法。"
  },
  {
    question: "如何处理模型输出不稳定的问题？",
    answer: "根据场景使用输入校验、结构约束、置信度判断、自动评测、过程日志和人工复核，避免把一次理想回答当作完整方案。"
  },
  {
    question: "可以从哪里了解项目的实现细节？",
    answer: "Agent 作品页展示每个项目的业务场景、技术栈、执行流程和工程亮点；关于页集中说明整体设计与工程能力。"
  }
];

const featuredDemos = agentDemos.slice(0, 3);

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <SiteHeader />

      <section className="overflow-hidden border-b border-slate-200 bg-[linear-gradient(180deg,#F8FAFC_0%,#FFFFFF_74%)]">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.03fr_0.97fr] lg:items-center lg:px-8 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              <Sparkles className="h-4 w-4 text-blue-600" />
              可运行的 AI 应用工程作品集
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-6xl">
              让 AI 真正进入日常办公流程
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              从轻量办公工具到企业级 Agent，完整呈现需求理解、交互设计、模型编排、可靠性控制与部署交付。
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <SmartEntryLink className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800">
                在线体验
                <ArrowRight className="h-4 w-4" />
              </SmartEntryLink>
              <ButtonLink href="/demos" variant="secondary">查看 Agent 作品</ButtonLink>
            </div>
            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3 border-t border-slate-200 pt-6 sm:gap-6">
              <Proof value="7" label="个办公工具" />
              <Proof value="5" label="个 Agent 项目" />
              <Proof value="端到端" label="工程实现" />
            </div>
          </div>
          <ProductPreview />
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="工程能力" title="不只展示结果，也关注应用如何稳定运行" description="每个页面都围绕真实输入、清晰反馈与可验证输出设计，让 AI 能力落在完整的产品流程里。" />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((item) => <FeatureCard key={item.title} item={item} />)}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="工具演示" title="7 个可直接进入的 AI 办公工具" description="选择具体任务，体验从输入、处理到结构化结果的完整交互。" />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => <ToolOverviewCard key={tool.id} tool={tool} />)}
          </div>
          <div className="mt-8 text-center">
            <ButtonLink href="/tools" variant="secondary">查看全部工具</ButtonLink>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Agent 作品集" title="从模型能力走向可交付的业务系统" description="代表项目覆盖知识库问答、效果评测与多智能体编排，重点呈现工程决策和完整链路。" />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {featuredDemos.map((demo) => (
              <article key={demo.slug} className="group flex min-h-[350px] flex-col rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.12)] transition duration-200 hover:-translate-y-1">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-sm text-blue-200">PROJECT {demo.index}</span>
                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-slate-200">{demo.readiness}</span>
                </div>
                <p className="mt-8 text-sm font-semibold text-blue-200">{demo.scene}</p>
                <h3 className="mt-3 text-2xl font-semibold">{demo.chineseName}</h3>
                <p className="mt-4 flex-1 text-sm leading-7 text-slate-300">{demo.subtitle}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {demo.stack.slice(0, 3).map((item) => <span key={item} className="rounded-lg bg-white/[0.07] px-2.5 py-1 text-xs text-slate-300">{item}</span>)}
                </div>
                <Link href={`/demos/${demo.slug}`} className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-slate-950 transition hover:bg-blue-50">
                  查看项目详情 <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
          <div className="mt-8 text-center">
            <ButtonLink href="/demos" variant="secondary">查看全部 Agent 项目</ButtonLink>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader title="三步完成一次 AI 办公处理" />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <article key={step.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Icon className="h-5 w-5" /></span>
                    <span className="text-sm font-semibold text-slate-400">0{index + 1}</span>
                  </div>
                  <h3 className="mt-6 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <SectionHeader eyebrow="实现说明" title="关于这些 AI 应用" />
          <div className="mt-10 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-6 shadow-sm">
            {faqs.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold">
                  {faq.question}<span aria-hidden="true" className="text-slate-400 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-7 text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <PortfolioFooter />
    </main>
  );
}

function Proof({ value, label }: { value: string; label: string }) {
  return <div aria-label={`${value} ${label}`}><p className="text-xl font-semibold text-slate-950 sm:text-2xl">{value}</p><p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">{label}</p></div>;
}

function ButtonLink({ href, children, variant = "primary" }: { href: string; children: ReactNode; variant?: "primary" | "secondary" }) {
  const style = variant === "primary"
    ? "bg-slate-950 text-white hover:bg-slate-800"
    : "border border-slate-200 bg-white text-slate-800 hover:border-blue-200 hover:bg-blue-50/70";
  return <Link href={href} className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 ${style}`}>{children}<ArrowRight className="h-4 w-4" /></Link>;
}

function SectionHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return <div className="mx-auto max-w-3xl text-center">{eyebrow ? <p className="mb-3 text-sm font-semibold text-blue-600">{eyebrow}</p> : null}<h2 className="text-2xl font-semibold tracking-normal sm:text-4xl">{title}</h2>{description ? <p className="mt-4 text-base leading-8 text-slate-600">{description}</p> : null}</div>;
}

function ToolOverviewCard({ tool }: { tool: ToolCard }) {
  const Icon = tool.icon;
  return (
    <article className="group flex min-h-64 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-900 transition group-hover:bg-blue-50 group-hover:text-blue-700"><Icon className="h-5 w-5" /></span>
      <h3 className="mt-5 text-lg font-semibold">{tool.title}</h3>
      <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">{tool.description}</p>
      <Link href={`/tools/${tool.id}`} className="mt-6 inline-flex h-11 items-center gap-2 text-sm font-semibold text-slate-950 transition hover:text-blue-700">进入工具 <ArrowRight className="h-4 w-4" /></Link>
    </article>
  );
}

function FeatureCard({ item }: { item: { title: string; description: string; icon: LucideIcon } }) {
  const Icon = item.icon;
  return <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white"><Icon className="h-5 w-5" /></span><h3 className="mt-5 text-lg font-semibold">{item.title}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p></article>;
}

function ProductPreview() {
  const tasks = [
    { label: "数据分析", note: "趋势与异常已识别", icon: BarChart3 },
    { label: "文档总结", note: "关键结论已提炼", icon: FileText },
    { label: "多 Agent 工作流", note: "执行链路可追踪", icon: GitBranch }
  ];
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="absolute -right-4 top-8 h-40 w-40 rounded-full bg-blue-100/70 blur-3xl" />
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_30px_90px_rgba(15,23,42,0.12)]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">AI Application Lab</p><p className="mt-2 text-lg font-semibold">项目运行概览</p></div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">5 项在线</span>
          </div>
          <div className="mt-5 space-y-3">
            {tasks.map(({ label, note, icon: Icon }) => <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Icon className="h-5 w-5" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{label}</p><p className="mt-1 truncate text-xs text-slate-500">{note}</p></div><CheckCircle2 className="h-5 w-5 text-emerald-500" /></div>)}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">{["输入校验", "过程可观测", "结果可复核"].map((label) => <div key={label} className="rounded-xl border border-slate-200 bg-white px-2 py-3 text-center text-[11px] font-semibold text-slate-600 sm:text-xs">{label}</div>)}</div>
        </div>
      </div>
    </div>
  );
}

function PortfolioFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white px-5 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 border-b border-slate-200 pb-10 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
        <div><div className="flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white"><Sparkles className="h-4 w-4" /></span><span className="font-semibold">AI办公工具箱</span></div><p className="mt-4 max-w-md text-sm leading-7 text-slate-600">围绕真实办公任务构建的 AI 应用工程作品集，展示从产品交互到 Agent 编排与部署验证的完整实践。</p></div>
        <FooterColumn title="作品" links={[{ label: "办公工具", href: "/tools" }, { label: "Agent 作品集", href: "/demos" }, { label: "关于项目", href: "/about" }]} />
        <FooterColumn title="说明" links={[{ label: "隐私政策", href: "/privacy" }, { label: "服务条款", href: "/terms" }, { label: "登录", href: "/login" }]} />
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-3 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between"><p>© 2026 AI办公工具箱</p><p>AI Application Engineering Portfolio</p></div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return <div><h3 className="text-sm font-semibold">{title}</h3><div className="mt-4 flex flex-col gap-3">{links.map((link) => <Link key={link.href} href={link.href} className="text-sm text-slate-600 transition hover:text-slate-950">{link.label}</Link>)}</div></div>;
}
