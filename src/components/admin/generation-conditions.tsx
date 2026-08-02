"use client";

import { useState } from "react";
import { SettingsForm } from "@/components/admin/settings-form";
import { PromptManager } from "@/components/admin/prompt-manager";
import { GenerationPolicy } from "@/components/admin/generation-policy";
import type { GenerationSettings } from "@/lib/admin-config-data";
import type { ActivePrompt } from "@/lib/admin/fetch-generation";
import type { Theme } from "@/lib/admin-data";

type SubTab = "policy" | "settings" | "prompts";

interface GenerationConditionsProps {
  initialTab?: SubTab;
  initialPrompts?: ActivePrompt[];
  initialSettings?: GenerationSettings;
  initialThemes?: Theme[];
}

const SUBTABS: { key: SubTab; label: string; hint: string }[] = [
  {
    key: "policy",
    label: "生成方針",
    hint: "何を書くか（AIが毎回自動でテーマを決定・方針だけ指定）",
  },
  {
    key: "settings",
    label: "生成設定",
    hint: "文字数・文体・自動公開・モデルなど",
  },
  {
    key: "prompts",
    label: "プロンプト",
    hint: "AIへの指示文（構成/本文/SEO/修正/AI判定）",
  },
];

function isSubTab(v: string | undefined | null): v is SubTab {
  return SUBTABS.some((t) => t.key === v);
}

export function GenerationConditions({
  initialTab = "policy",
  initialPrompts,
  initialSettings,
  initialThemes,
}: GenerationConditionsProps) {
  const [tab, setTab] = useState<SubTab>(
    isSubTab(initialTab) ? initialTab : "policy",
  );

  function changeTab(key: SubTab) {
    setTab(key);
    // Next router を使わない＝RSC / データ再取得が走らない
    const url = new URL(window.location.href);
    url.searchParams.set("tab", key);
    window.history.replaceState(null, "", url.pathname + url.search);
  }

  const active = SUBTABS.find((t) => t.key === tab)!;

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="hidden text-xl font-bold text-slate-900 md:block">
        生成条件
      </h1>
      <p className="text-sm text-slate-500 md:mt-1">
        AIが記事を「何を・どう書くか」の条件をまとめて管理します。
      </p>

      <div className="mt-3 -mx-4 border-b border-slate-200 md:hidden">
        <div className="flex overflow-x-auto px-2 scrollbar-none">
          {SUBTABS.map((t) => {
            const isActive = t.key === tab;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => changeTab(t.key)}
                className={`relative shrink-0 px-3.5 py-3 text-[14px] whitespace-nowrap ${
                  isActive
                    ? "font-bold text-ink"
                    : "font-medium text-slate-400"
                }`}
              >
                {t.label}
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute inset-x-2 bottom-0 h-[3px] rounded-full bg-ink"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-400 md:hidden">{active.hint}</p>

      <div className="mt-4 hidden flex-wrap gap-2 border-b border-slate-200 pb-3 md:flex">
        {SUBTABS.map((t) => {
          const isActive = t.key === tab;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => changeTab(t.key)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                isActive
                  ? "bg-navy-700 text-white"
                  : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {t.label}
            </button>
          );
        })}
        <span className="flex items-center text-xs text-slate-400">
          {active.hint}
        </span>
      </div>

      <div className="mt-6">
        {tab === "policy" && (
          <GenerationPolicy
            initialInstruction={initialSettings?.generationInstruction}
            initialThemes={initialThemes}
          />
        )}
        {tab === "settings" && <SettingsForm initial={initialSettings} />}
        {tab === "prompts" && <PromptManager initial={initialPrompts} />}
      </div>
    </div>
  );
}
