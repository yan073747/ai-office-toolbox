import SolutionDetailPage from "../SolutionDetailPage";
import { getSolutionBySlug } from "../solution-data";

export const metadata = {
  title: "企业办公自动化 AI 方案 | AI办公工具箱",
  description: "面向中小企业、行政、人事和项目团队的 AI 办公自动化方案。"
};

export default function OfficeSolutionPage() {
  const solution = getSolutionBySlug("office");

  if (!solution) {
    return null;
  }

  return <SolutionDetailPage solution={solution} />;
}
