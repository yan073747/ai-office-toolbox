export const AUTHOR_EMAIL = "19217656722@163.com";
export const AUTHOR_DOUYIN_ID = "58016922716";

export const CONTACT_MAIL_SUBJECT = "AI办公工具箱咨询";
export const CONTACT_MAIL_BODY = "你好，我想咨询 AI 办公工具箱的继续体验或定制服务。";

export const CONTACT_MAILTO = `mailto:${AUTHOR_EMAIL}?subject=${CONTACT_MAIL_SUBJECT}&body=${CONTACT_MAIL_BODY}`;

export const QUOTA_EMPTY_MESSAGE = "你已使用完 5 次免费体验。想继续体验、开通更多额度或定制专属 AI 工具，请联系作者。";

export function isQuotaEmptyMessage(message: string) {
  return message === QUOTA_EMPTY_MESSAGE || message.includes("免费额度已用完") || message.includes("额度不足");
}
