"use client";

import { AUTHOR_DOUYIN_ID, AUTHOR_EMAIL, CONTACT_MAILTO } from "@/lib/contact-info";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clipboard,
  Clock3,
  Copy,
  FileUp,
  Mail,
  MessageSquareText,
  Phone,
  Send,
  Sparkles,
  UserRound,
  X
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";

const industries = ["电商", "外贸", "教育", "企业办公", "自媒体", "其他"];
const budgets = ["500 元以内", "500-1000 元", "1000-3000 元", "3000 元以上"];

const capabilities = [
  "AI 办公自动化",
  "AI 表格分析",
  "AI 文档总结",
  "AI 合同提取",
  "AI 电商运营助手",
  "AI 外贸跟单助手",
  "AI 自媒体内容助手",
  "AI 工作流 / 智能体定制"
];

const processSteps = ["填写需求", "邮箱或抖音沟通", "确认范围", "报价排期", "开发交付"];

const faqs = [
  {
    question: "提交后多久会联系我？",
    answer: "我会根据需求描述和联系方式尽快回复，建议至少填写手机号、微信号或邮箱中的一项。"
  },
  {
    question: "可以只定制一个小功能吗？",
    answer: "可以。适合从一个高频重复任务开始，例如表格分析、文档总结、合同提取、内容生成或客户跟进。"
  },
  {
    question: "提交后还需要单独联系吗？",
    answer: "不强制。如果需求比较急，也可以通过页面顶部的邮箱或抖音号直接联系我。"
  }
];

type FormState = {
  name: string;
  company: string;
  phone: string;
  wechat: string;
  email: string;
  douyin: string;
  industry: string;
  description: string;
  hasSample: boolean;
  budget: string;
};

type FormErrors = Partial<Record<keyof FormState | "contact" | "sampleFile", string>>;
type CopyTarget = "email" | "douyin" | null;

const initialForm: FormState = {
  name: "",
  company: "",
  phone: "",
  wechat: "",
  email: "",
  douyin: "",
  industry: "企业办公",
  description: "",
  hasSample: false,
  budget: "500-1000 元"
};

export default function ContactPageClient() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [sampleFile, setSampleFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [copied, setCopied] = useState<CopyTarget>(null);

  const contactProvided = useMemo(() => {
    return Boolean(form.phone.trim() || form.wechat.trim() || form.email.trim());
  }, [form.email, form.phone, form.wechat]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setSubmitStatus(null);
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      if (key === "phone" || key === "wechat" || key === "email") delete next.contact;
      return next;
    });
  }

  function validate() {
    const nextErrors: FormErrors = {};

    if (!form.name.trim()) nextErrors.name = "请输入姓名。";
    if (!contactProvided) nextErrors.contact = "请至少填写手机号、微信号或邮箱中的一项。";
    if (!form.description.trim()) nextErrors.description = "请简单描述你的业务场景或想解决的问题。";
    if (form.hasSample && !sampleFile) nextErrors.sampleFile = "请上传示例文件，或取消示例文件选项。";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitStatus(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          company: form.company,
          phone: form.phone,
          wechat: form.wechat,
          email: form.email,
          douyin: form.douyin,
          industry: form.industry,
          budget: form.budget,
          description: form.description
        })
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.success) {
        throw new Error(typeof data?.message === "string" ? data.message : "Contact submit failed.");
      }

      setSubmitStatus("success");
      setForm(initialForm);
      setSampleFile(null);
      setErrors({});
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("Contact submit failed:", error);
      }
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function copyText(value: string, target: CopyTarget) {
    await navigator.clipboard.writeText(value);
    setCopied(target);
    window.setTimeout(() => setCopied(null), 1600);
  }

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#F8FAFC_0%,#FFFFFF_100%)] px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.78fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              <Sparkles className="h-4 w-4 text-blue-600" />
              AI 定制服务咨询
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-6xl">
              告诉我你的需求，定制更适合业务的 AI 工具
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              适合电商、外贸、自媒体、办公自动化和团队流程提效。填写需求后我会尽快联系你，也可以直接通过邮箱或抖音联系。
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_26px_80px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-semibold text-slate-950">真实联系方式</p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <p>邮箱：<span className="font-semibold text-slate-950">{AUTHOR_EMAIL}</span></p>
              <p>抖音号：<span className="font-semibold text-slate-950">{AUTHOR_DOUYIN_ID}</span></p>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <a href={CONTACT_MAILTO} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white">
                <Mail className="h-4 w-4" />
                发送邮件
              </a>
              <button
                type="button"
                onClick={() => copyText(AUTHOR_DOUYIN_ID, "douyin")}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-800"
              >
                <Copy className="h-4 w-4" />
                {copied === "douyin" ? "已复制" : "复制抖音号"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.42fr] lg:items-start">
          <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-normal text-slate-950">提交定制需求</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">填写越具体，越方便判断方案范围、预算和排期。</p>
              </div>
              <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white sm:flex">
                <Send className="h-5 w-5" />
              </div>
            </div>

            {submitStatus === "success" ? (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-7 text-emerald-900">
                <p className="font-semibold">提交成功，我会尽快联系你。</p>
              </div>
            ) : null}

            {submitStatus === "error" ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm leading-7 text-red-800">
                <p className="font-semibold">提交失败，请稍后重试，或通过邮箱/抖音联系我。</p>
              </div>
            ) : null}

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <TextField label="姓名" value={form.name} onChange={(value) => updateField("name", value)} error={errors.name} icon={UserRound} required />
              <TextField label="公司 / 团队名称" value={form.company} onChange={(value) => updateField("company", value)} icon={Building2} />
              <TextField label="手机号" value={form.phone} onChange={(value) => updateField("phone", value)} error={errors.contact} icon={Phone} />
              <TextField label="微信号" value={form.wechat} onChange={(value) => updateField("wechat", value)} icon={MessageSquareText} />
              <TextField label="邮箱" value={form.email} onChange={(value) => updateField("email", value)} icon={Mail} />
              <TextField label="抖音号" value={form.douyin} onChange={(value) => updateField("douyin", value)} icon={Clipboard} />
              <SelectField label="所属行业" value={form.industry} options={industries} onChange={(value) => updateField("industry", value)} />
              <SelectField label="预算范围" value={form.budget} options={budgets} onChange={(value) => updateField("budget", value)} />
            </div>

            <div className="mt-5">
              <label className="text-sm font-semibold text-slate-950" htmlFor="description">
                需求描述 <span className="text-blue-600">*</span>
              </label>
              <textarea
                id="description"
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
                rows={7}
                placeholder="例如：每周需要整理销售表、提取异常订单，并生成一份运营周报，希望减少人工整理和写报告的时间。"
                className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
              {errors.description ? <p className="mt-2 text-xs font-medium text-red-600">{errors.description}</p> : null}
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={form.hasSample}
                  onChange={(event) => {
                    updateField("hasSample", event.target.checked);
                    if (!event.target.checked) setSampleFile(null);
                  }}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-950">是否有示例文件上传</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">可上传表格、文档或流程模板，帮助我更快理解实际业务。</span>
                </span>
              </label>

              {form.hasSample ? (
                <div className="mt-4">
                  {sampleFile ? (
                    <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <FileUp className="h-4 w-4 shrink-0 text-blue-600" />
                        <span className="truncate text-sm font-medium text-slate-700">{sampleFile.name}</span>
                      </div>
                      <button type="button" onClick={() => setSampleFile(null)} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-950" aria-label="删除示例文件">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center transition hover:border-blue-300 hover:bg-blue-50/40">
                      <FileUp className="h-6 w-6 text-blue-600" />
                      <span className="mt-3 text-sm font-semibold text-slate-950">点击上传示例文件</span>
                      <span className="mt-1 text-xs text-slate-500">支持常见文档、表格和图片文件</span>
                      <input
                        type="file"
                        className="sr-only"
                        onChange={(event) => {
                          setSampleFile(event.target.files?.[0] ?? null);
                          setErrors((current) => {
                            const next = { ...current };
                            delete next.sampleFile;
                            return next;
                          });
                        }}
                      />
                    </label>
                  )}
                  {errors.sampleFile ? <p className="mt-2 text-xs font-medium text-red-600">{errors.sampleFile}</p> : null}
                </div>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isSubmitting ? "正在提交..." : "提交需求"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <aside className="space-y-5">
            <InfoCard />
            <ProcessCard />
          </aside>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <SectionHeader title="常见问题" description="以下是提交定制需求前经常会确认的问题。" />
          <div className="mt-10 divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-white px-6 shadow-sm">
            {faqs.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-slate-950">
                  {faq.question}
                  <span className="text-slate-400 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-7 text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function TextField({
  label,
  value,
  onChange,
  error,
  icon: Icon,
  required,
  className = ""
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  icon: LucideIcon;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-sm font-semibold text-slate-950">
        {label} {required ? <span className="text-blue-600">*</span> : null}
      </label>
      <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
        <Icon className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400"
          placeholder={`请输入${label}`}
        />
      </div>
      {error ? <p className="mt-2 text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-950">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function InfoCard() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_26px_80px_rgba(15,23,42,0.14)]">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-blue-200">
        <CheckCircle2 className="h-5 w-5" />
      </div>
      <h2 className="mt-6 text-xl font-semibold">我们可以帮你做什么？</h2>
      <div className="mt-5 space-y-3">
        {capabilities.map((item) => (
          <div key={item} className="flex items-center gap-3 text-sm text-slate-200">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-300" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProcessCard() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <Clock3 className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-semibold text-slate-950">联系流程</h2>
      </div>
      <div className="mt-5 space-y-4">
        {processSteps.map((step, index) => (
          <div key={step} className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-700">
              {index + 1}
            </span>
            <span className="pt-1 text-sm font-medium text-slate-700">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <h2 className="text-2xl font-semibold tracking-normal text-slate-950 sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-8 text-slate-600">{description}</p> : null}
    </div>
  );
}
