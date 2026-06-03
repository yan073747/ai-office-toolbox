"use client";

import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  ClipboardList,
  FileCheck2,
  FileText,
  MailCheck,
  MessageSquareText,
  Presentation,
  Search,
  Sparkles
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
    <main className="min-h-screen bg-white text-slate-950">
      <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#F8FAFC_0%,#FFFFFF_100%)] px-5 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              <Sparkles className="h-4 w-4 text-blue-600" />
              Office AI Toolbox
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">AI 办公工具箱</h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              选择一个工具，上传文件或输入内容，即可获得 AI 生成的结构化结果。
            </p>
          </div>

          <div className="mt-9 grid gap-4 lg:grid-cols-[1fr_360px] lg:items-center">
            <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
              {categories.map((category) => {
                const count = category === "全部" ? tools.length : tools.filter((tool) => tool.category === category).length;
                const active = activeCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={
                      active
                        ? "h-10 shrink-0 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm"
                        : "h-10 shrink-0 rounded-xl px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                    }
                  >
                    {category}
                    <span className={active ? "ml-2 text-white/70" : "ml-2 text-slate-400"}>{count}</span>
                  </button>
                );
              })}
            </div>

            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="搜索工具名称"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              />
            </label>
          </div>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600">工具列表</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">选择你要处理的办公任务</h2>
            </div>
            <p className="text-sm text-slate-500">当前显示 {filteredTools.length} 个工具</p>
          </div>

          {filteredTools.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.title} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
              <p className="text-lg font-semibold text-slate-950">没有找到匹配工具</p>
              <p className="mt-2 text-sm text-slate-500">可以换一个关键词，或切换到“全部”分类查看。</p>
            </div>
          )}
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.16)] sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-blue-200">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-semibold tracking-normal sm:text-3xl">不确定该用哪个工具？</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                你可以联系我们，我们会根据你的业务场景推荐合适的 AI 办公方案。
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50"
              >
                联系定制
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/#solutions"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/15 px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                查看行业方案
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ToolCard({ tool }: { tool: ToolItem }) {
  const Icon = tool.icon;

  return (
    <article className="group flex min-h-[320px] flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-950 transition group-hover:bg-blue-50 group-hover:text-blue-700">
          <Icon className="h-5 w-5" />
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
          {tool.category}
        </span>
      </div>

      <h3 className="mt-5 text-xl font-semibold tracking-normal text-slate-950">{tool.title}</h3>
      <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">{tool.description}</p>

      <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-4">
        <InfoLine label="输入类型" value={tool.input} />
        <InfoLine label="适合人群" value={tool.audience} />
      </div>

      <Link
        href={`/tools/${tool.id}`}
        className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
      >
        立即使用
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 text-sm">
      <span className="text-xs font-semibold text-slate-400">{label}</span>
      <span className="font-medium leading-6 text-slate-700">{value}</span>
    </div>
  );
}
