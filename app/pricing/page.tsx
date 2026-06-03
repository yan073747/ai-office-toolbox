import PricingPageClient from "@/components/PricingPageClient";
import SiteHeader from "@/components/SiteHeader";

export const metadata = {
  title: "定价 | AI办公工具箱",
  description: "AI办公工具箱支持免费体验、按次购买、个人套餐和企业定制，适合个人、小团队和企业办公自动化。"
};

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <PricingPageClient />
    </>
  );
}
