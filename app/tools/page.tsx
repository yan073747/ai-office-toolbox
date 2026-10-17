import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import ToolsOverviewClient from "@/components/ToolsOverviewClient";

export const metadata: Metadata = {
  title: "免费工具｜AI WorkBox",
  description:
    "七个不用注册就能用的 AI 小工具：Excel 数据分析、PDF 智能总结、合同重点提取、汇报生成、PPT 大纲、会议纪要、邮件润色。"
};

export default function ToolsPage() {
  return (
    <div className="bg-paper text-inkd">
      <SiteHeader />
      <ToolsOverviewClient />
      <SiteFooter />
    </div>
  );
}
