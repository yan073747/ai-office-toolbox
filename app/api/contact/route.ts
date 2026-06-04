import { NextResponse } from "next/server";

type ContactPayload = {
  name?: string;
  company?: string;
  phone?: string;
  wechat?: string;
  email?: string;
  douyin?: string;
  industry?: string;
  budget?: string;
  description?: string;
};

type FeishuTable = {
  table_id?: string;
  name?: string;
};

type FeishuField = {
  field_name?: string;
  type?: number;
};

type FeishuResponse<T> = {
  code?: number;
  msg?: string;
  data?: T;
  tenant_access_token?: string;
};

const FEISHU_API_BASE = "https://open.feishu.cn/open-apis";

const FIELD_NAMES = [
  "姓名",
  "公司/团队名称",
  "手机号",
  "微信号",
  "邮箱",
  "抖音号",
  "所属行业",
  "预算范围",
  "需求描述",
  "提交时间",
  "是否已处理",
  "优先级",
  "来源页面"
];

const DATE_FIELD_TYPE = 5;
const CHECKBOX_FIELD_TYPE = 7;

export async function POST(request: Request) {
  try {
    const payload = (await request.json().catch(() => null)) as ContactPayload | null;
    const validationError = validatePayload(payload);

    if (validationError) {
      return NextResponse.json({ success: false, message: validationError }, { status: 400 });
    }

    const config = getFeishuConfig();
    if (!config.ok) {
      return NextResponse.json({ success: false, message: config.message }, { status: 500 });
    }

    const token = await getTenantAccessToken(config.appId, config.appSecret);
    const tableId = await resolveTableId(config.baseAppToken, token, config.tableId);
    const fields = await listFields(config.baseAppToken, tableId, token);
    const recordFields = buildRecordFields(payload as RequiredContactPayload, fields);

    if (!Object.keys(recordFields).length) {
      return NextResponse.json({ success: false, message: "飞书表格没有可写入的匹配字段，请检查字段名称。" }, { status: 500 });
    }

    await createRecord(config.baseAppToken, tableId, token, recordFields);

    return NextResponse.json({
      success: true,
      message: "提交成功，我会尽快联系你。"
    });
  } catch (error) {
    console.warn("Contact submit failed:", safeErrorMessage(error));
    return NextResponse.json(
      {
        success: false,
        message: "提交失败，请稍后重试，或通过邮箱/抖音联系我。"
      },
      { status: 500 }
    );
  }
}

type RequiredContactPayload = ContactPayload & {
  name: string;
  industry: string;
  budget: string;
  description: string;
};

function validatePayload(payload: ContactPayload | null) {
  if (!payload) return "提交数据格式不正确。";
  if (!payload.name?.trim()) return "请输入姓名。";
  if (!payload.phone?.trim() && !payload.email?.trim() && !payload.wechat?.trim()) return "请至少填写手机号、微信号或邮箱中的一项。";
  if (!payload.industry?.trim()) return "请选择所属行业。";
  if (!payload.budget?.trim()) return "请选择预算范围。";
  if (!payload.description?.trim()) return "请填写需求描述。";
  return "";
}

function getFeishuConfig() {
  const appId = process.env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET;
  const baseAppToken = process.env.FEISHU_BASE_APP_TOKEN;
  const tableId = process.env.FEISHU_TABLE_ID;

  if (!appId || !appSecret || !baseAppToken) {
    return {
      ok: false as const,
      message: "飞书配置缺失，请检查 FEISHU_APP_ID、FEISHU_APP_SECRET、FEISHU_BASE_APP_TOKEN。"
    };
  }

  return {
    ok: true as const,
    appId,
    appSecret,
    baseAppToken,
    tableId: normalizeTableId(tableId)
  };
}

function normalizeTableId(tableId?: string) {
  const value = tableId?.trim();
  if (!value) return undefined;

  if (!/^tbl[a-zA-Z0-9]+$/.test(value)) {
    console.warn("FEISHU_TABLE_ID is configured but does not look like a table_id. Falling back to list tables.");
    return undefined;
  }

  return value;
}

async function getTenantAccessToken(appId: string, appSecret: string) {
  const result = await requestFeishu<unknown>("/auth/v3/tenant_access_token/internal", {
    method: "POST",
    body: JSON.stringify({
      app_id: appId,
      app_secret: appSecret
    })
  });

  const token = result.tenant_access_token;
  if (!token) throw new Error("Failed to get tenant access token.");
  return token;
}

async function resolveTableId(baseAppToken: string, token: string, tableId?: string) {
  if (tableId?.trim()) {
    return tableId.trim();
  }

  const tables = await listTables(baseAppToken, token);

  const firstTableId = tables[0]?.table_id;
  if (!firstTableId) throw new Error("No table found in Feishu base.");

  return firstTableId;
}

async function listTables(baseAppToken: string, token: string) {
  const result = await requestFeishu<{ items?: FeishuTable[] }>(`/bitable/v1/apps/${baseAppToken}/tables?page_size=100`, {
    headers: authHeaders(token)
  });

  return result.data?.items || [];
}

async function listFields(baseAppToken: string, tableId: string, token: string) {
  const result = await requestFeishu<{ items?: FeishuField[] }>(`/bitable/v1/apps/${baseAppToken}/tables/${tableId}/fields?page_size=100`, {
    headers: authHeaders(token)
  });

  return result.data?.items || [];
}

function buildRecordFields(payload: RequiredContactPayload, fields: FeishuField[]) {
  const availableFields = new Map(fields.map((field) => [field.field_name, field]));
  const source: Record<string, string | number | boolean> = {
    姓名: payload.name.trim(),
    "公司/团队名称": payload.company?.trim() || "",
    手机号: payload.phone?.trim() || "",
    微信号: payload.wechat?.trim() || "",
    邮箱: payload.email?.trim() || "",
    抖音号: payload.douyin?.trim() || "",
    所属行业: payload.industry.trim(),
    预算范围: payload.budget.trim(),
    需求描述: payload.description.trim(),
    提交时间: Date.now(),
    是否已处理: "否",
    优先级: "中",
    来源页面: "联系定制"
  };

  const record: Record<string, string | number | boolean> = {};

  for (const fieldName of FIELD_NAMES) {
    const field = availableFields.get(fieldName);

    if (!field) {
      console.warn(`Feishu contact field missing: ${fieldName}`);
      continue;
    }

    const value = source[fieldName];
    if (value === "") continue;

    record[fieldName] = normalizeFieldValue(field, value);
  }

  return record;
}

function normalizeFieldValue(field: FeishuField, value: string | number | boolean) {
  if (field.type === DATE_FIELD_TYPE) {
    return typeof value === "number" ? value : Date.now();
  }

  if (field.type === CHECKBOX_FIELD_TYPE) {
    return value === true || value === "是";
  }

  return typeof value === "number" ? String(value) : value;
}

async function createRecord(baseAppToken: string, tableId: string, token: string, fields: Record<string, string | number | boolean>) {
  await requestFeishu(`/bitable/v1/apps/${baseAppToken}/tables/${tableId}/records`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ fields })
  });
}

async function requestFeishu<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");

  const response = await fetch(`${FEISHU_API_BASE}${path}`, {
    ...init,
    headers
  });

  const result = (await response.json().catch(() => ({}))) as FeishuResponse<T>;

  if (!response.ok || result.code !== 0) {
    throw new Error(`Feishu API failed: ${result.code ?? response.status} ${result.msg || "unknown error"}`);
  }

  return result;
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`
  };
}

function safeErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message.replace(/Bearer\s+[A-Za-z0-9._-]+/g, "Bearer ***");
  return "Unknown contact submit error.";
}
