"use client";

import { AUTHOR_DOUYIN_ID, AUTHOR_EMAIL, CONTACT_MAILTO } from "@/lib/contact-info";
import { FormEvent, useMemo, useState } from "react";

const budgets = ["3,000 以下", "3,000–6,000", "6,000–15,000", "15,000 以上", "还不确定"];

type FormState = {
  name: string;
  contact: string;
  budget: string;
  description: string;
};

type Errors = Partial<Record<"name" | "contact" | "description", string>>;

const initialForm: FormState = {
  name: "",
  contact: "",
  budget: "",
  description: ""
};

/** 一个框填联系方式，前端识别类型，再拆回后端原有的三个字段 */
function detectContactType(value: string): "邮箱" | "手机号" | "微信号" | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "邮箱";
  if (/^1[3-9]\d{9}$/.test(trimmed.replace(/[\s-]/g, ""))) return "手机号";
  return "微信号";
}

function splitContact(value: string) {
  const trimmed = value.trim();
  const type = detectContactType(trimmed);
  if (type === "邮箱") return { email: trimmed, phone: "", wechat: "" };
  if (type === "手机号") return { email: "", phone: trimmed.replace(/[\s-]/g, ""), wechat: "" };
  return { email: "", phone: "", wechat: trimmed };
}

export default function ContactPageClient() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState<"email" | "douyin" | null>(null);

  async function copyValue(value: string, target: "email" | "douyin") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(target);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      setCopied(null);
    }
  }

  const contactType = useMemo(() => detectContactType(form.contact), [form.contact]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setSubmitError(false);
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (key !== "name" && key !== "contact" && key !== "description") return current;
      const next: Errors = { ...current };
      delete next[key as keyof Errors];
      return next;
    });
  }

  function validate() {
    const nextErrors: Errors = {};
    if (!form.name.trim()) nextErrors.name = "留个称呼，我好知道怎么叫你。";
    if (!form.contact.trim()) nextErrors.contact = "留一个能联系上的就行。";
    else if (form.contact.trim().length < 3) nextErrors.contact = "这个看着不太像，再填一次？";
    if (!form.description.trim()) nextErrors.description = "随便说两句也可以，我好判断能不能做。";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(false);
    if (!validate()) return;

    setIsSubmitting(true);
    const contact = splitContact(form.contact);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          company: "",
          phone: contact.phone,
          wechat: contact.wechat,
          email: contact.email,
          douyin: "",
          industry: "未填写",
          budget: form.budget || "未填写",
          description: form.description
        })
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.success) {
        throw new Error(typeof data?.message === "string" ? data.message : "Contact submit failed.");
      }

      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("Contact submit failed:", error);
      }
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="bg-paper text-inkd">
      <div className="mx-auto max-w-site px-5 pb-6 pt-9 md:pt-11">
        <span className="inline-block border-b border-[#E0C4B4] pb-0.5 text-[12.5px] font-semibold tracking-[0.04em] text-accent">
          不用填一堆资料
        </span>
        <h1 className="mt-3.5 text-[25px] font-semibold leading-[1.42] tracking-[-0.012em] text-inkd md:text-[33px]">
          说说你现在最烦的那件事，
          <br className="hidden sm:block" />
          我看能不能做成自动的
        </h1>
        <p className="mt-3 max-w-[480px] text-[14.5px] leading-[1.95] text-ink2">
          四个框，一分钟。填完我直接回你，不用等客服排队。
        </p>
      </div>

      <div className="mx-auto grid max-w-site gap-9 px-5 pb-14 md:grid-cols-[minmax(0,1fr)_320px] md:items-start md:gap-12">
        <div>
          {done ? <SuccessCard /> : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="rounded-[4px] border border-wline bg-white px-5 py-6 md:px-6"
            >
              <div className="mb-5">
                <label htmlFor="name" className="block text-[13px] font-semibold text-inkd">
                  怎么称呼<span className="ml-0.5 text-accent">*</span>
                </label>
                <input
                  id="name"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="老陈 / 陈经理，随便叫"
                  autoComplete="name"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className={fieldClass(Boolean(errors.name))}
                />
                {errors.name ? (
                  <p id="name-error" className="mt-1.5 text-[12px] text-[#B3372E]">
                    {errors.name}
                  </p>
                ) : null}
              </div>

              <div className="mb-5">
                <label htmlFor="contact" className="block text-[13px] font-semibold text-inkd">
                  联系方式<span className="ml-0.5 text-accent">*</span>
                  <em className="ml-2 text-[12px] font-normal not-italic text-mute">微信、手机、邮箱，填一个就行</em>
                </label>
                <input
                  id="contact"
                  value={form.contact}
                  onChange={(event) => updateField("contact", event.target.value)}
                  placeholder="微信号 / 手机号 / 邮箱"
                  aria-invalid={Boolean(errors.contact)}
                  aria-describedby={errors.contact ? "contact-error" : "contact-hint"}
                  className={fieldClass(Boolean(errors.contact))}
                />
                {errors.contact ? (
                  <p id="contact-error" className="mt-1.5 text-[12px] text-[#B3372E]">
                    {errors.contact}
                  </p>
                ) : (
                  <p id="contact-hint" className="mt-1.5 text-[12px] text-mute">
                    {contactType ? `认出来了：${contactType}` : "不用想填哪个，系统自己认。"}
                  </p>
                )}
              </div>

              <div className="mb-5">
                <label htmlFor="description" className="block text-[13px] font-semibold text-inkd">
                  你现在最想解决的一件事<span className="ml-0.5 text-accent">*</span>
                </label>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  rows={4}
                  placeholder="例如：客户天天问保修和发货时间，客服要翻半天手册，一天回四五十条。想让它自己答，答不了再转人。"
                  aria-invalid={Boolean(errors.description)}
                  aria-describedby={errors.description ? "description-error" : "description-hint"}
                  className={`${fieldClass(Boolean(errors.description))} min-h-[104px] resize-y`}
                />
                {errors.description ? (
                  <p id="description-error" className="mt-1.5 text-[12px] text-[#B3372E]">
                    {errors.description}
                  </p>
                ) : (
                  <p id="description-hint" className="mt-1.5 text-[12px] text-mute">
                    越具体越好。说清楚「谁、每天做几遍、卡在哪」，我就能判断能不能做。
                  </p>
                )}
              </div>

              <div className="mb-6">
                <span className="block text-[13px] font-semibold text-inkd">
                  预算大概在哪个范围
                  <em className="ml-2 text-[12px] font-normal not-italic text-mute">拿不准就选最后一项</em>
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {budgets.map((option) => {
                    const active = form.budget === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={active}
                        onClick={() => updateField("budget", active ? "" : option)}
                        className={`rounded-[3px] border px-3.5 py-2 text-[13.5px] transition ${
                          active
                            ? "border-deep bg-deep font-semibold text-paper"
                            : "border-wline bg-white text-ink2 hover:border-[#CFC5B1] hover:bg-paper2"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1.5 text-[12px] text-mute">这一项不影响我回你。只是让我知道该给你哪个方案。</p>
              </div>

              {submitError ? (
                <div className="mb-4 rounded-[3px] border border-[#E3C4BC] bg-[#FBF2EF] px-4 py-3 text-[13px] leading-[1.8] text-[#8E3327]">
                  没发出去。再点一次，或者直接发邮件给我。
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="hover-lift w-full rounded-[3px] bg-deep px-5 py-3.5 text-[15px] font-semibold text-paper transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "正在发..." : "发给他，等回复"}
              </button>
              <p className="mt-2.5 text-center text-[12px] text-mute">提交后不会给你发广告，也不会转给第三方。</p>
            </form>
          )}
        </div>

        <aside>
          <div className="border-t border-wline pt-4 md:border-t-0 md:pt-0">
            <b className="block text-[13.5px] font-semibold text-inkd">不想填表？直接找我</b>

            <div className="mt-2.5 space-y-2">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-[13px] text-mute">邮箱</span>
                <span className="font-mono text-[12.5px] text-inkd">{AUTHOR_EMAIL}</span>
                <button
                  type="button"
                  onClick={() => copyValue(AUTHOR_EMAIL, "email")}
                  className="border-b border-[#DFC3B2] pb-0.5 text-[12px] font-semibold text-accent"
                >
                  {copied === "email" ? "已复制" : "复制"}
                </button>
              </div>
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-[13px] text-mute">抖音号</span>
                <span className="font-mono text-[12.5px] text-inkd">{AUTHOR_DOUYIN_ID}</span>
                <button
                  type="button"
                  onClick={() => copyValue(AUTHOR_DOUYIN_ID, "douyin")}
                  className="border-b border-[#DFC3B2] pb-0.5 text-[12px] font-semibold text-accent"
                >
                  {copied === "douyin" ? "已复制" : "复制"}
                </button>
              </div>
            </div>

            <p className="mt-2.5 rounded-[3px] bg-paper2 px-3 py-2 text-[12px] leading-[1.8] text-mute">
              微信暂时不公开，免得被加爆。你留了联系方式，我会主动加你。
            </p>
            <p className="mt-2 text-[12px] leading-[1.8] text-mute">
              不方便复制？<a href={CONTACT_MAILTO} className="font-semibold text-accent">点这里直接打开邮件</a>
            </p>
          </div>

          <div className="mt-6 border-t border-wline pt-4">
            <b className="block text-[13.5px] font-semibold text-inkd">我一般这么回你</b>
            <ul className="mt-2 space-y-1 text-[13px] leading-[1.9] text-ink2">
              <li>能做的，直接给范围和时间</li>
              <li>做不了的，说清楚为什么</li>
              <li>预算不够的，给你一个更小的版本</li>
              <li>不推销、不催单、不拉群</li>
            </ul>
          </div>

          <div className="mt-6">
            <div className="rounded-[3px] bg-paper2 px-4 py-3.5 text-[12.5px] leading-[1.85] text-ink2">
              <b className="mb-1 block font-semibold text-inkd">有样本文件？</b>
              先不用传。等我们聊上了，你直接把表格或文档发给我就行，比在网页上传方便。
            </div>
          </div>

          <div className="mt-6 border-t border-wline pt-2">
            <FaqItem question="多久会回我？" answer="工作日 2 小时内。晚上和周日提交的，第二天上午回。" open />
            <FaqItem question="能只做一个小功能吗？" answer="可以。最小的一单是 3,000 起，只做一个场景，1–2 周。" />
            <FaqItem
              question="资料会不会泄露？"
              answer="可以签保密协议。默认数据不出你自己的账号，也可以完全放在你自己的服务器上。"
            />
          </div>
        </aside>
      </div>
    </main>
  );
}

function fieldClass(hasError: boolean) {
  const base =
    "mt-1.5 w-full rounded-[3px] border bg-white px-3 py-2.5 text-[14.5px] leading-[1.7] text-inkd outline-none transition placeholder:text-[#ADA392] focus:ring-[3px]";
  return hasError
    ? `${base} border-[#D9A79B] focus:border-[#B3372E] focus:ring-[#F3E0DB]`
    : `${base} border-wline focus:border-accent focus:ring-[#F3E3DC]`;
}

function FaqItem({ question, answer, open = false }: { question: string; answer: string; open?: boolean }) {
  return (
    <details open={open} className="group border-b border-wline2 py-3">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[14px] font-semibold text-inkd">
        {question}
        <span aria-hidden="true" className="text-[13px] text-mute transition group-open:rotate-90">
          ›
        </span>
      </summary>
      <p className="mt-2 text-[13px] leading-[1.9] text-ink2">{answer}</p>
    </details>
  );
}

function SuccessCard() {
  return (
    <div className="rounded-[4px] border border-wline border-t-[3px] border-t-accent bg-white px-5 py-6 md:px-6">
      <h2 className="text-[18px] font-semibold text-inkd">收到了，我看到了</h2>
      <p className="mt-2 text-[13.5px] leading-[1.9] text-ink2">
        工作时间内一般 <b className="font-semibold text-inkd">2 小时</b>内回你，晚上提交的第二天上午回。
      </p>

      <div className="mt-4 rounded-[3px] bg-paper2 px-4 py-3.5 text-[13px] leading-[1.9] text-ink2">
        <b className="mb-1 block font-semibold text-inkd">接下来是这样：</b>
        1. 我先看一眼你说的那件事，判断能不能做
        <br />
        2. 能做的，给你一个范围 + 大概价钱
        <br />
        3. 做不了的，直接告诉你做不了，或者该找谁
      </div>

      <p className="mt-4 text-[13px] text-ink2">等的时候可以顺手看看这三个，都是能直接操作的：</p>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] font-semibold text-accent">
        <a href="https://rag-ticket.aiworkbox.cn" target="_blank" rel="noopener noreferrer" className="hover:underline">
          知识库问答 →
        </a>
        <a href="https://docflow.aiworkbox.cn" target="_blank" rel="noopener noreferrer" className="hover:underline">
          多 AI 文档流 →
        </a>
        <a href="https://mcp.aiworkbox.cn" target="_blank" rel="noopener noreferrer" className="hover:underline">
          接公司数据的助手 →
        </a>
      </div>
    </div>
  );
}
