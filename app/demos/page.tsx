import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { agentDemos } from "@/lib/agent-demos";

export const metadata: Metadata = {
  title: "技术演示｜AI WorkBox",
  description:
    "五个已上线的 AI 应用演示：企业知识库工单助手、Prompt 评测平台、多 Agent 文档工作流、跨境商品上架 Agent、企业 MCP 工具调用平台。都能直接点开用。"
};

const notes = [
  {
    title: "都是真跑着的，不是截图",
    body: "每个地址点进去就能操作。企业知识库问答那个有 42 条测试用例，全部通过；评测平台自己有 16 项测试。"
  },
  {
    title: "用的是样例数据，不碰真客户",
    body: "演示环境里都是样例客户、样例商品、样例文档。你公司真实数据接进来是另一套部署。"
  },
  {
    title: "重点不在「AI 很聪明」",
    body: "重点是答不出来的时候怎么办、答案从哪一段来的、出错能不能查到哪一步。这三件事决定它能不能在你公司用下去。"
  }
];

export default function AgentDemosPage() {
  return (
    <div className="bg-paper text-inkd">
      <SiteHeader />

      <section className="border-b border-wline px-5 pb-7 pt-9 md:pb-9 md:pt-11">
        <div className="mx-auto max-w-site">
          <p className="inline-block border-b border-[#E0C4B4] pb-0.5 text-[12.5px] font-semibold tracking-[0.04em] text-accent">
            技术演示
          </p>
          <h1 className="mt-3.5 max-w-[600px] text-[26px] font-semibold leading-[1.42] tracking-[-0.012em] text-inkd md:text-[34px]">
            五个系统都还开着，你可以自己点开试
          </h1>
          <div className="mt-4 grid max-w-[660px] gap-2.5 text-[15px] leading-[1.95] text-ink2">
            <p>
              这些不是作品集里的配图，是能操作的站点。想看哪个直接点，用坏了也不影响我什么。
            </p>
            <p className="text-[13.5px] leading-[1.9] text-mute">
              看完如果觉得「我厂里也有这么个活」，那基本就对上话了。
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-wline px-5 py-8 md:py-10">
        <div className="mx-auto max-w-site">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
            <div>
              <p className="text-[11.5px] font-semibold tracking-[0.03em] text-accent">五个系统</p>
              <h2 className="mt-1 text-[21px] font-semibold tracking-[-0.005em] text-inkd">按「最像你公司」的顺序排的</h2>
            </div>
            <p className="text-[13px] text-mute">全部可在线打开</p>
          </div>

          <ol className="border-t border-wline">
            {agentDemos.map((demo) => (
              <li key={demo.slug} className="border-b border-wline2">
                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 py-5 md:grid-cols-[38px_1fr_190px] md:gap-x-4">
                  <span className="col-start-1 row-start-1 pt-0.5 font-mono text-[11px] tabular-nums text-mute md:text-[12px]">
                    {demo.index}
                  </span>

                  <div className="col-start-2 row-start-1 min-w-0">
                    <h3 className="text-[16px] font-semibold leading-[1.55] text-inkd">{demo.chineseName}</h3>
                    <p className="mt-1.5 text-[13.5px] leading-[1.85] text-ink2">{demo.subtitle}</p>
                    <p className="mt-2 text-[12.5px] leading-[1.75] text-mute">
                      技术上：{demo.technicalHighlight}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                      <a
                        href={demo.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="border-b border-[#DFC3B2] pb-0.5 text-[13px] font-semibold text-accent"
                      >
                        打开 {demo.liveUrl.replace("https://", "")} ↗
                      </a>
                      <Link
                        href={`/demos/${demo.slug}`}
                        className="text-[13px] font-medium text-mute underline-offset-4 hover:text-inkd hover:underline"
                      >
                        看它怎么做出来的
                      </Link>
                    </div>
                  </div>

                  <div className="col-start-2 row-start-2 border-t border-wline2 pt-2 md:col-start-3 md:row-start-1 md:border-l md:border-t-0 md:pl-4 md:pt-0">
                    <p className="text-[11.5px] font-semibold tracking-[0.03em] text-mute">对应什么活</p>
                    <p className="mt-1 text-[12.5px] leading-[1.75] text-ink2">{demo.businessScene}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-5 text-[13px] leading-[1.8] text-mute">
            另外还做过一个企业内部数字化中台（飞书 + 内部系统），不对外演示 —— 那个是给公司内部用的。
          </p>
        </div>
      </section>

      <section className="border-b border-wline px-5 py-8 md:py-10">
        <div className="mx-auto max-w-site">
          <p className="text-[11.5px] font-semibold tracking-[0.03em] text-accent">先说清楚</p>
          <h2 className="mt-1 text-[21px] font-semibold tracking-[-0.005em] text-inkd">看的时候留意这三件事</h2>
          <div className="mt-5 grid border-t border-wline2 md:grid-cols-3">
            {notes.map((note, index) => (
              <div
                key={note.title}
                className={`py-4 md:pr-5 ${index === notes.length - 1 ? "" : "border-b border-wline2 md:border-b-0 md:border-r"}`}
              >
                <h3 className="text-[14.5px] font-semibold leading-[1.6] text-inkd">
                  <span className="mr-1.5 font-mono text-[11px] text-mute">{String(index + 1).padStart(2, "0")}</span>
                  {note.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-[1.85] text-ink2">{note.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-deep px-5 py-10 md:py-12">
        <div className="mx-auto flex max-w-site flex-wrap items-center justify-between gap-7">
          <div>
            <h2 className="text-[22px] font-semibold leading-[1.5] text-paper md:text-[25px]">
              你那边也有个每天重复干的活？
            </h2>
            <p className="mt-2 max-w-[440px] text-[13px] leading-[1.8] text-[#B7AE9B]">
              说给我听就行。能做成上面这样我就报个价，做不了我直接说不做。
            </p>
          </div>
          <Link
            href="/contact"
            className="hover-lift inline-flex h-12 items-center justify-center whitespace-nowrap rounded-[3px] bg-accent px-6 text-[15px] font-semibold text-white transition hover:bg-[#9C4525]"
          >
            说说你的情况 →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
