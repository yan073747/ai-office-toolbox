import ContactPageClient from "@/components/ContactPageClient";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata = {
  title: "说说你的情况｜AI WorkBox 企业 AI 落地",
  description:
    "四个框，一分钟。说说你现在最烦的那件事，我告诉你哪些能做、哪些做不了。佛山顺德，全国可远程。"
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <ContactPageClient />
      <SiteFooter />
    </>
  );
}
