export const AUTHOR_EMAIL = "19217656722@163.com";
export const AUTHOR_DOUYIN_ID = "58016922716";

export const CONTACT_MAIL_SUBJECT = "AI WorkBox 咨询";
export const CONTACT_MAIL_BODY = "你好，我想问一下下面这件事能不能做成自动的：";

export const CONTACT_MAILTO = `mailto:${AUTHOR_EMAIL}?subject=${CONTACT_MAIL_SUBJECT}&body=${CONTACT_MAIL_BODY}`;

export const QUOTA_EMPTY_MESSAGE = "免费次数已用完，请购买套餐继续使用";

export function isQuotaEmptyMessage(message: string) {
  return message === QUOTA_EMPTY_MESSAGE || message.includes("免费额度已用完") || message.includes("额度不足");
}
