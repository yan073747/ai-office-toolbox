"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";

type WorkflowExperiencePlaceholderProps = {
  dark?: boolean;
  solutionName?: string;
  buttonText?: string;
  message?: string;
};

const defaultMessage = "该行业专属 AI 工作流正在搭建中，暂时无法直接体验。你可以先体验现有 AI 办公工具，或联系我们定制该方案。";

export default function WorkflowExperiencePlaceholder({
  dark = false,
  solutionName,
  buttonText = "立即体验",
  message = defaultMessage
}: WorkflowExperiencePlaceholderProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="w-full sm:w-auto">
      {/* 后续行业工作流上线后，可将该占位交互替换为真实工具路由。 */}
      <button
        type="button"
        onClick={() => setVisible(true)}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-slate-950 shadow-lg shadow-slate-950/10 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-100 sm:w-auto"
      >
        {buttonText}
        <ArrowRight className="h-4 w-4" />
      </button>

      {visible ? (
        <div className={dark ? "mt-4 w-full rounded-2xl border border-white/15 bg-white/[0.06] p-5 sm:w-[30rem]" : "mt-4 w-full rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:w-[30rem]"}>
          {solutionName ? <p className={dark ? "mb-2 text-sm font-semibold text-white" : "mb-2 text-sm font-semibold text-slate-950"}>{solutionName}</p> : null}
          <p className={dark ? "text-sm leading-7 text-slate-100" : "text-sm leading-7 text-slate-700"}>
            {message}
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <a
              href="/tools"
              className={
                dark
                  ? "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-100"
                  : "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50"
              }
            >
              体验现有工具
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/contact"
              className={
                dark
                  ? "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
                  : "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50"
              }
            >
              联系定制
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
