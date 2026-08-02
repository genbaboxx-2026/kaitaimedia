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
      <h1 className="text-xl font-bold text-slate-900">プロンプト管理</h1>
      <p className="mt-1 text-sm text-slate-500">
        生成ステップごとのプロンプトを編集します。プロンプトは prompts テーブルから取得します。
      </p>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {PROMPTS.map((d) => (
          <div key={d.step} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-bold text-slate-800">
              {PROMPT_STEP_LABEL[d.step]} のプロンプト
            </p>

            {/* 差し込み変数 */}
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
              rows={12}
              className="mt-3 w-full flex-1 rounded-md border border-slate-300 px-3 py-2 font-mono text-[13px] leading-relaxed focus:border-navy-600 focus:outline-none"
            />

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={() => save(d.step)}
                disabled={isPending}
                className="rounded-md bg-navy-700 px-4 py-2 text-sm font-bold text-white hover:bg-navy-600 disabled:opacity-60"
              >
                保存
              </button>
              {savedStep === d.step && (
                <span className="text-sm font-semibold text-emerald-700">保存しました</span>
              )}
              {errorStep === d.step && (
                <span className="text-sm font-semibold text-red-600">保存に失敗しました</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
