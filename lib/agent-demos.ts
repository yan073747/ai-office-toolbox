export type AgentDemoSlug = "rag-ticket" | "promptops" | "document-workflow" | "crossborder-listing" | "mcp-agent";

export type AgentDemo = {
  slug: AgentDemoSlug;
  index: string;
  name: string;
  shortName: string;
  chineseName: string;
  subtitle: string;
  scene: string;
  audience: string;
  liveUrl: string;
  deploymentStatus: "deployed" | "pending";
  sourcePath: string;
  readiness: "可面试演示" | "准备接入" | "本地验证";
  accent: "amber" | "blue" | "green" | "teal" | "violet";
  stack: string[];
  businessScene: string;
  technicalHighlight: string;
  talkingPoints: string[];
  pains: string[];
  solution: string;
  workflow: string[];
  metrics: { label: string; value: string }[];
  demoAccount?: { username: string; password: string };
};

export const demoBaseDomain = "aiworkbox.cn";

export const agentDemos: AgentDemo[] = [
  {
    slug: "rag-ticket",
    index: "01",
    name: "Enterprise RAG Ticket Agent",
    shortName: "RAG Ticket Agent",
    chineseName: "企业知识库工单助手",
    subtitle: "企业知识库问答、来源引用与低置信度转人工的完整 RAG 工程链路。",
    scene: "企业知识库 / 客服工单",
    audience: "面向企业客服、内部知识库、售后支持团队",
    liveUrl: "https://rag-ticket.aiworkbox.cn",
    deploymentStatus: "pending",
    sourcePath: "enterprise-rag-ticket-agent",
    readiness: "可面试演示",
    accent: "blue",
    stack: ["Python", "FastAPI", "Chroma", "SQLite", "DeepSeek", "Docker"],
    businessScene: "企业客服工单问答与知识库检索",
    technicalHighlight: "RAG 检索、来源引用、置信度控制、低置信度转人工",
    talkingPoints: ["文档上传、切分、向量化到检索闭环", "回答附带来源片段与置信度", "无法可靠回答时自动生成工单", "后台记录问答、工单与运营指标"],
    pains: ["企业制度和业务资料分散，客服难以快速定位答案。", "大模型直接回答容易产生幻觉，缺少来源依据。", "无法回答时需要稳定进入人工处理流程。"],
    solution: "系统将文档入库、向量检索、RAG 回答、来源引用、置信度判断和工单兜底串成一条可复现链路。",
    workflow: ["上传文档", "文本切分", "向量检索", "RAG回答", "低置信转工单"],
    metrics: [
      { label: "文档格式", value: "PDF / DOCX / MD / TXT" },
      { label: "兜底机制", value: "低置信度转人工" },
      { label: "部署方式", value: "Docker Compose" }
    ],
    demoAccount: { username: "demo_interviewer", password: "Demo@2026!" }
  },
  {
    slug: "promptops",
    index: "02",
    name: "PromptOps Evaluation Platform",
    shortName: "PromptOps",
    chineseName: "Prompt 评测与优化平台",
    subtitle: "把 Prompt 从临时文本变成可版本管理、可批量评测、可持续优化的工程资产。",
    scene: "AI 工程化 / Prompt 评测",
    audience: "面向 AI 应用开发、模型效果评估、Prompt 工程团队",
    liveUrl: "https://promptops.aiworkbox.cn",
    deploymentStatus: "pending",
    sourcePath: "promptops-evaluation-platform",
    readiness: "准备接入",
    accent: "green",
    stack: ["Python", "FastAPI", "SQLite", "Unittest", "Mock LLM", "JavaScript"],
    businessScene: "Prompt 版本管理、批量评测与失败案例分析",
    technicalHighlight: "测试集管理、自动评分、人工复核、版本对比",
    talkingPoints: ["Prompt 像代码一样版本化管理", "批量运行测试集并记录模型输出", "结合自动评分和人工复核判断效果", "失败案例沉淀为下一轮优化依据"],
    pains: ["很多 AI Demo 只展示一次成功回答，缺少稳定评估。", "Prompt 修改后无法证明新版本是否真正更好。", "失败案例没有结构化沉淀，难以复盘。"],
    solution: "平台围绕 Prompt 版本、测试用例、批量运行、自动评分、人工复核和失败分析建立闭环。",
    workflow: ["选择Prompt版本", "维护测试集", "批量评测", "人工复核", "版本对比"],
    metrics: [
      { label: "评测模式", value: "Mock First" },
      { label: "核心指标", value: "得分 / 失败率 / 成本" },
      { label: "测试覆盖", value: "16 tests OK" }
    ],
    demoAccount: { username: "demo_interviewer", password: "Demo@2026!" }
  },
  {
    slug: "document-workflow",
    index: "03",
    name: "Multi-Agent Document Workflow",
    shortName: "Document Workflow",
    chineseName: "多 Agent 文档工作流",
    subtitle: "多智能体协同处理表格与文档，自动完成计划确认、数据分析、报告生成和下载。",
    scene: "办公自动化 / 多 Agent 编排",
    audience: "面向企业行政、运营、销售分析、项目管理团队",
    liveUrl: "https://docflow.aiworkbox.cn",
    deploymentStatus: "deployed",
    sourcePath: "document-workflow-agent",
    readiness: "可面试演示",
    accent: "amber",
    stack: ["Python", "FastAPI", "LangGraph", "Next.js", "SQLite", "Celery", "Redis"],
    businessScene: "Excel 数据分析、经营报告生成与 Agent Trace 复盘",
    technicalHighlight: "Planner / Analyst / Writer / Reviewer 多 Agent 协作",
    talkingPoints: ["上传销售 Excel 后生成执行计划", "人工确认关键计划再进入执行", "展示 Agent Trace、状态和失败恢复", "输出 Markdown / PDF 报告"],
    pains: ["数据分散在 Excel/CSV 中，人工整理耗时且易错。", "报告生成缺少统一结构，难以追踪过程与结果。", "复杂办公任务需要多步骤协作，不是一次问答能解决。"],
    solution: "通过 Planner、Data Analyst、Writer、Reviewer 多个角色串联工作流，让文档处理过程可观察、可确认、可恢复。",
    workflow: ["上传Excel", "计划确认", "Agent执行", "质量审核", "报告下载"],
    metrics: [
      { label: "输出格式", value: "Markdown / PDF" },
      { label: "执行链路", value: "LangGraph Trace" },
      { label: "演示账号", value: "demo@example.com" }
    ],
    demoAccount: { username: "demo@example.com", password: "demo123456" }
  },
  {
    slug: "crossborder-listing",
    index: "04",
    name: "Cross-border Listing Agent",
    shortName: "Listing Agent",
    chineseName: "跨境商品上架 Agent",
    subtitle: "面向跨境电商运营的竞品分析、多语言 Listing 生成、A/B 版本评分与导出流程。",
    scene: "跨境电商 / Listing 优化",
    audience: "面向跨境电商运营、商品上架、广告投放团队",
    liveUrl: "https://listing.aiworkbox.cn",
    deploymentStatus: "pending",
    sourcePath: "crossborder-listing-agent",
    readiness: "可面试演示",
    accent: "amber",
    stack: ["Python", "FastAPI", "SQLite", "DeepSeek", "CSV", "Excel Export"],
    businessScene: "商品 Listing 生成、竞品分析、多语言本地化",
    technicalHighlight: "LLM 适配、无 Key 回退、评分维度拆解、CSV/Excel 导出",
    talkingPoints: ["结构化录入商品与竞品 CSV", "生成 A/B 两个 Listing 版本", "按 SEO、转化、本地化等维度评分", "保存历史并导出运营交付物"],
    pains: ["跨境运营需要反复整理竞品、关键词和卖点。", "多语言 Listing 容易质量不稳，缺少评分依据。", "最终结果需要能交付给运营团队继续使用。"],
    solution: "Agent 自动完成竞品分析、Listing 生成、A/B 对比、评分拆解、二次优化和导出。",
    workflow: ["录入商品", "导入竞品CSV", "生成Listing", "A/B评分", "导出结果"],
    metrics: [
      { label: "语言", value: "中 / 英 / 日 / 德 / 西" },
      { label: "评分维度", value: "5 项" },
      { label: "导出", value: "CSV / Excel" }
    ],
    demoAccount: { username: "demo_interviewer", password: "Demo@2026!" }
  },
  {
    slug: "mcp-agent",
    index: "05",
    name: "Enterprise MCP Agent",
    shortName: "MCP Agent",
    chineseName: "企业 MCP 工具调用平台",
    subtitle: "通过 MCP Client 调用自定义 MCP Server，将客户、订单、报价、待办和知识库工具串成可观测流程。",
    scene: "MCP 工具调用 / CRM 销售助手",
    audience: "面向企业销售、CRM、内部系统集成和工具调用场景",
    liveUrl: "https://mcp.aiworkbox.cn",
    deploymentStatus: "pending",
    sourcePath: "enterprise-mcp-agent",
    readiness: "准备接入",
    accent: "teal",
    stack: ["TypeScript", "Node.js", "MCP SDK", "Express", "React", "SQLite", "Zod"],
    businessScene: "企业内部系统连接、工具调用与销售跟进",
    technicalHighlight: "MCP Server、工具权限、参数校验、调用日志",
    talkingPoints: ["API Server 通过 MCP Client 调用业务工具", "工具层负责权限校验和参数验证", "支持规则编排与 LLM Tool Calling 切换", "前端展示工具入参、出参、耗时和状态"],
    pains: ["企业工具散落在 CRM、订单、知识库和待办系统里。", "模型直接访问业务数据存在权限与审计风险。", "多步工具调用需要可观测、可复盘。"],
    solution: "用 MCP 将业务工具封装成可复用协议层，Agent 只负责编排，工具层负责权限、校验和日志。",
    workflow: ["识别请求", "选择工具", "校验权限", "执行调用", "记录日志"],
    metrics: [
      { label: "工具数", value: "5 个核心工具" },
      { label: "编排模式", value: "Rule / LLM" },
      { label: "测试", value: "Vitest" }
    ],
    demoAccount: { username: "sales_demo", password: "Demo@2026!" }
  }
];

export function getAgentDemo(slug: string) {
  return agentDemos.find((demo) => demo.slug === slug);
}
