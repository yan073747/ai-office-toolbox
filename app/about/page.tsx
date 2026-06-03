import SiteHeader from "@/components/SiteHeader";
import SmartEntryLink from "@/components/SmartEntryLink";
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  FileSearch,
  FileText,
  Lightbulb,
  MailCheck,
  MessageSquareText,
  Presentation,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  Users
} from "lucide-react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export const metadata = {
  title: "关于我们 | AI办公工具箱",
  description: "AI办公工具箱专注于用 AI 提升办公效率，把复杂的 AI 能力变成普通人也能直接使用的办公工具。"
};

const problems = [
  {
    title: "表格不会分析",
    description: "面对销售、运营、财务表格，不知道从哪里看趋势、异常和问题。",
    icon: BarChart3
  },
  {
    title: "PDF 阅读太慢",
    description: "长文档、报告和资料需要逐页阅读，提炼重点耗费大量时间。",
    icon: FileText
  },
  {
    title: "合同重点难找",
    description: "主体、金额、期限、违约责任和风险点分散在不同段落里。",
    icon: FileSearch
  },
  {
    title: "周报月报重复写",
    description: "每周都要整理工作内容、成果、问题和计划，表达还要正式清晰。",
    icon: CalendarCheck
  }
];

const principles = [
  {
    title: "简单易用",
    description: "不要求用户懂提示词或模型参数，只需要上传文件或输入内容。",
    icon: Sparkles
  },
  {
    title: "输出结构化",
    description: "尽量把结果整理成摘要、要点、表格、清单和建议，方便直接使用。",
    icon: ClipboardList
  },
  {
    title: "面向真实办公场景",
    description: "围绕表格、文档、合同、汇报、会议和沟通这些高频任务设计。",
    icon: Target
  },
  {
    title: "支持持续迭代",
    description: "根据用户反馈不断优化字段、结果格式、流程稳定性和使用体验。",
    icon: RefreshCw
  }
];

const launchedTools = [
  { name: "Excel 数据分析", icon: BarChart3 },
  { name: "PDF 智能总结", icon: FileText },
  { name: "合同重点提取", icon: FileSearch },
  { name: "日报周报月报", icon: CalendarCheck },
  { name: "PPT 大纲", icon: Presentation },
  { name: "会议纪要", icon: MessageSquareText },
  { name: "邮件通知润色", icon: MailCheck }
];

const roadmap = [
  "用户系统",
  "额度系统",
  "支付系统",
  "行业 AI 助手",
  "企业定制服务"
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <SiteHeader />

      <section className="overflow-hidden border-b border-slate-200 bg-[linear-gradient(180deg,#F8FAFC_0%,#FFFFFF_100%)] px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.82fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              关于 AI办公工具箱
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-6xl">
              我们专注于用 AI 提升办公效率
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              AI办公工具箱致力于把复杂的 AI 能力，变成普通人也能直接使用的办公工具。
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <SmartEntryLink className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800">
                免费体验
                <ArrowRight className="h-4 w-4" />
              </SmartEntryLink>
              <ButtonLink href="/contact" variant="secondary">
                联系定制
              </ButtonLink>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_28px_90px_rgba(15,23,42,0.1)]">
            <div className="rounded-2xl bg-slate-950 p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">Office AI Toolbox</p>
              <h2 className="mt-3 text-2xl font-semibold">从重复办公到自动处理</h2>
              <div className="mt-6 space-y-3">
                {["上传表格或文档", "选择办公场景", "生成结构化结果", "持续优化业务流程"].map((item, index) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-sm font-semibold text-blue-100">
                      {index + 1}
                    </span>
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
          <SectionHeader
            eyebrow="我们解决什么问题"
            title="把高频、重复、耗时的办公任务交给 AI"
            description="很多办公任务并不复杂，但需要反复整理、总结、分析和改写。我们的目标是让这些任务更快完成，结果更清晰。"
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {problems.map((item) => (
              <FeatureCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="产品理念"
            title="让工具足够简单，也足够贴近办公现场"
            description="我们不会把页面做成复杂的调试台，而是让用户直接完成实际工作。"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {principles.map((item) => (
              <article key={item.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
                <div className="flex items-start gap-4">
                  <IconBox icon={item.icon} />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.72fr_1fr] lg:items-start">
          <div className="rounded-3xl border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_28px_90px_rgba(15,23,42,0.18)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-blue-200">
              <Lightbulb className="h-5 w-5" />
            </div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">当前版本</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal">AI办公工具箱 V1.0</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              当前版本聚焦个人和小团队的高频办公任务，先把核心工具跑通，再逐步完善账号、额度、支付和企业定制能力。
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold tracking-normal text-slate-950">已上线工具</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {launchedTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <div key={tool.name} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-semibold text-slate-800">{tool.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold text-blue-600">后续计划</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
                继续补齐从体验到付费、从工具到业务助手的完整链路
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-600">
                V1.0 先验证核心办公工具能力，后续会围绕稳定使用、长期服务和企业场景持续迭代。
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {roadmap.map((item, index) => (
                <div key={item} className={index === roadmap.length - 1 ? "rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:col-span-2" : "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"}>
                  <div className="flex items-center gap-3">
                    <span className={index === roadmap.length - 1 ? "flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white" : "flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-700"}>
                      {index + 1}
                    </span>
                    <h3 className="text-base font-semibold text-slate-950">{item}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <Users className="h-5 w-5" />
              </div>
              <h2 className="mt-6 text-2xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
                现在就体验 AI 办公工具箱
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                先从一个真实办公任务开始，体验 AI 如何帮你节省整理、总结、分析和写作时间。
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <SmartEntryLink className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800">
                免费体验
                <ArrowRight className="h-4 w-4" />
              </SmartEntryLink>
              <ButtonLink href="/contact" variant="secondary">
                联系定制
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ item }: { item: { title: string; description: string; icon: LucideIcon } }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
      <IconBox icon={item.icon} />
      <h3 className="mt-5 text-lg font-semibold text-slate-950">{item.title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
    </article>
  );
}

function IconBox({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
      <Icon className="h-5 w-5" />
    </span>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow ? <p className="text-sm font-semibold text-blue-600">{eyebrow}</p> : null}
      <h2 className="mt-3 text-2xl font-semibold tracking-normal text-slate-950 sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-8 text-slate-600">{description}</p> : null}
    </div>
  );
}

function ButtonLink({ href, children, variant = "primary" }: { href: string; children: React.ReactNode; variant?: "primary" | "secondary" }) {
  const className =
    variant === "primary"
      ? "inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
      : "inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50";

  return (
    <Link href={href} className={className}>
      {children}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
