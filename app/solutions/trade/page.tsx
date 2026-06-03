import SolutionDetailPage from "../SolutionDetailPage";
import { getSolutionBySlug } from "../solution-data";

export const metadata = {
  title: "外贸跟单 AI 方案 | AI办公工具箱",
  description: "面向外贸询盘、英文邮件、报价资料和产品文档整理的 AI 办公方案。"
};

export default function TradeSolutionPage() {
  const solution = getSolutionBySlug("trade");

  if (!solution) {
    return null;
  }

  return <SolutionDetailPage solution={solution} />;
}
