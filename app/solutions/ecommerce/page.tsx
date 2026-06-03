import SolutionDetailPage from "../SolutionDetailPage";
import { getSolutionBySlug } from "../solution-data";

export const metadata = {
  title: "电商运营 AI 方案 | AI办公工具箱",
  description: "面向电商运营、商品文案、销售数据分析和运营复盘的 AI 办公方案。"
};

export default function EcommerceSolutionPage() {
  const solution = getSolutionBySlug("ecommerce");

  if (!solution) {
    return null;
  }

  return <SolutionDetailPage solution={solution} />;
}
