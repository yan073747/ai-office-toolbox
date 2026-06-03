import ContactPageClient from "@/components/ContactPageClient";
import SiteHeader from "@/components/SiteHeader";

export const metadata = {
  title: "联系定制 | AI办公工具箱",
  description: "提交你的业务流程和办公自动化需求，我们帮你定制适合企业、小团队、个体户、电商和外贸场景的 AI 办公助手。"
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <ContactPageClient />
    </>
  );
}
