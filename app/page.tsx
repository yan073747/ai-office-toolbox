import Link from "next/link";
import type { Metadata } from "next";
import { AUTHOR_EMAIL } from "@/lib/contact-info";

export const metadata: Metadata = {
  title: "企业 AI 落地服务｜知识库问答 · 客服自动回复 · 报表自动化｜佛山顺德",
  description:
    "面向中小企业与电商团队的 AI 落地服务：企业知识库问答、客服自动回复、文档与报表自动化。先做小样看效果，满意再谈。人在佛山顺德，全国可远程。"
};

const pains = [
  "客服每天要回几十条一模一样的问题，换个人又要重新教一遍",
  "手册、规章、产品资料散在好几个地方，真要用的时候找不到",
  "有人每天在手动整理表格、汇总数据、写日报，占掉大半天",
  "合同、单据、报表要一条条人工看，还容易看漏",
  "知道 AI 有用，但不知道从哪开始，也怕花了钱做出来没人用"
];

const services = [
  {
    n: "1",
    title: "企业知识库问答",
    desc: (
      <>
        把你的资料——手册、规章、产品说明、常见问题——全部喂进去，做一个能准确回答问题、
        <strong className="font-semibold text-slate-900">并且告诉你答案出自哪一段</strong>的问答入口。
      </>
    ),
    fit: "适合：内部员工查询、客户咨询、新人培训　｜　交付：网页版 / 企业微信 / 飞书",
    price: "¥6,000 起　·　2-3 周"
  },
  {
    n: "2",
    title: "客服 / 售后自动回复",
    desc: (
      <>
        接在你现有的咨询渠道上，自动回答常见问题，
        <strong className="font-semibold text-slate-900">答不了的自动转人工，不会硬编</strong>
        。后台能看到它答不上来的是哪些问题，越用越准。
      </>
    ),
    fit: "适合：电商客服、售后咨询、门店线上咨询",
    price: "¥3,000 起　·　1-2 周　·　维护 ¥500/月起"
  },
  {
    n: "3",
    title: "文档与报表自动化",
    desc: "把每天重复的文档处理做成一条自动流水线：数据汇总、报告生成、单据提取、异常标记，人只需要看需要看的那部分。",
    fit: "适合：日报周报汇总、订单审核、合同要点提取、多表格合并",
    price: "¥10,000 起　·　3-5 周"
  },
  {
    n: "4",
    title: "其他技术需求",
    desc: "小程序、网站、爬虫、数据整理、脚本自动化。",
    fit: "按需求评估，也可以先做一个小样看看",
    price: "¥500 起"
  }
];

const steps = [
  { title: "免费沟通（30 分钟）", desc: "你说需求，我告诉你哪些能做、哪些不能做。做不了我直说，不会硬接。" },
  { title: "确认方案与报价", desc: "双方确认后才开始，不模糊报价、不中途加价。" },
  { title: "分阶段交付，每周同步", desc: "不搞「做完才给你看」，中间随时可以提意见和调方向。" },
  { title: "上线 + 30 天免费维护", desc: "交付含使用文档和一次线上培训，上线后 30 天内的问题免费处理。" }
];

const cases = [
  {
    title: "企业知识库工单助手",
    url: "https://rag-ticket.aiworkbox.cn",
    problem: "公司有二十多份业务文档，员工和客户反复问同样的问题，答错了还要人工兜底",
    approach:
      "把文档清洗切成 68 个章节建立索引，做一个只按原文回答、带出处引用、拿不准就自动转人工的问答系统，网页和飞书机器人都能用",
    result: "5 类真实问题的准确率与转人工判断全部通过，42 个测试用例全部通过；答不出来时明确转人工，不硬编",
    stack: "Python · 向量检索 · DeepSeek"
  },
  {
    title: "多 AI 协作的文档工作流",
    url: "https://docflow.aiworkbox.cn",
    problem: "一份报告要人从表格里扒数据、分析、再写成文档，来回反复，一天就没了",
    approach: "让 4 个 AI 分工协作——一个负责做计划、一个分析数据、一个写报告、一个导出文件，中间每一步都能查到",
    result: "52 个任务、432 条执行记录全部可回溯；出问题自动标记，不用全程盯着",
    stack: "Python · 多智能体编排 · LangGraph"
  },
  {
    title: "接得上公司数据的 AI 助手",
    url: "https://mcp.aiworkbox.cn",
    problem: "AI 只会聊天，接不到公司已有的客户、订单、报价数据上，用起来还是两张皮",
    approach: "把客户、订单、报价单、待办、知识库 5 类工具接给 AI，并加上角色权限——销售和经理能做的事不一样，越权自动拦截",
    result: "每一步调用的输入、输出、耗时、是否被拦截，全部留痕可查",
    stack: "TypeScript · MCP · Node.js"
  }
];

const otherCases = [
  {
    title: "企业内部数字化中台（飞书）",
    desc: "知识库问答 + 日报自动汇总 + 高额订单审核提醒，3 条自动化流程已跑通",
    url: ""
  },
  {
    title: "AI 效果评测平台",
    desc: "上线前把 AI 的答案批量跑一遍打分，保证不跑偏",
    url: "https://promptops.aiworkbox.cn"
  },
  {
    title: "跨境商品文案优化",
    desc: "自动生成多语言商品描述并给 SEO 打分，帮跨境卖家省掉翻译和改写的时间",
    url: "https://listing.aiworkbox.cn"
  }
];

const freeTools = [
  "Excel 数据分析",
  "PDF 智能总结",
  "合同重点提取",
  "日报周报月报",
  "会议纪要整理",
  "邮件润色",
  "PPT 大纲"
];

const faqs = [
  {
    q: "我怎么知道你做的东西能用在我们的业务上？",
    a: "先聊一次，我告诉你哪些能做、哪些不能做。做不了我直说，不会硬接。小额需求我可以先做一个小样给你看。"
  },
  {
    q: "会不会泄露我们的资料？",
    a: "可以签保密协议。默认方案下数据不出你自己的账号；也可以完全放在你自己的服务器上。"
  },
  {
    q: "大概要花多少钱？",
    a: "最小可用版本 3000 起。具体取决于要做几个场景、要不要接你现有的系统。聊 30 分钟我能给你一个范围。"
  },
  {
    q: "做出来没人用怎么办？",
    a: "所以第一步要选一个「每天都真的在发生」的场景，而不是「听起来很高级」的场景。上线后 30 天内，我会根据实际使用情况调整。"
  }
];

export default function Home() {
  return (
    <div className="bg-white text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="text-[15px] font-bold tracking-tight text-[#1F4E79]">AI WorkBox</span>
            <span className="text-xs text-slate-400">AI 应用落地</span>
          </Link>
          <nav className="hidden items-center gap-7 md:flex" aria-label="主导航">
            <a href="#services" className="text-sm font-medium text-slate-600 transition hover:text-[#1F4E79]">
              服务能力
            </a>
            <a href="#cases" className="text-sm font-medium text-slate-600 transition hover:text-[#1F4E79]">
              做过的项目
            </a>
            <Link href="/tools" className="text-sm font-medium text-slate-600 transition hover:text-[#1F4E79]">
              免费工具
            </Link>
            <Link href="/demos" className="text-sm font-medium text-slate-600 transition hover:text-[#1F4E79]">
              技术演示
            </Link>
          </nav>
          <Link
            href="/contact"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#1F4E79] px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#153A5C]"
          >
            聊一聊
          </Link>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#F8FAFC_0%,#FFFFFF_72%)]">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <span className="inline-block rounded-full border border-[#D3E1EF] bg-[#EAF1F8] px-3 py-1.5 text-[13px] text-[#1F4E79]">
            中小企业 · 电商团队 ｜ 佛山顺德 &amp; 全国远程
          </span>
          <h1 className="mt-6 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-[38px]">
            把重复的活交给 AI，
            <br />
            你只做需要人的部分
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-[17px]">
            企业知识库问答、客服自动回复、文档与报表自动化。从梳理需求到上线交付，一个人做完，最快 1-2 周可用。
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-[#1F4E79] px-6 text-[15px] font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#153A5C]"
            >
              免费聊 30 分钟，先看能不能做
            </Link>
            <Link
              href="/tools"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-[#1F4E79] bg-white px-6 text-[15px] font-semibold text-[#1F4E79] transition hover:-translate-y-0.5 hover:bg-[#EAF1F8]"
            >
              先用免费工具试一下
            </Link>
          </div>
          <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13.5px] text-slate-500">
            <span>6 个 AI 应用已上线可点开</span>
            <span className="text-slate-300">｜</span>
            <span>源码开源可查</span>
            <span className="text-slate-300">｜</span>
            <span>先做小样，满意再谈</span>
          </p>
        </div>
      </section>

      <section className="border-b border-slate-200 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">如果下面有一条说中了你，我们大概能聊得很顺</h2>
          <p className="mt-3 text-[14.5px] text-slate-500">不用全中，中一条就值得聊聊。</p>
          <ul className="mt-8 grid gap-3">
            {pains.map((pain) => (
              <li
                key={pain}
                className="relative rounded-xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-5 text-[15.5px] leading-7 text-slate-800"
              >
                <span className="absolute left-5 top-[22px] h-[7px] w-[7px] rounded-full bg-[#1F4E79]" aria-hidden="true" />
                {pain}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="services" className="scroll-mt-20 border-b border-slate-200 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">四件事，我做得最熟</h2>
          <p className="mt-3 text-[14.5px] text-slate-500">每一项都可以先做最小版本，跑起来看效果再扩。</p>
          <div className="mt-8 grid gap-4">
            {services.map((service) => (
              <article key={service.title} className="rounded-xl border border-slate-200 bg-white p-6">
                <h3 className="flex items-center gap-3 text-[17.5px] font-bold text-slate-950">
                  <span className="inline-flex h-6 w-6 flex-none items-center justify-center rounded-md bg-[#1F4E79] text-[13px] font-bold text-white">
                    {service.n}
                  </span>
                  {service.title}
                </h3>
                <p className="mt-3 text-[15px] leading-7 text-slate-600">{service.desc}</p>
                <p className="mt-3 text-[13.5px] text-slate-400">{service.fit}</p>
                <p className="mt-4 border-t border-dashed border-slate-200 pt-4 text-[15px] font-bold text-[#1F4E79]">
                  {service.price}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">怎么开始</h2>
          <p className="mt-3 text-[14.5px] text-slate-500">付款方式：签订后 50%，验收后 50%。</p>
          <ol className="mt-8 grid gap-3">
            {steps.map((step, index) => (
              <li key={step.title} className="flex items-start gap-4 py-2">
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#EAF1F8] text-sm font-bold text-[#1F4E79]">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-base font-semibold text-slate-950">{step.title}</h3>
                  <p className="mt-1 text-[14.5px] leading-7 text-slate-600">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="cases" className="scroll-mt-20 border-b border-slate-200 bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">做过的三件事</h2>
          <p className="mt-3 text-[14.5px] text-slate-500">下面每个都能点开直接用，不需要注册、不需要登录。</p>
          <div className="mt-8 grid gap-4">
            {cases.map((item) => (
              <article key={item.title} className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="text-[17.5px] font-bold text-slate-950">{item.title}</h3>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whitespace-nowrap rounded-lg bg-[#EAF1F8] px-3.5 py-2 text-sm font-semibold text-[#1F4E79] transition hover:bg-[#D3E1EF]"
                  >
                    点开在线演示 →
                  </a>
                </div>
                <dl className="mt-4 grid gap-2 text-[14.5px] leading-7">
                  {(
                    [
                      ["问题", item.problem],
                      ["做法", item.approach],
                      ["结果", item.result],
                      ["技术", item.stack]
                    ] as const
                  ).map(([label, value]) => (
                    <div key={label} className="flex flex-col gap-1 sm:flex-row sm:gap-3">
                      <dt className="flex-none text-[13.5px] text-slate-400 sm:w-12 sm:pt-0.5">{label}</dt>
                      <dd className="text-slate-700">{value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>

          <ul className="mt-6 border-l-[3px] border-slate-200 pl-4">
            {otherCases.map((item) => (
              <li key={item.title} className="mb-3 text-[14.5px] leading-7 text-slate-600">
                <span className="font-semibold text-slate-900">{item.title}</span>
                <span> — {item.desc}</span>
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 font-medium text-[#1F4E79] hover:underline"
                  >
                    演示 →
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-slate-200 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">先用一个免费工具，试试我的水平</h2>
          <p className="mt-3 text-[14.5px] text-slate-500">下面这些可以直接打开用。用着顺手，再聊怎么把它搬进你的业务。</p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {freeTools.map((tool) => (
              <span key={tool} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700">
                {tool}
              </span>
            ))}
          </div>
          <Link
            href="/tools"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-lg border border-[#1F4E79] bg-white px-5 text-sm font-semibold text-[#1F4E79] transition hover:bg-[#EAF1F8]"
          >
            打开工具页 →
          </Link>
        </div>
      </section>

      <section className="border-b border-slate-200 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">关于我</h2>
          <div className="mt-5 grid gap-4 text-[15.5px] leading-8 text-slate-600">
            <p>AI WorkBox 是我一个人做的小工作室，专注 AI 应用落地。</p>
            <p>
              过去一年，我把 6 个 AI 应用从需求梳理做到上线部署，覆盖知识库问答、客服自动化、多 AI 协作工作流和企业工具调用。
            </p>
            <p className="font-semibold text-slate-900">
              我不卖概念，也不卖课。我卖的是能跑起来的东西——而且你可以先看演示再决定。
            </p>
            <p>人在佛山顺德，可远程协作，本地也可以当面沟通。</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <Link href="/demos" className="font-medium text-[#1F4E79] hover:underline">
              全部项目演示 →
            </Link>
            <a
              href="https://github.com/yan073747"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#1F4E79] hover:underline"
            >
              GitHub 源码仓库（代码可查）→
            </a>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">常见问题</h2>
          <div className="mt-6 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white px-6">
            {faqs.map((faq, index) => (
              <details key={faq.q} className="group py-4" open={index === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15.5px] font-semibold text-slate-950">
                  {faq.q}
                  <span aria-hidden="true" className="text-slate-400 transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[14.5px] leading-7 text-slate-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#1F4E79] px-6 py-14 text-center">
        <h2 className="text-2xl font-bold text-white">聊聊你的场景，我告诉你能做不能做</h2>
        <p className="mt-3 text-[14.5px] text-[#C7D9EA]">免费沟通 30 分钟，不需要承诺任何东西。</p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/contact"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-white px-6 text-[15px] font-semibold text-[#1F4E79] transition hover:-translate-y-0.5"
          >
            提交需求，约 30 分钟沟通
          </Link>
          <a
            href={`mailto:${AUTHOR_EMAIL}`}
            className="inline-flex h-12 items-center justify-center rounded-lg border border-white/50 px-6 text-[15px] font-semibold text-white transition hover:bg-white/10"
          >
            {AUTHOR_EMAIL}
          </a>
        </div>
      </section>

      <footer className="px-6 py-7 text-center text-[13px] text-slate-400">
        AI WorkBox · AI 应用落地　｜　佛山顺德 &amp; 全国远程　｜　
        <Link href="/privacy" className="hover:text-slate-600">
          隐私政策
        </Link>
        <span> · </span>
        <Link href="/terms" className="hover:text-slate-600">
          服务条款
        </Link>
      </footer>
    </div>
  );
}
