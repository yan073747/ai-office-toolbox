const DIFY_USER = "website-user";
const WORKFLOW_TIMEOUT_MS = 120_000;

export type DifyFileValue = {
  type: "document" | "image" | "audio" | "video" | "custom";
  transfer_method: "local_file";
  upload_file_id: string;
};

type DifyUploadResponse = {
  id?: string;
  name?: string;
  message?: string;
};

type UploadedFile = {
  id: string;
  name?: string;
};

export class DifyApiError extends Error {
  status: number;
  code: "invalid_api_key" | "workflow_failed" | "empty_result" | "timeout" | "network" | "upload_failed";
  details?: unknown;

  constructor(
    message: string,
    status = 500,
    code: DifyApiError["code"] = "workflow_failed",
    details?: unknown
  ) {
    super(message);
    this.name = "DifyApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function getBaseUrl() {
  return process.env.DIFY_BASE_URL || "https://api.dify.ai/v1";
}

function getAuthHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`
  };
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = WORKFLOW_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = windowlessSetTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new DifyApiError("请求超时", 504, "timeout", error);
    }

    throw new DifyApiError("网络错误", 502, "network", error);
  } finally {
    clearTimeout(timer);
  }
}

function windowlessSetTimeout(callback: () => void, timeoutMs: number) {
  return setTimeout(callback, timeoutMs);
}

function readNestedValue(source: unknown, path: string[]) {
  return path.reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[key];
  }, source);
}

function cleanDifyResult(value: string) {
  return value.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

function extractFromOutputs(outputs: unknown) {
  if (!outputs || typeof outputs !== "object") return "";

  const outputRecord = outputs as Record<string, unknown>;
  for (const key of ["result", "text", "answer"]) {
    const value = outputRecord[key];
    if (typeof value === "string" && value.trim()) return cleanDifyResult(value);
  }

  const outputValues = Object.values(outputRecord);
  if (outputValues.length === 1) {
    const [onlyValue] = outputValues;
    if (typeof onlyValue === "string" && onlyValue.trim()) return cleanDifyResult(onlyValue);
  }

  const firstText = outputValues.find((value) => typeof value === "string" && value.trim());
  if (typeof firstText === "string") return cleanDifyResult(firstText);

  return "";
}

export async function uploadFile(apiKey: string, file: File): Promise<UploadedFile> {
  if (!apiKey) {
    throw new DifyApiError("API Key 无效", 500, "invalid_api_key");
  }

  const formData = new FormData();
  formData.append("file", file, file.name);
  formData.append("user", DIFY_USER);

  const url = `${getBaseUrl()}/files/upload`;
  console.log("Dify upload request:", {
    url,
    method: "POST",
    user: DIFY_USER,
    file: {
      name: file.name,
      type: file.type,
      size: file.size
    },
    authHeaderPresent: Boolean(apiKey)
  });

  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: getAuthHeaders(apiKey),
    body: formData
  });

  const data = (await response.json().catch(() => null)) as DifyUploadResponse | null;
  console.log("Dify upload status:", response.status);
  console.log("Dify response:", data);

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new DifyApiError("API Key 无效", response.status, "invalid_api_key", data);
    }

    throw new DifyApiError(data?.message || "文件上传失败", response.status, "upload_failed", data);
  }

  if (!data?.id) {
    throw new DifyApiError("Dify 返回空结果", 502, "empty_result", data);
  }

  return {
    ...data,
    id: data.id
  };
}

export async function runWorkflow(
  apiKey: string,
  inputs: Record<string, unknown>,
  options?: {
    workflowUrl?: string;
    workflowId?: string;
    toolName?: string;
  }
) {
  if (!apiKey) {
    throw new DifyApiError("API Key 无效", 500, "invalid_api_key");
  }

  const url = options?.workflowUrl || `${getBaseUrl()}/workflows/run`;
  const requestBody = {
    inputs,
    response_mode: "blocking",
    user: DIFY_USER
  };

  console.log("Dify workflow request:", {
    toolName: options?.toolName,
    workflowId: options?.workflowId,
    url,
    method: "POST",
    headers: {
      Authorization: apiKey ? "Bearer ***" : "",
      "Content-Type": "application/json"
    },
    body: requestBody
  });

  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: {
      ...getAuthHeaders(apiKey),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });

  const data = await response.json().catch(() => null);
  console.log("Dify status:", response.status);
  console.log("Dify response:", data);

  if (!response.ok) {
    const message = readNestedValue(data, ["message"]) || readNestedValue(data, ["data", "error"]);
    if (response.status === 401 || response.status === 403) {
      throw new DifyApiError("API Key 无效", response.status, "invalid_api_key", data);
    }

    throw new DifyApiError(
      typeof message === "string" ? message : "Workflow 调用失败",
      response.status,
      "workflow_failed",
      data
    );
  }

  return data;
}

export async function runWorkflowStreaming(
  apiKey: string,
  inputs: Record<string, unknown>,
  options?: {
    workflowUrl?: string;
    workflowId?: string;
    toolName?: string;
  }
) {
  if (!apiKey) {
    throw new DifyApiError("API Key 无效", 500, "invalid_api_key");
  }

  const url = options?.workflowUrl || `${getBaseUrl()}/workflows/run`;
  const requestBody = {
    inputs,
    response_mode: "streaming",
    user: DIFY_USER
  };

  console.log("Dify workflow request:", {
    toolName: options?.toolName,
    workflowId: options?.workflowId,
    url,
    method: "POST",
    headers: {
      Authorization: apiKey ? "Bearer ***" : "",
      "Content-Type": "application/json"
    },
    body: requestBody
  });

  const controller = new AbortController();
  const timer = windowlessSetTimeout(() => controller.abort(), WORKFLOW_TIMEOUT_MS * 2);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...getAuthHeaders(apiKey),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    const rawText = await response.text();
    console.log("Dify status:", response.status);
    console.log("Dify response:", rawText);

    if (!response.ok) {
      const data = safeJsonParse(rawText);
      const message = readNestedValue(data, ["message"]) || readNestedValue(data, ["data", "error"]);
      if (response.status === 401 || response.status === 403) {
        throw new DifyApiError("API Key 无效", response.status, "invalid_api_key", data);
      }

      throw new DifyApiError(
        typeof message === "string" ? message : "Workflow 调用失败",
        response.status,
        "workflow_failed",
        data || rawText
      );
    }

    const events = parseSseEvents(rawText);
    const finishedEvent =
      [...events].reverse().find((item) => item.event === "workflow_finished" || item.data?.event === "workflow_finished") ||
      events[events.length - 1];

    const data = finishedEvent?.data || { events };
    console.log("Dify response:", data);
    return data;
  } catch (error) {
    if (error instanceof DifyApiError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new DifyApiError("请求超时", 504, "timeout", error);
    }

    throw new DifyApiError("网络错误", 502, "network", error);
  } finally {
    clearTimeout(timer);
  }
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function parseSseEvents(text: string) {
  const events: Array<{ event: string; data: Record<string, unknown> | null }> = [];
  let event = "";
  let dataLines: string[] = [];

  const flush = () => {
    if (!event && dataLines.length === 0) return;
    const rawData = dataLines.join("\n");
    events.push({
      event,
      data: rawData && rawData !== "[DONE]" ? safeJsonParse(rawData) : null
    });
    event = "";
    dataLines = [];
  };

  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) {
      flush();
      continue;
    }

    if (line.startsWith("event:")) {
      event = line.slice("event:".length).trim();
      continue;
    }

    if (line.startsWith("data:")) {
      dataLines.push(line.slice("data:".length).trimStart());
    }
  }

  flush();
  return events;
}

export function extractDifyResult(response: unknown) {
  const directOutputs = readNestedValue(response, ["data", "outputs"]);
  const directResult = extractFromOutputs(directOutputs);
  if (directResult) return directResult;

  const dataAnswer = readNestedValue(response, ["data", "answer"]);
  if (typeof dataAnswer === "string" && dataAnswer.trim()) return cleanDifyResult(dataAnswer);

  const rootAnswer = readNestedValue(response, ["answer"]);
  if (typeof rootAnswer === "string" && rootAnswer.trim()) return cleanDifyResult(rootAnswer);

  const nestedOutputs = readNestedValue(response, ["data", "data", "outputs"]);
  const nestedResult = extractFromOutputs(nestedOutputs);
  if (nestedResult) return nestedResult;

  return "";
}

export function getDifyErrorMessage(error: unknown) {
  if (error instanceof DifyApiError) {
    if (error.code === "invalid_api_key") return "服务配置异常，请联系管理员。";
    if (error.code === "empty_result") return "未生成有效结果，请调整输入后重试。";
    if (error.code === "timeout") return "请求超时，请稍后重试。";
    if (error.code === "network") return "网络异常，请稍后重试。";
    if (error.code === "upload_failed") return `文件上传失败：${error.message}`;
    return `生成失败：${error.message}`;
  }

  if (error instanceof TypeError) {
    return "网络异常，请稍后重试。";
  }

  if (error instanceof Error) {
    return error.message || "生成失败，请稍后重试。";
  }

  return "生成失败，请稍后重试。";
}

export function getDifyErrorStatus(error: unknown) {
  if (error instanceof DifyApiError) return error.status;
  return 500;
}

export function toDifyDocument(uploadFileId: string): DifyFileValue {
  return {
    type: "document",
    transfer_method: "local_file",
    upload_file_id: uploadFileId
  };
}
