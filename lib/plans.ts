export const FREE_USES_PER_TOOL = 1;

export type PlanId = "basic" | "standard" | "pro";

export type ToolDefinition = {
  toolId: string;
  toolName: string;
};

export type PlanDefinition = {
  id: PlanId;
  name: string;
  price: number;
  credits: number;
  durationDays: number;
};

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  { toolId: "excel", toolName: "Excel 分析" },
  { toolId: "pdf", toolName: "PDF 总结" },
  { toolId: "contract", toolName: "合同重点提取" },
  { toolId: "report", toolName: "周报月报生成" },
  { toolId: "ppt", toolName: "PPT 大纲大师" },
  { toolId: "meeting", toolName: "会议纪要整理" },
  { toolId: "polish", toolName: "邮件润色" }
];

export const PLAN_DEFINITIONS: PlanDefinition[] = [
  {
    id: "basic",
    name: "体验套餐",
    price: 9.9,
    credits: 20,
    durationDays: 30
  },
  {
    id: "standard",
    name: "标准套餐",
    price: 19.9,
    credits: 50,
    durationDays: 30
  },
  {
    id: "pro",
    name: "高级套餐",
    price: 49.9,
    credits: 150,
    durationDays: 30
  }
];

export function getPlanDefinition(planId: string | null | undefined) {
  return PLAN_DEFINITIONS.find((plan) => plan.id === planId);
}

export function getToolDefinition(toolId: string | null | undefined) {
  return TOOL_DEFINITIONS.find((tool) => tool.toolId === toolId);
}
