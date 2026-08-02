"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { CATEGORIES } from "@/lib/dummy-data";
import { ARTICLE_TYPE_LABEL, type ArticleType } from "@/lib/types";

type FormState = {
  title: string;
  categorySlug: string;
  articleType: ArticleType;
  targetKeyword: string;
  note: string;
  aiTitle: boolean;
};

const INITIAL: FormState = {
  title: "",
  categorySlug: "",
  articleType: "A",
  targetKeyword: "",
  note: "",
  aiTitle: false,
};

/**
 * 記事管理画面から AI 記事を1本生成する（内容を指定するモーダル付き）。
 */
export function GenerateArticleButton() {
  const router = useRouter();
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !running) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, running]);

  function openModal() {
    setForm(INITIAL);
    setMessage(null);
    setError(null);
    setOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (running) return;

    if (!form.aiTitle && !form.title.trim()) {
      setError("テーマ・タイトルを入力するか、「タイトルはAIにおまかせ」をオンにしてください。");
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
          title: form.aiTitle ? "" : form.title.trim(),
          categorySlug: form.categorySlug || undefined,
          articleType: form.articleType,
          targetKeyword: form.targetKeyword.trim() || undefined,
          note: form.note.trim() || undefined,
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
              内容を指定して生成します。空欄の項目はAIが補います。
            </p>

            <label className="mt-5 flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.aiTitle}
                disabled={running}
                onChange={(e) =>
                  setForm((f) => ({ ...f, aiTitle: e.target.checked }))
                }
              />
              タイトルはAIにおまかせ
            </label>

            {!form.aiTitle && (
              <label className="mt-3 block">
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
            )}

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
