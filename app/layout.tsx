import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI办公工具箱 | Office AI Toolbox",
  description: "面向个人、小团队、个体户和中小企业的 AI 办公效率工具箱，支持 Excel 分析、PDF 总结、合同提取、汇报生成、PPT 大纲、会议纪要和邮件润色。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
