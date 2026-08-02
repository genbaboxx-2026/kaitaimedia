"use client";

import { useState, useTransition } from "react";
import { getCategoryName, CATEGORIES } from "@/lib/dummy-data";
import type { Theme, ThemePriority } from "@/lib/admin-data";
import type { ArticleType } from "@/lib/types";
import {
  setSettingAction,
  addThemeAction,
  deleteThemeAction,
  reorderThemesAction,
} from "@/app/admin/(app)/generation/actions";

interface Candidate {
  title: string;
  categorySlug: string;
  targetKeyword: string;
  articleType: ArticleType;
  priority: ThemePriority;
}

export function GenerationPolicy({
  initialInstruction,
  initialThemes,
}: {
  initialInstruction?: string;
  initialThemes?: Theme[];
}) {
  const [value, setValue] = useState(initialInstruction ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [themes, setThemes] = useState<Theme[]>(initialThemes ?? []);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [genre, setGenre] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function savePolicy() {
    setError(null);
    startTransition(async () => {
      const res = await setSettingAction("generation_instruction", value);
      if (res.ok) {
        setSaved(true);
        window.setTimeout(() => setSaved(false), 2500);
      } else {
        setError(res.error ?? "保存に失敗しました");
      }
    });
  }

  async function fetchCandidates(): Promise<Candidate[]> {
    const genreName = genre ? getCategoryName(genre) : "";
    const instruction = [
      value.trim(),
      genreName ? `カテゴリーは「${genreName}」のテーマを中心に。` : "",
    ]
      .filter(Boolean)
      .join(" ");
    const res = await fetch("/api/admin/themes/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instruction, count: 6 }),
    });
    if (!res.ok) throw new Error();
    const data = (await res.json()) as { themes: Candidate[] };
    const list = data.themes ?? [];
    if (!genre) return list;
    return list
      .filter((t) => t.categorySlug === genre)
      .concat(list.filter((t) => t.categorySlug !== genre));
  }

  async function showCandidates() {
    setLoading(true);
    setMsg(null);
    setError(null);
    try {
      // 入力した方針も同時に保存（次回の自動生成にも反映）
      if (value.trim()) {
        const saveRes = await setSettingAction("generation_instruction", value);
        if (!saveRes.ok) {
          setError(saveRes.error ?? "方針の保存に失敗しました");
        } else {
          setSaved(true);
          window.setTimeout(() => setSaved(false), 2500);
        }
      }
      setCandidates(await fetchCandidates());
      setMsg("候補を作成しました。追加したいものを選んでください。");
    } catch {
      setMsg("候補の取得に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  async function addOne(c: Candidate) {
    setMsg(null);
    const r = await addThemeAction({
      title: c.title,
      categorySlug: c.categorySlug,
      targetKeyword: c.targetKeyword ?? "",
      articleType: (
        ["A", "B", "C"].includes(c.articleType) ? c.articleType : "A"
      ) as ArticleType,
      priority: (
        ["high", "medium", "low"].includes(c.priority) ? c.priority : "medium"
      ) as ThemePriority,
    });
    if (r.ok && r.id) {
      setThemes((prev) => [
        ...prev,
        {
          id: r.id!,
          title: c.title,
          categorySlug: c.categorySlug,
          targetKeyword: c.targetKeyword ?? "",
          articleType: c.articleType ?? "A",
          priority: c.priority ?? "medium",
          status: "pending",
        },
      ]);
      setCandidates((prev) => prev.filter((x) => x.title !== c.title));
    } else {
      setMsg(r.error ?? "追加に失敗しました");
    }
  }

  function move(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= themes.length) return;
    const next = [...themes];
    [next[index], next[j]] = [next[j], next[index]];
    setThemes(next);
    reorderThemesAction(next.map((t) => t.id)).then((r) => {
      if (!r.ok) setMsg(r.error ?? "並び替えの保存に失敗しました");
    });
  }

  async function removeTheme(id: string) {
    const snapshot = themes;
    setThemes((prev) => prev.filter((t) => t.id !== id));
    const r = await deleteThemeAction(id);
    if (!r.ok) {
      setThemes(snapshot);
      setMsg(r.error ?? "削除に失敗しました");
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div>
        <h1 className="hidden text-xl font-bold text-slate-900 md:block">
          生成方針
        </h1>
        <p className="text-sm text-slate-500 md:mt-1">
          フリーテキストとジャンルを入れて「候補作成」→ 気に入ったテーマを追加 →
          記事管理から生成、の流れです。
        </p>
      </div>

      {/* 1カードで：フリーテキスト → ジャンル → 候補作成 */}
      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-bold text-slate-800">テーマ候補を作る</p>
        <p className="mt-0.5 text-xs text-slate-400">
          書きたい方向を入れてジャンルを選び、「候補作成」を押してください。
        </p>

        <label className="mt-4 block">
          <span className="text-xs font-semibold text-slate-600">
            フリーテキスト（任意）
          </span>
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={4}
            placeholder={
              "例：スタートアップがもし解体屋を始めたら\n例：初心者向けに噛み砕いて / 今週はアスベスト対策を中心に"
            }
            className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-navy-600 focus:outline-none"
          />
        </label>

        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="min-w-[12rem] flex-1">
            <span className="text-xs font-semibold text-slate-600">ジャンル</span>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm text-slate-700 focus:border-navy-600 focus:outline-none"
              aria-label="ジャンル"
            >
              <option value="">ランダム（全ジャンル）</option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={showCandidates}
            disabled={loading}
            className="rounded-md bg-navy-700 px-4 py-2 text-sm font-bold text-white hover:bg-navy-600 disabled:opacity-60"
          >
            {loading ? "作成中…" : "候補作成"}
          </button>
          <button
            type="button"
            onClick={savePolicy}
            disabled={isPending}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {isPending ? "保存中…" : "方針だけ保存"}
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
          {saved && (
            <span className="font-semibold text-emerald-700">保存しました</span>
          )}
          {error && (
            <span className="font-semibold text-red-600">{error}</span>
          )}
          {msg && <span className="text-navy-700">{msg}</span>}
        </div>

        {candidates.length > 0 && (
          <ul className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
            {candidates.map((c) => (
              <li
                key={c.title}
                className="flex items-center justify-between gap-3 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {c.title}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {getCategoryName(c.categorySlug)}
                    {c.targetKeyword ? ` ・ ${c.targetKeyword}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => addOne(c)}
                  className="shrink-0 rounded-md border border-navy-300 px-3 py-1 text-xs font-bold text-navy-700 hover:bg-navy-50"
                >
                  ＋ 追加
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 待ち行列 */}
      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-bold text-slate-800">
          追加済み（次に生成される順）：{themes.length} 件
        </p>
        <p className="mt-0.5 text-xs text-slate-400">
          記事管理の「キューの一番上から」は、ここの1番目が使われます。
        </p>

        {themes.length > 0 ? (
          <ul className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200">
            {themes.map((t, i) => (
              <li key={t.id} className="flex items-center gap-3 px-3 py-2.5">
                <div className="flex flex-col leading-none">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label="上へ"
                    className="text-slate-400 hover:text-navy-700 disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === themes.length - 1}
                    aria-label="下へ"
                    className="text-slate-400 hover:text-navy-700 disabled:opacity-30"
                  >
                    ▼
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-slate-800">
                    <span className="mr-2 font-bold text-slate-400">
                      {i + 1}
                    </span>
                    {t.title}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {getCategoryName(t.categorySlug)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeTheme(t.id)}
                  className="shrink-0 text-xs text-red-600 hover:underline"
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 rounded-lg border border-dashed border-slate-300 px-3 py-4 text-center text-xs text-slate-400">
            まだありません。上で候補を作って「＋ 追加」してください。
          </p>
        )}
      </div>
    </div>
  );
}
