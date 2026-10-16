import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI WorkBox | 企业 AI 应用落地服务",
  description:
    "AI WorkBox：面向中小企业与电商团队的 AI 落地服务，覆盖企业知识库问答、客服自动回复、文档与报表自动化，以及可在线试用的 AI 办公工具。"
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
