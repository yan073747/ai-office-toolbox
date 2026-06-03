import { extractDifyResult, toDifyDocument } from "@/lib/dify";

type CellValue = string | number | null;

type SheetData = {
  name: string;
  rows: CellValue[][];
};

export type ExcelSample = {
  id: string;
  fileName: string;
  description: string;
  sheets: SheetData[];
  expected: {
    rowCount: number;
    headers: string[];
    importantColumns: string[];
    numericColumns: string[];
    dateColumns: string[];
    durationColumns: string[];
    anomalyKeywords: string[];
    expectedWarnings?: string[];
  };
};

type VariantConfig = {
  label: "旧版" | "新版V1.3.2";
  apiKey: string;
  apiKeySource: string;
  specificApiKeyPresent: boolean;
  toolType: string;
  fileVariable: string;
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

type VariantResult = {
  label: "旧版" | "新版V1.3.2";
  success: boolean;
  resultText: string;
  error: string;
  tokens: number | null;
  elapsedMs: number;
  fieldScore: number;
  integrityScore: number;
  anomalyScore: number;
  typeScore: number;
  friendlyScore: number;
  successScore: number;
  tokenScore: number;
  overallScore: number;
  debug: VariantDebug;
};

export type ExcelAbTestRow = {
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

export type ExcelAbTestReport = {
  generatedAt: string;
  mode: ExcelAbTestMode;
  rows: ExcelAbTestRow[];
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

const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
export type ExcelAbTestMode = "quick" | "full";

const ESTIMATED_OLD_TOKENS_PER_CALL = 80000;
const ESTIMATED_NEW_TOKENS_PER_CALL = 8000;
const DIFY_USER = "website-user";
const AB_TEST_TIMEOUT_MS = 180_000;

type ConfigDebug = {
  apiKeyPresent: boolean;
  specificApiKeyPresent: boolean;
  apiKeySource: string;
  toolType: string;
  fileVariable: string;
};

type DifyHttpDebugResponse = {
  ok: boolean;
  status: number;
  data: unknown;
  rawText: string;
};

export async function runExcelAbTest(mode: ExcelAbTestMode = "quick"): Promise<ExcelAbTestReport> {
  const samples = selectSamples(mode);
  const oldConfig = getVariantConfig("旧版");
  const newConfig = getVariantConfig("新版V1.3.2");
  const rows: ExcelAbTestRow[] = [];

  for (const sample of samples) {
    const old = await runVariant(sample, oldConfig);
    const newer = await runVariant(sample, newConfig);
    applyRelativeTokenScores(old, newer);

    rows.push({
      sampleId: sample.id,
      fileName: sample.fileName,
      description: sample.description,
      expectedRows: sample.expected.rowCount,
      expectedColumns: sample.expected.headers.length,
      old,
      newer,
      ...buildRecommendation(old, newer)
    });
  }

  const summary = buildReportSummary(rows);
  const debug = {
    old: buildConfigDebug(oldConfig),
    newer: buildConfigDebug(newConfig)
  };
  const markdown = buildMarkdownReport(rows, summary, debug);
  const csv = buildCsvReport(rows);

  return {
    generatedAt: new Date().toISOString(),
    mode,
    rows,
    debug,
    summary,
    markdown,
    csv
  };
}

function selectSamples(mode: ExcelAbTestMode) {
  const samples = createExcelSamples();
  if (mode === "quick") {
    return samples.filter((sample) => sample.id === "standard_sales" || sample.id === "finance_budget");
  }

  return samples;
}

function getVariantConfig(label: "旧版" | "新版V1.3.2"): VariantConfig {
  const prefix = label === "旧版" ? "OLD" : "NEW";
  const apiKeyEnvName = `EXCEL_AB_${prefix}_API_KEY`;
  const apiKeyCandidates = [
    { name: apiKeyEnvName, value: process.env[apiKeyEnvName] },
    { name: "TOOLBOX_OFFICE_API_KEY", value: process.env.TOOLBOX_OFFICE_API_KEY },
    { name: "DIFY_EXCEL_API_KEY", value: process.env.DIFY_EXCEL_API_KEY },
    { name: "EXCEL_API_KEY", value: process.env.EXCEL_API_KEY }
  ];
  const matchedApiKey = apiKeyCandidates.find((item) => Boolean(item.value));

  return {
    label,
    apiKey: matchedApiKey?.value || "",
    apiKeySource: matchedApiKey?.name || "未配置",
    specificApiKeyPresent: Boolean(process.env[apiKeyEnvName]),
    toolType:
      process.env[`EXCEL_AB_${prefix}_TOOL_TYPE`] ||
      "excel_analysis",
    fileVariable: process.env[`EXCEL_AB_${prefix}_FILE_VARIABLE`] || "files"
  };
}

function buildConfigDebug(config: VariantConfig): ConfigDebug {
  return {
    apiKeyPresent: Boolean(config.apiKey),
    specificApiKeyPresent: config.specificApiKeyPresent,
    apiKeySource: config.apiKeySource,
    toolType: config.toolType,
    fileVariable: config.fileVariable
  };
}

async function runVariant(sample: ExcelSample, config: VariantConfig): Promise<VariantResult> {
  const startedAt = Date.now();
  const debug = createVariantDebug(config);

  try {
    if (!config.apiKey) {
      throw new Error(`${config.label} API Key 未配置`);
    }

    const file = new File([createXlsxBuffer(sample.sheets)], sample.fileName, { type: XLSX_MIME });
    const uploadedFile = await uploadFileForAbTest(config.apiKey, file, debug);
    const inputs = buildWorkflowInputs(config, uploadedFile.id);
    const response = await runWorkflowForAbTest(config.apiKey, inputs, debug);
    const resultText = extractDifyResult(response);
    const tokens = extractTotalTokens(response);
    const elapsedMs = Date.now() - startedAt;
    const emptyResultMessage = resultText.trim() ? "" : inferEmptyResultMessage(response, tokens, config.toolType);
    if (emptyResultMessage) {
      debug.errorMessage = emptyResultMessage;
    }

    const scores = scoreOutput(sample, resultText, emptyResultMessage, Boolean(resultText.trim()));

    return {
      label: config.label,
      success: Boolean(resultText.trim()),
      resultText,
      error: emptyResultMessage,
      tokens,
      elapsedMs,
      tokenScore: 0,
      ...scores,
      debug
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    const elapsedMs = Date.now() - startedAt;
    debug.errorMessage = message;
    const scores = scoreOutput(sample, "", message, false);

    return {
      label: config.label,
      success: false,
      resultText: "",
      error: message,
      tokens: null,
      elapsedMs,
      tokenScore: 0,
      ...scores,
      debug
    };
  }
}

function createVariantDebug(config: VariantConfig): VariantDebug {
  return {
    apiKeyPresent: Boolean(config.apiKey),
    apiKeySource: config.apiKeySource,
    specificApiKeyPresent: config.specificApiKeyPresent,
    toolType: config.toolType,
    fileVariable: config.fileVariable,
    requestSent: false,
    uploadStatus: null,
    workflowStatus: null,
    responseLength: 0,
    responsePreview: "",
    errorMessage: ""
  };
}

async function uploadFileForAbTest(apiKey: string, file: File, debug: VariantDebug) {
  const formData = new FormData();
  formData.append("file", file, file.name);
  formData.append("user", DIFY_USER);

  const response = await fetchDifyForAbTest(`${getDifyBaseUrl()}/files/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`
    },
    body: formData
  });

  debug.uploadStatus = response.status;

  if (!response.ok) {
    throw new Error(readDifyErrorMessage(response.data) || `文件上传失败，HTTP ${response.status}`);
  }

  const uploadFileId = readRecordValue(response.data, "id");
  if (typeof uploadFileId !== "string" || !uploadFileId) {
    throw new Error("文件上传成功但未返回 upload_file_id");
  }

  return {
    id: uploadFileId
  };
}

async function runWorkflowForAbTest(apiKey: string, inputs: Record<string, unknown>, debug: VariantDebug) {
  const requestPayload = {
    inputs,
    response_mode: "blocking",
    user: DIFY_USER
  };

  debug.requestSent = true;
  console.log("Excel AB Dify request payload:", {
    inputs,
    response_mode: requestPayload.response_mode,
    user: requestPayload.user,
    authHeaderPresent: Boolean(apiKey)
  });

  const response = await fetchDifyForAbTest(`${getDifyBaseUrl()}/workflows/run`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestPayload)
  });

  debug.workflowStatus = response.status;
  debug.responseLength = response.rawText.length;
  debug.responsePreview = trimForDebug(response.rawText, 1200);

  console.log("Excel AB Dify response status:", response.status);
  console.log("Excel AB Dify response body:", response.data || response.rawText);

  if (!response.ok) {
    throw new Error(readDifyErrorMessage(response.data) || `Workflow 调用失败，HTTP ${response.status}`);
  }

  return response.data;
}

async function fetchDifyForAbTest(url: string, init: RequestInit): Promise<DifyHttpDebugResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AB_TEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal
    });
    const rawText = await response.text();
    return {
      ok: response.ok,
      status: response.status,
      data: safeJsonParse(rawText),
      rawText
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("请求超时");
    }

    throw new Error(error instanceof Error ? error.message : "网络请求失败");
  } finally {
    clearTimeout(timer);
  }
}

function getDifyBaseUrl() {
  return process.env.DIFY_BASE_URL || "https://api.dify.ai/v1";
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function readRecordValue(source: unknown, key: string) {
  if (!source || typeof source !== "object") return undefined;
  return (source as Record<string, unknown>)[key];
}

function readNestedRecordValue(source: unknown, path: string[]) {
  return path.reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[key];
  }, source);
}

function readDifyErrorMessage(source: unknown) {
  const candidates = [
    readRecordValue(source, "message"),
    readRecordValue(source, "error"),
    readRecordValue(source, "code"),
    readNestedRecordValue(source, ["data", "error"]),
    readNestedRecordValue(source, ["data", "message"])
  ];
  const message = candidates.find((item) => typeof item === "string" && item.trim());
  return typeof message === "string" ? message : "";
}

function inferEmptyResultMessage(response: unknown, tokens: number | null, toolType: string) {
  const difyMessage = readDifyErrorMessage(response);
  if (difyMessage) return difyMessage;

  const outputs = readNestedRecordValue(response, ["data", "outputs"]) || readRecordValue(response, "outputs");
  if (outputs && typeof outputs === "object" && Object.keys(outputs).length === 0) {
    if (tokens === 0) {
      return `Dify 返回 outputs 为空且 total_tokens 为 0，可能 tool_type 未命中：${toolType}`;
    }

    return "Dify 返回 outputs 为空";
  }

  if (tokens === 0) {
    return `Dify total_tokens 为 0，可能 workflow 分支未执行：${toolType}`;
  }

  return "Dify 未返回可展示结果";
}

function trimForDebug(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

function buildWorkflowInputs(config: VariantConfig, uploadFileId: string) {
  const documentValue = toDifyDocument(uploadFileId);
  const inputs: Record<string, unknown> = {
    tool_type: config.toolType
  };

  inputs[config.fileVariable] = [documentValue];
  return inputs;
}

function scoreOutput(sample: ExcelSample, resultText: string, error: string, success: boolean) {
  const text = normalizeText(`${resultText}\n${error}`);
  const fieldScore = scoreFields(sample, text);
  const typeScore = scoreTypes(sample, text);
  const integrityScore = scoreIntegrity(sample, text, success);
  const anomalyScore = scoreAnomalies(sample, text);
  const friendlyScore = scoreFriendlyPrompt(sample, text, success);
  const successScore = success ? 100 : 0;

  return {
    fieldScore,
    integrityScore,
    anomalyScore,
    typeScore,
    friendlyScore,
    successScore,
    overallScore: 0
  };
}

function applyRelativeTokenScores(oldResult: VariantResult, newResult: VariantResult) {
  oldResult.tokenScore = scoreTokenUsage(oldResult.tokens, oldResult.tokens, newResult.tokens);
  newResult.tokenScore = scoreTokenUsage(newResult.tokens, oldResult.tokens, newResult.tokens);
  oldResult.overallScore = calcOverallScore(oldResult);
  newResult.overallScore = calcOverallScore(newResult);
}

function calcOverallScore(result: VariantResult) {
  return roundScore(
    result.fieldScore * 0.4 +
      result.integrityScore * 0.25 +
      result.anomalyScore * 0.15 +
      result.tokenScore * 0.1 +
      result.successScore * 0.1
  );
}

function scoreTokenUsage(tokens: number | null, oldTokens: number | null, newTokens: number | null) {
  if (!tokens || tokens <= 0) return 0;
  if (!oldTokens || !newTokens || oldTokens <= 0 || newTokens <= 0) return 70;

  const minTokens = Math.min(oldTokens, newTokens);
  const ratio = tokens / minTokens;

  if (ratio <= 1.05) return 100;
  if (ratio <= 1.5) return 80;
  if (ratio <= 2) return 60;
  if (ratio <= 4) return 35;
  return 10;
}

function scoreFields(sample: ExcelSample, text: string) {
  const allFields = sample.expected.headers;
  if (!allFields.length) return 100;

  const found = allFields.filter((field) => text.includes(normalizeText(field))).length;
  const importantFound = sample.expected.importantColumns.filter((field) => text.includes(normalizeText(field))).length;
  const base = (found / allFields.length) * 70;
  const important = sample.expected.importantColumns.length
    ? (importantFound / sample.expected.importantColumns.length) * 30
    : 30;

  return roundScore(base + important);
}

function scoreTypes(sample: ExcelSample, text: string) {
  const checks = [
    { names: sample.expected.numericColumns, keywords: ["数值", "金额", "min", "max", "mean", "平均", "最大", "最小"] },
    { names: sample.expected.dateColumns, keywords: ["日期", "最早", "最晚", "跨度"] },
    { names: sample.expected.durationColumns, keywords: ["时长", "秒", "分钟", "平均时长"] }
  ];

  let total = 0;
  let matched = 0;

  for (const check of checks) {
    for (const name of check.names) {
      total += 1;
      const fieldHit = text.includes(normalizeText(name));
      const keywordHit = check.keywords.some((keyword) => text.includes(normalizeText(keyword)));
      if (fieldHit && keywordHit) matched += 1;
    }
  }

  if (total === 0) return 85;
  return roundScore((matched / total) * 100);
}

function scoreIntegrity(sample: ExcelSample, text: string, success: boolean) {
  if (!success) return 0;

  const rowHit = containsApproxNumber(text, sample.expected.rowCount);
  const columnHit = containsApproxNumber(text, sample.expected.headers.length);
  const importantHit = sample.expected.importantColumns.filter((field) => text.includes(normalizeText(field))).length;
  const importantScore = sample.expected.importantColumns.length
    ? (importantHit / sample.expected.importantColumns.length) * 60
    : 60;

  return roundScore(importantScore + (rowHit ? 25 : 0) + (columnHit ? 15 : 0));
}

function scoreAnomalies(sample: ExcelSample, text: string) {
  if (!sample.expected.anomalyKeywords.length) {
    return text.includes("异常") && text.includes("未检测到") ? 95 : 80;
  }

  const found = sample.expected.anomalyKeywords.filter((keyword) => text.includes(normalizeText(keyword))).length;
  const generic = ["异常", "缺失", "离群", "风险", "0值", "空值"].filter((keyword) => text.includes(normalizeText(keyword))).length;
  return roundScore(Math.min(100, (found / sample.expected.anomalyKeywords.length) * 75 + generic * 6));
}

function scoreFriendlyPrompt(sample: ExcelSample, text: string, success: boolean) {
  const warnings = sample.expected.expectedWarnings || [];
  if (success && warnings.length === 0) return 85;

  const hit = warnings.filter((warning) => text.includes(normalizeText(warning))).length;
  if (warnings.length > 0) return roundScore((hit / warnings.length) * 100);

  return text.includes("请") || text.includes("建议") || text.includes("无法") ? 80 : 40;
}

function buildRecommendation(oldResult: VariantResult, newResult: VariantResult) {
  const scoreDelta = newResult.overallScore - oldResult.overallScore;
  const tokenDelta =
    oldResult.tokens && newResult.tokens ? (oldResult.tokens - newResult.tokens) / oldResult.tokens : null;

  if (newResult.success && scoreDelta >= 5 && (tokenDelta === null || tokenDelta >= 0.15)) {
    return {
      recommendation: "建议替换" as const,
      reason: `新版综合评分提升 ${scoreDelta.toFixed(1)} 分，Token 降幅 ${formatRate(tokenDelta)}。`
    };
  }

  if (newResult.success && scoreDelta >= -3) {
    return {
      recommendation: "继续观察" as const,
      reason: `新版综合评分差异 ${scoreDelta.toFixed(1)} 分，建议结合人工抽查确认。`
    };
  }

  return {
    recommendation: "不建议替换" as const,
    reason: `新版综合评分低于旧版 ${Math.abs(scoreDelta).toFixed(1)} 分，需继续优化。`
  };
}

function buildReportSummary(rows: ExcelAbTestRow[]) {
  const oldAverageScore = average(rows.map((row) => row.old.overallScore));
  const newAverageScore = average(rows.map((row) => row.newer.overallScore));
  const oldAverageTokens = averageNullable(rows.map((row) => row.old.tokens));
  const newAverageTokens = averageNullable(rows.map((row) => row.newer.tokens));
  const oldActualTokens = sumTokens(rows.map((row) => row.old.tokens));
  const newActualTokens = sumTokens(rows.map((row) => row.newer.tokens));
  const tokenReductionRate =
    oldAverageTokens && newAverageTokens ? (oldAverageTokens - newAverageTokens) / oldAverageTokens : null;
  const newWinCount = rows.filter((row) => row.newer.overallScore > row.old.overallScore).length;
  const oldSuccessRate = average(rows.map((row) => (row.old.success ? 100 : 0)));
  const newSuccessRate = average(rows.map((row) => (row.newer.success ? 100 : 0)));
  const oldAverageAnomalyScore = average(rows.map((row) => row.old.anomalyScore));
  const newAverageAnomalyScore = average(rows.map((row) => row.newer.anomalyScore));
  const callCount = {
    old: rows.length,
    newer: rows.length,
    total: rows.length * 2
  };
  const estimatedTokens = {
    old: rows.length * ESTIMATED_OLD_TOKENS_PER_CALL,
    newer: rows.length * ESTIMATED_NEW_TOKENS_PER_CALL,
    total: rows.length * (ESTIMATED_OLD_TOKENS_PER_CALL + ESTIMATED_NEW_TOKENS_PER_CALL)
  };
  const actualTokens = {
    old: oldActualTokens,
    newer: newActualTokens,
    total: oldActualTokens + newActualTokens
  };
  const upgradeReady =
    newAverageScore >= oldAverageScore &&
    newActualTokens > 0 &&
    oldActualTokens > 0 &&
    newActualTokens < oldActualTokens &&
    newSuccessRate >= oldSuccessRate &&
    newAverageAnomalyScore >= oldAverageAnomalyScore;
  const upgradeDecision: ExcelAbTestReport["summary"]["upgradeDecision"] = upgradeReady ? "【建议升级到 V1.3.2】" : "【保留当前版本】";
  const conclusion = upgradeReady
    ? "新版综合评分、Token、成功率和异常识别均满足替换标准。"
    : "新版尚未同时满足综合评分、Token、成功率和异常识别四项替换标准。";

  return {
    sampleCount: rows.length,
    callCount,
    estimatedTokens,
    actualTokens,
    oldSuccessRate,
    newSuccessRate,
    oldAverageAnomalyScore,
    newAverageAnomalyScore,
    oldAverageScore,
    newAverageScore,
    oldAverageTokens,
    newAverageTokens,
    tokenReductionRate,
    newWinCount,
    conclusion,
    upgradeDecision
  };
}

function buildMarkdownReport(
  rows: ExcelAbTestRow[],
  summary: ExcelAbTestReport["summary"],
  debug: ExcelAbTestReport["debug"]
) {
  const lines = [
    "# Excel 自动化 AB 测试报告",
    "",
    `生成时间：${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}`,
    "",
    "## 总览",
    "",
    `- 样本数量：${summary.sampleCount}`,
    `- 旧版平均分：${summary.oldAverageScore.toFixed(1)}`,
    `- 新版平均分：${summary.newAverageScore.toFixed(1)}`,
    `- 旧版平均 Token：${formatNumber(summary.oldAverageTokens)}`,
    `- 新版平均 Token：${formatNumber(summary.newAverageTokens)}`,
    `- 实际 Token 总计：旧版 ${formatNumber(summary.actualTokens.old)} / 新版 ${formatNumber(summary.actualTokens.newer)} / 总计 ${formatNumber(summary.actualTokens.total)}`,
    `- 成功率：旧版 ${summary.oldSuccessRate.toFixed(1)}% / 新版 ${summary.newSuccessRate.toFixed(1)}%`,
    `- 异常识别平均分：旧版 ${summary.oldAverageAnomalyScore.toFixed(1)} / 新版 ${summary.newAverageAnomalyScore.toFixed(1)}`,
    `- Token 平均降幅：${formatRate(summary.tokenReductionRate)}`,
    `- 新版胜出样本数：${summary.newWinCount}/${summary.sampleCount}`,
    `- 替换判断：${summary.upgradeDecision}`,
    `- 结论：${summary.conclusion}`,
    "",
    "## 调试信息",
    "",
    `- 旧版 API Key 是否存在：${debug.old.apiKeyPresent ? "是" : "否"}`,
    `- 新版 API Key 是否存在：${debug.newer.apiKeyPresent ? "是" : "否"}`,
    `- 旧版 API Key 来源：${debug.old.apiKeySource}`,
    `- 新版 API Key 来源：${debug.newer.apiKeySource}`,
    `- 旧版 Tool Type：${debug.old.toolType}`,
    `- 新版 Tool Type：${debug.newer.toolType}`,
    "",
    "## 明细对比",
    "",
    "| 文件名 | 字段识别 | 数据完整性 | 异常值识别 | Token | 成功率 | 综合评分 | 建议替换 |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |"
  ];

  for (const row of rows) {
    lines.push(
      `| ${row.fileName} | ` +
        `${row.old.fieldScore.toFixed(0)} / ${row.newer.fieldScore.toFixed(0)} | ` +
        `${row.old.integrityScore.toFixed(0)} / ${row.newer.integrityScore.toFixed(0)} | ` +
        `${row.old.anomalyScore.toFixed(0)} / ${row.newer.anomalyScore.toFixed(0)} | ` +
        `${formatNumber(row.old.tokens)} / ${formatNumber(row.newer.tokens)} | ` +
        `${row.old.success ? 100 : 0} / ${row.newer.success ? 100 : 0} | ` +
        `${row.old.overallScore.toFixed(1)} / ${row.newer.overallScore.toFixed(1)} | ` +
        `${row.recommendation} |`
    );
  }

  lines.push("", "## 样本说明", "");

  for (const row of rows) {
    lines.push(
      `### ${row.fileName}`,
      "",
      `- 场景：${row.description}`,
      `- 预期行数：${row.expectedRows}`,
      `- 预期列数：${row.expectedColumns}`,
      `- 旧版耗时：${(row.old.elapsedMs / 1000).toFixed(1)}s`,
      `- 新版耗时：${(row.newer.elapsedMs / 1000).toFixed(1)}s`,
      `- 判断：${row.reason}`,
      ""
    );
  }

  return lines.join("\n");
}

function buildCsvReport(rows: ExcelAbTestRow[]) {
  const header = [
    "文件名",
    "场景",
    "旧版字段识别",
    "新版字段识别",
    "旧版数据完整性",
    "新版数据完整性",
    "旧版异常识别",
    "新版异常识别",
    "旧版Token",
    "新版Token",
    "旧版综合评分",
    "新版综合评分",
    "建议替换",
    "原因"
  ];

  const body = rows.map((row) => [
    row.fileName,
    row.description,
    row.old.fieldScore,
    row.newer.fieldScore,
    row.old.integrityScore,
    row.newer.integrityScore,
    row.old.anomalyScore,
    row.newer.anomalyScore,
    row.old.tokens ?? "",
    row.newer.tokens ?? "",
    row.old.overallScore,
    row.newer.overallScore,
    row.recommendation,
    row.reason
  ]);

  return [header, ...body].map((line) => line.map(escapeCsv).join(",")).join("\n");
}

function createExcelSamples(): ExcelSample[] {
  return [
    createSalesSample(),
    createFinanceSample(),
    createProjectSample(),
    createNoHeaderSample(),
    createMultiSheetSample(),
    createMissingAnomalySample(),
    createVideoDurationSample(),
    createMixedTextNumberSample(),
    createEmptyTableSample(),
    createLargeOperationalSample()
  ];
}

function createSalesSample(): ExcelSample {
  const headers = ["日期", "区域", "产品", "销售额", "成本", "利润", "数量"];
  const rows: CellValue[][] = [headers];
  const regions = ["华东", "华南", "华北", "西南"];
  const products = ["标准版", "专业版", "企业版"];

  for (let index = 0; index < 120; index++) {
    const sales = index === 88 ? 980000 : 18000 + (index % 20) * 850;
    const cost = Math.round(sales * (0.48 + (index % 5) * 0.03));
    rows.push([
      dateString(2026, 1, index + 1),
      regions[index % regions.length],
      products[index % products.length],
      sales,
      cost,
      sales - cost,
      20 + (index % 35)
    ]);
  }

  return sample("standard_sales.xlsx", "标准销售表，包含销售额异常高值。", [{ name: "销售数据", rows }], {
    rowCount: 120,
    headers,
    importantColumns: ["日期", "区域", "产品", "销售额", "成本", "利润"],
    numericColumns: ["销售额", "成本", "利润", "数量"],
    dateColumns: ["日期"],
    durationColumns: [],
    anomalyKeywords: ["销售额", "异常", "离群", "980000"]
  });
}

function createFinanceSample(): ExcelSample {
  const headers = ["月份", "科目", "部门", "预算", "实际", "差异", "审批状态"];
  const rows: CellValue[][] = [headers];
  const subjects = ["市场费", "差旅费", "服务器", "采购", "培训"];
  const departments = ["运营部", "销售部", "技术部", "财务部"];

  for (let index = 0; index < 90; index++) {
    const budget = 20000 + (index % 12) * 1200;
    const actual = index === 42 ? budget * 3 : budget + ((index % 9) - 4) * 900;
    rows.push([
      `2026-${String((index % 12) + 1).padStart(2, "0")}-01`,
      subjects[index % subjects.length],
      departments[index % departments.length],
      budget,
      actual,
      actual - budget,
      index % 17 === 0 ? "" : "已审批"
    ]);
  }

  return sample("finance_budget.xlsx", "财务预算表，包含预算超支和审批状态缺失。", [{ name: "预算执行", rows }], {
    rowCount: 90,
    headers,
    importantColumns: ["月份", "科目", "部门", "预算", "实际", "差异"],
    numericColumns: ["预算", "实际", "差异"],
    dateColumns: ["月份"],
    durationColumns: [],
    anomalyKeywords: ["超支", "缺失", "审批", "差异"]
  });
}

function createProjectSample(): ExcelSample {
  const headers = ["任务ID", "项目", "负责人", "开始日期", "截止日期", "状态", "进度%", "工时"];
  const rows: CellValue[][] = [headers];
  const owners = ["张三", "李四", "王五", "赵六"];
  const statuses = ["未开始", "进行中", "已完成", "延期"];

  for (let index = 0; index < 80; index++) {
    rows.push([
      `TASK-${String(index + 1).padStart(4, "0")}`,
      index % 2 ? "CRM升级" : "AI办公工具箱",
      owners[index % owners.length],
      dateString(2026, 2, index + 1),
      dateString(2026, 2, index + 8),
      statuses[index % statuses.length],
      index === 65 ? 0 : Math.min(100, (index % 12) * 9),
      index === 31 ? 260 : 4 + (index % 18)
    ]);
  }

  return sample("project_management.xlsx", "项目管理表，包含延期、0进度和超长工时。", [{ name: "项目任务", rows }], {
    rowCount: 80,
    headers,
    importantColumns: ["任务ID", "项目", "负责人", "状态", "进度%", "工时"],
    numericColumns: ["进度%", "工时"],
    dateColumns: ["开始日期", "截止日期"],
    durationColumns: [],
    anomalyKeywords: ["延期", "0", "工时", "异常"]
  });
}

function createNoHeaderSample(): ExcelSample {
  const rows: CellValue[][] = [];
  for (let index = 0; index < 120; index++) {
    rows.push([index + 1, 12 + index * 2, 44 + index * 3, 128 + index * 4, 336 + index * 5, 832 + index * 6]);
  }

  return sample("no_header_numeric.xlsx", "首行全数字的无表头表格，用于验证 Column_x 识别。", [{ name: "无表头", rows }], {
    rowCount: 120,
    headers: ["Column_1", "Column_2", "Column_3", "Column_4", "Column_5", "Column_6"],
    importantColumns: ["Column_1", "Column_2", "Column_3"],
    numericColumns: ["Column_1", "Column_2", "Column_3", "Column_4", "Column_5", "Column_6"],
    dateColumns: [],
    durationColumns: [],
    anomalyKeywords: ["Column", "无表头", "表头"],
    expectedWarnings: ["无表头", "Column"]
  });
}

function createMultiSheetSample(): ExcelSample {
  const salesRows: CellValue[][] = [["日期", "门店", "销售额", "客单价"]];
  const inventoryRows: CellValue[][] = [["SKU", "品类", "库存", "安全库存"]];
  const staffRows: CellValue[][] = [["员工", "部门", "入职日期", "绩效分"]];

  for (let index = 0; index < 60; index++) {
    salesRows.push([dateString(2026, 3, index + 1), `门店${(index % 8) + 1}`, 9000 + index * 120, 80 + (index % 15)]);
    inventoryRows.push([`SKU-${index + 1}`, index % 2 ? "配件" : "主商品", index === 44 ? 0 : 100 + index, 50]);
    staffRows.push([`员工${index + 1}`, index % 2 ? "销售" : "运营", dateString(2025, 1, index + 1), 70 + (index % 25)]);
  }

  return sample("multi_sheet_business.xlsx", "多 Sheet 业务表，覆盖销售、库存、员工信息。", [
    { name: "销售", rows: salesRows },
    { name: "库存", rows: inventoryRows },
    { name: "员工", rows: staffRows }
  ], {
    rowCount: 180,
    headers: ["日期", "门店", "销售额", "客单价", "SKU", "品类", "库存", "安全库存", "员工", "部门", "入职日期", "绩效分"],
    importantColumns: ["销售额", "库存", "绩效分"],
    numericColumns: ["销售额", "客单价", "库存", "安全库存", "绩效分"],
    dateColumns: ["日期", "入职日期"],
    durationColumns: [],
    anomalyKeywords: ["库存", "0", "多", "Sheet"]
  });
}

function createMissingAnomalySample(): ExcelSample {
  const headers = ["客户ID", "城市", "订单金额", "折扣率", "下单日期", "备注"];
  const rows: CellValue[][] = [headers];
  for (let index = 0; index < 150; index++) {
    rows.push([
      `C${String(index + 1).padStart(5, "0")}`,
      index % 13 === 0 ? "" : ["广州", "上海", "北京", "成都"][index % 4],
      index === 77 ? -500 : 200 + (index % 30) * 20,
      index === 98 ? 90 : (index % 10) * 3,
      index % 19 === 0 ? "" : dateString(2026, 4, index + 1),
      index % 31 === 0 ? "人工复核" : ""
    ]);
  }

  return sample("missing_values_anomalies.xlsx", "含缺失值、负订单金额和异常折扣的表格。", [{ name: "异常订单", rows }], {
    rowCount: 150,
    headers,
    importantColumns: ["客户ID", "城市", "订单金额", "折扣率", "下单日期"],
    numericColumns: ["订单金额", "折扣率"],
    dateColumns: ["下单日期"],
    durationColumns: [],
    anomalyKeywords: ["缺失", "负", "折扣", "异常"]
  });
}

function createVideoDurationSample(): ExcelSample {
  const headers = ["日期", "制作人", "游戏名称", "视频长度", "是否检查", "是否通过", "文件夹"];
  const rows: CellValue[][] = [headers];
  const games = ["看门狗3军团", "死亡岛2", "极限竞速5"];

  for (let index = 0; index < 90; index++) {
    const duration = index === 55 ? "00:00:00" : `00:${String(10 + (index % 20)).padStart(2, "0")}:${String(index % 60).padStart(2, "0")}`;
    rows.push([
      dateString(2026, 1, index + 1),
      ["严卓健", "陈佳", "黄敏"][index % 3],
      games[index % games.length],
      duration,
      index % 12 === 0 ? "" : "是",
      index % 14 === 0 ? "" : "通过",
      `yc-${games[index % games.length]}-${index + 1}`
    ]);
  }

  return sample("date_duration_video.xlsx", "含日期、视频时长和中文混数字文本的内容生产表。", [{ name: "视频记录", rows }], {
    rowCount: 90,
    headers,
    importantColumns: ["日期", "制作人", "游戏名称", "视频长度"],
    numericColumns: [],
    dateColumns: ["日期"],
    durationColumns: ["视频长度"],
    anomalyKeywords: ["时长", "00:00:00", "缺失", "看门狗3军团"]
  });
}

function createMixedTextNumberSample(): ExcelSample {
  const headers = ["商品名称", "版本", "章节", "用户ID", "评分", "备注"];
  const rows: CellValue[][] = [headers];
  for (let index = 0; index < 100; index++) {
    rows.push([
      ["看门狗3军团", "产品A12", "智能键盘2代"][index % 3],
      `版本${(index % 5) + 1}.0`,
      `第${(index % 20) + 1}章`,
      `user${1000 + index}`,
      index === 66 ? 0 : 60 + (index % 35),
      index % 17 === 0 ? "需复查" : ""
    ]);
  }

  return sample("mixed_text_numbers.xlsx", "中文和英文混数字文本，验证不要误判为数值列。", [{ name: "混合文本", rows }], {
    rowCount: 100,
    headers,
    importantColumns: ["商品名称", "版本", "章节", "用户ID", "评分"],
    numericColumns: ["评分"],
    dateColumns: [],
    durationColumns: [],
    anomalyKeywords: ["评分", "0", "文本", "看门狗3军团"]
  });
}

function createEmptyTableSample(): ExcelSample {
  const headers = ["日期", "客户", "金额", "状态"];
  const rows: CellValue[][] = [headers];

  return sample("empty_table.xlsx", "只有表头的空表格，验证友好提示。", [{ name: "空表", rows }], {
    rowCount: 0,
    headers,
    importantColumns: headers,
    numericColumns: ["金额"],
    dateColumns: ["日期"],
    durationColumns: [],
    anomalyKeywords: ["空", "无数据", "有效数据"],
    expectedWarnings: ["空", "无数据"]
  });
}

function createLargeOperationalSample(): ExcelSample {
  const headers = [
    "日期",
    "订单ID",
    "客户",
    "城市",
    "商品",
    "销售额",
    "成本",
    "利润",
    "数量",
    "折扣率",
    "处理时长",
    "客服",
    "渠道",
    "是否复购",
    "评分",
    "备注"
  ];
  const rows: CellValue[][] = [headers];

  for (let index = 0; index < 5563; index++) {
    const sales = index === 4321 ? 1800000 : 300 + (index % 200) * 13;
    const cost = Math.round(sales * 0.58);
    rows.push([
      dateString(2026, 1, index + 1),
      `ORD-${String(index + 1).padStart(6, "0")}`,
      `客户${index + 1}`,
      ["广州", "上海", "北京", "深圳", "成都"][index % 5],
      ["企业版", "标准版", "增值服务", "看门狗3军团周边"][index % 4],
      sales,
      cost,
      sales - cost,
      1 + (index % 12),
      index % 71 === 0 ? 0 : (index % 15) * 2,
      index === 2222 ? "00:00:00" : `00:${String(5 + (index % 30)).padStart(2, "0")}:${String(index % 60).padStart(2, "0")}`,
      ["张三", "李四", "王五"][index % 3],
      ["官网", "小红书", "抖音", "线下"][index % 4],
      index % 2 ? "是" : "否",
      index % 89 === 0 ? "" : 60 + (index % 40),
      index % 300 === 0 ? "异常复核" : ""
    ]);
  }

  return sample("large_5563x16_operational.xlsx", "5563 行 × 16 列大表，覆盖日期、时长、数值、缺失和离群值。", [{ name: "运营明细", rows }], {
    rowCount: 5563,
    headers,
    importantColumns: ["日期", "订单ID", "销售额", "成本", "利润", "处理时长", "评分"],
    numericColumns: ["销售额", "成本", "利润", "数量", "折扣率", "评分"],
    dateColumns: ["日期"],
    durationColumns: ["处理时长"],
    anomalyKeywords: ["1800000", "00:00:00", "缺失", "离群", "异常"]
  });
}

function sample(
  fileName: string,
  description: string,
  sheets: SheetData[],
  expected: ExcelSample["expected"]
): ExcelSample {
  return {
    id: fileName.replace(/\.xlsx$/i, ""),
    fileName,
    description,
    sheets,
    expected
  };
}

function createXlsxBuffer(sheets: SheetData[]) {
  const files: Array<{ name: string; content: string }> = [
    {
      name: "[Content_Types].xml",
      content: contentTypesXml(sheets.length)
    },
    {
      name: "_rels/.rels",
      content: rootRelsXml()
    },
    {
      name: "xl/workbook.xml",
      content: workbookXml(sheets)
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      content: workbookRelsXml(sheets.length)
    }
  ];

  sheets.forEach((sheet, index) => {
    files.push({
      name: `xl/worksheets/sheet${index + 1}.xml`,
      content: worksheetXml(sheet.rows)
    });
  });

  return zipStore(files);
}

function contentTypesXml(sheetCount: number) {
  const sheetOverrides = Array.from({ length: sheetCount }, (_, index) =>
    `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
  ).join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
${sheetOverrides}
</Types>`;
}

function rootRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;
}

function workbookXml(sheets: SheetData[]) {
  const sheetItems = sheets
    .map((sheet, index) => `<sheet name="${escapeXml(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`)
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>${sheetItems}</sheets>
</workbook>`;
}

function workbookRelsXml(sheetCount: number) {
  const rels = Array.from({ length: sheetCount }, (_, index) =>
    `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`
  ).join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rels}</Relationships>`;
}

function worksheetXml(rows: CellValue[][]) {
  const rowXml = rows
    .map((row, rowIndex) => {
      const cells = row
        .map((cell, colIndex) => cellXml(cell, `${columnName(colIndex + 1)}${rowIndex + 1}`))
        .join("");
      return `<row r="${rowIndex + 1}">${cells}</row>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetData>${rowXml}</sheetData>
</worksheet>`;
}

function cellXml(value: CellValue, ref: string) {
  if (value === null || value === undefined || value === "") {
    return `<c r="${ref}"/>`;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return `<c r="${ref}"><v>${value}</v></c>`;
  }

  return `<c r="${ref}" t="inlineStr"><is><t>${escapeXml(String(value))}</t></is></c>`;
}

function zipStore(files: Array<{ name: string; content: string }>) {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBuffer = Buffer.from(file.name, "utf8");
    const data = Buffer.from(file.content, "utf8");
    const crc = crc32(data);
    const localHeader = Buffer.alloc(30);

    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x0800, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(data.length, 18);
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(nameBuffer.length, 26);
    localHeader.writeUInt16LE(0, 28);

    localParts.push(localHeader, nameBuffer, data);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x0800, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(data.length, 20);
    centralHeader.writeUInt32LE(data.length, 24);
    centralHeader.writeUInt16LE(nameBuffer.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);

    centralParts.push(centralHeader, nameBuffer);
    offset += localHeader.length + nameBuffer.length + data.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDirectory, end]);
}

function crc32(buffer: Buffer) {
  let crc = 0xffffffff;

  for (let index = 0; index < buffer.length; index++) {
    const byte = buffer[index];
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function columnName(index: number) {
  let name = "";
  while (index > 0) {
    const remainder = (index - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    index = Math.floor((index - 1) / 26);
  }
  return name;
}

function extractTotalTokens(response: unknown): number | null {
  const values: number[] = [];

  walk(response, (key, value) => {
    if ((key === "total_tokens" || key === "totalTokens") && typeof value === "number") {
      values.push(value);
    }
  });

  return values.length ? Math.max(...values) : null;
}

function walk(value: unknown, visitor: (key: string, value: unknown) => void, key = "") {
  visitor(key, value);

  if (Array.isArray(value)) {
    value.forEach((item) => walk(item, visitor));
    return;
  }

  if (value && typeof value === "object") {
    for (const [childKey, childValue] of Object.entries(value)) {
      walk(childValue, visitor, childKey);
    }
  }
}

function dateString(year: number, month: number, dayOffset: number) {
  const date = new Date(Date.UTC(year, month - 1, 1));
  date.setUTCDate(date.getUTCDate() + dayOffset - 1);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}

function containsApproxNumber(text: string, expected: number) {
  const candidates = new Set([
    String(expected),
    expected.toLocaleString("en-US"),
    expected.toLocaleString("zh-CN")
  ]);

  return Array.from(candidates).some((candidate) => text.includes(candidate));
}

function roundScore(value: number) {
  return Math.max(0, Math.min(100, Number(value.toFixed(1))));
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1));
}

function averageNullable(values: Array<number | null>) {
  const valid = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (!valid.length) return null;
  return Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length);
}

function sumTokens(values: Array<number | null>): number {
  return values.reduce<number>((sum, value) => sum + (typeof value === "number" && Number.isFinite(value) ? value : 0), 0);
}

function formatNumber(value: number | null) {
  if (value === null || value === undefined) return "-";
  return Math.round(value).toLocaleString("zh-CN");
}

function formatRate(value: number | null) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "-";
  return `${(value * 100).toFixed(1)}%`;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapeCsv(value: unknown) {
  const text = String(value ?? "");
  if (!/[",\n\r]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}
