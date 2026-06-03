import { DifyApiError, extractDifyResult, runWorkflow, runWorkflowStreaming, toDifyDocument, uploadFile } from "@/lib/dify";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const missingConfigMessage = "服务暂时不可用，请稍后重试。";

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
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
      files: getFiles(formData)
    };
  }

  const body = await request.json();
  const pptPages = Number(body.ppt_pages);
  return {
    tool_type: String(body.tool_type || ""),
    text_input: String(body.text_input || ""),
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
  switch (payload.tool_type) {
    case "Excel 数据分析":
    case "Excel数据分析":
    case "excel_analysis":
    case "excel": {
      const uploadedFiles = await Promise.all((payload.files || []).map((file) => uploadFile(apiKey, file)));
      return {
        tool_type: payload.tool_type,
        files: uploadedFiles.map((file) => toDifyDocument(file.id))
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
        text_input: payload.text_input || ""
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
        text_input: buildContractInstruction(payload.text_input || "")
      };
    }
    case "周报/月报生成":
    case "report_generator":
    case "report":
      return {
        tool_type: payload.tool_type,
        text_input: payload.text_input || "",
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
        text_input: payload.text_input || ""
      };
    }
    case "会议纪要整理":
    case "meeting_summary":
    case "meeting":
      return {
        tool_type: payload.tool_type,
        text_input: payload.text_input || ""
      };
    case "邮件/通知润色":
    case "邮箱/通知润色":
    case "email_polish":
    case "polish":
      return {
        tool_type: payload.tool_type,
        text_input: payload.text_input || "",
        communication_type: payload.communication_type || "",
        communication_tone: payload.communication_tone || ""
      };
    default:
      throw new Error("unknown_tool");
  }
}

function buildContractInstruction(userFocus: string) {
  const focus = userFocus.trim();
  return [
    "请先判断上传文档是否属于合同、协议、订单、租赁协议、三方协议、实习协议、劳动合同、采购协议、合作协议等具有法律约束或交易约定性质的文件。",
    "如果文档明显不是合同或协议类文档，不要强行提取合同主体、金额、违约责任等条款；请返回：当前文件不像合同或协议类文档，可能无法提取合同条款。请上传合同、协议、订单、租赁协议、三方协议、采购协议等文件。并补充文档类型判断、不适合做合同提取的原因，以及建议用户改用 PDF智能总结工具。",
    "如果文档属于三方协议、实习协议、劳动合同、租赁合同、采购合同、合作协议等，请正常提取合同重点。",
    focus ? `用户关注点：${focus}` : "用户关注点：无"
  ].join("\n");
}

export async function POST(request: Request) {
  const apiKey = process.env.TOOLBOX_OFFICE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: missingConfigMessage }, { status: 500 });
  }

  try {
    const payload = await parsePayload(request);
    console.log("Dify request payload:", payload);
    const inputs = await createInputs(payload, apiKey);
    console.log("Dify final request body:", {
      inputs,
      response_mode: "blocking",
      user: "website-user"
    });
    const response =
      payload.tool_type === "ppt_outline" || payload.tool_type === "PPT大纲生成" || payload.tool_type === "PPT 大纲生成"
        ? await runWorkflowStreaming(apiKey, inputs, {
            toolName: "office_toolbox_ppt"
          })
        : await runWorkflow(apiKey, inputs, {
            toolName: "office_toolbox"
          });
    console.log("Dify response:", response);
    const result = extractDifyResult(response);

    if (!result.trim()) {
      const runData = response && typeof response === "object" ? (response as { data?: { total_tokens?: number; outputs?: unknown } }).data : undefined;
      const totalTokens = runData?.total_tokens;
      const outputs = runData?.outputs;
      const outputsEmpty = outputs && typeof outputs === "object" && Object.keys(outputs).length === 0;
      console.error("Dify error:", {
        message: "empty outputs",
        totalTokens,
        outputs,
        response
      });
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

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Dify error:", error);
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
