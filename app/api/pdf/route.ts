import {
  extractDifyResult,
  getDifyErrorMessage,
  getDifyErrorStatus,
  runWorkflow,
  toDifyDocument,
  uploadFile
} from "@/lib/dify";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const workflowUrl = `${process.env.DIFY_BASE_URL || "https://api.dify.ai/v1"}/workflows/run`;

export async function POST(request: Request) {
  const apiKey = process.env.PDF_API_KEY;
  const workflowId = process.env.PDF_WORKFLOW_ID || "pdf";

  console.log("PDF API key loaded:", Boolean(apiKey));
  console.log("PDF workflow id:", workflowId);

  if (!apiKey) {
    console.log("Dify error:", "PDF_API_KEY 未配置");
    return NextResponse.json({ error: "服务配置异常，请联系管理员。" }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "请上传 PDF 文件" }, { status: 400 });
    }

    const uploadedFile = await uploadFile(apiKey, file);
    const inputs = {
      pdf_file: [toDifyDocument(uploadedFile.id)]
    };
    console.log("PDF request body:", inputs);

    const response = await runWorkflow(apiKey, inputs, {
      workflowUrl,
      workflowId,
      toolName: "pdf"
    });
    console.log("Dify response:", response);

    const result = extractDifyResult(response);
    if (!result.trim()) {
      return NextResponse.json({ error: "未生成有效结果，请调整输入后重试。" }, { status: 502 });
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.log("Dify error:", error);
    return NextResponse.json({ error: getDifyErrorMessage(error) }, { status: getDifyErrorStatus(error) });
  }
}
