import { ExcelAbTestMode, runExcelAbTest } from "@/lib/excel-ab-test";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const mode: ExcelAbTestMode = body?.mode === "full" ? "full" : "quick";
    const report = await runExcelAbTest(mode);
    return NextResponse.json(report);
  } catch (error) {
    console.error("Excel AB test error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Excel AB 测试执行失败"
      },
      { status: 500 }
    );
  }
}
