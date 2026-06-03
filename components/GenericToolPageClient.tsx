"use client";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clipboard,
  Copy,
  Download,
  FileText,
  Loader2,
  RefreshCcw,
  Sparkles,
  UploadCloud,
  X
} from "lucide-react";
import { canUseTool, consumeQuotaAfterSuccess } from "@/lib/user-store";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Dispatch, RefObject, SetStateAction } from "react";
import type { LucideIcon } from "lucide-react";

type ToolKind = "file" | "text" | "hybrid";
type FieldType = "text" | "textarea" | "number" | "select" | "checkbox";

type ToolField = {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  defaultValue?: string;
  min?: number;
};

type ToolConfig = {
  id: string;
  toolType: string;
  name: string;
  intro: string;
  formats: string;
  quotaText: string;
  kind: ToolKind;
  accept?: string;
  uploadHint?: string;
  sizeLimit?: string;
  submitLabel: string;
  emptyText: string;
  fields: ToolField[];
  sample: string;
};

const toolConfigs: Record<string, ToolConfig> = {
  excel: {
    id: "excel",
    toolType: "excel_analysis",
    name: "Excel 数据分析",
    intro: "上传 Excel 或 CSV，自动生成数据分析报告。",
    formats: ".xlsx / .xls / .csv",
    quotaText: "新用户免费额度 5 次",
    kind: "file",
    accept: ".xlsx,.xls,.csv",
    uploadHint: "支持 Excel / CSV 文件",
    sizeLimit: "建议 20MB 以内",
    submitLabel: "开始分析",
    emptyText: "Excel 分析结果会显示在这里",
    fields: [
      {
        name: "analysis_goal",
        label: "分析目标（可选）",
        type: "textarea",
        placeholder: "例如：重点分析销售趋势、异常值、客户分布和改进建议"
      }
    ],
    sample: "## 数据分析报告示例\n\n- 数据概览：共识别 12 个字段，包含销售额、地区、渠道等核心维度。\n- 异常提示：发现 3 条销售额明显偏低记录。\n- 趋势判断：华东地区近 30 天增长较快。\n- 建议：进一步拆分渠道转化率，定位高价值客户来源。"
  },
  pdf: {
    id: "pdf",
    toolType: "pdf_summary",
    name: "PDF 智能总结",
    intro: "上传 PDF 文档，快速提炼摘要、重点内容和风险点。",
    formats: ".pdf",
    quotaText: "新用户免费额度 5 次",
    kind: "file",
    accept: ".pdf",
    uploadHint: "支持可复制文字的 PDF",
    sizeLimit: "建议 20MB 以内，暂不支持扫描件 OCR",
    submitLabel: "开始总结",
    emptyText: "PDF 总结结果会显示在这里",
    fields: [
      {
        name: "summary_depth",
        label: "总结深度",
        type: "select",
        options: ["标准", "简洁", "详细"],
        defaultValue: "标准"
      }
    ],
    sample: "## PDF 总结示例\n\n### 核心摘要\n文档主要围绕项目背景、执行计划和潜在风险展开。\n\n### 重点内容\n- 项目目标清晰，但资源排期需要进一步确认。\n- 风险集中在交付时间和跨部门协作。\n\n### 建议\n优先明确负责人、时间节点和验收标准。"
  },
  contract: {
    id: "contract",
    toolType: "contract_extract",
    name: "合同重点提取",
    intro: "识别合同主体、金额、义务、违约责任和关键时间节点。",
    formats: ".pdf / 文本",
    quotaText: "新用户免费额度 5 次",
    kind: "hybrid",
    accept: ".pdf,.txt,.doc,.docx",
    uploadHint: "支持合同 PDF / Word / TXT，也可粘贴合同文本",
    sizeLimit: "建议 20MB 以内，非合同文件会建议使用 PDF 总结工具",
    submitLabel: "开始提取",
    emptyText: "合同重点提取结果会显示在这里",
    fields: [
      {
        name: "contract_text",
        label: "合同文本或关注点（可选）",
        type: "textarea",
        placeholder: "可粘贴合同正文，或填写：重点看违约责任、付款周期、赔偿条款"
      }
    ],
    sample: "## 合同重点提取示例\n\n- 合同主体：甲方 XX 公司，乙方 XX 服务商。\n- 金额条款：合同总额 50,000 元，分两期付款。\n- 时间节点：签署后 10 个工作日内启动交付。\n- 风险点：违约责任描述较笼统，建议补充赔偿上限和处理流程。"
  },
  report: {
    id: "report",
    toolType: "report_generator",
    name: "日报周报月报生成",
    intro: "输入工作内容，自动生成正式、简洁或商务风格的汇报。",
    formats: "文本",
    quotaText: "新用户免费额度 5 次",
    kind: "text",
    submitLabel: "生成报告",
    emptyText: "生成的工作报告会显示在这里",
    fields: [
      {
        name: "work_content",
        label: "工作内容",
        type: "textarea",
        required: true,
        placeholder: "请输入本阶段工作内容、成果、问题与后续计划"
      },
      {
        name: "report_type",
        label: "报告类型",
        type: "select",
        options: ["周报", "日报", "月报"],
        defaultValue: "周报"
      },
      {
        name: "tone",
        label: "语气",
        type: "select",
        options: ["正式", "简洁", "商务"],
        defaultValue: "正式"
      }
    ],
    sample: "## 周报示例\n\n### 本周完成\n- 完成客户资料整理与重点客户跟进。\n- 梳理销售数据并输出异常情况说明。\n\n### 遇到问题\n- 部分数据口径不一致，需要进一步确认。\n\n### 下周计划\n- 完成数据复盘并推进重点客户转化。"
  },
  ppt: {
    id: "ppt",
    toolType: "ppt_outline",
    name: "PPT 大纲大师",
    intro: "输入主题和页数，自动生成完整 PPT 页面结构。",
    formats: "主题 / 页数 / 风格",
    quotaText: "新用户免费额度 5 次",
    kind: "text",
    submitLabel: "生成大纲",
    emptyText: "PPT 大纲会显示在这里",
    fields: [
      {
        name: "topic",
        label: "PPT 主题",
        type: "text",
        required: true,
        placeholder: "例如：AI 办公产品商业计划书"
      },
      {
        name: "pages",
        label: "页数",
        type: "number",
        required: true,
        min: 1,
        defaultValue: "10"
      },
      {
        name: "style",
        label: "风格",
        type: "select",
        options: ["商务", "正式", "教学", "路演"],
        defaultValue: "商务"
      }
    ],
    sample: "## PPT 大纲示例\n\n1. 封面：AI 办公产品商业计划书\n2. 市场背景：办公效率工具需求增长\n3. 用户痛点：重复整理、写作、分析成本高\n4. 产品方案：七类 AI 办公工具\n5. 商业模式：按次、套餐、企业定制\n6. 总结：落地计划与下一步目标"
  },
  meeting: {
    id: "meeting",
    toolType: "meeting_summary",
    name: "会议纪要整理",
    intro: "将杂乱会议记录整理成纪要、结论和待办事项。",
    formats: "会议文本",
    quotaText: "新用户免费额度 5 次",
    kind: "text",
    submitLabel: "整理纪要",
    emptyText: "会议纪要会显示在这里",
    fields: [
      {
        name: "meeting_content",
        label: "会议记录",
        type: "textarea",
        required: true,
        placeholder: "请输入会议记录、聊天记录或语音转文字内容"
      },
      {
        name: "extract_todos",
        label: "提取待办事项",
        type: "checkbox",
        defaultValue: "true"
      }
    ],
    sample: "## 会议纪要示例\n\n### 会议结论\n- 本周优先推进产品首页改版和工具页测试。\n\n### 待办事项\n- 设计：周三前完成首页视觉调整。\n- 开发：周五前完成工具页联调。\n- 运营：准备首批用户反馈表。"
  },
  polish: {
    id: "polish",
    toolType: "email_polish",
    name: "邮件通知润色",
    intro: "将普通表达改写成正式邮件、公告或通知。",
    formats: "文本",
    quotaText: "新用户免费额度 5 次",
    kind: "text",
    submitLabel: "开始润色",
    emptyText: "润色结果会显示在这里",
    fields: [
      {
        name: "original_content",
        label: "原始内容",
        type: "textarea",
        required: true,
        placeholder: "请输入需要润色的邮件、通知或沟通内容"
      },
      {
        name: "communication_type",
        label: "类型",
        type: "select",
        options: ["邮件", "通知", "公告"],
        defaultValue: "邮件"
      },
      {
        name: "communication_tone",
        label: "语气",
        type: "select",
        options: ["正式", "友好", "简洁"],
        defaultValue: "正式"
      }
    ],
    sample: "## 邮件润色示例\n\n尊敬的同事您好：\n\n关于本周项目进度，请各位于周五 18:00 前完成相关材料提交。如有特殊情况，请提前与项目负责人沟通。\n\n感谢配合。"
  }
};

export function isValidToolId(toolId: string) {
  return Boolean(toolConfigs[toolId]);
}

export function getToolName(toolId: string) {
  return toolConfigs[toolId]?.name || "AI 办公工具";
}

export default function GenericToolPageClient({ toolId }: { toolId: string }) {
  const tool = toolConfigs[toolId] || toolConfigs.excel;
  const initialValues = useMemo(() => createInitialValues(tool), [tool]);
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sampleOpen, setSampleOpen] = useState(false);
  const [quotaOpen, setQuotaOpen] = useState(false);
  const resultRef = useRef<HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValues(createInitialValues(tool));
    setSelectedFile(null);
    setResult("");
    setError("");
    setIsLoading(false);
    setCopied(false);
    setSampleOpen(false);
  }, [tool]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitTool();
  }

  async function submitTool() {
    setError("");
    setResult("");
    setCopied(false);

    const validationError = validateToolInput(tool, values, selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    const toolUseCheck = canUseTool();
    if (!toolUseCheck.canUse) {
      if (toolUseCheck.reason === "quota_empty") setQuotaOpen(true);
      setError(toolUseCheck.message);
      return;
    }

    setIsLoading(true);

    try {
      const body = buildRequestBody(tool, values, selectedFile);
      const response = await fetch("/api/toolbox/office", {
        method: "POST",
        body,
        headers: body instanceof FormData ? undefined : { "Content-Type": "application/json" }
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = normalizeErrorMessage(data?.error);
        if (message.includes("额度不足")) setQuotaOpen(true);
        setError(message);
        return;
      }

      if (!data?.result || typeof data.result !== "string") {
        setError("AI 已完成处理，但未返回可展示内容，请稍后重试。");
        return;
      }

      setResult(data.result);
      consumeQuotaAfterSuccess({
        toolId: tool.id,
        toolName: tool.name,
        inputType: getInputType(tool)
      });
      window.requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("Tool page warning:", err);
      }
      setError("服务暂时繁忙，请稍后重试。");
    } finally {
      setIsLoading(false);
    }
  }

  async function copyResult() {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function downloadWord() {
    if (!result) return;
    const html = `<!doctype html><html><head><meta charset="utf-8"></head><body><pre style="white-space:pre-wrap;font-family:Arial,'Microsoft YaHei',sans-serif;line-height:1.8;">${escapeHtml(result)}</pre></body></html>`;
    const blob = new Blob([html], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${tool.name}-结果.doc`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function onFileDrop(file: File) {
    setError("");
    setSelectedFile(file);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-white px-5 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950">
            <ArrowLeft className="h-4 w-4" />
            返回工具箱
          </Link>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
                <Sparkles className="h-4 w-4 text-blue-600" />
                {tool.quotaText}
              </div>
              <h1 className="text-3xl font-semibold tracking-normal text-slate-950 sm:text-5xl">{tool.name}</h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">{tool.intro}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-xs font-semibold text-slate-400">支持格式</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{tool.formats}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="min-w-0">
          <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-950">输入内容</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">填写必要信息后开始处理，结果会显示在右侧。</p>
            </div>

            <div className="space-y-5">
              {tool.kind === "file" || tool.kind === "hybrid" ? (
                <FileUploadArea
                  tool={tool}
                  selectedFile={selectedFile}
                  fileInputRef={fileInputRef}
                  onSelect={onFileDrop}
                  onRemove={() => setSelectedFile(null)}
                />
              ) : null}

              {tool.kind === "hybrid" ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
                  非合同文件会建议使用 PDF 总结工具。当前版本暂不支持扫描件 OCR，请上传可复制文字的文档。
                </div>
              ) : null}

              {tool.fields.map((field) => (
                <FieldRenderer key={field.name} field={field} value={values[field.name] || ""} setValues={setValues} />
              ))}

              {error ? (
                <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="min-w-0 flex-1">
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
                  </span>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isLoading ? "处理中..." : tool.submitLabel}
              </button>
            </div>
          </form>

          <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <button
              type="button"
              onClick={() => setSampleOpen((current) => !current)}
              className="flex w-full items-center justify-between gap-4 text-left text-sm font-semibold text-slate-950"
            >
              查看示例输出
              <span className="text-slate-400">{sampleOpen ? "-" : "+"}</span>
            </button>
            {sampleOpen ? (
              <div className="markdown-body mt-5 rounded-2xl bg-slate-50 p-4 text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{tool.sample}</ReactMarkdown>
              </div>
            ) : null}
          </div>
        </div>

        <section ref={resultRef} className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">AI 生成结果</h2>
              <p className="mt-1 text-sm text-slate-500">长文本结果会在当前区域内部滚动。</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ActionButton onClick={copyResult} disabled={!result} icon={Copy} label={copied ? "已复制" : "复制结果"} />
              <ActionButton onClick={downloadWord} disabled={!result} icon={Download} label="下载为 Word" />
              <ActionButton onClick={submitTool} disabled={!result || isLoading} icon={RefreshCcw} label="重新生成" />
            </div>
          </div>

          <div className="mt-5 max-h-[680px] min-h-[460px] overflow-y-auto rounded-2xl bg-slate-50 p-5">
            {isLoading ? (
              <div className="flex h-full min-h-[420px] flex-col items-center justify-center text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <h3 className="mt-5 text-lg font-semibold text-slate-950">正在处理</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">预计需要一些时间，请不要刷新页面。</p>
              </div>
            ) : null}

            {!isLoading && !result ? (
              <div className="flex h-full min-h-[420px] flex-col items-center justify-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
                  <Clipboard className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm font-medium text-slate-500">{tool.emptyText || "生成结果会显示在这里"}</p>
              </div>
            ) : null}

            {result ? (
              <div className="markdown-body text-sm leading-7 text-slate-800">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
              </div>
            ) : null}
          </div>
        </section>
      </section>

      {quotaOpen ? <QuotaModal onClose={() => setQuotaOpen(false)} /> : null}
    </main>
  );
}

function FileUploadArea({
  tool,
  selectedFile,
  fileInputRef,
  onSelect,
  onRemove
}: {
  tool: ToolConfig;
  selectedFile: File | null;
  fileInputRef: RefObject<HTMLInputElement>;
  onSelect: (file: File) => void;
  onRemove: () => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-800">上传文件</label>
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files?.[0];
          if (file) onSelect(file);
        }}
        className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 transition hover:border-blue-300 hover:bg-blue-50/40"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={tool.accept}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onSelect(file);
          }}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-950">{selectedFile.name}</p>
              <p className="mt-1 text-xs text-slate-500">{formatFileSize(selectedFile.size)}</p>
            </div>
            <button
              type="button"
              onClick={onRemove}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:text-slate-950"
              aria-label="删除文件"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center py-3 text-center"
          >
            <UploadCloud className="h-8 w-8 text-blue-600" />
            <span className="mt-3 text-sm font-semibold text-slate-950">点击上传或拖拽文件到这里</span>
            <span className="mt-2 text-xs leading-5 text-slate-500">{tool.uploadHint}</span>
          </button>
        )}
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-500">
        {tool.formats} · {tool.sizeLimit || "建议 20MB 以内"}
      </p>
    </div>
  );
}

function FieldRenderer({
  field,
  value,
  setValues
}: {
  field: ToolField;
  value: string;
  setValues: Dispatch<SetStateAction<Record<string, string>>>;
}) {
  function update(nextValue: string) {
    setValues((current) => ({ ...current, [field.name]: nextValue }));
  }

  if (field.type === "select") {
    return (
      <div>
        <label htmlFor={field.name} className="mb-2 block text-sm font-semibold text-slate-800">
          {field.label}
        </label>
        <select
          id={field.name}
          value={value}
          onChange={(event) => update(event.target.value)}
          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
        >
          {(field.options || []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div>
        <label htmlFor={field.name} className="mb-2 block text-sm font-semibold text-slate-800">
          {field.label}
        </label>
        <textarea
          id={field.name}
          value={value}
          required={field.required}
          placeholder={field.placeholder}
          onChange={(event) => update(event.target.value)}
          className="min-h-36 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
        />
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800">
        <input
          type="checkbox"
          checked={value === "true"}
          onChange={(event) => update(event.target.checked ? "true" : "false")}
          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        {field.label}
      </label>
    );
  }

  return (
    <div>
      <label htmlFor={field.name} className="mb-2 block text-sm font-semibold text-slate-800">
        {field.label}
      </label>
      <input
        id={field.name}
        type={field.type}
        min={field.min}
        value={value}
        required={field.required}
        placeholder={field.placeholder}
        onChange={(event) => update(event.target.value)}
        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}

function ActionButton({
  onClick,
  disabled,
  icon: Icon,
  label
}: {
  onClick: () => void;
  disabled: boolean;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function QuotaModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          <Sparkles className="h-5 w-5" />
        </div>
        <h2 className="mt-5 text-xl font-semibold text-slate-950">免费额度已用完</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">免费额度已用完，请升级套餐或联系定制。</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link href="/#pricing" className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 text-sm font-semibold text-white">
            查看套餐
          </Link>
          <Link href="/contact" className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-slate-800">
            联系定制
          </Link>
        </div>
        <button type="button" onClick={onClose} className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50">
          关闭
        </button>
      </div>
    </div>
  );
}

function createInitialValues(tool: ToolConfig) {
  return Object.fromEntries(
    tool.fields.map((field) => {
      if (field.defaultValue !== undefined) return [field.name, field.defaultValue];
      if (field.type === "select") return [field.name, field.options?.[0] || ""];
      if (field.type === "checkbox") return [field.name, "false"];
      return [field.name, ""];
    })
  );
}

function validateToolInput(tool: ToolConfig, values: Record<string, string>, selectedFile: File | null) {
  if (tool.kind === "file" && !selectedFile) return "请先上传需要处理的文件。";
  if (tool.id === "contract" && !selectedFile && !values.contract_text?.trim()) return "请上传合同文件或粘贴合同文本。";

  const requiredField = tool.fields.find((field) => field.required && !String(values[field.name] || "").trim());
  if (requiredField) return "请先输入需要处理的内容。";

  if (selectedFile && tool.accept) {
    const allowed = tool.accept.split(",").map((item) => item.trim().replace(".", "").toLowerCase());
    const ext = selectedFile.name.split(".").pop()?.toLowerCase() || "";
    if (ext && !allowed.includes(ext)) return "文件格式不支持。";
  }

  return "";
}

function buildRequestBody(tool: ToolConfig, values: Record<string, string>, selectedFile: File | null) {
  if (tool.kind === "file" || tool.kind === "hybrid") {
    const formData = new FormData();
    formData.append("tool_type", tool.toolType);
    if (selectedFile) formData.append("files", selectedFile);

    if (tool.id === "pdf") {
      formData.append("text_input", `总结深度：${values.summary_depth || "标准"}`);
    } else if (tool.id === "contract") {
      formData.append("text_input", values.contract_text || "");
    } else if (tool.id === "excel") {
      formData.append("text_input", values.analysis_goal || "");
    }

    return formData;
  }

  if (tool.id === "report") {
    return JSON.stringify({
      tool_type: tool.toolType,
      text_input: values.work_content || "",
      report_type: values.report_type || "",
      report_style: values.tone || ""
    });
  }

  if (tool.id === "ppt") {
    const pages = Number(values.pages);
    return JSON.stringify({
      tool_type: tool.toolType,
      ppt_topic: values.topic || "",
      ppt_style: values.style || "",
      ppt_pages: Number.isFinite(pages) ? pages : 0,
      text_input: ""
    });
  }

  if (tool.id === "meeting") {
    return JSON.stringify({
      tool_type: tool.toolType,
      text_input: `${values.meeting_content || ""}\n\n是否提取待办事项：${values.extract_todos === "true" ? "是" : "否"}`
    });
  }

  return JSON.stringify({
    tool_type: tool.toolType,
    text_input: values.original_content || "",
    communication_type: values.communication_type || "",
    communication_tone: values.communication_tone || ""
  });
}

function normalizeErrorMessage(message: unknown) {
  const text = typeof message === "string" ? message : "";

  if (!text) return "服务暂时繁忙，请稍后重试。";
  if (text.includes("quota") || text.includes("额度")) return "额度不足，请升级套餐后继续使用。";
  if (text.includes("OCR") || text.includes("未读取") || text.includes("无法读取") || text.includes("empty")) {
    return "文件内容无法读取，当前版本暂不支持 OCR，请上传可复制文字的文档。";
  }
  if (text.includes("format") || text.includes("格式")) return "文件格式不支持。";
  if (text.includes("timeout") || text.includes("504")) return "服务暂时繁忙，请稍后重试。";

  return "服务暂时繁忙，请稍后重试。";
}

function getInputType(tool: ToolConfig) {
  if (tool.kind === "file") return tool.formats;
  if (tool.kind === "hybrid") return "文件 / 文本";
  return "文本";
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

