import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { agentDemos, getAgentDemo } from "@/lib/agent-demos";

type DemoDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const publicDemoNotes: Record<string, string> = {
  "rag-ticket":
    "线上版本用样例知识库演示文档入库、检索和转工单；接你公司的文档库、Embedding 服务和模型是另一套部署。",
  promptops:
    "线上版本用 Mock Model 演示 Prompt 版本、测试集和失败案例；工程版可接 OpenAI、Claude、Gemini、DeepSeek 等。",
  "document-workflow":
    "线上版本用固定样例数据跑通全流程；工程版可接真实文件存储、任务队列、模型服务和权限系统。",
  "crossborder-listing":
    "线上版本用本地规则和样例商品演示；工程版可接真实模型、店铺数据、运营导出和历史数据库。",
  "mcp-agent":
    "线上版本用固定样例数据模拟调用链路；工程版可接真实 MCP Server、CRM、权限校验和审计日志。"
};

export function generateStaticParams() {
  return agentDemos.map((demo) => ({ slug: demo.slug }));
}

export async function generateMetadata({ params }: DemoDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const demo = getAgentDemo(slug);

  if (!demo) {
    return { title: "技术演示｜AI WorkBox" };
  }

  return {
    title: `${demo.chineseName}｜AI WorkBox`,
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
    <div className="bg-paper text-inkd">
      <SiteHeader />

      <section className="border-b border-wline px-5 pb-7 pt-7 md:pb-9 md:pt-9">
        <div className="mx-auto max-w-site">
          <Link
            href="/demos"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-mute transition hover:text-accent"
          >
            ← 返回技术演示
          </Link>

          <div className="mt-5 grid gap-7 md:grid-cols-[1fr_280px] md:items-start">
            <div className="min-w-0">
              <p className="inline-block border-b border-[#E0C4B4] pb-0.5 text-[12.5px] font-semibold tracking-[0.04em] text-accent">
                案例 {demo.index} · {demo.scene}
              </p>
              <h1 className="mt-3 text-[26px] font-semibold leading-[1.38] tracking-[-0.012em] text-inkd md:text-[33px]">
                {demo.chineseName}
              </h1>
              <p className="mt-1.5 font-mono text-[11.5px] tracking-wide text-mute">{demo.name}</p>
              <p className="mt-3.5 max-w-[560px] text-[14.5px] leading-[1.95] text-ink2">{demo.subtitle}</p>

              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                {demo.deploymentStatus === "deployed" ? (
                  <a
                    href={demo.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover-lift inline-flex h-11 items-center justify-center gap-2 rounded-[3px] bg-accent px-5 text-[14px] font-semibold text-white transition hover:bg-[#9C4525]"
                  >
                    打开在线演示
                    <span aria-hidden="true">↗</span>
                  </a>
                ) : (
                  <span className="inline-flex h-11 items-center justify-center rounded-[3px] bg-paper2 px-5 text-[14px] font-semibold text-mute">
                    还在部署，暂时打不开
                  </span>
                )}
                <a
                  href="https://github.com/yan073747/ai-office-toolbox"
                  target="_blank"
                  rel="noreferrer"
                  className="hover-lift inline-flex h-11 items-center justify-center gap-2 rounded-[3px] border border-wline bg-white px-5 text-[14px] font-semibold text-inkd transition hover:border-[#CFC5B1]"
                >
                  看主站源码
                </a>
              </div>
            </div>

            <aside className="border-t border-wline2 pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0">
              <p className="text-[11.5px] font-semibold tracking-[0.03em] text-mute">演示入口</p>
              {demo.deploymentStatus === "deployed" ? (
                <a
                  href={demo.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1.5 block break-all text-[13px] font-semibold text-accent underline-offset-4 hover:underline"
                >
                  {demo.liveUrl.replace("https://", "")} ↗
                </a>
              ) : (
                <p className="mt-1.5 break-all text-[13px] font-semibold text-mute">
                  {demo.liveUrl.replace("https://", "")}（部署中）
                </p>
              )}
              <p className="mt-1 text-[12px] text-mute">状态：{demo.readiness}</p>

              {demo.demoAccount ? (
                <div className="mt-4 border-t border-wline2 pt-3">
                  <p className="text-[11.5px] font-semibold tracking-[0.03em] text-mute">演示账号</p>
                  <dl className="mt-1.5 grid gap-1 text-[12.5px]">
                    <div className="flex justify-between gap-3">
                      <dt className="text-mute">用户名</dt>
                      <dd className="font-mono text-inkd">{demo.demoAccount.username}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-mute">密码</dt>
                      <dd className="font-mono text-inkd">{demo.demoAccount.password}</dd>
                    </div>
                  </dl>
                </div>
              ) : null}

              <div className="mt-4 border-t border-wline2 pt-3">
                <p className="text-[11.5px] font-semibold tracking-[0.03em] text-mute">一句实话</p>
                <p className="mt-1.5 text-[12.5px] leading-[1.8] text-ink2">{publicDemoNotes[demo.slug]}</p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="border-b border-wline px-5 py-8 md:py-10">
        <div className="mx-auto grid max-w-site gap-8 md:grid-cols-[1.15fr_0.85fr]">
          <article className="min-w-0">
            <p className="text-[11.5px] font-semibold tracking-[0.03em] text-accent">解决什么问题</p>
            <h2 className="mt-1 text-[21px] font-semibold tracking-[-0.005em] text-inkd">为什么值得做这个东西</h2>
            <p className="mt-3 text-[14.5px] leading-[1.95] text-ink2">{demo.solution}</p>
            <ul className="mt-5 border-t border-wline2">
              {demo.pains.map((pain) => (
                <li key={pain} className="flex gap-2.5 border-b border-wline2 py-3 text-[13.5px] leading-[1.85] text-ink2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  <span>{pain}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="min-w-0">
            <p className="text-[11.5px] font-semibold tracking-[0.03em] text-accent">演示流程</p>
            <h2 className="mt-1 text-[21px] font-semibold tracking-[-0.005em] text-inkd">点进去之后会看到什么</h2>
            <ol className="mt-4 border-t border-wline2">
              {demo.workflow.map((step, index) => (
                <li key={step} className="grid grid-cols-[26px_1fr] gap-2.5 border-b border-wline2 py-3">
                  <span className="font-mono text-[11.5px] tabular-nums text-mute">{String(index + 1).padStart(2, "0")}</span>
                  <span className="text-[13.5px] font-medium leading-[1.8] text-inkd">{step}</span>
                </li>
              ))}
            </ol>
          </article>
        </div>
      </section>

      <section className="border-b border-wline px-5 py-8 md:py-10">
        <div className="mx-auto grid max-w-site gap-8 md:grid-cols-[0.85fr_1.15fr]">
          <article className="min-w-0">
            <p className="text-[11.5px] font-semibold tracking-[0.03em] text-accent">技术栈</p>
            <h2 className="mt-1 text-[21px] font-semibold tracking-[-0.005em] text-inkd">用了什么</h2>
            <p className="mt-2.5 text-[13px] leading-[1.85] text-mute">这些只是工具名，真正花时间的是下面那三个数。</p>
            <div className="mt-3.5 flex flex-wrap gap-x-3 gap-y-1.5">
              {demo.stack.map((item) => (
                <span key={item} className="border-b border-wline2 pb-0.5 text-[12.5px] font-medium text-ink2">
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-[3px] border border-wline bg-wline">
              {demo.metrics.map((metric) => (
                <div key={metric.label} className="bg-white px-2.5 py-3">
                  <p className="text-[10.5px] leading-[1.5] text-mute">{metric.label}</p>
                  <p className="mt-1 text-[12.5px] font-semibold leading-[1.5] text-inkd">{metric.value}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="min-w-0">
            <p className="text-[11.5px] font-semibold tracking-[0.03em] text-accent">值得看的地方</p>
            <h2 className="mt-1 text-[21px] font-semibold tracking-[-0.005em] text-inkd">如果你要做类似的东西</h2>
            <ul className="mt-4 border-t border-wline2">
              {demo.talkingPoints.map((point, index) => (
                <li key={point} className="grid grid-cols-[26px_1fr] gap-2.5 border-b border-wline2 py-3">
                  <span className="font-mono text-[11.5px] tabular-nums text-mute">{String(index + 1).padStart(2, "0")}</span>
                  <span className="text-[13.5px] leading-[1.85] text-ink2">{point}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="bg-deep px-5 py-10 md:py-12">
        <div className="mx-auto flex max-w-site flex-wrap items-center justify-between gap-7">
          <div>
            <h2 className="text-[22px] font-semibold leading-[1.5] text-paper md:text-[25px]">
              这个看着像你们那个活？
            </h2>
            <p className="mt-2 max-w-[440px] text-[13px] leading-[1.8] text-[#B7AE9B]">
              那咱们聊十分钟。你也可以先回去把其它四个也点一遍。
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/contact"
              className="hover-lift inline-flex h-12 items-center justify-center whitespace-nowrap rounded-[3px] bg-accent px-6 text-[15px] font-semibold text-white transition hover:bg-[#9C4525]"
            >
              说说你的情况 →
            </Link>
            <Link
              href="/demos"
              className="hover-lift inline-flex h-12 items-center justify-center whitespace-nowrap rounded-[3px] border border-white/25 px-5 text-[14px] font-semibold text-paper transition hover:bg-white/10"
            >
              看其它项目
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
