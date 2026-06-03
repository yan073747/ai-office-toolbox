import {
  BarChart3,
  BriefcaseBusiness,
  ClipboardCheck,
  FileSearch,
  FileText,
  MailCheck,
  MessageSquareText,
  PenLine,
  ShoppingBag,
  Sparkles,
  TableProperties
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type SolutionSlug = "ecommerce" | "trade" | "office" | "content";

export type SolutionSummary = {
  slug: SolutionSlug;
  title: string;
  subtitle: string;
  audience: string;
  description: string;
  pains: string[];
  aiSolutions: string[];
  tools: {
    name: string;
    description: string;
    icon: LucideIcon;
  }[];
  flow: string[];
  icon: LucideIcon;
};

export const solutions: SolutionSummary[] = [
  {
    slug: "ecommerce",
    title: "电商运营 AI 方案",
    subtitle: "面向店铺日常运营、商品内容和销售复盘的 AI 工作流",
    audience: "淘宝、拼多多、抖音小店、1688 商家和小型电商团队",
    description: "将商品文案、卖点提炼、销售数据分析和周报生成组合成一套运营辅助流程，减少重复写作和人工整理时间。",
    pains: ["商品标题和卖点需要反复改写", "详情页内容整理耗时", "销售数据看不出重点", "周报和复盘依赖人工汇总"],
    aiSolutions: ["自动生成商品标题和卖点", "基于素材整理商品详情页文案", "分析 Excel 销售表并提炼异常点", "生成店铺运营周报和复盘建议"],
    tools: [
      { name: "电商文案工具", description: "生成标题、卖点、详情页和营销短文案。", icon: ShoppingBag },
      { name: "Excel 分析工具", description: "分析销售、库存、转化等表格数据。", icon: TableProperties },
      { name: "报告生成工具", description: "把运营数据整理成周报和复盘摘要。", icon: BarChart3 },
      { name: "文本润色工具", description: "优化商品描述、活动说明和客服话术。", icon: PenLine }
    ],
    flow: ["上传商品或销售资料", "选择电商运营场景", "AI 生成文案或分析结果", "人工确认并微调", "导出用于上架、复盘或汇报"],
    icon: ShoppingBag
  },
  {
    slug: "trade",
    title: "外贸跟单 AI 方案",
    subtitle: "面向询盘分析、英文沟通和资料整理的 AI 工作流",
    audience: "外贸业务员、外贸公司、小型工厂和跨境销售团队",
    description: "围绕客户询盘、英文邮件、报价资料和产品 PDF 信息整理，帮助业务员更快完成跟进和沟通准备。",
    pains: ["英文邮件回复慢", "客户询盘信息分散", "报价资料整理耗时", "产品资料和合同重点难提取"],
    aiSolutions: ["提炼询盘关键信息和跟进重点", "润色英文邮件和客户回复", "整理报价说明和产品卖点", "总结 PDF 产品资料、合同和沟通记录"],
    tools: [
      { name: "文本润色工具", description: "润色英文邮件、客户回复和跟进话术。", icon: MailCheck },
      { name: "PDF 总结工具", description: "总结产品资料、认证文件和客户附件。", icon: FileSearch },
      { name: "合同提取工具", description: "提取订单、合同和条款中的重点信息。", icon: ClipboardCheck },
      { name: "会议纪要工具", description: "整理客户会议、沟通记录和后续事项。", icon: MessageSquareText }
    ],
    flow: ["导入询盘、邮件或产品资料", "选择外贸跟单场景", "AI 提取客户需求和资料重点", "生成回复、报价或跟进清单", "进入下一轮客户沟通"],
    icon: FileText
  },
  {
    slug: "office",
    title: "企业办公自动化 AI 方案",
    subtitle: "面向报表、文档、合同、会议和汇报的办公提效流程",
    audience: "中小企业、行政、人事、项目团队",
    description: "把表格分析、PDF 总结、合同提取、会议纪要和周报生成组合成一套办公提效流程。",
    pains: ["报表整理耗时", "会议纪要混乱", "合同重点难找"],
    aiSolutions: ["Excel 数据分析", "PDF 智能总结", "合同重点提取", "会议纪要整理", "周报/月报生成"],
    tools: [
      { name: "Excel 分析工具", description: "分析经营、项目、人事和行政表格数据。", icon: TableProperties },
      { name: "PDF 总结工具", description: "快速总结制度、方案、资料和长文档重点。", icon: FileSearch },
      { name: "合同提取工具", description: "提取合同主体、金额、期限、义务和风险点。", icon: ClipboardCheck },
      { name: "会议纪要工具", description: "整理会议内容、决议、负责人和待办事项。", icon: MessageSquareText }
    ],
    flow: ["导入表格、PDF、合同或会议文本", "选择办公自动化场景", "AI 提取重点并生成结构化结果", "团队确认并补充业务信息", "用于汇报、归档或后续跟进"],
    icon: BriefcaseBusiness
  },
  {
    slug: "content",
    title: "自媒体内容 AI 方案",
    subtitle: "面向选题、标题、脚本、改写和复盘的内容生产流程",
    audience: "小红书、抖音、公众号、视频号创作者",
    description: "把选题、标题、脚本、改写和复盘组合成内容生产辅助流程。",
    pains: ["标题不会写", "视频脚本没结构", "内容改写效率低"],
    aiSolutions: ["爆款标题生成", "视频脚本生成", "小红书文案改写", "公众号文章生成", "内容复盘总结"],
    tools: [
      { name: "文本润色工具", description: "改写标题、正文、口播稿和平台风格文案。", icon: PenLine },
      { name: "报告生成工具", description: "整理内容复盘、选题表现和阶段总结。", icon: BarChart3 },
      { name: "会议纪要工具", description: "把选题会、复盘会整理成内容执行清单。", icon: MessageSquareText },
      { name: "PDF 总结工具", description: "提炼资料、课程、行业报告中的内容素材。", icon: FileSearch }
    ],
    flow: ["输入选题、素材或参考内容", "选择内容生产场景", "AI 生成标题、脚本或改写稿", "按平台风格人工微调", "发布后整理复盘和下一轮选题"],
    icon: PenLine
  }
];

export function getSolutionBySlug(slug: string) {
  return solutions.find((solution) => solution.slug === slug);
}

export const solutionHighlights = [
  { label: "多工具组合", value: "7 个 AI 办公工具" },
  { label: "落地方式", value: "标准工具 + 定制流程" },
  { label: "适用阶段", value: "MVP 演示 / 团队试用 / 定制交付" },
  { label: "接入方式", value: "前端体验 + 后续服务端工作流" }
];

export const solutionIcon = Sparkles;
