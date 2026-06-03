import SiteHeader from "@/components/SiteHeader";
import { ArrowRight, CheckCircle2, Contact, Route, Sparkles, Wrench } from "lucide-react";
import type { SolutionSummary } from "./solution-data";
import WorkflowExperiencePlaceholder from "./WorkflowExperiencePlaceholder";

export default function SolutionDetailPage({ solution }: { solution: SolutionSummary }) {
  const Icon = solution.icon;

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <SiteHeader />

      <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#F8FAFC_0%,#FFFFFF_100%)] px-5 py-14 sm:px-6 sm:py-18 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.78fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              <Icon className="h-4 w-4 text-blue-600" />
              行业方案详情
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-6xl">{solution.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{solution.subtitle}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <WorkflowExperiencePlaceholder solutionName={solution.title} />
              <ButtonLink href="/contact" variant="secondary">
                联系定制
              </ButtonLink>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.1)]">
            <p className="text-sm font-semibold text-blue-700">适用对象</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">{solution.audience}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">{solution.description}</p>
            <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
              <p className="text-sm font-semibold text-blue-200">交付目标</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                先用现有工具快速体验，再根据团队资料格式、话术模板和业务规则继续定制。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-6 sm:py-18 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
          <InfoPanel title="行业介绍" icon={<Sparkles className="h-5 w-5" />}>
            <p className="text-sm leading-7 text-slate-600">{solution.description}</p>
          </InfoPanel>

          <InfoPanel title="典型痛点" icon={<Contact className="h-5 w-5" />}>
            <List items={solution.pains} />
          </InfoPanel>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 px-5 py-14 sm:px-6 sm:py-18 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader title="AI 解决方案" description="围绕真实业务节点组合工具能力，减少重复处理、复制粘贴和人工整理。" />
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {solution.aiSolutions.map((item) => (
              <div key={item} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                <p className="text-sm leading-7 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-6 sm:py-18 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader title="对应工具列表" description="详情页只引用现有工具入口，不修改任何工具请求参数或 Dify API 调用逻辑。" />
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {solution.tools.map((tool) => {
              const ToolIcon = tool.icon;
              return (
                <article key={tool.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
                    <ToolIcon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-base font-semibold text-slate-950">{tool.name}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{tool.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 px-5 py-14 sm:px-6 sm:py-18 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader title="使用流程图" description="从资料输入到结果落地，保持步骤清晰，便于团队试用和后续定制。" />
          <div className="mt-10 grid gap-4 md:grid-cols-5">
            {solution.flow.map((step, index) => (
              <div key={step} className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-semibold text-blue-700">{index + 1}</div>
                <p className="mt-4 text-sm font-semibold leading-6 text-slate-800">{step}</p>
                {index < solution.flow.length - 1 ? (
                  <Route className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-slate-300 md:block" />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-6 sm:py-18 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_28px_90px_rgba(15,23,42,0.18)] sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-blue-200">
                <Wrench className="h-5 w-5" />
              </div>
              <h2 className="mt-6 text-2xl font-semibold tracking-normal sm:text-4xl">先体验工具，再定制工作流</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                如果标准工具已经能覆盖一部分流程，可以继续把模板、字段、审批或导出方式做成定制方案。
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <WorkflowExperiencePlaceholder dark solutionName={solution.title} />
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

function InfoPanel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">{icon}</div>
      <h2 className="mt-6 text-2xl font-semibold text-slate-950">{title}</h2>
      <div className="mt-4">{children}</div>
    </article>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item} className="flex gap-3 text-sm leading-7 text-slate-700">
          <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-blue-600" />
          <span>{item}</span>
        </div>
      ))}
    </div>
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

function ButtonLink({ href, children, variant = "primary" }: { href: string; children: React.ReactNode; variant?: "primary" | "secondary" | "dark" }) {
  const className =
    variant === "primary"
      ? "bg-white text-slate-950 shadow-lg shadow-slate-950/10 hover:bg-slate-100"
      : variant === "dark"
        ? "border border-white/15 bg-white/5 text-white hover:bg-white/10"
        : "border border-slate-200 bg-white text-slate-800 shadow-sm hover:border-blue-200 hover:bg-blue-50";

  return (
    <a href={href} className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 ${className}`}>
      {children}
      <ArrowRight className="h-4 w-4" />
    </a>
  );
}
