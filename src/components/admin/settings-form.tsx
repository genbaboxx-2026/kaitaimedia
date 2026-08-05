"use client";

import { useState, useTransition } from "react";
import {
  AI_MODELS,
  CHECK_ITEMS,
  DEFAULT_SETTINGS,
  type GenerationSettings,
} from "@/lib/admin-config-data";
import { saveSettingsAction } from "@/app/admin/(app)/generation/actions";

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-navy-700" : "bg-slate-300"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="border-b border-slate-100 pb-2 text-sm font-bold text-slate-800">
        {title}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {hint && <p className="text-xs text-slate-400">{hint}</p>}
      </div>
      <div className="shrink-0 self-end sm:self-auto">{children}</div>
    </div>
  );
}

export function SettingsForm({ initial }: { initial?: GenerationSettings }) {
  const [s, setS] = useState<GenerationSettings>(initial ?? DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function set<K extends keyof GenerationSettings>(k: K, v: GenerationSettings[K]) {
    setS((prev) => ({ ...prev, [k]: v }));
  }

  function handleSave() {
    setError(null);
    const entries: { key: string; value: string }[] = [
      { key: "auto_publish_enabled", value: String(s.autoPublishEnabled) },
      { key: "generation_enabled", value: String(s.generationEnabled) },
      { key: "generation_time", value: s.generationTime },
      { key: "generation_interval_days", value: String(s.generationIntervalDays) },
      { key: "articles_per_day", value: String(s.articlesPerDay) },
      { key: "min_char_count", value: String(s.minCharCount) },
      { key: "max_char_count", value: String(s.maxCharCount) },
      { key: "writing_style", value: s.writingStyle },
      { key: "expertise_level", value: s.expertiseLevel },
      { key: "heading_count", value: String(s.headingCount) },
      { key: "faq_enabled", value: String(s.faqEnabled) },
      { key: "max_auto_revisions", value: String(s.maxAutoRevisions) },
      { key: "monthly_ai_budget_limit", value: String(s.monthlyAiBudgetLimit) },
      { key: "per_article_cost_limit_usd", value: String(s.perArticleCostLimitUsd) },
      { key: "ai_model", value: s.aiModel },
      ...CHECK_ITEMS.map((c) => ({
        key: `check_${c.key}_enabled`,
        value: String(s.checks[c.key]),
      })),
    ];
    startTransition(async () => {
      const res = await saveSettingsAction(entries);
      if (res.ok) {
        setSaved(true);
        window.setTimeout(() => setSaved(false), 2500);
      } else {
        setError(res.error ?? "保存に失敗しました");
      }
    });
  }

  const num =
    "w-28 rounded-md border border-slate-300 px-2.5 py-1.5 text-right text-sm focus:border-navy-600 focus:outline-none";
  const sel =
    "rounded-md border border-slate-300 px-2.5 py-1.5 text-sm focus:border-navy-600 focus:outline-none";

  return (
    <div className="mx-auto max-w-4xl pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden text-xl font-bold text-slate-900 md:block">
          生成設定
        </h1>
        <div className="hidden items-center gap-3 md:flex">
          {saved && (
            <span className="text-sm font-semibold text-emerald-700">保存しました</span>
          )}
          {error && (
            <span className="text-sm font-semibold text-red-600">保存失敗：{error}</span>
          )}
          <button
            onClick={handleSave}
            disabled={isPending}
            className="rounded-md bg-navy-700 px-4 py-2 text-sm font-bold text-white hover:bg-navy-600 disabled:opacity-60"
          >
            {isPending ? "保存中…" : "設定を保存"}
          </button>
        </div>
      </div>
      <p className="text-sm text-slate-500 md:mt-1">
        settings テーブルに保存されます（コードに定数を持ちません）。
      </p>

      <div className="mt-6 space-y-5">
        <Section title="自動生成の制御">
          <Row label="完全自動公開" hint="ON=合格記事を即公開 / OFF=すべて下書き">
            <Toggle checked={s.autoPublishEnabled} onChange={(v) => set("autoPublishEnabled", v)} />
          </Row>
          <Row label="自動生成を有効にする" hint="OFFで生成自体を停止">
            <Toggle checked={s.generationEnabled} onChange={(v) => set("generationEnabled", v)} />
          </Row>
          <Row
            label="実行時刻（JST）"
            hint="この時刻以降に自動生成します（Vercel Cronが約15分ごとに確認）。不足分だけ生成し、不合格下書きは成功数に含めず再試行。試行上限は生成本数×2。保存するだけで反映されます"
          >
            <input type="time" value={s.generationTime} onChange={(e) => set("generationTime", e.target.value)} className={sel} />
          </Row>
          <Row
            label="何日ごとに生成するか"
            hint="1=毎日 / 2=2日に1回 / 3=3日に1回。前回の定時完了日から数えます。保存するだけで反映されます"
          >
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={30}
                value={s.generationIntervalDays}
                onChange={(e) =>
                  set(
                    "generationIntervalDays",
                    Math.max(1, Math.floor(Number(e.target.value) || 1)),
                  )
                }
                className={num}
              />
              <span className="text-sm font-medium text-slate-600">日ごと</span>
            </div>
          </Row>
          <Row
            label="1回あたりの生成本数"
            hint="生成日に成功させる本数の上限（公開または合格下書き）。不合格下書きは成功数に含みません。試行上限は自動でこの値×2です"
          >
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={s.articlesPerDay}
                onChange={(e) => set("articlesPerDay", Number(e.target.value))}
                className={num}
              />
              <span className="text-sm font-medium text-slate-600">本</span>
            </div>
          </Row>
        </Section>

        <Section title="記事生成ルール">
          <Row label="文字数（下限・上限）">
            <div className="flex items-center gap-2">
              <input type="number" value={s.minCharCount} onChange={(e) => set("minCharCount", Number(e.target.value))} className={num} />
              <span className="text-slate-400">〜</span>
              <input type="number" value={s.maxCharCount} onChange={(e) => set("maxCharCount", Number(e.target.value))} className={num} />
            </div>
          </Row>
          <Row label="文体">
            <select value={s.writingStyle} onChange={(e) => set("writingStyle", e.target.value as GenerationSettings["writingStyle"])} className={sel}>
              <option value="desu_masu">です・ます</option>
              <option value="dearu">だ・である</option>
            </select>
          </Row>
          <Row label="専門用語のレベル">
            <select value={s.expertiseLevel} onChange={(e) => set("expertiseLevel", e.target.value as GenerationSettings["expertiseLevel"])} className={sel}>
              <option value="beginner">初級</option>
              <option value="intermediate">中級</option>
              <option value="advanced">上級</option>
            </select>
          </Row>
          <Row label="見出し数の目安（H2）">
            <input type="number" value={s.headingCount} onChange={(e) => set("headingCount", Number(e.target.value))} className={num} />
          </Row>
          <Row label="FAQセクションを付ける">
            <Toggle checked={s.faqEnabled} onChange={(v) => set("faqEnabled", v)} />
          </Row>
          <Row label="自動修正の上限回数" hint="要件：最大2回">
            <input type="number" min={0} max={5} value={s.maxAutoRevisions} onChange={(e) => set("maxAutoRevisions", Number(e.target.value))} className={num} />
          </Row>
        </Section>

        <Section title="品質チェックの有効／無効">
          <div className="grid gap-y-3 sm:grid-cols-2">
            {CHECK_ITEMS.map((c) => (
              <label key={c.key} className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={s.checks[c.key]}
                  onChange={(e) => set("checks", { ...s.checks, [c.key]: e.target.checked })}
                />
                {c.label}
              </label>
            ))}
          </div>
        </Section>

        <Section title="コスト制御">
          <Row
            label="月間AI利用料の上限（円）"
            hint="0で上限なし。超過で自動停止（ログのUSD概算×約150円で比較）"
          >
            <input type="number" min={0} value={s.monthlyAiBudgetLimit} onChange={(e) => set("monthlyAiBudgetLimit", Number(e.target.value))} className={num} />
          </Row>
          <Row
            label="1記事あたりのコスト上限（USD）"
            hint="0で上限なし。超過でその記事の生成を中断"
          >
            <input
              type="number"
              min={0}
              step={0.1}
              value={s.perArticleCostLimitUsd}
              onChange={(e) => set("perArticleCostLimitUsd", Number(e.target.value))}
              className={num}
            />
          </Row>
          <Row label="使用するAIモデル">
            <select value={s.aiModel} onChange={(e) => set("aiModel", e.target.value)} className={sel}>
              {AI_MODELS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </Row>
        </Section>
      </div>

      {/* モバイル：固定保存バー */}
      <div
        className="fixed inset-x-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md md:hidden"
        style={{
          bottom: "calc(3.5rem + env(safe-area-inset-bottom))",
        }}
      >
        <div className="flex items-center gap-3">
          {(saved || error) && (
            <span
              className={`text-xs font-bold ${saved ? "text-emerald-700" : "text-red-600"}`}
            >
              {saved ? "保存しました" : `保存失敗`}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isPending}
            className="ml-auto flex-1 rounded-xl bg-navy-700 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {isPending ? "保存中…" : "設定を保存"}
          </button>
        </div>
      </div>
    </div>
  );
}
