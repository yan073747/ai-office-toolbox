import SiteHeader from "@/components/SiteHeader";
import ToolsOverviewClient from "@/components/ToolsOverviewClient";

export const metadata = {
  title: "AI 办公工具箱 | 全部工具",
  description: "查看 AI办公工具箱已上线工具，支持 Excel 数据分析、PDF 智能总结、合同重点提取、汇报生成、PPT 大纲、会议纪要和邮件通知润色。"
};

export default function ToolsPage() {
  return (
    <>
      <SiteHeader />
      <ToolsOverviewClient />
    </>
  );
}
