import GenericToolPageClient from "@/components/GenericToolPageClient";
import SiteHeader from "@/components/SiteHeader";
import { notFound } from "next/navigation";

const toolNames: Record<string, string> = {
  excel: "Excel 数据分析",
  pdf: "PDF 智能总结",
  contract: "合同重点提取",
  report: "日报周报月报生成",
  ppt: "PPT 大纲大师",
  meeting: "会议纪要整理",
  polish: "邮件通知润色"
};

type ToolPageProps = {
  params: Promise<{
    toolId: string;
  }>;
};

export async function generateMetadata({ params }: ToolPageProps) {
  const { toolId } = await params;

  if (!toolNames[toolId]) {
    return {
      title: "工具不存在 | AI办公工具箱"
    };
  }

  return {
    title: `${toolNames[toolId]} | AI办公工具箱`,
    description: `使用 ${toolNames[toolId]}，上传文件或输入内容，获取 AI 生成的结构化结果。`
  };
}

export function generateStaticParams() {
  return [
    { toolId: "excel" },
    { toolId: "pdf" },
    { toolId: "contract" },
    { toolId: "report" },
    { toolId: "ppt" },
    { toolId: "meeting" },
    { toolId: "polish" }
  ];
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { toolId } = await params;

  if (!toolNames[toolId]) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <GenericToolPageClient toolId={toolId} />
    </>
  );
}
