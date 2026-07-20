import SiteHeader from "@/components/SiteHeader";
import { agentDemos } from "@/lib/agent-demos";
import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  FileDown,
  FlaskConical,
  Link2,
  Network,
  UploadCloud,
  Zap
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "AI Agent 作品集 | AI办公工具箱",
  description: "查看可在线体验的 AI Agent 项目作品集，包含企业 RAG 工单助手、PromptOps、多 Agent 文档工作流、跨境 Listing Agent 和 Enterprise MCP Agent。"
};

const selectedDemo = agentDemos.find((demo) => demo.slug === "mcp-agent") ?? agentDemos[0];

const endpointRows = agentDemos.map((demo) => ({
  index: demo.index,
  name: demo.name,
  slug: demo.slug,
  href: demo.liveUrl,
  deployed: demo.deploymentStatus === "deployed"
}));

const workflowIcons = [UploadCloud, CheckCircle2, Network, FileDown];

export default function AgentDemosPage() {
  return (
    <main className="min-h-screen bg-[#fbfaf7] text-stone-950">
      <SiteHeader />

      <section className="border-b border-stone-200 bg-[#fffdf8] px-5 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold tracking-normal text-amber-700">面向技术面试的可部署演示项目集</p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-normal text-stone-950 sm:text-6xl">
              AI Agent 作品集
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-600">
              五个项目统一收纳在 aiworkbox.cn 下，面试官可以从一个入口查看业务场景、工程架构、技术栈和真实演示地址。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {selectedDemo.deploymentStatus === "deployed" ? (
                <a
                  href={selectedDemo.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-stone-950 px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-stone-800"
                >
                  打开推荐演示
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : (
                <Link
                  href={`/demos/${selectedDemo.slug}`}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-stone-950 px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-stone-800"
                >
                  部署中 / 查看详情
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              <Link
                href={`/demos/${selectedDemo.slug}`}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-5 text-sm font-semibold text-stone-800 transition hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50"
              >
                查看案例详情
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white shadow-[0_18px_60px_rgba(41,37,36,0.06)]">
            <div className="flex flex-col items-start gap-3 border-b border-stone-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-stone-950">实时可用的演示地址</h2>
                <p className="mt-1 text-xs text-stone-500">子域名可逐个接入真实服务，不需要购买新域名。</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                全部可访问
              </span>
            </div>
            <div className="divide-y divide-stone-100">
              {endpointRows.map((row) => (
                <Link
                  key={row.index}
                  href={row.deployed ? row.href : `/demos/${row.slug}`}
                  className="grid grid-cols-[34px_minmax(0,1fr)] items-start gap-2 px-5 py-3 text-sm transition hover:bg-amber-50/70 sm:grid-cols-[44px_minmax(0,1fr)_auto] sm:items-center sm:gap-3"
                >
                  <span className="font-mono text-xs text-stone-400">{row.index}</span>
                  <span className="min-w-0 font-medium leading-5 text-stone-800">{row.name}</span>
                  <span className={row.deployed ? "col-span-2 inline-flex min-w-0 items-center gap-2 break-all text-blue-700 sm:col-span-1 sm:justify-self-end" : "col-span-2 inline-flex min-w-0 items-center gap-2 text-amber-700 sm:col-span-1 sm:justify-self-end"}>
                    {row.deployed ? row.href.replace("https://", "") : "部署中 / 查看详情"}
                    {row.deployed ? <ExternalLink className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-xl border border-stone-200 bg-white shadow-[0_20px_70px_rgba(41,37,36,0.07)] lg:grid-cols-[310px_1fr]">
          <aside className="border-b border-stone-200 bg-[#fffaf0] lg:border-b-0 lg:border-r">
            <div className="border-b border-stone-200 px-6 py-5">
              <h2 className="text-base font-semibold text-stone-950">案例索引</h2>
              <p className="mt-1 text-xs leading-5 text-stone-500">按面试讲解顺序组织，默认展示最贴合办公主站的项目。</p>
            </div>
            <div className="divide-y divide-stone-200/80">
              {agentDemos.map((demo) => {
                const active = demo.slug === selectedDemo.slug;
                return (
                  <Link
                    key={demo.slug}
                    href={`/demos/${demo.slug}`}
                    className={`grid grid-cols-[44px_1fr_auto] items-center gap-3 px-5 py-5 transition ${
                      active ? "border-l-4 border-amber-600 bg-amber-50 text-amber-900" : "border-l-4 border-transparent hover:bg-white"
                    }`}
                  >
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${active ? "bg-amber-600 text-white" : "bg-white text-stone-700 ring-1 ring-stone-200"}`}>
                      {demo.index}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold leading-5">{demo.name}</span>
                      <span className="mt-1 block text-xs leading-5 text-stone-500">{demo.chineseName}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-stone-400" />
                  </Link>
                );
              })}
            </div>
          </aside>

          <div>
            <section className="grid gap-8 border-b border-stone-200 p-6 lg:grid-cols-[1fr_0.78fr] lg:p-9">
              <div>
                <p className="text-xs font-semibold text-amber-700">当前案例 {selectedDemo.index}</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-normal text-stone-950 sm:text-4xl">{selectedDemo.name}</h2>
                <p className="mt-3 text-base leading-7 text-stone-600">{selectedDemo.subtitle}</p>

                <div className="mt-8 grid gap-6 md:grid-cols-2">
                  <NarrativeBlock title="问题与挑战" items={selectedDemo.pains} />
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-stone-950">
                      <Zap className="h-4 w-4 text-amber-600" />
                      解决方案概述
                    </div>
                    <p className="mt-3 text-sm leading-7 text-stone-600">{selectedDemo.solution}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-stone-200 bg-[#fffdf8] p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-stone-950">
                  <Link2 className="h-4 w-4 text-blue-700" />
                  演示路径
                </div>
                {selectedDemo.deploymentStatus === "deployed" ? (
                  <a
                    href={selectedDemo.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800 transition hover:bg-blue-100"
                  >
                    {selectedDemo.liveUrl}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : (
                  <div className="mt-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                    <span>{selectedDemo.liveUrl}</span>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs">部署中</span>
                  </div>
                )}
                <p className="mt-3 text-xs leading-5 text-stone-500">建议体验流程：上传样例数据、确认计划、观察 Agent 执行链路、下载报告。</p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {selectedDemo.metrics.map((metric) => (
                    <div key={metric.label} className="rounded-lg border border-stone-200 bg-white px-3 py-3">
                      <p className="text-xs text-stone-500">{metric.label}</p>
                      <p className="mt-1 text-sm font-semibold text-stone-950">{metric.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="border-b border-stone-200 p-6 lg:p-9">
              <h3 className="text-base font-semibold text-stone-950">工作流程</h3>
              <div className="mt-5 grid gap-4 md:grid-cols-4">
                {selectedDemo.workflow.slice(0, 4).map((step, index) => {
                  const Icon = workflowIcons[index] ?? CheckCircle2;
                  return (
                    <div key={step} className="grid grid-cols-[48px_1fr] items-center gap-3 rounded-xl border border-stone-200 bg-white p-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-blue-700">步骤 {index + 1}</p>
                        <p className="mt-1 text-sm font-semibold text-stone-900">{step}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="p-6 lg:p-9">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-amber-600" />
                <h3 className="text-base font-semibold text-stone-950">项目横向对比</h3>
              </div>
              <div className="mt-5 overflow-hidden rounded-xl border border-stone-200">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-[#fffaf0] text-xs text-stone-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">项目名称</th>
                      <th className="px-4 py-3 font-semibold">核心业务场景</th>
                      <th className="px-4 py-3 font-semibold">技术亮点</th>
                      <th className="px-4 py-3 font-semibold">演示就绪度</th>
                      <th className="px-4 py-3 font-semibold">可访问地址</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 bg-white">
                    {agentDemos.map((demo) => (
                      <tr key={demo.slug} className={demo.slug === selectedDemo.slug ? "bg-amber-50/70" : undefined}>
                        <td className="px-4 py-3 font-semibold text-stone-900">{demo.name}</td>
                        <td className="px-4 py-3 text-stone-600">{demo.businessScene}</td>
                        <td className="px-4 py-3 text-stone-600">{demo.technicalHighlight}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {demo.readiness}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {demo.deploymentStatus === "deployed" ? (
                            <a href={demo.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-semibold text-blue-700 hover:text-blue-900">
                              {demo.liveUrl.replace("https://", "")}
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          ) : (
                            <Link href={`/demos/${demo.slug}`} className="inline-flex items-center gap-2 font-semibold text-amber-700 hover:text-amber-900">
                              部署中 / 查看详情
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </section>

      <section className="px-5 pb-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 rounded-xl border border-stone-200 bg-stone-950 p-6 text-white md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-200">
              <FlaskConical className="h-4 w-4" />
              子域名部署建议
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-300">
              五个项目可以继续独立部署，只要在阿里云 DNS 中添加对应 CNAME 或 A 记录，主站的作品集入口就能保持统一。
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-stone-200">
            <CalendarClock className="h-4 w-4 text-amber-200" />
            更新时间：2026-07-13
          </div>
        </div>
      </section>
    </main>
  );
}

function NarrativeBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-stone-950">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-600">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
