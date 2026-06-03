"use client";

import { Download, FlaskConical, Loader2, Play, Table2 } from "lucide-react";
import { useMemo, useState } from "react";

type VariantResult = {
  success: boolean;
  tokens: number | null;
  fieldScore: number;
  integrityScore: number;
  anomalyScore: number;
  tokenScore: number;
  successScore: number;
  overallScore: number;
  elapsedMs: number;
  error: string;
  debug: VariantDebug;
};

type VariantDebug = {
  apiKeyPresent: boolean;
  apiKeySource: string;
  specificApiKeyPresent: boolean;
  toolType: string;
  fileVariable: string;
  requestSent: boolean;
  uploadStatus: number | null;
  workflowStatus: number | null;
  responseLength: number;
  responsePreview: string;
  errorMessage: string;
};

type ConfigDebug = {
  apiKeyPresent: boolean;
  specificApiKeyPresent: boolean;
  apiKeySource: string;
  toolType: string;
  fileVariable: string;
};

type ReportRow = {
  sampleId: string;
  fileName: string;
  description: string;
  expectedRows: number;
  expectedColumns: number;
  old: VariantResult;
  newer: VariantResult;
  recommendation: "建议替换" | "继续观察" | "不建议替换";
  reason: string;
};

type Report = {
  generatedAt: string;
  mode: TestMode;
  rows: ReportRow[];
  debug: {
    old: ConfigDebug;
    newer: ConfigDebug;
  };
  summary: {
    sampleCount: number;
    callCount: {
      old: number;
      newer: number;
      total: number;
    };
    estimatedTokens: {
      old: number;
      newer: number;
      total: number;
    };
    actualTokens: {
      old: number;
      newer: number;
      total: number;
    };
    oldSuccessRate: number;
    newSuccessRate: number;
    oldAverageAnomalyScore: number;
    newAverageAnomalyScore: number;
    oldAverageScore: number;
    newAverageScore: number;
    oldAverageTokens: number | null;
    newAverageTokens: number | null;
    tokenReductionRate: number | null;
    newWinCount: number;
    conclusion: string;
    upgradeDecision: "【建议升级到 V1.3.2】" | "【保留当前版本】";
  };
  markdown: string;
  csv: string;
};

type TestMode = "quick" | "full";

const testPlans: Record<TestMode, { label: string; sampleCount: number; oldCalls: number; newCalls: number; estimatedOldTokens: number; estimatedNewTokens: number }> = {
  quick: {
    label: "快速测试",
    sampleCount: 2,
    oldCalls: 2,
    newCalls: 2,
    estimatedOldTokens: 160000,
    estimatedNewTokens: 16000
  },
  full: {
    label: "完整测试",
    sampleCount: 10,
    oldCalls: 10,
    newCalls: 10,
    estimatedOldTokens: 800000,
    estimatedNewTokens: 80000
  }
};

export default function ExcelAbTestClient() {
  const [report, setReport] = useState<Report | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runningMode, setRunningMode] = useState<TestMode | null>(null);
  const [selectedMode, setSelectedMode] = useState<TestMode>("quick");
  const [error, setError] = useState("");

  const startedText = useMemo(() => {
    if (!report) return "尚未运行";
    return new Date(report.generatedAt).toLocaleString("zh-CN");
  }, [report]);

  const currentPlan = testPlans[selectedMode];

  async function runTest(mode: TestMode) {
    setSelectedMode(mode);
    setRunningMode(mode);
    setIsRunning(true);
    setError("");
    setReport(null);

    try {
      const response = await fetch("/api/ab-tests/excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode })
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "AB 测试执行失败");
      }

      setReport(data);
    } catch (err) {
      console.warn("Excel AB test warning:", err);
      setError(err instanceof Error ? err.message : "AB 测试执行失败，请检查服务配置。");
    } finally {
      setIsRunning(false);
      setRunningMode(null);
    }
  }

  function download(content: string, fileName: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 rounded-2xl border border-amber-300/30 bg-amber-300/10 px-5 py-4 text-sm leading-6 text-amber-50 shadow-lg shadow-black/20">
          这是内部研发测试页面，用于验证 Excel 工作流版本升级，不面向普通用户开放。
        </div>

        <header className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-sm text-blue-100">
                <FlaskConical className="h-4 w-4" />
                Excel 自动化 AB 测试
              </div>
              <h1 className="text-3xl font-semibold tracking-normal text-white">Excel 分析能力对比评估</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                先运行 2 个样本的快速测试，确认 API、旧版流程、新版流程、Token 统计和报告生成正常后，再手动启动完整测试。
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => runTest("quick")}
                disabled={isRunning}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-slate-950 shadow-lg shadow-black/20 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                {isRunning && runningMode === "quick" ? "快速测试中..." : "快速测试"}
              </button>
              <button
                type="button"
                onClick={() => runTest("full")}
                disabled={isRunning}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:bg-slate-500"
              >
                {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                {isRunning && runningMode === "full" ? "完整测试中..." : "完整测试"}
              </button>
              <button
                type="button"
                onClick={() => report && download(report.markdown, "Excel-AB测试报告.md", "text/markdown;charset=utf-8")}
                disabled={!report || isRunning}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 px-5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:text-slate-500"
              >
                <Download className="h-4 w-4" />
                下载 Markdown
              </button>
              <button
                type="button"
                onClick={() => report && download(report.csv, "Excel-AB测试评分表.csv", "text/csv;charset=utf-8")}
                disabled={!report || isRunning}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 px-5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:text-slate-500"
              >
                <Table2 className="h-4 w-4" />
                下载 CSV
              </button>
            </div>
          </div>
        </header>

        <section className="mt-5 grid gap-4 lg:grid-cols-4">
          <MetricCard label="测试状态" value={isRunning ? "运行中" : startedText} />
          <MetricCard label="样本数量" value={report ? `${report.summary.sampleCount}` : `${currentPlan.sampleCount}`} />
          <MetricCard label="新版胜出" value={report ? `${report.summary.newWinCount}/${report.summary.sampleCount}` : "-"} />
          <MetricCard label="Token 降幅" value={report ? formatRate(report.summary.tokenReductionRate) : "-"} />
        </section>

        <section className="mt-5 grid gap-4 lg:grid-cols-2">
          <PlanCard
            title="快速测试"
            active={selectedMode === "quick" && !report}
            sampleCount={testPlans.quick.sampleCount}
            oldCalls={testPlans.quick.oldCalls}
            newCalls={testPlans.quick.newCalls}
            estimatedOldTokens={testPlans.quick.estimatedOldTokens}
            estimatedNewTokens={testPlans.quick.estimatedNewTokens}
          />
          <PlanCard
            title="完整测试"
            active={selectedMode === "full" && !report}
            sampleCount={testPlans.full.sampleCount}
            oldCalls={testPlans.full.oldCalls}
            newCalls={testPlans.full.newCalls}
            estimatedOldTokens={testPlans.full.estimatedOldTokens}
            estimatedNewTokens={testPlans.full.estimatedNewTokens}
          />
        </section>

        {error ? (
          <div className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-100">
            {error}
          </div>
        ) : null}

        {isRunning ? (
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-200" />
            <p className="mt-4 text-sm font-medium text-white">正在自动生成测试文件并循环调用两个流程。</p>
            <p className="mt-2 text-xs text-slate-400">
              {runningMode === "full" ? "10 份样本 × 2 个流程" : "2 份样本 × 2 个流程"}，期间无需手动上传。
            </p>
          </div>
        ) : null}

        {report ? (
          <>
            <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <h2 className="text-lg font-semibold text-white">综合结论</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <SummaryBlock label="旧版平均分" value={report.summary.oldAverageScore.toFixed(1)} />
                <SummaryBlock label="新版平均分" value={report.summary.newAverageScore.toFixed(1)} />
                <SummaryBlock label="平均 Token" value={`${formatNumber(report.summary.oldAverageTokens)} / ${formatNumber(report.summary.newAverageTokens)}`} />
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <SummaryBlock label="实际 Token：旧版" value={formatNumber(report.summary.actualTokens.old)} />
                <SummaryBlock label="实际 Token：新版" value={formatNumber(report.summary.actualTokens.newer)} />
                <SummaryBlock label="实际 Token：总计" value={formatNumber(report.summary.actualTokens.total)} />
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <SummaryBlock label="成功率" value={`${report.summary.oldSuccessRate.toFixed(0)}% / ${report.summary.newSuccessRate.toFixed(0)}%`} />
                <SummaryBlock label="异常识别" value={`${report.summary.oldAverageAnomalyScore.toFixed(1)} / ${report.summary.newAverageAnomalyScore.toFixed(1)}`} />
                <SummaryBlock label="替换判断" value={report.summary.upgradeDecision} />
              </div>
              <p className="mt-4 rounded-xl bg-slate-900/70 px-4 py-3 text-sm leading-7 text-slate-200">
                {report.summary.conclusion}
              </p>
            </section>

            <section className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">调试信息</h2>
                  <p className="mt-1 text-sm text-amber-100/80">用于定位新版是否真正执行、分支是否命中、返回结果是否为空。</p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <DebugConfigCard title="旧版配置" debug={report.debug.old} />
                <DebugConfigCard title="新版 V1.3.2 配置" debug={report.debug.newer} />
              </div>

              <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-slate-950/70">
                <div className="overflow-x-auto">
                  <table className="min-w-[1180px] w-full border-collapse text-sm">
                    <thead className="bg-white/5 text-left text-slate-300">
                      <tr>
                        <Th>文件名</Th>
                        <Th>旧版 HTTP Status</Th>
                        <Th>新版 HTTP Status</Th>
                        <Th>旧版返回长度</Th>
                        <Th>新版返回长度</Th>
                        <Th>旧版错误信息</Th>
                        <Th>新版错误信息</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.rows.map((row) => (
                        <tr key={`${row.sampleId}-debug`} className="border-t border-white/10 align-top">
                          <Td>
                            <div className="font-semibold text-white">{row.fileName}</div>
                            <div className="mt-1 text-xs text-slate-400">{row.sampleId}</div>
                          </Td>
                          <Td>{formatHttpStatus(row.old.debug)}</Td>
                          <Td>{formatHttpStatus(row.newer.debug)}</Td>
                          <Td>{formatNumber(row.old.debug.responseLength)}</Td>
                          <Td>{formatNumber(row.newer.debug.responseLength)}</Td>
                          <Td>
                            <DebugErrorText debug={row.old.debug} fallback={row.old.error} />
                          </Td>
                          <Td>
                            <DebugErrorText debug={row.newer.debug} fallback={row.newer.error} />
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {report.rows.map((row) => (
                  <div key={`${row.sampleId}-preview`} className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
                    <div className="text-sm font-semibold text-white">{row.fileName}</div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <ResponsePreview title="旧版返回预览" value={row.old.debug.responsePreview} />
                      <ResponsePreview title="新版返回预览" value={row.newer.debug.responsePreview} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white text-slate-950 shadow-2xl shadow-black/20">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-lg font-semibold">测试明细</h2>
                <p className="mt-1 text-sm text-slate-500">单元格格式为：旧版 / 新版</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-[1120px] w-full border-collapse text-sm">
                  <thead className="bg-slate-50 text-left text-slate-600">
                    <tr>
                      <Th>文件名</Th>
                      <Th>字段识别</Th>
                      <Th>数据完整性</Th>
                      <Th>异常识别</Th>
                      <Th>Token</Th>
                      <Th>成功率</Th>
                      <Th>综合评分</Th>
                      <Th>建议</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.rows.map((row) => (
                      <tr key={row.sampleId} className="border-t border-slate-100 align-top">
                        <Td>
                          <div className="font-semibold text-slate-950">{row.fileName}</div>
                          <div className="mt-1 max-w-xs text-xs leading-5 text-slate-500">{row.description}</div>
                        </Td>
                        <Td>{scorePair(row.old.fieldScore, row.newer.fieldScore)}</Td>
                        <Td>{scorePair(row.old.integrityScore, row.newer.integrityScore)}</Td>
                        <Td>{scorePair(row.old.anomalyScore, row.newer.anomalyScore)}</Td>
                        <Td>{formatNumber(row.old.tokens)} / {formatNumber(row.newer.tokens)}</Td>
                        <Td>{row.old.success ? 100 : 0} / {row.newer.success ? 100 : 0}</Td>
                        <Td>
                          <span className={row.newer.overallScore >= row.old.overallScore ? "font-semibold text-emerald-700" : "font-semibold text-red-700"}>
                            {row.old.overallScore.toFixed(1)} / {row.newer.overallScore.toFixed(1)}
                          </span>
                        </Td>
                        <Td>
                          <div className="font-semibold">{row.recommendation}</div>
                          <div className="mt-1 max-w-xs text-xs leading-5 text-slate-500">{row.reason}</div>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function PlanCard({
  title,
  active,
  sampleCount,
  oldCalls,
  newCalls,
  estimatedOldTokens,
  estimatedNewTokens
}: {
  title: string;
  active: boolean;
  sampleCount: number;
  oldCalls: number;
  newCalls: number;
  estimatedOldTokens: number;
  estimatedNewTokens: number;
}) {
  return (
    <div className={active ? "rounded-2xl border border-blue-300/40 bg-blue-400/10 p-5" : "rounded-2xl border border-white/10 bg-white/[0.04] p-5"}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">{sampleCount} 个样本</span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-900/70 px-4 py-3">
          <p className="text-xs text-slate-400">预计调用次数</p>
          <p className="mt-2 text-sm text-slate-100">旧版：{oldCalls} 次</p>
          <p className="mt-1 text-sm text-slate-100">新版：{newCalls} 次</p>
          <p className="mt-1 text-sm font-semibold text-white">总计：{oldCalls + newCalls} 次</p>
        </div>
        <div className="rounded-xl bg-slate-900/70 px-4 py-3">
          <p className="text-xs text-slate-400">预计 Token 消耗（估算）</p>
          <p className="mt-2 text-sm text-slate-100">旧版：{formatNumber(estimatedOldTokens)}</p>
          <p className="mt-1 text-sm text-slate-100">新版：{formatNumber(estimatedNewTokens)}</p>
          <p className="mt-1 text-sm font-semibold text-white">总计：{formatNumber(estimatedOldTokens + estimatedNewTokens)}</p>
        </div>
      </div>
    </div>
  );
}

function SummaryBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function DebugConfigCard({ title, debug }: { title: string; debug: ConfigDebug }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <dl className="mt-3 grid gap-2 text-sm">
        <DebugLine label="API Key 是否存在" value={debug.apiKeyPresent ? "是" : "否"} strong={debug.apiKeyPresent} />
        <DebugLine label="专用 API Key 是否存在" value={debug.specificApiKeyPresent ? "是" : "否"} strong={debug.specificApiKeyPresent} />
        <DebugLine label="API Key 来源" value={debug.apiKeySource} />
        <DebugLine label="Tool Type" value={debug.toolType} />
        <DebugLine label="文件变量" value={debug.fileVariable} />
      </dl>
    </div>
  );
}

function DebugLine({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-2 last:border-b-0 last:pb-0">
      <dt className="text-slate-400">{label}</dt>
      <dd className={strong ? "font-semibold text-emerald-300" : "font-medium text-slate-100"}>{value}</dd>
    </div>
  );
}

function DebugErrorText({ debug, fallback }: { debug: VariantDebug; fallback: string }) {
  const message = debug.errorMessage || fallback || "-";
  return <div className="max-w-xs whitespace-pre-wrap break-words text-xs leading-5 text-amber-100">{message}</div>;
}

function ResponsePreview({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold text-slate-300">{title}</div>
      <pre className="mt-2 max-h-44 overflow-auto rounded-lg border border-white/10 bg-black/30 p-3 text-xs leading-5 text-slate-300">
        {value || "无返回内容"}
      </pre>
    </div>
  );
}

function formatHttpStatus(debug: VariantDebug) {
  if (debug.workflowStatus !== null) return String(debug.workflowStatus);
  if (debug.uploadStatus !== null) return `上传 ${debug.uploadStatus}`;
  return debug.requestSent ? "请求中断" : "未发送";
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-semibold">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-4">{children}</td>;
}

function scorePair(oldScore: number, newScore: number) {
  return (
    <span className={newScore >= oldScore ? "font-medium text-emerald-700" : "font-medium text-red-700"}>
      {oldScore.toFixed(0)} / {newScore.toFixed(0)}
    </span>
  );
}

function formatNumber(value: number | null) {
  if (value === null || value === undefined) return "-";
  return Math.round(value).toLocaleString("zh-CN");
}

function formatRate(value: number | null) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "-";
  return `${(value * 100).toFixed(1)}%`;
}
