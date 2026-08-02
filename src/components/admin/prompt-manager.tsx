"use client";

import { useState, useTransition } from "react";
import {
  PROMPTS,
  PROMPT_STEP_LABEL,
  type PromptStep,
} from "@/lib/admin-config-data";
import { savePromptAction } from "@/app/admin/(app)/generation/actions";

interface InitialPrompt {
  step: PromptStep;
  content: string;
  variables: string[];
}

type ContentMap = Record<PromptStep, string>;

// DBから来た有効プロンプト（initial）を優先。無ければダミーPROMPTSの初期値。
function buildInitial(initial?: InitialPrompt[]): {
  content: ContentMap;
  variables: Record<PromptStep, string[]>;
} {
  const content = {} as ContentMap;
  const variables = {} as Record<PromptStep, string[]>;
  for (const d of PROMPTS) {
    const active = d.versions.find((v) => v.version === d.activeVersion)!;
    content[d.step] = active.content;
    variables[d.step] = d.variables.map((v) => v.replace(/[{}]/g, ""));
  }
  if (initial) {
    for (const p of initial) {
      content[p.step] = p.content;
      variables[p.step] = p.variables;
    }
  }
  return { content, variables };
}

export function PromptManager({ initial }: { initial?: InitialPrompt[] }) {
  const built = buildInitial(initial);
  const [content, setContent] = useState<ContentMap>(built.content);
  const variablesByStep = built.variables;
  const [savedStep, setSavedStep] = useState<PromptStep | null>(null);
  const [errorStep, setErrorStep] = useState<PromptStep | null>(null);
  const [isPending, startTransition] = useTransition();

  function save(step: PromptStep) {
    setErrorStep(null);
    startTransition(async () => {
      const res = await savePromptAction(step, content[step]);
      if (res.ok) {
        setSavedStep(step);
        window.setTimeout(() => setSavedStep((s) => (s === step ? null : s)), 2500);
      } else {
        setErrorStep(step);
      }
    });
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="hidden text-xl font-bold text-slate-900 md:block">
        プロンプト管理
      </h1>
      <p className="text-sm text-slate-500 md:mt-1">
        生成ステップごとのプロンプトを編集します。
      </p>

      <div className="mt-4 grid gap-4 md:mt-5 md:gap-5 lg:grid-cols-2">
        {PROMPTS.map((d) => (
          <div
            key={d.step}
            className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 md:p-5"
          >
            <p className="text-[15px] font-black text-ink md:text-sm md:font-bold md:text-slate-800">
              {PROMPT_STEP_LABEL[d.step]} のプロンプト
            </p>

            <div className="mt-3">
              <p className="text-xs font-semibold text-slate-500">差し込み変数</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {(variablesByStep[d.step] ?? []).map((v) => (
                  <code
                    key={v}
                    className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-navy-700"
                  >
                    {`{{${v}}}`}
                  </code>
                ))}
              </div>
            </div>

            <textarea
              value={content[d.step]}
              onChange={(e) =>
                setContent((prev) => ({ ...prev, [d.step]: e.target.value }))
              }
              rows={10}
              className="mt-3 min-h-[12rem] w-full flex-1 rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-[14px] leading-relaxed focus:border-navy-600 focus:outline-none md:rounded-md md:py-2 md:text-[13px]"
            />

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={() => save(d.step)}
                disabled={isPending}
                className="w-full rounded-xl bg-navy-700 px-4 py-3 text-sm font-bold text-white active:bg-navy-600 disabled:opacity-60 md:w-auto md:rounded-md md:py-2"
              >
                保存
              </button>
              {savedStep === d.step && (
                <span className="text-sm font-semibold text-emerald-700">
                  保存しました
                </span>
              )}
              {errorStep === d.step && (
                <span className="text-sm font-semibold text-red-600">
                  保存に失敗しました
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
