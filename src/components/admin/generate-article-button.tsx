"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { CATEGORIES, getCategoryName } from "@/lib/dummy-data";
import type { Theme } from "@/lib/admin-data";
import { ARTICLE_TYPE_LABEL, type ArticleType } from "@/lib/types";

type Mode = "queue_top" | "theme_id" | "custom";

type FormState = {
  mode: Mode;
  themeId: string;
  title: string;
  categorySlug: string;
  articleType: ArticleType;
  targetKeyword: string;
  note: string;
};

const INITIAL: FormState = {
  mode: "queue_top",
  themeId: "",
  title: "",
  categorySlug: "",
  articleType: "A",
  targetKeyword: "",
  note: "",
};

/**
 * 記事管理画面から AI 記事を1本生成する（キュー先頭／テーマ選択／手入力）。
 */
export function GenerateArticleButton({
  pendingThemes = [],
}: {
  pendingThemes?: Theme[];
}) {
  const router = useRouter();
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const topTheme = pendingThemes[0];

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !running) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, running]);

  function openModal() {
    setForm({
      ...INITIAL,
      themeId: pendingThemes[0]?.id ?? "",
    });
    setMessage(null);
    setError(null);
    setOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (running) return;

    if (form.mode === "queue_top" && !topTheme) {
      setError(
        "待ち行列にテーマがありません。生成条件でテーマを追加するか、「自分で入力」を選んでください。",
      );
      return;
    }
    if (form.mode === "theme_id" && !form.themeId) {
      setError("テーマを選択してください。");
      return;
    }
    if (form.mode === "custom" && !form.title.trim()) {
      setError("テーマ・タイトルを入力してください。");
      return;
    }

    setRunning(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: form.mode,
          themeId: form.mode === "theme_id" ? form.themeId : undefined,
          title: form.mode === "custom" ? form.title.trim() : undefined,
          categorySlug:
            form.mode === "custom" ? form.categorySlug || undefined : undefined,
          articleType: form.mode === "custom" ? form.articleType : undefined,
          targetKeyword:
            form.mode === "custom"
              ? form.targetKeyword.trim() || undefined
              : undefined,
          note: form.mode === "custom" ? form.note.trim() || undefined : undefined,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        status?: string;
        message?: string;
        slug?: string;
      };
      if (!res.ok || data.ok === false) {
        throw new Error(data.error ?? data.message ?? `HTTP ${res.status}`);
      }
      const status = data.status ?? "";
      const detail = data.message ?? "完了";
      setMessage(
        data.slug
          ? `[${status}] ${detail}（${data.slug}）`
          : `[${status}] ${detail}`,
      );
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRunning(false);
    }
  }

  const modes: { key: Mode; label: string; hint: string }[] = [
    {
      key: "queue_top",
      label: "キューの一番上から",
      hint: "生成条件の待ち行列の先頭テーマで生成します",
    },
    {
      key: "theme_id",
      label: "テーマから選択",
      hint: "待ち行列の中からテーマを選んで生成します",
    },
    {
      key: "custom",
      label: "自分で入力",
      hint: "タイトルなどを手入力して生成します",
    },
  ];

  return (
    <div className="flex flex-col items-stretch gap-1 sm:items-end">
      <button
        type="button"
        onClick={openModal}
        disabled={running}
        className="inline-flex items-center justify-center rounded-lg bg-navy-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy-800 disabled:cursor-wait disabled:opacity-70"
      >
        {running ? "生成中…（数分かかることがあります）" : "記事を生成する"}
      </button>
      {running && (
        <p className="text-xs text-slate-500">
          画面を閉じずにお待ちください。完了後に一覧が更新されます。
        </p>
      )}
      {message && (
        <p className="max-w-md text-xs font-medium text-emerald-700">{message}</p>
      )}
      {error && !open && (
        <p className="max-w-md text-xs font-medium text-red-600">{error}</p>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={() => {
            if (!running) setOpen(false);
          }}
        >
          <form
            onSubmit={submit}
            onClick={(ev) => ev.stopPropagation()}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 shadow-xl"
          >
            <h2 id={titleId} className="text-lg font-bold text-slate-900">
              どんな記事を作りますか？
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              待ち行列の先頭・テーマ選択・手入力から選べます。
            </p>

            <fieldset className="mt-5 space-y-2">
              <legend className="text-xs font-semibold text-slate-600">
                生成方法
              </legend>
              {modes.map((m) => (
                <label
                  key={m.key}
                  className={`flex cursor-pointer gap-3 rounded-lg border px-3 py-2.5 ${
                    form.mode === m.key
                      ? "border-navy-700 bg-navy-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="mode"
                    value={m.key}
                    checked={form.mode === m.key}
                    disabled={running}
                    onChange={() => setForm((f) => ({ ...f, mode: m.key }))}
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-sm font-bold text-slate-900">
                      {m.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {m.hint}
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>

            {form.mode === "queue_top" && (
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                <p className="text-xs font-semibold text-slate-500">
                  次に生成されるテーマ（1番目）
                </p>
                {topTheme ? (
                  <>
                    <p className="mt-1 text-sm font-bold leading-snug text-slate-900">
                      {topTheme.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {getCategoryName(topTheme.categorySlug)} ・ 記事型
                      {topTheme.articleType}
                    </p>
                  </>
                ) : (
                  <p className="mt-1 text-sm text-amber-700">
                    待ち行列が空です。生成条件でテーマを追加してください。
                  </p>
                )}
              </div>
            )}

            {form.mode === "theme_id" && (
              <label className="mt-4 block">
                <span className="text-xs font-semibold text-slate-600">
                  テーマを選択 <span className="text-red-500">*</span>
                </span>
                {pendingThemes.length === 0 ? (
                  <p className="mt-2 text-sm text-amber-700">
                    選択できるテーマがありません。生成条件で追加してください。
                  </p>
                ) : (
                  <select
                    value={form.themeId}
                    disabled={running}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, themeId: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-navy-600"
                  >
                    {pendingThemes.map((t, i) => (
                      <option key={t.id} value={t.id}>
                        {i + 1}. {t.title.slice(0, 60)}
                        {t.title.length > 60 ? "…" : ""}
                      </option>
                    ))}
                  </select>
                )}
              </label>
            )}

            {form.mode === "custom" && (
              <>
                <label className="mt-4 block">
                  <span className="text-xs font-semibold text-slate-600">
                    テーマ・タイトル <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="text"
                    value={form.title}
                    disabled={running}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    placeholder="例：解体工事のアスベスト事前調査の実務手順"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-navy-600"
                  />
                </label>

                <label className="mt-3 block">
                  <span className="text-xs font-semibold text-slate-600">
                    カテゴリー
                  </span>
                  <select
                    value={form.categorySlug}
                    disabled={running}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, categorySlug: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-navy-600"
                  >
                    <option value="">おまかせ</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>

                <fieldset className="mt-3">
                  <legend className="text-xs font-semibold text-slate-600">
                    記事型
                  </legend>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {(Object.keys(ARTICLE_TYPE_LABEL) as ArticleType[]).map(
                      (key) => (
                        <label
                          key={key}
                          className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-bold ${
                            form.articleType === key
                              ? "border-navy-700 bg-navy-700 text-white"
                              : "border-slate-300 bg-white text-slate-700"
                          }`}
                        >
                          <input
                            type="radio"
                            name="articleType"
                            value={key}
                            checked={form.articleType === key}
                            disabled={running}
                            onChange={() =>
                              setForm((f) => ({ ...f, articleType: key }))
                            }
                            className="sr-only"
                          />
                          {key}：{ARTICLE_TYPE_LABEL[key]}
                        </label>
                      ),
                    )}
                  </div>
                </fieldset>

                <label className="mt-3 block">
                  <span className="text-xs font-semibold text-slate-600">
                    狙うキーワード（任意）
                  </span>
                  <input
                    type="text"
                    value={form.targetKeyword}
                    disabled={running}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, targetKeyword: e.target.value }))
                    }
                    placeholder="例：アスベスト 事前調査"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-navy-600"
                  />
                </label>

                <label className="mt-3 block">
                  <span className="text-xs font-semibold text-slate-600">
                    追加の指示（任意）
                  </span>
                  <textarea
                    value={form.note}
                    disabled={running}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, note: e.target.value }))
                    }
                    rows={3}
                    placeholder="例：初心者向けに噛み砕いて。届出の流れを中心に。"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-navy-600"
                  />
                </label>
              </>
            )}

            {error && (
              <p className="mt-3 text-xs font-medium text-red-600">{error}</p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={running}
                onClick={() => setOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={running}
                className="rounded-lg bg-navy-700 px-4 py-2 text-sm font-bold text-white hover:bg-navy-800 disabled:cursor-wait disabled:opacity-70"
              >
                {running ? "生成中…" : "この内容で生成"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
