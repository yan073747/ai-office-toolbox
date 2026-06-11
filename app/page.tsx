import SiteHeader from "@/components/SiteHeader";
import SmartEntryLink from "@/components/SmartEntryLink";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileCheck2,
  FileText,
  Layers3,
  MailCheck,
  MessageSquareText,
  PenLine,
  Presentation,
  ShieldCheck,
  Sparkles,
  Target,
  TimerReset,
  UploadCloud
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type ToolCard = {
  title: string;
  description: string;
  icon: LucideIcon;
};

type FeatureCard = {
  title: string;
  description: string;
  icon: LucideIcon;
};

type SolutionCard = {
  title: string;
  audience: string;
  problems: string;
};

const tools: ToolCard[] = [
  {
    title: "Excel 数据分析",
    description: "上传表格，自动识别结构、异常、趋势和建议。",
    icon: BarChart3
  },
  {
    title: "PDF 智能总结",
    description: "上传 PDF，自动提炼重点、摘要和风险信息。",
    icon: FileText
  },
  {
    title: "合同重点提取",
    description: "自动提取主体、金额、时间节点、权利义务和风险点。",
    icon: FileCheck2
  },
  {
    title: "日报周报月报生成",
    description: "输入工作内容，自动生成正式汇报文本。",
    icon: ClipboardList
  },
  {
    title: "PPT 大纲大师",
    description: "输入主题和页数，自动生成完整 PPT 结构。",
    icon: Presentation
  },
  {
    title: "会议纪要整理",
    description: "将会议记录整理成结构化纪要和待办事项。",
    icon: MessageSquareText
  },
  {
    title: "邮件通知润色",
    description: "将普通文字润色成正式邮件或通知公告。",
    icon: MailCheck
  }
];

const features: FeatureCard[] = [
  {
    title: "节省时间",
    description: "减少重复整理、总结、写作工作，把时间留给判断和执行。",
    icon: TimerReset
  },
  {
    title: "结构化输出",
    description: "自动生成清晰报告、摘要、提纲和待办，方便直接复用。",
    icon: Layers3
  },
  {
    title: "多场景覆盖",
    description: "覆盖表格、文档、合同、汇报、会议、邮件等高频办公场景。",
    icon: BriefcaseBusiness
  },
  {
    title: "支持定制",
    description: "可根据企业流程定制专属 AI 工作流，适配真实业务习惯。",
    icon: ShieldCheck
  }
];

const previewTasks = [
  { title: "Excel 分析完成", detail: "发现 3 处异常波动", icon: BarChart3, tone: "bg-blue-50 text-blue-700" },
  { title: "PDF 总结完成", detail: "已提炼 6 条核心观点", icon: FileText, tone: "bg-violet-50 text-violet-700" },
  { title: "合同风险已提取", detail: "识别付款与违约条款", icon: FileCheck2, tone: "bg-slate-100 text-slate-700" },
  { title: "周报已生成", detail: "结构化输出工作成果", icon: ClipboardList, tone: "bg-emerald-50 text-emerald-700" }
];

const steps = [
  {
    title: "选择工具",
    description: "根据任务选择表格分析、文档总结、汇报生成或邮件润色。",
    icon: Target
  },
  {
    title: "上传文件或输入内容",
    description: "支持表格、PDF、文本内容，也可以输入补充说明。",
    icon: UploadCloud
  },
  {
    title: "获取结构化结果",
    description: "AI 自动输出摘要、报告、提纲、纪要或优化后的正式文本。",
    icon: CheckCircle2
  }
];

const solutions: SolutionCard[] = [
  {
    title: "电商运营助手",
    audience: "适合网店商家、运营团队、内容团队",
    problems: "批量生成商品卖点、种草文案、短视频口播和运营汇报。"
  },
  {
    title: "外贸跟单助手",
    audience: "适合外贸公司、SOHO、跟单人员",
    problems: "整理客户需求、邮件润色、订单资料归档和进度汇报。"
  },
  {
    title: "企业办公自动化助手",
    audience: "适合中小企业、行政、人事、财务和项目团队",
    problems: "自动处理表格、文档、会议纪要、月报和内部流程资料。"
  }
];

const faqs = [
  {
    question: "支持哪些文件？",
    answer: "当前主要支持 Excel、CSV、PDF、Word 和 TXT 等常见办公文件。不同工具会根据场景限制可上传的文件类型。"
  },
  {
    question: "扫描版 PDF 能不能识别？",
    answer: "当前版本暂不支持 OCR 识别。建议上传可复制文字的 PDF、Word 或 TXT 文档，扫描件识别会作为后续能力预留。"
  },
  {
    question: "生成结果可以商用吗？",
    answer: "生成结果可用于日常办公和商业场景，但重要合同、财务、法律内容建议结合人工复核后再使用。"
  },
  {
    question: "是否支持企业定制？",
    answer: "支持。可以根据企业已有表格、文档模板、审批流程和汇报格式，定制更贴合业务的 AI 办公助手。"
  },
  {
    question: "付费后如何使用？",
    answer: "后续会支持按次购买、套餐购买和企业定制服务。当前可先免费体验，再根据使用频率选择合适方案。"
  }
];

function ButtonLink({
  href,
  children,
  variant = "primary"
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  const className =
    variant === "primary"
      ? "bg-slate-950 text-white shadow-lg shadow-slate-950/10 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-950/15"
      : "border border-slate-200 bg-white text-slate-800 shadow-sm hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/70 hover:text-slate-950";

  return (
    <a
      href={href}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold tracking-normal transition duration-200 ${className}`}
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </a>
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
      {eyebrow ? <p className="mb-3 text-sm font-semibold text-blue-600">{eyebrow}</p> : null}
      <h2 className="text-2xl font-semibold tracking-normal text-slate-950 sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-8 text-slate-600">{description}</p> : null}
    </div>
  );
}

function ToolOverviewCard({ tool }: { tool: ToolCard }) {
  const Icon = tool.icon;

  return (
    <article className="group flex min-h-64 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-900 transition group-hover:bg-blue-50 group-hover:text-blue-700">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-normal text-slate-950">{tool.title}</h3>
      <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">{tool.description}</p>
      <a href="/tools" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-950 transition hover:text-blue-700">
        立即体验
        <ArrowRight className="h-4 w-4" />
      </a>
    </article>
  );
}

function FeatureCard({ feature }: { feature: FeatureCard }) {
  const Icon = feature.icon;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-slate-950">{feature.title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
    </article>
  );
}

function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="absolute -right-4 top-8 h-40 w-40 rounded-full bg-blue-100/60 blur-3xl" />
      <div className="absolute -bottom-4 left-4 h-32 w-32 rounded-full bg-violet-100/60 blur-3xl" />

      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_30px_90px_rgba(15,23,42,0.12)]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Office AI Toolbox</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">任务处理中心</p>
            </div>
            <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">自动处理中</div>
          </div>

          <div className="mt-5 space-y-3">
            {previewTasks.map((task, index) => {
              const Icon = task.icon;

              return (
                <div
                  key={task.title}
                  className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  style={{ transform: `translateX(${index % 2 === 0 ? 0 : 14}px)` }}
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${task.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-950">{task.title}</p>
                    <p className="mt-1 truncate text-xs text-slate-500">{task.detail}</p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                </div>
              );
            })}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {["文件处理", "自动总结", "结构输出"].map((label) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center text-xs font-semibold text-slate-600">
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <SiteHeader />

      <section className="overflow-hidden border-b border-slate-200 bg-[linear-gradient(180deg,#F8FAFC_0%,#FFFFFF_72%)]">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.03fr_0.97fr] lg:items-center lg:px-8 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              <Sparkles className="h-4 w-4 text-blue-600" />
              面向个人和团队的 AI 办公效率平台
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-6xl">
              让 AI 帮你完成重复办公任务
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              集成 Excel 数据分析、PDF 总结、合同提取、周报生成、PPT 大纲、会议纪要和邮件润色，帮助个人和团队更快完成日常办公。
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <SmartEntryLink className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold tracking-normal text-white shadow-lg shadow-slate-950/10 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-950/15">
                免费体验
                <ArrowRight className="h-4 w-4" />
              </SmartEntryLink>
              <ButtonLink href="/tools" variant="secondary">
                查看工具
              </ButtonLink>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-slate-200 pt-6">
              <div>
                <p className="text-2xl font-semibold text-slate-950">7+</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">高频办公工具</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-950">3步</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">完成内容处理</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-950">可定制</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">适配企业流程</p>
              </div>
            </div>
          </div>

          <ProductPreview />
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            title="一个工具箱，解决高频办公问题"
            description="从数据分析到文档整理，从汇报写作到沟通润色，把分散的 AI 能力整合成稳定、易用的办公工具。"
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      <section id="tools" className="border-y border-slate-200 bg-slate-50 px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="工具概览" title="已上线的 7 个 AI 办公工具" description="选择对应场景，上传文件或输入内容，即可获得结构化结果。" />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <ToolOverviewCard key={tool.title} tool={tool} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader title="三步完成 AI 办公处理" />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <article key={step.title} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-semibold text-slate-400">步骤 {index + 1}</span>
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-slate-950">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="solutions" className="border-y border-slate-200 bg-slate-950 px-5 py-16 text-white sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold text-blue-300">行业方案</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-normal sm:text-4xl">不只是工具，也可以定制成你的业务助手</h2>
              <p className="mt-5 text-base leading-8 text-slate-300">
                如果你有固定的表格处理、文档整理、汇报模板或业务流程，可以将工具箱扩展为贴合团队习惯的专属 AI 助手。
              </p>
              <div className="mt-8">
                <ButtonLink href="/contact" variant="secondary">
                  联系定制
                </ButtonLink>
              </div>
            </div>

            <div className="grid gap-5">
              {solutions.map((solution) => (
                <article key={solution.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-white">{solution.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">适用人群：{solution.audience}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">可解决的问题：{solution.problems}</p>
                  <a href="/contact" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-200 transition hover:text-white">
                    联系定制
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold text-blue-600">价格引导</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-normal text-slate-950 sm:text-4xl">先免费体验，再决定是否付费</h2>
              <p className="mt-5 text-base leading-8 text-slate-600">适合轻量试用，也适合长期办公自动化。你可以先验证效果，再选择按次、套餐或企业定制。</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              {["新用户免费体验 1 次", "支持按次购买", "支持套餐购买", "支持企业定制"].map((item) => (
                <div key={item} className="flex items-center gap-3 border-b border-slate-200 py-3 last:border-b-0">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="#pricing">查看定价</ButtonLink>
            <ButtonLink href="/contact" variant="secondary">
              联系定制
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <SectionHeader title="常见问题" />
          <div className="mt-10 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-6 shadow-sm">
            {faqs.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-slate-950">
                  {faq.question}
                  <span className="text-slate-400 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-7 text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer id="contact" className="bg-white px-5 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 border-b border-slate-200 pb-10 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="font-semibold text-slate-950">AI办公工具箱</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-7 text-slate-600">
              Office AI Toolbox，面向个人、小团队、个体户和中小企业的 AI 办公效率工具网站。
            </p>
          </div>

          <FooterColumn title="产品" links={["工具箱", "行业方案", "定价", "免费体验"]} />
          <FooterColumn title="联系" links={["联系定制", "商务合作", "使用反馈", "在线支持"]} />
          <FooterColumn title="条款" links={["隐私政策", "服务条款", "数据安全", "免责声明"]} />
        </div>
        <div className="mx-auto flex max-w-7xl flex-col gap-3 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 AI办公工具箱. All rights reserved.</p>
          <a href="https://openi.cn/" target="_blank" rel="noopener noreferrer" className="transition hover:text-slate-950">
            OpenI AI时代
          </a>
        </div>
      </footer>
    </main>
  );
}

const footerLinks: Record<string, string> = {
  工具箱: "/tools",
  行业方案: "/solutions",
  定价: "/pricing",
  免费体验: "/tools",
  联系定制: "/contact",
  商务合作: "/contact",
  使用反馈: "/contact",
  在线支持: "/contact",
  隐私政策: "/privacy",
  服务条款: "/terms",
  数据安全: "/privacy",
  免责声明: "/terms"
};

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      <div className="mt-4 flex flex-col gap-3">
        {links.map((link) => (
          <a key={link} href={footerLinks[link] || "/contact"} className="text-sm text-slate-600 transition hover:text-slate-950">
            {link}
          </a>
        ))}
      </div>
    </div>
  );
}
