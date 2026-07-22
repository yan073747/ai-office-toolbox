import SiteHeader from "@/components/SiteHeader";
import { agentDemos, getAgentDemo } from "@/lib/agent-demos";
import { ArrowLeft, ArrowRight, CheckCircle2, ExternalLink, FileCode2, KeyRound, Layers3, Route, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

type DemoDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const publicDemoNotes: Record<string, string> = {
  "rag-ticket": "当前线上版本使用样例知识库演示文档入库、检索和转工单；工程版可接入真实文档库、Embedding 服务和模型服务。",
  promptops: "当前线上版本使用 Mock Model 演示 Prompt 版本、测试集和失败案例；工程版可接入 OpenAI、Claude、Gemini、DeepSeek 等模型 Provider。",
  "document-workflow": "当前线上版本使用 deterministic fixture 和安全样例数据；工程版可接入真实文件存储、任务队列、模型 Provider 和权限系统。",
  "crossborder-listing": "当前线上版本使用本地规则和样例商品数据演示；工程版可接入真实 LLM、店铺数据、运营导出和历史数据库。",
  "mcp-agent": "当前线上版本使用前端模拟链路和固定样例数据；工程版可接入真实 MCP Server、CRM、权限校验和审计日志。"
};

export function generateStaticParams() {
  return agentDemos.map((demo) => ({ slug: demo.slug }));
}

export async function generateMetadata({ params }: DemoDetailPageProps) {
  const { slug } = await params;
  const demo = getAgentDemo(slug);

  if (!demo) {
    return {
      title: "AI Agent 作品集 | AI办公工具箱"
    };
  }

  return {
    title: `${demo.name} | AI Agent 作品集`,
    description: demo.subtitle
  };
}

export default async function DemoDetailPage({ params }: DemoDetailPageProps) {
  const { slug } = await params;
  const demo = getAgentDemo(slug);

  if (!demo) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-stone-950">
      <SiteHeader />

      <section className="border-b border-stone-200 bg-[#fffdf8] px-5 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link href="/demos" className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 transition hover:text-stone-950">
            <ArrowLeft className="h-4 w-4" />
            返回 Agent 作品集
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_420px] lg:items-start">
            <div>
              <p className="text-sm font-semibold text-amber-700">案例 {demo.index} / {demo.scene}</p>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight tracking-normal text-stone-950 sm:text-6xl">{demo.name}</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-stone-600">{demo.subtitle}</p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {demo.deploymentStatus === "deployed" ? (
                  <a
                    href={demo.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-stone-950 px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-stone-800"
                  >
                    打开在线演示
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : (
                  <span className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-stone-950 px-5 text-sm font-semibold text-white">
                    部署中 / 暂不可外跳
                  </span>
                )}
                <a
                  href={`https://github.com/yan073747/ai-office-toolbox`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-5 text-sm font-semibold text-stone-800 transition hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50"
                >
                  查看主站仓库
                  <FileCode2 className="h-4 w-4" />
                </a>
              </div>
            </div>

            <aside className="rounded-xl border border-stone-200 bg-white p-5 shadow-[0_18px_60px_rgba(41,37,36,0.06)]">
              <div className="flex items-center justify-between gap-4 border-b border-stone-200 pb-4">
                <div>
                  <p className="text-xs font-semibold text-stone-500">演示入口</p>
                  <h2 className="mt-1 text-lg font-semibold text-stone-950">{demo.chineseName}</h2>
                </div>
                <span className={demo.deploymentStatus === "deployed" ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700" : "rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700"}>
                  {demo.deploymentStatus === "deployed" ? demo.readiness : "部署中"}
                </span>
              </div>

              {demo.deploymentStatus === "deployed" ? (
                <a
                  href={demo.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800 transition hover:bg-blue-100"
                >
                  {demo.liveUrl.replace("https://", "")}
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : (
                <div className="mt-5 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                  <span>{demo.liveUrl.replace("https://", "")}</span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs">部署中</span>
                </div>
              )}

              {demo.demoAccount ? (
                <div className="mt-5 rounded-lg border border-stone-200 bg-[#fffdf8] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-stone-950">
                    <KeyRound className="h-4 w-4 text-amber-700" />
                    演示账号
                  </div>
                  <dl className="mt-3 grid gap-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-stone-500">用户名</dt>
                      <dd className="font-mono text-stone-950">{demo.demoAccount.username}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-stone-500">密码</dt>
                      <dd className="font-mono text-stone-950">{demo.demoAccount.password}</dd>
                    </div>
                  </dl>
                </div>
              ) : null}

              <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
                <div className="flex items-center gap-2 font-semibold">
                  <ShieldCheck className="h-4 w-4" />
                  公开演示说明
                </div>
                <p className="mt-2">当前线上版本使用样例数据、Mock 或本地规则，保证公开访问稳定；工程版已预留真实模型、数据库、权限或后端服务接入空间。</p>
                <p className="mt-2">{publicDemoNotes[demo.slug]}</p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="px-5 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_0.9fr]">
          <article className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm lg:p-8">
            <div className="flex items-center gap-2">
              <Layers3 className="h-5 w-5 text-amber-700" />
              <h2 className="text-xl font-semibold text-stone-950">项目解决什么问题</h2>
            </div>
            <p className="mt-4 text-sm leading-7 text-stone-600">{demo.solution}</p>
            <div className="mt-6 grid gap-3">
              {demo.pains.map((pain) => (
                <div key={pain} className="flex gap-3 rounded-lg bg-[#fffaf0] px-4 py-3 text-sm leading-6 text-stone-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                  <span>{pain}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm lg:p-8">
            <div className="flex items-center gap-2">
              <Route className="h-5 w-5 text-blue-700" />
              <h2 className="text-xl font-semibold text-stone-950">演示流程</h2>
            </div>
            <div className="mt-6 space-y-3">
              {demo.workflow.map((step, index) => (
                <div key={step} className="grid grid-cols-[42px_1fr] items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">{index + 1}</span>
                  <div className="rounded-lg border border-stone-200 px-4 py-3 text-sm font-semibold text-stone-800">{step}</div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="px-5 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-xl border border-stone-200 bg-stone-950 p-6 text-white shadow-sm lg:p-8">
            <h2 className="text-xl font-semibold">技术栈</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {demo.stack.map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-stone-100">
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {demo.metrics.map((metric) => (
                <div key={metric.label} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs text-stone-400">{metric.label}</p>
                  <p className="mt-2 text-sm font-semibold text-white">{metric.value}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm lg:p-8">
            <h2 className="text-xl font-semibold text-stone-950">能力展示重点</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {demo.talkingPoints.map((point) => (
                <div key={point} className="rounded-lg border border-stone-200 bg-[#fffdf8] p-4 text-sm leading-6 text-stone-700">
                  {point}
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="px-5 pb-14 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-stone-950">继续查看其它项目</p>
            <p className="mt-1 text-sm text-stone-500">所有页面都使用同一套作品集信息架构，便于横向比较项目能力。</p>
          </div>
          <Link href="/demos" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-stone-950 px-4 text-sm font-semibold text-white transition hover:bg-stone-800">
            返回作品集总览
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
