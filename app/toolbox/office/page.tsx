import OfficeToolboxClient from "@/components/OfficeToolboxClient";
import Link from "next/link";

export const metadata = {
  title: "AI办公工具箱",
  description: "上传文件或输入内容，AI 自动帮你完成繁琐工作。"
};

export default function OfficeToolboxPage() {
  return (
    <>
      <section className="bg-amber-50 px-4 py-4 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 rounded-2xl border border-amber-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-amber-900">这是旧版统一工具箱入口，推荐使用新版工具页。</p>
          <Link href="/tools" className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white">
            前往新版工具箱
          </Link>
        </div>
      </section>
      <OfficeToolboxClient />
    </>
  );
}
