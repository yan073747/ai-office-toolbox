import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI办公工具箱 | Office AI Toolbox",
  description: "可运行的 AI 应用工程作品集，覆盖办公工具、RAG、Prompt 评测、多 Agent 工作流与 MCP 工具调用。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <a className="skip-link" href="#main-content">
          跳到主要内容
        </a>
        <div id="main-content">{children}</div>
      </body>
    </html>
  );
}
