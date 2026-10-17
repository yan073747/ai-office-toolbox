/**
 * 新报单通知。
 *
 * 设计原则：通知只是附加动作，任何一条通道失败都不能影响表单提交本身。
 * 所有请求都有超时，错误全部吞掉（只打日志），调用方 await 它也不会抛。
 *
 * 支持两条独立通道，配了哪个就走哪个，都配了就两条都走：
 *   FEISHU_WEBHOOK_URL   飞书群自定义机器人 webhook
 *   RESEND_API_KEY + NOTIFY_EMAIL   邮件通知（Resend 免费额度 100 封/天）
 */

const TIMEOUT_MS = 6000;

export type Lead = {
  name: string;
  contact: string;
  budget: string;
  description: string;
  source: string;
};

export async function notifyNewLead(lead: Lead) {
  const tasks: Array<Promise<void>> = [];

  if (process.env.FEISHU_WEBHOOK_URL) {
    tasks.push(sendToFeishu(lead));
  }

  if (process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL) {
    tasks.push(sendByEmail(lead));
  }

  if (!tasks.length) return;

  // 不用 Promise.all：一条失败不该影响另一条
  await Promise.allSettled(tasks);
}

function buildText(lead: Lead) {
  return [
    `新报单：${lead.name}`,
    `联系方式：${lead.contact || "未留"}`,
    `预算：${lead.budget || "未填"}`,
    "",
    lead.description,
    "",
    `来源：${lead.source}`
  ].join("\n");
}

async function sendToFeishu(lead: Lead) {
  const url = process.env.FEISHU_WEBHOOK_URL;
  if (!url) return;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        msg_type: "text",
        content: { text: buildText(lead) }
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });

    if (!response.ok) {
      console.warn("Feishu webhook responded", response.status);
    }
  } catch (error) {
    console.warn("Feishu webhook notify failed:", safeMessage(error));
  }
}

async function sendByEmail(lead: Lead) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!apiKey || !to) return;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM || "AI WorkBox <onboarding@resend.dev>",
        to: [to],
        subject: `新报单：${lead.name}`,
        text: buildText(lead)
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn("Resend responded", response.status, detail.slice(0, 300));
    }
  } catch (error) {
    console.warn("Email notify failed:", safeMessage(error));
  }
}

function safeMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
