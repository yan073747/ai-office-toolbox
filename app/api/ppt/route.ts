import { extractDifyResult, getDifyErrorMessage, getDifyErrorStatus, runWorkflow } from "@/lib/dify";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const workflowUrl = `${process.env.DIFY_BASE_URL || "https://api.dify.ai/v1"}/workflows/run`;

export async function POST(request: Request) {
  const apiKey = process.env.PPT_API_KEY;
  const workflowId = process.env.PPT_WORKFLOW_ID || "ppt";

  console.log("PPT API key loaded:", Boolean(apiKey));
  console.log("PPT workflow id:", workflowId);

  if (!apiKey) {
    console.log("Dify error:", "PPT_API_KEY 未配置");
    return NextResponse.json({ error: "服务配置异常，请联系管理员。" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const inputs = {
      topic: String(body.topic || ""),
      scene: String(body.scene || ""),
      pages: Number(body.pages || 0),
      audience: String(body.audience || "")
    };
    console.log("PPT request body:", inputs);

    const response = await runWorkflow(apiKey, inputs, {
      workflowUrl,
      workflowId,
      toolName: "ppt"
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
