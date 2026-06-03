import SolutionDetailPage from "../SolutionDetailPage";
import { getSolutionBySlug } from "../solution-data";

export const metadata = {
  title: "自媒体内容 AI 方案 | AI办公工具箱",
  description: "面向小红书、抖音、公众号和视频号创作者的 AI 内容生产方案。"
};

export default function ContentSolutionPage() {
  const solution = getSolutionBySlug("content");

  if (!solution) {
    return null;
  }

  return <SolutionDetailPage solution={solution} />;
}
