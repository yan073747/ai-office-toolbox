import SiteHeader from "@/components/SiteHeader";
import { ArrowRight, CheckCircle2, ClipboardList, MessageSquareText, Users } from "lucide-react";
import { solutionHighlights, solutions } from "./solution-data";

export const metadata = {
  title: "行业方案 | AI办公工具箱",
  description: "面向电商运营和外贸跟单场景的 AI 办公工具组合方案。"
};

export default function SolutionsPage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <SiteHeader />

      <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#F8FAFC_0%,#FFFFFF_100%)] px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.82fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              <ClipboardList className="h-4 w-4 text-blue-600" />
              行业级 AI 办公解决方案
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-6xl">
              把 AI 工具组合成可落地的行业工作流
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              不只提供单个工具，也可以围绕电商运营、外贸跟单等重复办公场景，把文案、表格、文档和沟通能力串成稳定流程。
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="#plans">查看方案</ButtonLink>
              <ButtonLink href="/contact" variant="secondary">
                联系定制
              </ButtonLink>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_30px_90px_rgba(15,23,42,0.1)]">
            <div className="rounded-2xl bg-slate-950 p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">Solution Builder</p>
              <h2 className="mt-3 text-2xl font-semibold">从工具到业务助手</h2>
              <div className="mt-6 grid gap-3">
                {solutionHighlights.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
                    <p className="text-xs text-slate-400">{item.label}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-100">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="plans" className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="行业方案列表"
            title="选择一个业务场景，进入完整方案详情"
            description="每个方案都包含行业痛点、AI 处理方式、对应工具和使用流程，适合作为团队试用或后续定制的起点。"
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {solutions.map((solution) => {
              const Icon = solution.icon;
              return (
                <article
                  key={solution.slug}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-8"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-6 text-2xl font-semibold tracking-normal text-slate-950">{solution.title}</h2>
                  <p className="mt-3 text-sm font-semibold text-blue-700">{solution.audience}</p>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{solution.description}</p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <ListPanel title="典型痛点" items={solution.pains.slice(0, 3)} />
                    <ListPanel title="AI 解决方案" items={solution.aiSolutions.slice(0, 3)} accent />
                  </div>

                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <ButtonLink href={`/solutions/${solution.slug}`} compact>
                      了解方案
                    </ButtonLink>
                    <ButtonLink href="/contact" variant="secondary" compact>
                      联系定制
                    </ButtonLink>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader title="行业方案如何交付" />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {["梳理业务场景", "组合现有工具", "适配资料格式", "试用后再定制"].map((step, index) => (
              <article key={step} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-sm font-semibold text-blue-700">{index + 1}</span>
                <h3 className="mt-5 text-base font-semibold text-slate-950">{step}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_28px_90px_rgba(15,23,42,0.18)] sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-blue-200">
                <Users className="h-5 w-5" />
              </div>
              <h2 className="mt-6 text-2xl font-semibold tracking-normal sm:text-4xl">想把你的业务流程做成 AI 助手？</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                可以先从标准工具体验开始，再根据表格、文档模板、话术和业务规则继续定制。
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/tools">立即体验</ButtonLink>
              <ButtonLink href="/contact" variant="dark">
                联系定制
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ListPanel({ title, items, accent = false }: { title: string; items: string[]; accent?: boolean }) {
  return (
    <div className={accent ? "rounded-2xl bg-blue-50 p-5" : "rounded-2xl bg-slate-50 p-5"}>
      <h3 className={accent ? "text-sm font-semibold text-blue-950" : "text-sm font-semibold text-slate-950"}>{title}</h3>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item} className="flex gap-3 text-sm leading-6 text-slate-700">
            <CheckCircle2 className={accent ? "mt-0.5 h-4 w-4 shrink-0 text-blue-600" : "mt-0.5 h-4 w-4 shrink-0 text-slate-400"} />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow ? <p className="mb-3 text-sm font-semibold text-blue-600">{eyebrow}</p> : null}
      <h2 className="text-2xl font-semibold tracking-normal text-slate-950 sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-8 text-slate-600">{description}</p> : null}
    </div>
  );
}

function ButtonLink({
  href,
  children,
  variant = "primary",
  compact = false
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "dark";
  compact?: boolean;
}) {
  const className =
    variant === "primary"
      ? "bg-slate-950 text-white shadow-lg shadow-slate-950/10 hover:bg-slate-800"
      : variant === "dark"
        ? "border border-white/15 bg-white/5 text-white hover:bg-white/10"
        : "border border-slate-200 bg-white text-slate-800 shadow-sm hover:border-blue-200 hover:bg-blue-50";

  return (
    <a
      href={href}
      className={`inline-flex ${compact ? "h-11" : "h-12"} items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 ${className}`}
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </a>
  );
}
