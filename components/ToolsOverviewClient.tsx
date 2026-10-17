"use client";

import {
  ArrowRight,
  BarChart3,
  ClipboardList,
  FileCheck2,
  FileText,
  MailCheck,
  MessageSquareText,
  Presentation,
  Search
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";

type Category = "全部" | "文件处理" | "文本生成" | "汇报办公";

type ToolItem = {
  id: string;
  title: string;
  description: string;
  input: string;
  audience: string;
  category: Exclude<Category, "全部">;
  icon: LucideIcon;
};

const categories: Category[] = ["全部", "文件处理", "文本生成", "汇报办公"];

const tools: ToolItem[] = [
  {
    id: "excel",
    title: "Excel 数据分析",
    description: "上传 Excel 或 CSV，自动生成数据概览、异常分析、风险提示和优化建议。",
    input: "Excel / CSV",
    audience: "运营、财务、销售、数据助理",
    category: "文件处理",
    icon: BarChart3
  },
  {
    id: "pdf",
    title: "PDF 智能总结",
    description: "上传 PDF 文档，快速提炼摘要、重点内容和风险点。",
    input: "PDF",
    audience: "学生、职场人、研究人员",
    category: "文件处理",
    icon: FileText
  },
  {
    id: "contract",
    title: "合同重点提取",
    description: "识别合同主体、金额、义务、违约责任和关键时间节点。",
    input: "PDF / 文本",
    audience: "个体户、公司行政、法务助理",
    category: "文件处理",
    icon: FileCheck2
  },
  {
    id: "report",
    title: "日报周报月报生成",
    description: "输入工作内容，自动生成正式、简洁或商务风格的汇报。",
    input: "文本",
    audience: "职场人、团队负责人",
    category: "汇报办公",
    icon: ClipboardList
  },
  {
    id: "ppt",
    title: "PPT 大纲大师",
    description: "输入主题和页数，自动生成完整 PPT 页面结构。",
    input: "主题 / 页数 / 风格",
    audience: "学生、职场汇报、课程制作",
    category: "汇报办公",
    icon: Presentation
  },
  {
    id: "meeting",
    title: "会议纪要整理",
    description: "将杂乱会议记录整理成纪要、结论和待办事项。",
    input: "会议文本",
    audience: "行政、项目经理、团队负责人",
    category: "文本生成",
    icon: MessageSquareText
  },
  {
    id: "polish",
    title: "邮件通知润色",
    description: "将普通表达改写成正式邮件、公告或通知。",
    input: "文本",
    audience: "行政、人事、职场人",
    category: "文本生成",
    icon: MailCheck
  }
];

export default function ToolsOverviewClient() {
  const [activeCategory, setActiveCategory] = useState<Category>("全部");
  const [keyword, setKeyword] = useState("");

  const filteredTools = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return tools.filter((tool) => {
      const categoryMatched = activeCategory === "全部" || tool.category === activeCategory;
      const keywordMatched =
        !normalizedKeyword ||
        [tool.title, tool.description, tool.input, tool.audience, tool.category].some((value) =>
          value.toLowerCase().includes(normalizedKeyword)
        );

      return categoryMatched && keywordMatched;
    });
  }, [activeCategory, keyword]);

  return (
    <main className="bg-paper text-inkd">
      <section className="border-b border-wline px-5 pb-7 pt-9 md:pb-9 md:pt-11">
        <div className="mx-auto max-w-site">
          <p className="inline-block border-b border-[#E0C4B4] pb-0.5 text-[12.5px] font-semibold tracking-[0.04em] text-accent">
            免费工具
          </p>
          <h1 className="mt-3.5 max-w-[560px] text-[26px] font-semibold leading-[1.42] tracking-[-0.012em] text-inkd md:text-[34px]">
            七个不花钱的小工具，现在就能用
          </h1>
          <div className="mt-4 grid max-w-[660px] gap-2.5 text-[15px] leading-[1.95] text-ink2">
            <p>不用注册，不用留手机号，打开就能跑。做这些是因为我自己每天也要用。</p>
            <p className="text-[13.5px] leading-[1.9] text-mute">
              结果仅供参考，重要文件（合同、财务、对外通知）请自己再核一遍。
            </p>
          </div>

          <div className="mt-7 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-x-1 gap-y-2">
              {categories.map((category) => {
                const count = category === "全部" ? tools.length : tools.filter((tool) => tool.category === category).length;
                const active = activeCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setActiveCategory(category)}
                    className={
                      active
                        ? "h-9 rounded-[3px] border border-inkd bg-inkd px-3 text-[13px] font-semibold text-paper transition"
                        : "h-9 rounded-[3px] border border-transparent px-3 text-[13px] font-medium text-ink2 transition hover:border-wline hover:bg-paper2 hover:text-inkd"
                    }
                  >
                    {category}
                    <span className={active ? "ml-1.5 text-paper/60" : "ml-1.5 text-mute"}>{count}</span>
                  </button>
                );
              })}
            </div>

            <label className="relative block w-full md:w-[260px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
              <input
                aria-label="搜索工具名称"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="搜一下，比如「合同」"
                className="h-10 w-full rounded-[3px] border border-wline bg-white pl-9 pr-3 text-[13.5px] font-medium text-inkd outline-none transition placeholder:text-mute focus:border-accent"
              />
            </label>
          </div>
        </div>
      </section>

      <section className="border-b border-wline px-5 py-8 md:py-10">
        <div className="mx-auto max-w-site">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
            <div>
              <p className="text-[11.5px] font-semibold tracking-[0.03em] text-accent">工具列表</p>
              <h2 className="mt-1 text-[21px] font-semibold tracking-[-0.005em] text-inkd">挑一个现在要处理的活</h2>
            </div>
            <p className="text-[13px] text-mute">共 {filteredTools.length} 个</p>
          </div>

          {filteredTools.length ? (
            <ol className="border-t border-wline">
              {filteredTools.map((tool, index) => (
                <ToolRow key={tool.id} tool={tool} index={index} />
              ))}
            </ol>
          ) : (
            <div className="border-y border-wline px-2 py-14 text-center">
              <p className="text-[15px] font-semibold text-inkd">没有叫这个的工具</p>
              <p className="mt-2 text-[13px] text-mute">
                换个词试试，或者点上面「全部」把七个都看一遍。
              </p>
            </div>
          )}

          <p className="mt-6 text-[13.5px] leading-[1.9] text-ink2">
            想要的是「能接我自己数据、带权限、出错有人管」的版本，而不是这种单次工具 ——{" "}
            <Link href="/contact" className="border-b border-[#DFC3B2] pb-0.5 font-semibold text-accent">
              跟我说说你在做什么
            </Link>
            。
          </p>
        </div>
      </section>

      <section className="px-5 py-8 md:py-10">
        <div className="mx-auto max-w-site border-t-2 border-inkd pt-4">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <div>
              <h2 className="text-[19px] font-semibold leading-[1.5] text-inkd">这些工具背后的东西，也能看</h2>
              <p className="mt-2 max-w-[520px] text-[13.5px] leading-[1.85] text-ink2">
                每个都还开着，可以直接点进去用。看演示比看介绍有用。
              </p>
            </div>
            <Link
              href="/demos"
              className="hover-lift inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-[3px] border border-inkd px-5 text-[14px] font-semibold text-inkd transition hover:bg-inkd hover:text-paper"
            >
              看六个上线系统
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function ToolRow({ tool, index }: { tool: ToolItem; index: number }) {
  const Icon = tool.icon;

  return (
    <li className="border-b border-wline2">
      <Link
        href={`/tools/${tool.id}`}
        className="group grid grid-cols-[auto_1fr] items-start gap-x-3 gap-y-1.5 py-4 md:grid-cols-[38px_1fr_150px_86px] md:items-center md:gap-x-4"
      >
        <span className="col-start-1 row-start-1 font-mono text-[11px] tabular-nums text-mute md:text-[12px]">
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="col-start-2 row-start-1 min-w-0">
          <h3 className="flex items-center gap-2 text-[15px] font-semibold leading-[1.6] text-inkd">
            <Icon className="h-3.5 w-3.5 shrink-0 text-mute transition group-hover:text-accent" />
            <span className="border-b border-transparent pb-0.5 transition group-hover:border-[#DFC3B2]">
              {tool.title}
            </span>
          </h3>
          <p className="mt-1 text-[13px] leading-[1.8] text-ink2">{tool.description}</p>
          <p className="mt-1 text-[12px] leading-[1.7] text-mute md:hidden">
            吃 {tool.input} · 适合 {tool.audience}
          </p>
        </div>

        <p className="col-start-2 row-start-2 hidden text-[12.5px] text-mute md:col-start-3 md:row-start-1 md:block md:text-right">
          {tool.input}
        </p>

        <span className="col-start-2 row-start-3 inline-flex items-center gap-1 text-[13px] font-semibold text-accent md:col-start-4 md:row-start-1 md:justify-end">
          打开
          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        </span>
      </Link>
    </li>
  );
}
