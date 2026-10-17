import DashboardClient from "@/components/DashboardClient";

export const metadata = {
  title: "用户中心 | AI WorkBox",
  description: "查看 AI WorkBox账号额度、使用记录、订单和账号设置。"
};

export default function DashboardPage() {
  return <DashboardClient />;
}
