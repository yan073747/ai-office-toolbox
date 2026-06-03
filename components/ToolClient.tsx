"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type TextField = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number";
  placeholder?: string;
  required?: boolean;
  min?: number;
};

type SelectField = {
  name: string;
  label: string;
  options: string[];
  required?: boolean;
};

type Field = TextField | SelectField;

type ToolClientProps = {
  endpoint: string;
  submitLabel: string;
  file?: {
    name: string;
    label: string;
    accept: string;
    required?: boolean;
  };
  fields?: Field[];
};

function isSelectField(field: Field): field is SelectField {
  return "options" in field;
}

export default function ToolClient({ endpoint, submitLabel, file, fields = [] }: ToolClientProps) {
  const initialValues = useMemo(
    () =>
      Object.fromEntries(
        fields.map((field) => [field.name, isSelectField(field) ? field.options[0] || "" : ""])
      ) as Record<string, string>,
    [fields]
  );

  const [values, setValues] = useState(initialValues);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult("");
    setCopied(false);

    if (file?.required && !selectedFile) {
      setError("请选择需要处理的文件。");
      return;
    }

    setIsLoading(true);

    try {
      const isFileForm = Boolean(file);
      const response = await fetch(endpoint, {
        method: "POST",
        body: isFileForm ? buildFormData() : JSON.stringify(values),
        headers: isFileForm ? undefined : { "Content-Type": "application/json" }
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "生成失败，请稍后重试");
      }

      if (!data.result) {
        throw new Error("未生成有效结果，请调整输入后重试。");
      }

      setResult(data.result);
      window.requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "网络异常，请稍后重试。");
    } finally {
      setIsLoading(false);
    }
  }

  function buildFormData() {
    const formData = new FormData();
    if (selectedFile && file) {
      formData.append(file.name, selectedFile);
    }

    for (const [key, value] of Object.entries(values)) {
      formData.append(key, value);
    }

    return formData;
  }

  async function copyResult() {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <form onSubmit={handleSubmit} className="rounded-xl border border-line bg-white p-5 shadow-sm sm:p-6">
        <div className="space-y-5">
          {file ? (
            <div>
              <label htmlFor={file.name} className="mb-2 block text-sm font-medium text-ink">
                {file.label}
              </label>
              <input
                ref={fileInputRef}
                id={file.name}
                name={file.name}
                type="file"
                accept={file.accept}
                required={file.required}
                onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                className="block w-full cursor-pointer rounded-lg border border-line bg-white text-sm text-muted file:mr-4 file:border-0 file:bg-ink file:px-4 file:py-3 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700"
              />
              {selectedFile ? <p className="mt-2 text-sm text-muted">已选择：{selectedFile.name}</p> : null}
            </div>
          ) : null}

          {fields.map((field) => (
            <div key={field.name}>
              <label htmlFor={field.name} className="mb-2 block text-sm font-medium text-ink">
                {field.label}
              </label>
              {isSelectField(field) ? (
                <select
                  id={field.name}
                  name={field.name}
                  required={field.required}
                  value={values[field.name] || ""}
                  onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                  className="min-h-11 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-blue-50"
                >
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  required={field.required}
                  placeholder={field.placeholder}
                  value={values[field.name] || ""}
                  onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                  className="min-h-40 w-full resize-y rounded-lg border border-line bg-white px-4 py-3 text-sm leading-7 text-ink outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-4 focus:ring-blue-50"
                />
              ) : (
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type || "text"}
                  min={field.min}
                  required={field.required}
                  placeholder={field.placeholder}
                  value={values[field.name] || ""}
                  onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                  className="min-h-11 w-full rounded-lg border border-line bg-white px-4 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-4 focus:ring-blue-50"
                />
              )}
            </div>
          ))}

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-brand px-5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isLoading ? "生成中..." : submitLabel}
          </button>
        </div>
      </form>

      <section ref={resultRef} className="rounded-xl border border-line bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3 border-b border-line pb-4">
          <h2 className="text-lg font-semibold text-ink">AI 输出结果</h2>
          <button
            type="button"
            onClick={copyResult}
            disabled={!result}
            className="inline-flex min-h-9 items-center justify-center rounded-lg border border-line bg-white px-3 text-sm font-medium text-ink transition hover:bg-soft disabled:cursor-not-allowed disabled:text-slate-300"
          >
            {copied ? "已复制" : "复制结果"}
          </button>
        </div>

        <div className="mt-5 min-h-80">
          {isLoading ? <p className="text-sm text-muted">AI 正在处理，请稍候。</p> : null}
          {!isLoading && !result ? <p className="text-sm text-muted">生成结果会显示在这里。</p> : null}
          {result ? (
            <div className="markdown-body text-sm leading-7 text-ink">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
