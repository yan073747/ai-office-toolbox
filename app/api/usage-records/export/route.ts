import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit-log";
import { getCurrentServerUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";

type UsageExportRecord = {
  createdAt: Date;
  toolId: string;
  toolName: string;
  status: string;
  quotaUsed: number;
  errorMessage: string | null;
};

function parseDate(value: string | null, endOfDay = false) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }
  return date;
}

function escapeCsvCell(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function formatCsvTime(value: Date) {
  return value.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

export async function GET(request: Request) {
  let userId: string | undefined;
  const searchParams = new URL(request.url).searchParams;
  const format = searchParams.get("format") || "csv";
  const toolId = searchParams.get("toolId") || "";
  const dateFromParam = searchParams.get("dateFrom");
  const dateToParam = searchParams.get("dateTo");

  try {
    const user = await getCurrentServerUser();
    userId = user?.id;
    if (!user) {
      await writeAuditLog({
        request,
        event: "usage_records.export.failed",
        level: "warn",
        message: "Unauthenticated CSV export.",
        metadata: { status: 401 }
      });
      return NextResponse.json({ ok: false, message: "请先登录后导出使用记录。" }, { status: 401 });
    }

    if (format !== "csv") {
      await writeAuditLog({
        request,
        userId,
        event: "usage_records.export.failed",
        level: "warn",
        message: "Unsupported export format.",
        metadata: { format, status: 400 }
      });
      return NextResponse.json({ ok: false, message: "当前仅支持 CSV 导出。" }, { status: 400 });
    }

    const dateFrom = parseDate(dateFromParam);
    const dateTo = parseDate(dateToParam, true);
    const where = {
      userId: user.id,
      ...(toolId && toolId !== "all" ? { toolId } : {}),
      ...(dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom ? { gte: dateFrom } : {}),
              ...(dateTo ? { lte: dateTo } : {})
            }
          }
        : {})
    };

    const records = await prisma.usageRecord.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        createdAt: true,
        toolId: true,
        toolName: true,
        status: true,
        quotaUsed: true,
        errorMessage: true
      }
    });

    const headers = ["时间", "工具ID", "工具名称", "状态", "消耗额度", "错误信息"];
    const rows = (records as UsageExportRecord[]).map((record) => [
      formatCsvTime(record.createdAt),
      record.toolId,
      record.toolName,
      record.status === "success" ? "成功" : "失败",
      record.quotaUsed,
      record.errorMessage || ""
    ]);
    const csv = [headers, ...rows].map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
    const filename = `usage-records-${new Date().toISOString().slice(0, 10)}.csv`;

    await writeAuditLog({
      request,
      userId,
      event: "usage_records.export.success",
      metadata: {
        format,
        toolId: toolId || "all",
        dateFrom: dateFromParam || undefined,
        dateTo: dateToParam || undefined,
        count: records.length
      }
    });

    return new NextResponse(`\uFEFF${csv}`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    await writeAuditLog({
      request,
      userId,
      event: "usage_records.export.failed",
      level: "error",
      message: error instanceof Error ? error.message : "unknown",
      metadata: {
        format,
        toolId: toolId || "all",
        errorType: error instanceof Error ? error.name : "unknown",
        status: 500
      }
    });
    return NextResponse.json({ ok: false, message: "导出失败，请稍后重试。" }, { status: 500 });
  }
}
