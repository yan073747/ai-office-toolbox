import { DifyApiError, extractDifyResult, runWorkflow, runWorkflowStreaming, toDifyDocument, uploadFile } from "@/lib/dify";
import { writeAuditLog } from "@/lib/audit-log";
import { countRateLimitEvents, getIpHash, getRateLimitKey, recordRateLimitEvent } from "@/lib/rate-limit";
import { getSessionUserId } from "@/lib/server-auth";
import { FREE_LIMIT_REACHED_CODE, canUseToolServer, consumeQuotaAfterToolSuccess } from "@/lib/server-quota";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const missingConfigMessage = "服务暂时不可用，请稍后重试。";
const TOOL_FAILURE_ACTION = "tool.call.failed";
const TOOL_FAILURE_WINDOW_MS = 10 * 60 * 1000;
const TOOL_FAILURE_ALERT_THRESHOLD = 3;

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function firstNonEmpty(...values: Array<unknown>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function getFiles(formData: FormData) {
  return formData.getAll("files").filter((value): value is File => value instanceof File && value.size > 0);
}

async function parsePayload(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    return {
      tool_type: readText(formData, "tool_type"),
      text_input: readText(formData, "text_input"),
      user_requirement: readText(formData, "user_requirement"),
      files: getFiles(formData)
    };
  }

  const body = await request.json();
  const pptPages = Number(body.ppt_pages);
  return {
    tool_type: String(body.tool_type || ""),
    text_input: String(body.text_input || ""),
    user_requirement: String(body.user_requirement || ""),
    report_type: String(body.report_type || ""),
    report_style: String(body.report_style || ""),
    ppt_topic: String(body.ppt_topic || ""),
    ppt_style: String(body.ppt_style || ""),
    ppt_pages: Number.isFinite(pptPages) ? pptPages : 0,
    communication_type: String(body.communication_type || ""),
    communication_tone: String(body.communication_tone || "")
  };
}

async function createInputs(payload: Awaited<ReturnType<typeof parsePayload>>, apiKey: string) {
  const userRequirement = firstNonEmpty(payload.user_requirement, payload.text_input);

  switch (payload.tool_type) {
    case "Excel 数据分析":
    case "Excel数据分析":
    case "excel_analysis":
    case "excel": {
      const uploadedFiles = await Promise.all((payload.files || []).map((file) => uploadFile(apiKey, file)));
      return {
        tool_type: payload.tool_type,
        files: uploadedFiles.map((file) => toDifyDocument(file.id)),
        text_input: buildExcelRequirementInstruction(userRequirement)
      };
    }
    case "PDF 智能总结":
    case "PDF智能分析":
    case "pdf_summary":
    case "pdf": {
      const uploadedFiles = await Promise.all((payload.files || []).map((file) => uploadFile(apiKey, file)));
      return {
        tool_type: payload.tool_type,
        files: uploadedFiles.map((file) => toDifyDocument(file.id)),
        text_input: buildRequirementText(payload.text_input || "", userRequirement, "PDF总结要求")
      };
    }
    case "合同/文件重点提取":
    case "合同重点提取":
    case "contract_extract":
    case "contract": {
      const uploadedFiles = await Promise.all((payload.files || []).map((file) => uploadFile(apiKey, file)));
      return {
        tool_type: payload.tool_type,
        files: uploadedFiles.map((file) => toDifyDocument(file.id)),
        text_input: buildContractInstruction(payload.text_input || "", userRequirement)
      };
    }
    case "周报/月报生成":
    case "report_generator":
    case "report":
      return {
        tool_type: payload.tool_type,
        text_input: buildRequirementText(payload.text_input || "", payload.user_requirement || "", "用户补充要求"),
        report_type: payload.report_type || "",
        report_style: payload.report_style || ""
      };
    case "PPT 大纲生成":
    case "PPT大纲生成":
    case "ppt_outline":
    case "ppt": {
      const pptPages = Number(payload.ppt_pages);
      return {
        tool_type: payload.tool_type,
        ppt_topic: payload.ppt_topic || "",
        ppt_style: payload.ppt_style || "",
        ppt_pages: Number.isFinite(pptPages) ? pptPages : 0,
        text_input: buildRequirementText(payload.text_input || "", payload.user_requirement || "", "用户补充要求")
      };
    }
    case "会议纪要整理":
    case "meeting_summary":
    case "meeting":
      return {
        tool_type: payload.tool_type,
        text_input: buildRequirementText(payload.text_input || "", payload.user_requirement || "", "会议整理要求")
      };
    case "邮件/通知润色":
    case "邮箱/通知润色":
    case "email_polish":
    case "polish":
      return {
        tool_type: payload.tool_type,
        text_input: buildRequirementText(payload.text_input || "", payload.user_requirement || "", "润色补充要求"),
        communication_type: payload.communication_type || "",
        communication_tone: payload.communication_tone || ""
      };
    default:
      throw new Error("unknown_tool");
  }
}

function buildRequirementText(mainText: string, requirement: string, label: string) {
  const main = mainText.trim();
  const userRequirement = requirement.trim();
  if (!userRequirement || userRequirement === main) return main;
  return [main, `${label}：${userRequirement}`].filter(Boolean).join("\n\n");
}

function buildExcelRequirementInstruction(userRequirement: string) {
  const requirement = userRequirement.trim();
  if (!requirement) return "";

  return [
    "【强制输出要求】最终报告必须包含以下一级标题，标题文字必须原样输出：",
    "# 用户指定问题响应",
    `用户分析目标：${requirement}`,
    "请优先响应用户分析目标，并把具体回答放在“用户指定问题响应”段落下。",
    "该段落必须明确回答用户提出的具体问题。",
    "如果用户要求检索某个关键词、专业、班级、姓名、学号或字段值，请基于表格数据进行检索，说明匹配数量，并列出相关班级/姓名/学号等可用摘要。",
    "如果没有发现匹配记录，请明确说明：未发现包含该关键词或条件的记录。"
  ].join("\n");
}

function buildContractInstruction(textInput: string, userRequirement: string) {
  const text = textInput.trim();
  const requirement = userRequirement.trim();
  return [
    "请先判断上传文档是否属于合同、协议、订单、租赁协议、三方协议、实习协议、劳动合同、采购协议、合作协议等具有法律约束或交易约定性质的文件。",
    "如果文档明显不是合同或协议类文档，不要强行提取合同主体、金额、违约责任等条款；请返回：当前文件不像合同或协议类文档，可能无法提取合同条款。请上传合同、协议、订单、租赁协议、三方协议、采购协议等文件。并补充文档类型判断、不适合做合同提取的原因，以及建议用户改用 PDF智能总结工具。",
    "如果文档属于三方协议、实习协议、劳动合同、租赁合同、采购合同、合作协议等，请正常提取合同重点。",
    requirement ? `用户关注点：${requirement}` : "用户关注点：无",
    text && text !== requirement ? `用户补充文本：${text}` : ""
  ].join("\n");
}

function logDifyInputSummary(payload: Awaited<ReturnType<typeof parsePayload>>, inputs: Record<string, unknown>) {
  if (process.env.NODE_ENV === "production") return;
  console.log("Dify input summary:", {
    tool_type: payload.tool_type,
    inputKeys: Object.keys(inputs),
    hasUserRequirement: Boolean(firstNonEmpty(payload.user_requirement, payload.text_input)),
    fileCount: Array.isArray(inputs.files) ? inputs.files.length : 0
  });
}

function logDifyResultSummary(response: unknown) {
  if (process.env.NODE_ENV === "production") return;
  const data = response && typeof response === "object" ? (response as { data?: { status?: string; total_tokens?: number; outputs?: unknown } }).data : undefined;
  console.log("Dify result summary:", {
    status: data?.status || "unknown",
    hasOutputs: Boolean(data?.outputs),
    totalTokens: data?.total_tokens
  });
}

async function recordToolFailure(request: Request, userId: string | null, toolType: string, errorType: string, message: string) {
  const ipHash = getIpHash(request);
  const rateKey = userId ? getRateLimitKey("user", userId) : getRateLimitKey("ip", ipHash);
  await recordRateLimitEvent(rateKey, TOOL_FAILURE_ACTION);
  const recentFailures = await countRateLimitEvents({
    key: rateKey,
    action: TOOL_FAILURE_ACTION,
    windowMs: TOOL_FAILURE_WINDOW_MS
  });

  if (recentFailures >= TOOL_FAILURE_ALERT_THRESHOLD) {
    await writeAuditLog({
      request,
      userId,
      event: "tool.call.repeated_failed",
      level: "warn",
      message,
      metadata: {
        tool_type: toolType,
        errorType,
        ipHash,
        count: recentFailures
      }
    });
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.TOOLBOX_OFFICE_API_KEY;
  let userId: string | null = null;
  let auditToolType = "unknown";

  if (!apiKey) {
    return NextResponse.json({ error: missingConfigMessage }, { status: 500 });
  }

  try {
    userId = await getSessionUserId();
    const payload = await parsePayload(request);
    auditToolType = payload.tool_type || "unknown";
    const toolInfo = getToolInfo(payload);
    const quotaCheck = await canUseToolServer(userId, toolInfo);
    if (!quotaCheck.canUse) {
      if (quotaCheck.reason === "free_limit_reached") {
        await writeAuditLog({
          request,
          userId,
          event: "quota.insufficient",
          level: "warn",
          metadata: {
            reason: quotaCheck.reason,
            code: quotaCheck.code,
            tool_type: auditToolType,
            toolId: toolInfo.toolId,
            remainingQuota: quotaCheck.quota?.remainingQuota
          }
        });
      }
      return NextResponse.json(
        {
          success: false,
          code: quotaCheck.code || (quotaCheck.reason === "not_logged_in" ? "NOT_LOGGED_IN" : FREE_LIMIT_REACHED_CODE),
          message: quotaCheck.message,
          error: quotaCheck.message
        },
        { status: quotaCheck.reason === "not_logged_in" ? 401 : quotaCheck.reason === "email_not_verified" ? 403 : 402 }
      );
    }

    const inputs = await createInputs(payload, apiKey);
    logDifyInputSummary(payload, inputs);
    const response =
      payload.tool_type === "ppt_outline" || payload.tool_type === "PPT大纲生成" || payload.tool_type === "PPT 大纲生成"
        ? await runWorkflowStreaming(apiKey, inputs, {
            toolName: "office_toolbox_ppt"
          })
        : await runWorkflow(apiKey, inputs, {
            toolName: "office_toolbox"
          });
    logDifyResultSummary(response);
    const result = extractDifyResult(response);

    if (!result.trim()) {
      const runData = response && typeof response === "object" ? (response as { data?: { total_tokens?: number; outputs?: unknown } }).data : undefined;
      const totalTokens = runData?.total_tokens;
      const outputs = runData?.outputs;
      const outputsEmpty = outputs && typeof outputs === "object" && Object.keys(outputs).length === 0;
      const errorType = totalTokens === 0 ? "branch_not_matched" : outputsEmpty ? "empty_outputs" : "empty_result";
      await recordToolFailure(request, userId, auditToolType, errorType, "Dify returned empty output.");
      await writeAuditLog({
        request,
        userId,
        event: "tool.call.failed",
        level: "error",
        message: "Dify returned empty output.",
        metadata: {
          tool_type: auditToolType,
          errorType
        }
      });
      if (process.env.NODE_ENV !== "production") {
        console.error("Dify error:", {
          message: "empty outputs",
          totalTokens,
          outputs,
          response
        });
      } else {
        console.error("Dify error: empty outputs");
      }
      if (totalTokens === 0) {
        return NextResponse.json(
          { error: "工具分支未命中，请检查 tool_type 选项与条件分支是否一致。" },
          { status: 502 }
        );
      }

      if (outputsEmpty) {
        return NextResponse.json({ error: "未获取到有效输出，请检查输出节点配置。" }, { status: 502 });
      }

      return NextResponse.json({ error: "未获取到有效输出。" }, { status: 502 });
    }

    await consumeQuotaAfterToolSuccess(userId as string, toolInfo, quotaCheck.access);
    return NextResponse.json({ result });
  } catch (error) {
    const errorType = error instanceof DifyApiError ? `dify_${error.status || "unknown"}` : error instanceof Error ? error.name : "unknown";
    const errorMessage = error instanceof Error ? error.message : "unknown";
    await recordToolFailure(request, userId, auditToolType, errorType, errorMessage);
    await writeAuditLog({
      request,
      userId,
      event: "tool.call.exception",
      level: "error",
      message: errorMessage,
      metadata: {
        tool_type: auditToolType,
        errorType
      }
    });
    await writeAuditLog({
      request,
      userId,
      event: "tool.call.failed",
      level: "error",
      message: errorMessage,
      metadata: {
        tool_type: auditToolType,
        errorType
      }
    });
    if (process.env.NODE_ENV !== "production") {
      console.error("Dify error:", error);
    } else {
      console.error("Dify error:", error instanceof Error ? error.message : "unknown");
    }
    if (error instanceof DifyApiError) {
      const detailMessage =
        error.details && typeof error.details === "object" && "message" in error.details
          ? String((error.details as { message?: unknown }).message)
          : error.message;
      return NextResponse.json({ error: detailMessage || error.message }, { status: error.status || 500 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    );
  }
}

function getToolInfo(payload: Awaited<ReturnType<typeof parsePayload>>) {
  const toolType = payload.tool_type;
  switch (toolType) {
    case "Excel 数据分析":
    case "Excel数据分析":
    case "excel_analysis":
    case "excel":
      return { toolId: "excel", toolName: "Excel 数据分析", inputType: ".xlsx / .xls / .csv" };
    case "PDF 智能总结":
    case "PDF智能分析":
    case "pdf_summary":
    case "pdf":
      return { toolId: "pdf", toolName: "PDF 智能总结", inputType: ".pdf / 文档" };
    case "合同/文件重点提取":
    case "合同重点提取":
    case "contract_extract":
    case "contract":
      return { toolId: "contract", toolName: "合同重点提取", inputType: "文件 / 文本" };
    case "周报/月报生成":
    case "report_generator":
    case "report":
      return { toolId: "report", toolName: "日报周报月报生成", inputType: "文本" };
    case "PPT 大纲生成":
    case "PPT大纲生成":
    case "ppt_outline":
    case "ppt":
      return { toolId: "ppt", toolName: "PPT 大纲大师", inputType: "文本" };
    case "会议纪要整理":
    case "meeting_summary":
    case "meeting":
      return { toolId: "meeting", toolName: "会议纪要整理", inputType: "文本" };
    case "邮件/通知润色":
    case "邮箱/通知润色":
    case "email_polish":
    case "polish":
      return { toolId: "polish", toolName: "邮件通知润色", inputType: "文本" };
    default:
      return { toolId: "unknown", toolName: "AI 办公工具", inputType: "文本" };
  }
}
