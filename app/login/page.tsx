import AuthPageClient from "@/components/AuthPageClient";

export const metadata = {
  title: "登录 | AI办公工具箱",
  description: "登录 AI办公工具箱，使用免费体验额度、查看历史生成记录并管理工具使用额度。"
};

export default function LoginPage() {
  return <AuthPageClient mode="login" />;
}
