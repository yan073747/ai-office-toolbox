"use client";

import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
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

const industries = ["电商", "外贸", "教育", "企业办公", "自媒体", "其他"];
const budgets = ["500元以下", "500-1000元", "1000-3000元", "3000元以上"];

const capabilities = [
  "AI 工作流搭建",
  "AI 办公工具定制",
  "文档自动总结",
  "表格自动分析",
  "企业知识库问答",
  "自动生成报告"
];

const processSteps = ["提交需求", "初步沟通", "确认报价", "开发交付", "测试优化"];

const faqs = [
  {
    question: "定制一个工具大概要多少钱？",
    answer: "轻量工具通常从几百元起，复杂流程会根据文件类型、流程节点、交付范围和维护需求单独评估。"
  },
  {
    question: "多久可以交付？",
    answer: "简单工具一般 3-7 天可以交付初版，涉及多流程、多文件或企业知识库的项目会先确认排期。"
  },
  {
    question: "可以只做一个小功能吗？",
    answer: "可以。你可以先从一个高频重复任务开始，例如表格整理、报告生成、文案润色或文档总结。"
  },
  {
    question: "是否支持后期维护？",
    answer: "支持。可以根据你的使用反馈继续优化提示词、字段、输出格式和业务流程。"
  }
];

type FormState = {
  name: string;
  company: string;
  phone: string;
  wechat: string;
  email: string;
  industry: string;
  description: string;
  hasSample: boolean;
  budget: string;
};

type FormErrors = Partial<Record<keyof FormState | "contact" | "sampleFile", string>>;

const initialForm: FormState = {
  name: "",
  company: "",
  phone: "",
  wechat: "",
  email: "",
  industry: "企业办公",
  description: "",
  hasSample: false,
  budget: "500-1000元"
};

export default function ContactPageClient() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [sampleFile, setSampleFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const contactProvided = useMemo(() => {
    return Boolean(form.phone.trim() || form.wechat.trim() || form.email.trim());
  }, [form.email, form.phone, form.wechat]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      if (key === "phone" || key === "wechat" || key === "email") {
        delete next.contact;
      }
      return next;
    });
  }

  function validate() {
    const nextErrors: FormErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "请输入姓名。";
    }

    if (!contactProvided) {
      nextErrors.contact = "请至少填写手机号、微信号或邮箱中的一项。";
    }

    if (!form.description.trim()) {
      nextErrors.description = "请简单描述你的业务场景或想解决的问题。";
    }

    if (form.hasSample && !sampleFile) {
      nextErrors.sampleFile = "请上传示例文件，或取消示例文件选项。";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(false);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    const payload = {
      ...form,
      sampleFile: sampleFile
        ? {
            name: sampleFile.name,
            size: sampleFile.size,
            type: sampleFile.type || "unknown"
          }
        : null
    };

    console.log("contact demand payload", payload);

    window.setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setForm(initialForm);
      setSampleFile(null);
      setErrors({});
    }, 700);
  }

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#F8FAFC_0%,#FFFFFF_100%)] px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.78fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              <Sparkles className="h-4 w-4 text-blue-600" />
              企业与团队定制咨询
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-6xl">
              告诉我们你的需求，我们帮你定制 AI 办公助手
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              适合企业、小团队、个体户、电商商家、外贸公司等业务场景。把重复的表格、文档、汇报和沟通任务，做成稳定可用的办公助手。
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_26px_80px_rgba(15,23,42,0.08)]">
            <div className="grid grid-cols-2 gap-4">
              {[
                ["响应方式", "人工初步沟通"],
                ["适合场景", "办公自动化"],
                ["交付形态", "网页工具"],
                ["后续支持", "可持续优化"]
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-500">{label}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
                </div>
              ))}
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
                <p className="mt-2 text-sm leading-6 text-slate-500">填写越具体，越方便我们判断适合的工具方案和预算范围。</p>
              </div>
              <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white sm:flex">
                <Send className="h-5 w-5" />
              </div>
            </div>

            {submitted ? (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800">
                需求已提交，我们会尽快与你联系。
              </div>
            ) : null}

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <TextField label="姓名" value={form.name} onChange={(value) => updateField("name", value)} error={errors.name} icon={UserRound} required />
              <TextField label="公司 / 团队名称" value={form.company} onChange={(value) => updateField("company", value)} icon={Building2} />
              <TextField label="手机号" value={form.phone} onChange={(value) => updateField("phone", value)} error={errors.contact} icon={Phone} />
              <TextField label="微信号" value={form.wechat} onChange={(value) => updateField("wechat", value)} icon={MessageSquareText} />
              <TextField label="邮箱" value={form.email} onChange={(value) => updateField("email", value)} icon={Mail} className="md:col-span-2" />

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
                    if (!event.target.checked) {
                      setSampleFile(null);
                    }
                  }}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-950">是否有示例文件上传</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">可上传表格、文档或流程模板，帮助我们更快理解实际业务。</span>
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
                      <button
                        type="button"
                        onClick={() => setSampleFile(null)}
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
                        aria-label="删除示例文件"
                      >
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
          <SectionHeader title="常见问题" description="以下是定制前经常会确认的问题，具体方案会根据你的流程复杂度评估。" />
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
  icon: typeof UserRound;
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
        <h2 className="text-lg font-semibold text-slate-950">提交流程</h2>
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
