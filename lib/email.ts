export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

function getEmailFrom() {
  return process.env.EMAIL_FROM || "";
}

export function getEmailConfigStatus() {
  const provider = (process.env.EMAIL_PROVIDER || "resend").toLowerCase();
  const from = getEmailFrom();
  const resendApiKey = process.env.RESEND_API_KEY || "";

  return {
    provider,
    ready: provider === "resend" && Boolean(from && resendApiKey),
    missing: [
      provider !== "resend" ? "EMAIL_PROVIDER" : "",
      !from ? "EMAIL_FROM" : "",
      !resendApiKey ? "RESEND_API_KEY" : ""
    ].filter(Boolean)
  };
}

export function getAppBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  ).replace(/\/$/, "");
}

export async function sendEmail(input: SendEmailInput) {
  const provider = (process.env.EMAIL_PROVIDER || "resend").toLowerCase();
  if (provider !== "resend") {
    throw new Error("Unsupported email provider.");
  }

  const config = getEmailConfigStatus();
  if (!config.ready) {
    throw new Error(`Email service is not configured: ${config.missing.join(", ")}`);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = getEmailFrom();

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text
    })
  });

  if (!response.ok) {
    throw new Error(`Email service request failed with status ${response.status}.`);
  }
}
