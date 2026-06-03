import AuthPageClient from "@/components/AuthPageClient";

export const metadata = {
  title: "注册 | AI办公工具箱",
  description: "注册 AI办公工具箱账号，获取免费体验额度，为后续历史记录、额度和付费系统做准备。"
};

export default function RegisterPage() {
  return <AuthPageClient mode="register" />;
}
