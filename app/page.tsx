import Link from "next/link";
import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "企业 AI 落地服务｜知识库问答 · 客服自动回复 · 报表自动化｜佛山顺德",
  description:
    "面向中小企业与电商团队的 AI 落地服务：企业知识库问答、客服自动回复、文档与报表自动化。先做小样看效果，满意再谈。人在佛山顺德，全国可远程。"
};

const services = [
  {
    title: "企业知识库问答",
    desc: "手册、规章、产品资料喂进去，问什么答什么，答案带出处。",
    note: "答不准自动转人工，不硬编 · 网页 / 企业微信 / 飞书",
    price: "¥6,000 起",
    duration: "2–3 周"
  },
  {
    title: "客服 / 售后自动回复",
    desc: "接在你现在的渠道上，常见问题自动答，答不了的转人工。",
    note: "后台能看见它答不上来的是哪些问题，越用越准 · 维护 ¥500/月",
    price: "¥3,000 起",
    duration: "1–2 周"
  },
  {
    title: "文档与报表自动化",
    desc: "日报周报、订单审核、合同要点提取、多表合并。",
    note: "整条流水线自动跑，人只看需要看的那部分",
    price: "¥10,000 起",
    duration: "3–5 周"
  },
  {
    title: "其他技术活",
    desc: "小程序、网站、爬虫、脚本、数据处理。",
    note: "可以先做一个小样，看效果再决定要不要往下",
    price: "¥500 起",
    duration: "按需求评估"
  }
];

const mainCases = [
  {
    title: "知识库工单助手",
    desc: "二十多份文档切成 68 个章节。答案带出处，拿不准自动转人工。",
    meta: "42 个测试用例全过",
    url: "https://rag-ticket.aiworkbox.cn"
  },
  {
    title: "多 AI 文档工作流",
    desc: "计划、分析、撰写、导出分给四个角色，中间每一步都能查到。",
    meta: "52 任务 · 432 条记录",
    url: "https://docflow.aiworkbox.cn"
  },
  {
    title: "接公司数据的助手",
    desc: "客户、订单、报价、待办、知识库接入 AI。销售和经理权限不同，越权自动拦。",
    meta: "5 类工具 · 全程留痕",
    url: "https://mcp.aiworkbox.cn"
  }
];

const otherCases = [
  { title: "企业内部数字化中台（飞书）", desc: "知识库问答 + 日报汇总 + 高额订单审核提醒", url: "" },
  { title: "AI 效果评测平台", desc: "上线前把答案批量跑一遍打分", url: "https://promptops.aiworkbox.cn" },
  { title: "跨境商品文案优化", desc: "多语言商品描述 + SEO 打分", url: "https://listing.aiworkbox.cn" }
];

const steps = [
  { n: "01", title: "先聊 30 分钟", desc: "你说现在最烦哪件事，我告诉你哪些能做、哪些做不了。" },
  { n: "02", title: "给范围给价", desc: "不模糊报价、不中途加价。确认了才开工。" },
  { n: "03", title: "分阶段交付", desc: "每周给你看进度，随时能改方向。" },
  { n: "04", title: "上线 + 30 天维护", desc: "带使用文档、一次培训，上线后 30 天内的问题免费修。" }
];

const reasons = [
  {
    title: "东西先给你看，不用先信我",
    desc: "6 个系统全部开着，不用注册就能点。看完觉得不行，就不用聊了。"
  },
  {
    title: "做不了我直接说",
    desc: "30 分钟聊完，不合适我告诉你为什么，以及该找谁。不会拖着你先签合同。"
  },
  {
    title: "从小的一步开始",
    desc: "先做一个小样跑起来看效果。满意再往下，不满意就停在这儿。"
  }
];

export default function Home() {
  return (
    <div className="bg-paper text-inkd">
      <SiteHeader />

      {/* 顶部信息条 */}
      <div className="bg-deep text-[12.5px] leading-[1.7] text-[#B7AE9B]">
        <div className="mx-auto flex max-w-site flex-wrap justify-between gap-x-5 gap-y-1 px-5 py-2">
          <span>周一至周六 10:00–20:00　·　佛山市顺德区，可上门</span>
          <span>
            本月还能接 <b className="font-semibold text-paper">1 个</b>项目
          </span>
        </div>
      </div>

      {/* 首屏 */}
      <section className="px-5 pb-9 pt-10 md:pb-12 md:pt-14">
        <div className="mx-auto grid max-w-site items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] md:gap-12">
          <div>
            <span className="inline-block border-b border-[#E0C4B4] pb-0.5 text-[12.5px] font-semibold tracking-[0.04em] text-accent">
              顺德本地 · 也可全程远程
            </span>
            <h1 className="mt-4 text-[27px] font-semibold leading-[1.4] tracking-[-0.012em] text-inkd md:text-[38px] md:leading-[1.38]">
              厂里店里每天重复的活，
              <br className="hidden sm:block" />
              交给我做成自动的
            </h1>
            <p className="mt-4 max-w-[430px] text-[15px] leading-[1.95] text-ink2 md:text-[16px]">
              客服天天回一样的问题、资料散在几个地方找不到、有人整天在做表格。这些都能做成系统，一个人做完，价钱写在下面。
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/contact"
                className="hover-lift inline-flex h-12 items-center justify-center rounded-[3px] bg-deep px-6 text-[14.5px] font-semibold text-paper transition hover:bg-black"
              >
                说说你的情况
              </Link>
              <Link href="/demos" className="border-b border-[#DFC3B2] pb-0.5 text-[14.5px] font-semibold text-accent">
                先打开一个演示 →
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-mute">
              <span>已上线 6 个系统</span>
              <span>源码可查</span>
              <span>先做小样，满意再谈</span>
            </div>
          </div>

          {/* 证据窗口 */}
          <div className="overflow-hidden rounded-[5px] border border-wline bg-white shadow-[0_14px_40px_rgba(27,26,23,0.07)]">
            <div className="flex items-center gap-1.5 border-b border-wline bg-paper2 px-3 py-2">
              <i className="block h-[7px] w-[7px] rounded-full bg-[#DAD2C2]" />
              <i className="block h-[7px] w-[7px] rounded-full bg-[#DAD2C2]" />
              <i className="block h-[7px] w-[7px] rounded-full bg-[#DAD2C2]" />
              <a
                href="https://rag-ticket.aiworkbox.cn"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 font-mono text-[10px] tracking-[-0.02em] text-mute"
              >
                rag-ticket.aiworkbox.cn
              </a>
            </div>
            <div className="p-4">
              <div className="rounded-[3px] bg-paper2 px-3 py-3 text-[12.5px] leading-[1.75] text-ink2">
                <p className="mb-1.5 text-mute">客户问：这台机器的保修是多久？</p>
                <p>
                  标准保修 <b className="font-semibold text-inkd">12 个月</b>，从签收日起算。商用场景可延保至{" "}
                  <b className="font-semibold text-inkd">24 个月</b>，下单时勾选就行。
                </p>
                <p className="mt-2 border-t border-dashed border-wline pt-2 text-[10.5px] leading-[1.6] text-mute">
                  来源：《售后服务手册 v3.2》第 4 章第 2 节　｜　置信度 0.94　｜　拿不准会自动转人工
                </p>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-px overflow-hidden rounded-[3px] border border-wline bg-wline">
                {[
                  ["42", "测试用例全过"],
                  ["68", "章节已建索引"],
                  ["0", "答错硬编"]
                ].map(([value, label]) => (
                  <div key={label} className="bg-white px-2.5 py-2.5">
                    <b className="block text-[17px] font-semibold leading-[1.3] tabular-nums text-inkd">{value}</b>
                    <span className="text-[10.5px] text-mute">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 四格事实 */}
      <div className="border-y border-wline">
        <div className="mx-auto grid max-w-site grid-cols-2 px-5 md:grid-cols-4">
          {[
            ["6 个", "已上线系统"],
            ["1–3 周", "常见交付周期"],
            ["30 天", "上线后免费维护"],
            ["50/50", "签订一半，验收一半"]
          ].map(([value, label], index) => (
            <div
              key={label}
              className={[
                "py-4 md:py-5",
                index % 2 === 1 ? "pl-4" : "",
                index > 1 ? "border-t border-wline2 md:border-t-0" : "",
                index > 0 ? "md:border-l md:border-wline2 md:pl-6" : ""
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <b className="block text-[21px] font-semibold leading-[1.25] tabular-nums text-inkd md:text-[23px]">{value}</b>
              <span className="text-[12px] leading-[1.6] text-mute">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 服务与价格 */}
      <section id="services" className="scroll-mt-24 border-b border-wline px-5 py-9 md:py-12">
        <div className="mx-auto max-w-site">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <div>
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-accent">服务与价格</p>
              <h2 className="mt-1 text-[21px] font-semibold tracking-[-0.005em] text-inkd">四件事，做得最熟</h2>
            </div>
            <p className="max-w-[520px] text-[13px] leading-[1.75] text-mute">
              以下都是起价。具体看要做几个场景、要不要接你现有的系统。
            </p>
          </div>

          <div className="mt-6 border-t border-wline">
            {services.map((service) => (
              <div
                key={service.title}
                className="grid grid-cols-[1fr_auto] items-start gap-x-4 gap-y-1.5 border-b border-wline2 py-4 md:grid-cols-[170px_1fr_105px_88px] md:gap-x-5"
              >
                <h3 className="col-start-1 row-start-1 text-[15px] font-semibold leading-[1.6] text-inkd">{service.title}</h3>
                <p className="col-start-2 row-start-1 whitespace-nowrap text-right text-[15px] font-semibold tabular-nums text-accent md:col-start-3">
                  {service.price}
                </p>
                <p className="col-span-2 text-[13px] leading-[1.8] text-ink2 md:col-span-1 md:col-start-2 md:row-start-1">
                  {service.desc}
                  <em className="mt-0.5 block text-[12px] not-italic leading-[1.7] text-mute">{service.note}</em>
                </p>
                <p className="col-span-2 text-[12px] text-mute md:col-span-1 md:col-start-4 md:row-start-1 md:text-right">
                  {service.duration}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-5 text-[13px] text-mute">
            另外还有 7 个免费工具可以直接用 ——{" "}
            <Link href="/tools" className="border-b border-[#DFC3B2] pb-0.5 font-semibold text-accent">
              打开工具页
            </Link>
          </p>
        </div>
      </section>

      {/* 做过的 */}
      <section id="cases" className="scroll-mt-24 border-b border-wline px-5 py-9 md:py-12">
        <div className="mx-auto max-w-site">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <div>
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-accent">Live demos</p>
              <h2 className="mt-1 text-[21px] font-semibold tracking-[-0.005em] text-inkd">点开就能用，不用注册</h2>
            </div>
            <p className="max-w-[520px] text-[13px] leading-[1.75] text-mute">不是截图，是能真的操作的东西。下面每个都开着。</p>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {mainCases.map((item) => (
              <a
                key={item.title}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col overflow-hidden rounded-[4px] border border-wline bg-white transition hover:border-[#CFC5B1] hover:shadow-[0_12px_30px_rgba(27,26,23,0.08)]"
              >
                <div className="relative h-[104px] overflow-hidden border-b border-wline2 bg-paper2 p-3">
                  <span className="mb-1.5 block h-[5px] w-[72%] rounded-[1px] bg-[#E5DDCB]" />
                  <span className="mb-1.5 block h-[5px] w-[46%] rounded-[1px] bg-[#E5DDCB]" />
                  <span className="mb-1.5 block h-[5px] w-full rounded-[1px] bg-[#E5DDCB]" />
                  <span className="block h-[5px] w-[64%] rounded-[1px] bg-[#E5DDCB]" />
                  <span className="absolute bottom-3 right-3 rounded-[2px] border border-wline bg-white px-1.5 py-1 font-mono text-[9px] text-mute">
                    {item.meta}
                  </span>
                </div>
                <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5">
                  <h3 className="text-[14.5px] font-semibold leading-[1.5] text-inkd">{item.title}</h3>
                  <p className="mt-1 flex-1 text-[12.5px] leading-[1.75] text-ink2">{item.desc}</p>
                  <span className="mt-2.5 text-[12.5px] font-semibold text-accent">打开 →</span>
                </div>
              </a>
            ))}
          </div>

          <ul className="mt-5 border-l-2 border-wline pl-4">
            {otherCases.map((item) => (
              <li key={item.title} className="text-[13px] leading-[1.9] text-ink2">
                <span className="font-semibold text-inkd">{item.title}</span>
                <span> — {item.desc}</span>
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="ml-1.5 font-semibold text-accent">
                    演示 →
                  </a>
                ) : (
                  <span className="ml-1.5 text-mute">（内部系统）</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 怎么做 */}
      <section className="border-b border-wline px-5 py-9 md:py-12">
        <div className="mx-auto max-w-site">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <div>
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-accent">Process</p>
              <h2 className="mt-1 text-[21px] font-semibold tracking-[-0.005em] text-inkd">怎么做</h2>
            </div>
            <p className="max-w-[520px] text-[13px] leading-[1.75] text-mute">四步，中间随时能叫停。</p>
          </div>

          <div className="mt-6 grid border-t border-wline2 md:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={step.n}
                className={`py-4 md:pr-5 ${index === steps.length - 1 ? "" : "border-b border-wline2 md:border-b-0 md:border-r"}`}
              >
                <em className="font-mono text-[11px] not-italic tracking-[0.08em] text-accent">{step.n}</em>
                <b className="mt-1.5 block text-[14.5px] font-semibold text-inkd">{step.title}</b>
                <span className="mt-1 block text-[12.5px] leading-[1.75] text-ink2">{step.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 为什么可以先信我一次 */}
      <section className="border-b border-wline px-5 py-9 md:py-12">
        <div className="mx-auto max-w-site">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-accent">Why me</p>
          <h2 className="mt-1 text-[21px] font-semibold tracking-[-0.005em] text-inkd">为什么可以先信我一次</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3 md:gap-7">
            {reasons.map((item) => (
              <div key={item.title} className="border-t-2 border-deep pt-3.5">
                <b className="block text-[14.5px] font-semibold text-inkd">{item.title}</b>
                <p className="mt-1.5 text-[13px] leading-[1.85] text-ink2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-deep px-5 py-10 md:py-12">
        <div className="mx-auto flex max-w-site flex-wrap items-center justify-between gap-7">
          <div>
            <h2 className="text-[23px] font-semibold leading-[1.5] text-paper md:text-[25px]">
              先说清楚你要解决什么，
              <br className="hidden sm:block" />
              再说多少钱
            </h2>
            <p className="mt-2 max-w-[420px] text-[13px] leading-[1.8] text-[#B7AE9B]">
              免费聊 30 分钟。做不了我直接说不会做，不会拖着你先签合同。
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
