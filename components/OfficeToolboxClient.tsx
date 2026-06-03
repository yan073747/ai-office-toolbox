"use client";

import {
  BarChart3,
  BriefcaseBusiness,
  ClipboardList,
  FileSearch,
  FileText,
  Mail,
  Menu,
  MessageSquareText,
  PanelLeftClose,
  Presentation,
  Trash2,
  UploadCloud
} from "lucide-react";
import { canUseTool, consumeQuotaAfterSuccess } from "@/lib/user-store";
import Link from "next/link";
import { ComponentType, DragEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

type ToolType = "excel" | "pdf" | "contract" | "report" | "ppt" | "meeting" | "polish";

type Field =
  | {
      type: "textarea" | "text" | "number";
      name: string;
      label: string;
      placeholder: string;
      required?: boolean;
      min?: number;
    }
  | {
      type: "select";
      name: string;
      label: string;
      options: string[];
      required?: boolean;
    };

type ToolConfig = {
  type: ToolType;
  label: string;
  value: string;
  description: string;
  buttonText: string;
  icon: ComponentType<{ className?: string }>;
  file?: {
    accept: string;
    title: string;
  };
  fields: Field[];
};

const tools: ToolConfig[] = [
  {
    type: "excel",
    label: "Excel数据分析",
    value: "excel_analysis",
    description: "上传 Excel 文件，自动分析数据结构、异常值、趋势与业务洞察。",
    buttonText: "开始分析",
    icon: BarChart3,
    file: {
      accept: ".xlsx,.xls,.csv",
      title: "上传 Excel 文件，AI 将自动分析数据结构、异常值、趋势与业务洞察。"
    },
    fields: []
  },
  {
    type: "pdf",
    label: "PDF智能总结",
    value: "pdf_summary",
    description: "提炼 PDF 核心结论、关键信息和风险点，快速形成可阅读摘要。",
    buttonText: "开始总结",
    icon: FileText,
    file: {
      accept: ".pdf,.doc,.docx,.txt",
      title: "上传 PDF 文件，快速提炼核心内容。"
    },
    fields: [
      {
        type: "textarea",
        name: "notes",
        label: "用户补充说明（可选）",
        placeholder: "例如：重点帮我总结核心结论与风险点"
      }
    ]
  },
  {
    type: "contract",
    label: "合同重点提取",
    value: "contract_extract",
    description: "围绕指定关注点提取条款、风险、责任和时间节点。",
    buttonText: "开始提取",
    icon: FileSearch,
    file: {
      accept: ".pdf,.doc,.docx,.txt",
      title: "上传合同、文档或文本文件，提取你关注的重点内容。"
    },
    fields: [
      {
        type: "textarea",
        name: "focus",
        label: "用户关注点（可选）",
        placeholder: "例如：重点帮我看违约责任、赔偿条款、付款周期"
      }
    ]
  },
  {
    type: "report",
    label: "周报/月报生成",
    value: "report_generator",
    description: "把零散工作内容整理成结构清晰、适合汇报的正式报告。",
    buttonText: "生成报告",
    icon: ClipboardList,
    fields: [
      {
        type: "textarea",
        name: "work_content",
        label: "工作内容输入",
        placeholder: "请输入本阶段工作内容、成果、问题与后续计划",
        required: true
      },
      {
        type: "select",
        name: "report_type",
        label: "报告类型",
        options: ["日报", "周报", "月报", "项目汇报"],
        required: true
      },
      {
        type: "select",
        name: "tone",
        label: "报告风格",
        options: ["正式汇报", "简洁版", "详细版", "领导汇报", "数据型"],
        required: true
      }
    ]
  },
  {
    type: "ppt",
    label: "PPT大纲生成",
    value: "ppt_outline",
    description: "根据主题和风格，生成清晰的页面结构、章节安排和内容重点。",
    buttonText: "生成PPT大纲",
    icon: Presentation,
    fields: [
      {
        type: "text",
        name: "topic",
        label: "PPT主题",
        placeholder: "例如：AI办公产品商业计划书",
        required: true
      },
      {
        type: "select",
        name: "style",
        label: "PPT风格",
        options: ["商务汇报", "科技风", "极简风", "教育培训", "产品发布", "营销方案", "学术答辩"],
        required: true
      },
      {
        type: "number",
        name: "page_count",
        label: "预计页数",
        placeholder: "例如：12",
        min: 1,
        required: true
      },
      {
        type: "textarea",
        name: "extra_content",
        label: "补充内容（可选）",
        placeholder: "可补充受众、应用场景、核心数据或必须包含的章节"
      }
    ]
  },
  {
    type: "meeting",
    label: "会议纪要整理",
    value: "meeting_summary",
    description: "把会议记录、聊天记录或语音转文字内容整理成纪要和待办事项。",
    buttonText: "整理纪要",
    icon: MessageSquareText,
    fields: [
      {
        type: "textarea",
        name: "meeting_content",
        label: "会议内容输入",
        placeholder: "请输入会议记录、聊天记录或语音转文字内容",
        required: true
      }
    ]
  },
  {
    type: "polish",
    label: "邮件/通知润色",
    value: "email_polish",
    description: "将原始沟通内容润色成更专业、清晰、适合场景的表达。",
    buttonText: "开始润色",
    icon: Mail,
    fields: [
      {
        type: "textarea",
        name: "original_content",
        label: "原始内容输入",
        placeholder: "请输入需要润色的邮件、通知或沟通内容",
        required: true
      },
      {
        type: "select",
        name: "communication_type",
        label: "沟通类型",
        options: ["工作邮件", "通知公告", "客户沟通", "催款通知", "会议通知", "请假申请", "合作邀约", "微信回复"],
        required: true
      },
      {
        type: "select",
        name: "communication_tone",
        label: "沟通语气",
        options: ["礼貌专业", "高情商", "简洁直接", "亲切自然", "强硬催促", "商务正式"],
        required: true
      }
    ]
  }
];

const toolTypeMap: Record<ToolType, { label: string; value: string }> = {
  excel: { label: "Excel数据分析", value: "excel_analysis" },
  pdf: { label: "PDF智能总结", value: "pdf_summary" },
  contract: { label: "合同重点提取", value: "contract_extract" },
  report: { label: "周报/月报生成", value: "report_generator" },
  ppt: { label: "PPT大纲生成", value: "ppt_outline" },
  meeting: { label: "会议纪要整理", value: "meeting_summary" },
  polish: { label: "邮件/通知润色", value: "email_polish" }
};

const emptyStateText: Record<ToolType, string> = {
  excel: "Excel 分析结果会显示在这里",
  pdf: "PDF 总结结果会显示在这里",
  contract: "合同重点提取结果会显示在这里",
  report: "生成的工作报告会显示在这里",
  ppt: "PPT 大纲会显示在这里",
  meeting: "会议纪要会显示在这里",
  polish: "润色结果会显示在这里"
};

const loadingMessages: Record<ToolType, string[]> = {
  excel: ["正在读取表格内容...", "正在分析数据结构...", "正在生成分析报告..."],
  pdf: ["正在解析文档内容...", "正在提取核心观点...", "正在生成总结结果..."],
  contract: ["正在读取合同内容...", "正在提取关键条款...", "正在分析潜在风险..."],
  report: ["正在整理工作内容...", "正在优化汇报结构...", "正在生成正式报告..."],
  ppt: ["正在分析主题...", "正在规划页面结构...", "正在生成 PPT 大纲..."],
  meeting: ["正在整理会议内容...", "正在提取重点事项...", "正在生成会议纪要..."],
  polish: ["正在分析沟通场景...", "正在优化表达语气...", "正在生成润色结果..."]
};

const scanWarningText =
  "已检测到文件，但未提取到可读取文字内容。该文件可能是扫描件、图片型 PDF 或拍照文件。当前版本暂不支持 OCR 识别，请上传可复制文字的 PDF / Word / TXT 文件。";
const uploadOcrHint = "当前版本暂不支持扫描件 OCR，请上传可复制文字的文档。";
const largeDocumentHint = "当前文档较大，处理时间可能较长，请耐心等待。";
const longDocumentFailureText = "当前文档内容较长，AI处理失败。建议拆分为多个较小文件后重新上传。";

function createInitialValues(tool: ToolConfig) {
  return Object.fromEntries(
    tool.fields.map((field) => [field.name, field.type === "select" ? field.options[0] || "" : ""])
  ) as Record<string, string>;
}

export default function OfficeToolboxClient() {
  const [activeType, setActiveType] = useState<ToolType>("excel");
  const activeTool = useMemo(() => tools.find((tool) => tool.type === activeType) || tools[0], [activeType]);
  const [values, setValues] = useState(() => createInitialValues(tools[0]));
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState("");
  const [resultToolType, setResultToolType] = useState<ToolType | null>(null);
  const [error, setError] = useState("");
  const [scanWarning, setScanWarning] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLElement>(null);
  const lastSubmissionRef = useRef<{ toolType: ToolType; values: Record<string, string>; file: File | null } | null>(null);

  useEffect(() => {
    if (!isLoading) {
      setLoadingStep(0);
      return;
    }

    const timer = window.setInterval(() => {
      setLoadingStep((current) => (current + 1) % loadingMessages[activeType].length);
    }, 1500);

    return () => window.clearInterval(timer);
  }, [activeType, isLoading]);

  function switchTool(type: ToolType) {
    const nextTool = tools.find((tool) => tool.type === type) || tools[0];
    setActiveType(type);
    setValues(createInitialValues(nextTool));
    setFile(null);
    setResult("");
    setResultToolType(null);
    setError("");
    setScanWarning("");
    setIsLoading(false);
    setLoadingStep(0);
    setCopied(false);
    setSidebarOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setScanWarning("");
    setCopied(false);

    if (activeTool.file && !file) {
      setError("请先上传需要处理的文件。");
      return;
    }

    const validationError = validateValues(activeTool, values);
    if (validationError) {
      setError(validationError);
      return;
    }

    const toolUseCheck = canUseTool();
    if (!toolUseCheck.canUse) {
      setError(toolUseCheck.message);
      return;
    }

    setIsLoading(true);
    setLoadingStep(0);

    try {
      const submission = {
        toolType: activeTool.type,
        values: { ...values },
        file
      };
      const response = await submitTool(submission);

      if (!response.ok) {
        handleToolFailure(response.error);
        return;
      }

      lastSubmissionRef.current = submission;
      setResult(response.result);
      setResultToolType(submission.toolType);
      consumeQuotaAfterSuccess({
        toolId: submission.toolType,
        toolName: targetToolName(submission.toolType),
        inputType: targetInputType(submission.toolType)
      });
      setValues(createInitialValues(activeTool));
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      window.requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function regenerate() {
    if (!lastSubmissionRef.current || lastSubmissionRef.current.toolType !== activeType) return;
    setError("");
    setScanWarning("");
    setCopied(false);
    setIsLoading(true);
    setLoadingStep(0);

    const toolUseCheck = canUseTool();
    if (!toolUseCheck.canUse) {
      setError(toolUseCheck.message);
      setIsLoading(false);
      return;
    }

    try {
      const response = await submitTool(lastSubmissionRef.current);

      if (!response.ok) {
        handleToolFailure(response.error);
        return;
      }

      setResult(response.result);
      setResultToolType(lastSubmissionRef.current.toolType);
      consumeQuotaAfterSuccess({
        toolId: lastSubmissionRef.current.toolType,
        toolName: targetToolName(lastSubmissionRef.current.toolType),
        inputType: targetInputType(lastSubmissionRef.current.toolType)
      });
      window.requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function submitTool(submission: { toolType: ToolType; values: Record<string, string>; file: File | null }) {
    try {
      const targetTool = tools.find((tool) => tool.type === submission.toolType) || tools[0];
      const requestBody = targetTool.file ? buildFilePayload(submission) : buildJsonPayload(submission);
      const response = await fetch("/api/toolbox/office", {
        method: "POST",
        body: requestBody,
        headers: targetTool.file ? undefined : { "Content-Type": "application/json" }
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.result) {
        logOfficeToolboxWarning(data.error || data.message || data);
        return {
          ok: false as const,
          error: String(data.error || data.message || "处理失败，请稍后重试")
        };
      }

      if (shouldShowScanWarning(String(data.result))) {
        return {
          ok: false as const,
          error: String(data.result)
        };
      }

      return {
        ok: true as const,
        result: String(data.result)
      };
    } catch (error) {
      logOfficeToolboxWarning(error);
      return {
        ok: false as const,
        error: error instanceof Error ? error.message : "处理失败，请稍后重试"
      };
    }
  }

  function handleToolFailure(message: string) {
    logOfficeToolboxWarning(message);
    if (shouldShowScanWarning(message)) {
      setScanWarning(scanWarningText);
    }
    setResult("");
    setResultToolType(null);
    setError(getFriendlyErrorMessage(message));
  }

  function logOfficeToolboxWarning(message: unknown) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Office toolbox warning:", message);
    }
  }

  function shouldShowScanWarning(message: string) {
    return /extractedText\s*为空|未读取到内容|未检测到\s*PDF\s*文档|未检测到PDF文档|文档提取失败|返回空内容|文件内容为空|上传的文件内容为空|空内容|无法读取文字|提取失败/.test(message);
  }

  function getFriendlyErrorMessage(message: string) {
    if (shouldShowScanWarning(message)) {
      return scanWarningText;
    }

    if (isLongDocumentFailure(message)) {
      return longDocumentFailureText;
    }

    if (/Failed to fetch|NetworkError|网络|fetch/i.test(message)) {
      return "服务暂时不可用，请稍后重试。";
    }

    if (/未获取到有效输出|输出节点|outputs|未返回|empty/i.test(message)) {
      return "AI 已完成处理，但未返回可展示内容，请检查工具配置。";
    }

    if (/文件|upload/i.test(message)) {
      return "请先上传需要处理的文件。";
    }

    if (/input form|must be one of/i.test(message)) {
      return "服务暂时不可用，请稍后重试。";
    }

    if (/输入|内容|required|empty input/i.test(message)) {
      return "请先输入需要处理的内容。";
    }

    if (/Workflow|调用失败|timeout|请求超时|服务|API|Dify/i.test(message)) {
      return "服务暂时不可用，请稍后重试。";
    }

    return "处理失败，请稍后重试。";
  }

  function isLongDocumentFailure(message: string) {
    if (!activeTool.file || !file || !isLargeDocument(file)) return false;
    return /Workflow|调用失败|timeout|请求超时|504|文档过长|内容较长/i.test(message);
  }

  function isLargeDocument(currentFile: File) {
    return currentFile.size > 20 * 1024 * 1024;
  }

  function validateValues(tool: ToolConfig, currentValues: Record<string, string>) {
    const missingRequiredText = tool.fields.some((field) => {
      if (!field.required) return false;
      if (field.type === "select") return false;
      return !String(currentValues[field.name] || "").trim();
    });

    return missingRequiredText ? "请先输入需要处理的内容。" : "";
  }

  function formatFileSize(size: number) {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  }

  function targetToolName(toolType: ToolType) {
    return tools.find((tool) => tool.type === toolType)?.label || toolTypeMap[toolType].label;
  }

  function targetInputType(toolType: ToolType) {
    const tool = tools.find((item) => item.type === toolType);
    if (!tool) return "文本";
    return tool.file ? tool.file.accept.replaceAll(",", " / ") : "文本";
  }

  function buildJsonPayload(submission: { toolType: ToolType; values: Record<string, string> }) {
    const payload = createPayload(submission);
    return JSON.stringify(payload);
  }

  function buildFilePayload(submission: { toolType: ToolType; values: Record<string, string>; file: File | null }) {
    const formData = new FormData();
    const payload = createPayload(submission);
    formData.append("tool_type", String(payload.tool_type));
    if (submission.file) formData.append("files", submission.file);
    for (const [key, value] of Object.entries(payload)) {
      if (key !== "tool_type" && key !== "files") {
        formData.append(key, String(value));
      }
    }
    return formData;
  }

  function createPayload(submission: { toolType: ToolType; values: Record<string, string>; file?: File | null }) {
    const value = submission.values;

    switch (submission.toolType) {
      case "excel":
        return {
          tool_type: toolTypeMap.excel.value,
          files: submission.file ? [submission.file.name] : []
        };
      case "pdf":
        return {
          tool_type: toolTypeMap.pdf.value,
          files: submission.file ? [submission.file.name] : [],
          text_input: value.notes || ""
        };
      case "contract":
        return {
          tool_type: toolTypeMap.contract.value,
          files: submission.file ? [submission.file.name] : [],
          text_input: value.focus || ""
        };
      case "report":
        return {
          tool_type: toolTypeMap.report.value,
          text_input: value.work_content || "",
          report_type: value.report_type || "",
          report_style: value.tone || ""
        };
      case "ppt":
        const pptPages = Number(value.page_count);
        return {
          tool_type: toolTypeMap.ppt.value,
          ppt_topic: value.topic || "",
          ppt_style: value.style || "",
          ppt_pages: Number.isFinite(pptPages) ? pptPages : 0,
          text_input: value.extra_content || ""
        };
      case "meeting":
        return {
          tool_type: toolTypeMap.meeting.value,
          text_input: value.meeting_content || ""
        };
      case "polish":
        return {
          tool_type: toolTypeMap.polish.value,
          text_input: value.original_content || "",
          communication_type: value.communication_type || "",
          communication_tone: value.communication_tone || ""
        };
    }
  }

  async function copyResult() {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  const ActiveIcon = activeTool.icon;
  const currentToolHasResult = Boolean(result && resultToolType === activeType);
  const currentLoadingMessage = loadingMessages[activeType][loadingStep] || "AI 正在处理中...";

  return (
    <main className="min-h-screen bg-[#0B1120] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 shadow-2xl shadow-black/20 backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-200">AI办公工具箱</p>
            <h1 className="mt-1 text-lg font-semibold tracking-normal text-white sm:text-xl">智能办公处理台</h1>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen((current) => !current)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-slate-200 md:hidden"
            aria-label="打开工具菜单"
          >
            {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        <div className="mt-4 grid flex-1 gap-4 md:grid-cols-[280px_1fr]">
          <aside
            className={`${sidebarOpen ? "block" : "hidden"} rounded-2xl border border-white/10 bg-white/[0.04] p-3 shadow-2xl shadow-black/20 backdrop-blur md:block`}
          >
            <div className="px-3 py-2">
              <p className="text-xs font-medium text-slate-400">工具菜单</p>
            </div>
            <nav className="mt-1 space-y-1.5">
              {tools.map((tool) => {
                const Icon = tool.icon;
                const isActive = tool.type === activeType;
                return (
                  <button
                    key={tool.type}
                    type="button"
                    onClick={() => switchTool(tool.type)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition duration-200 ${
                      isActive
                        ? "bg-white text-slate-950 shadow-lg shadow-blue-950/20"
                        : "text-slate-300 hover:bg-white/[0.08] hover:text-white"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                    <span className="font-medium">{tool.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <section className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#F8FAFC] text-slate-950 shadow-2xl shadow-black/25">
            <div className="border-b border-slate-200 px-5 py-5 sm:px-7">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-300/70">
                  <ActiveIcon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold tracking-normal text-slate-950">{activeTool.label}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">{activeTool.description}</p>
                </div>
              </div>
            </div>

            <div className="grid min-w-0 gap-5 p-5 sm:p-7 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <form noValidate onSubmit={handleSubmit} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="space-y-5">
                  {activeTool.file ? (
                    <div className="min-w-0">
                      <p className="mb-2 text-sm font-semibold text-slate-900">文件上传</p>
                      <label
                        onDrop={handleDrop}
                        onDragOver={(event) => event.preventDefault()}
                        className="flex min-h-44 min-w-0 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center transition duration-200 hover:border-blue-300 hover:bg-blue-50/60"
                      >
                        <UploadCloud className="h-9 w-9 text-slate-500" />
                        <span className="mt-4 text-sm font-semibold text-slate-900">{activeTool.file.title}</span>
                        <span className="mt-2 text-xs leading-6 text-slate-500">支持 PDF / Excel / Word / TXT</span>
                        <span className="mt-1 text-xs leading-5 text-slate-400">{uploadOcrHint}</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept={activeTool.file.accept}
                          onChange={(event) => setFile(event.target.files?.[0] || null)}
                          className="sr-only"
                        />
                      </label>
                      {file ? (
                        <div className="mt-3 flex min-w-0 items-center justify-between gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white px-4 py-3">
                          <div className="min-w-0 flex-1 overflow-hidden">
                            <p className="truncate text-sm font-medium text-slate-900">{file.name}</p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {formatFileSize(file.size)} · {file.type || "未知类型"}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-emerald-700">文件已上传，点击开始处理。</p>
                            {isLargeDocument(file) ? <p className="mt-1 text-xs leading-5 text-amber-700">{largeDocumentHint}</p> : null}
                            {scanWarning ? <p className="mt-2 text-xs leading-5 text-amber-700">{scanWarning}</p> : null}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFile(null);
                              if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                            aria-label="删除文件"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {activeTool.fields.map((field) => (
                    <div key={field.name}>
                      <label htmlFor={field.name} className="mb-2 block text-sm font-semibold text-slate-900">
                        {field.label}
                      </label>
                      {field.type === "select" ? (
                        <select
                          id={field.name}
                          value={values[field.name] || ""}
                          required={field.required}
                          onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                        >
                          {field.options.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : field.type === "textarea" ? (
                        <textarea
                          id={field.name}
                          value={values[field.name] || ""}
                          required={field.required}
                          placeholder={field.placeholder}
                          onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                          className="min-h-40 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                        />
                      ) : (
                        <input
                          id={field.name}
                          type={field.type}
                          min={field.min}
                          value={values[field.name] || ""}
                          required={field.required}
                          placeholder={field.placeholder}
                          onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                        />
                      )}
                    </div>
                  ))}

                  {error ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                      {error === "请先登录后使用" ? (
                        <Link href="/login" className="ml-2 font-semibold text-red-800 underline underline-offset-4">
                          去登录
                        </Link>
                      ) : null}
                      {error === "免费额度已用完，请升级套餐或联系定制" ? (
                        <>
                          <Link href="/pricing" className="ml-2 font-semibold text-red-800 underline underline-offset-4">
                            查看套餐
                          </Link>
                          <Link href="/contact" className="ml-2 font-semibold text-red-800 underline underline-offset-4">
                            联系定制
                          </Link>
                        </>
                      ) : null}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg shadow-slate-300/60 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {isLoading ? "AI 正在处理中..." : activeTool.buttonText}
                  </button>
                </div>
              </form>

              <section ref={resultRef} className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">输出结果</h3>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={copyResult}
                      disabled={!currentToolHasResult || isLoading}
                      className="inline-flex h-9 items-center rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                    >
                      {copied ? "已复制" : "复制"}
                    </button>
                    <button
                      type="button"
                      onClick={regenerate}
                      disabled={!currentToolHasResult || isLoading}
                      className="inline-flex h-9 items-center rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                    >
                      重新生成
                    </button>
                  </div>
                </div>

                <div className="mt-5 min-h-[420px] min-w-0 overflow-y-auto overflow-x-hidden rounded-2xl bg-slate-50 p-5 lg:max-h-[calc(100vh-260px)]">
                  {isLoading ? (
                    <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
                      <div className="relative h-12 w-12 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin" />
                      <p className="mt-5 text-sm font-semibold text-slate-800">{currentLoadingMessage}</p>
                      <p className="mt-2 text-xs text-slate-500">请稍候，结果生成后会自动显示。</p>
                    </div>
                  ) : null}
                  {!isLoading && !currentToolHasResult ? (
                    <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
                      <BriefcaseBusiness className="h-10 w-10 text-slate-300" />
                      <p className="mt-4 text-sm font-medium text-slate-700">{emptyStateText[activeType]}</p>
                    </div>
                  ) : null}
                  {currentToolHasResult && !isLoading ? (
                    <div className="markdown-body text-sm leading-7 text-slate-900">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                        {result}
                      </ReactMarkdown>
                    </div>
                  ) : null}
                </div>
              </section>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
