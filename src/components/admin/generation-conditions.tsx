"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ThemeManager } from "@/components/admin/theme-manager";
import { SettingsForm } from "@/components/admin/settings-form";
import { PromptManager } from "@/components/admin/prompt-manager";
import { MasterManager } from "@/components/admin/master-manager";
import type {
  GenerationSettings,
  MasterRow,
  MasterType,
} from "@/lib/admin-config-data";
import type { ActivePrompt } from "@/lib/admin/fetch-generation";
import type { Theme } from "@/lib/admin-data";

type SubTab = "themes" | "settings" | "masters" | "prompts";

interface GenerationConditionsProps {
  initialPrompts?: ActivePrompt[];
  initialSettings?: GenerationSettings;
  initialThemes?: Theme[];
  initialMasters?: Record<MasterType, MasterRow[]>;
}

const SUBTABS: { key: SubTab; label: string; hint: string }[] = [
  { key: "themes", label: "テーマ", hint: "何を書くか（AIが20件を自動維持・調整可）" },
  { key: "settings", label: "生成設定", hint: "文字数・文体・自動公開・品質基準・モデルなど" },
  { key: "masters", label: "ルール", hint: "用語集・禁止/推奨表現・数値除外・記事型テンプレ" },
  { key: "prompts", label: "プロンプト", hint: "AIへの指示文（構成/本文/SEO/修正/AI判定）" },
];

export function GenerationConditions(props: GenerationConditionsProps) {
  return (
    <Suspense fallback={null}>
      <GenerationConditionsInner {...props} />
    </Suspense>
  );
}

function GenerationConditionsInner({
  initialPrompts,
  initialSettings,
  initialThemes,
  initialMasters,
}: GenerationConditionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const raw = params.get("tab");
  const tab: SubTab = SUBTABS.some((t) => t.key === raw)
    ? (raw as SubTab)
    : "themes";
  const active = SUBTABS.find((t) => t.key === tab)!;

  function setTab(key: SubTab) {
    router.replace(`${pathname}?tab=${key}`, { scroll: false });
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-xl font-bold text-slate-900">生成条件</h1>
      <p className="mt-1 text-sm text-slate-500">
        AIが記事を「何を・どう書くか」の条件をまとめて管理します。
      </p>

      <div className="mt-4 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {SUBTABS.map((t) => {
          const isActive = t.key === tab;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
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
        {tab === "themes" && <ThemeManager initial={initialThemes} />}
        {tab === "settings" && <SettingsForm initial={initialSettings} />}
        {tab === "prompts" && <PromptManager initial={initialPrompts} />}
        {tab === "masters" && <MasterManager initial={initialMasters} />}
      </div>
    </div>
  );
}
