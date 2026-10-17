import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export default function ToolPageLayout({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper text-inkd">
      <SiteHeader />
      <main className="mx-auto max-w-site px-5 pb-12 pt-9 md:pt-11">
        <p className="inline-block border-b border-[#E0C4B4] pb-0.5 text-[12.5px] font-semibold tracking-[0.04em] text-accent">
          免费工具 · 不用注册也能试
        </p>
        <h1 className="mt-3.5 text-[25px] font-semibold leading-[1.42] tracking-[-0.012em] text-inkd md:text-[31px]">
          {title}
        </h1>
        <p className="mt-3 max-w-[560px] text-[14.5px] leading-[1.95] text-ink2">{description}</p>
        <div className="mt-7">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
