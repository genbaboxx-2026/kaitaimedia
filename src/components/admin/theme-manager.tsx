"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/dummy-data";
import {
  PRIORITY_LABEL,
  THEME_STOCK_WARNING,
  THEMES,
  type Theme,
  type ThemePriority,
} from "@/lib/admin-data";
import type { ArticleType } from "@/lib/types";
import {
  saveThemeAction,
  addThemeAction,
  deleteThemeAction,
  reorderThemesAction,
} from "@/app/admin/(app)/generation/actions";

const PRIORITY_RANK: Record<ThemePriority, number> = { high: 0, medium: 1, low: 2 };

// 優先度（高→中→低）で安定ソート。同じ優先度内の並び順は維持される。
function sortByPriority(list: Theme[]): Theme[] {
  return [...list].sort(
    (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority],
  );
}

export function ThemeManager({ initial }: { initial?: Theme[] }) {
  // テーマ管理は「未生成の待ち行列」。DBの未生成テーマを表示（無ければダミー）。
  const [rows, setRows] = useState<Theme[]>(
    sortByPriority((initial ?? THEMES.filter((t) => t.status === "pending"))),
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // AIによるテーマ提案
  const [instruction, setInstruction] = useState("");
  const [generating, setGenerating] = useState(false);
  const [aiMsg, setAiMsg] = useState<string | null>(null);

  async function generateWithAI() {
    const need = Math.max(0, THEME_STOCK_WARNING - pendingCount);
    if (need === 0) {
      setAiMsg(`未生成テーマは既に${THEME_STOCK_WARNING}件以上あります。補充は不要です。`);
      return;
    }
    setGenerating(true);
    setAiMsg(null);
    try {
      const res = await fetch("/api/admin/themes/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction, count: need }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as {
        themes: {
          title: string;
          categorySlug: string;
          targetKeyword: string;
          articleType: ArticleType;
          priority: ThemePriority;
        }[];
        source: string;
      };
      // それぞれDBに保存して実IDを得る
      const added: Theme[] = [];
      for (const s of data.themes) {
        const categorySlug =
          CATEGORIES.find((c) => c.slug === s.categorySlug)?.slug ?? CATEGORIES[0].slug;
        const articleType = (["A", "B", "C"].includes(s.articleType)
          ? s.articleType
          : "A") as ArticleType;
        const priority = (["high", "medium", "low"].includes(s.priority)
          ? s.priority
          : "medium") as ThemePriority;
        const r = await addThemeAction({
          title: s.title,
          categorySlug,
          targetKeyword: s.targetKeyword ?? "",
          articleType,
          priority,
        });
        if (r.ok && r.id) {
          added.push({
            id: r.id,
            title: s.title,
            categorySlug,
            targetKeyword: s.targetKeyword ?? "",
            articleType,
            priority,
            status: "pending",
          });
        }
      }
      setRows((prev) => sortByPriority([...prev, ...added]));
      setAiMsg(
        `${added.length}件補充しDBに保存しました${
          data.source === "mock" ? "（ダミー：ANTHROPIC_API_KEY 未設定）" : ""
        }。順番の変更・内容の修正・削除で調整してください。`,
      );
    } catch {
      setAiMsg("テーマ案の生成に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setGenerating(false);
    }
  }

  const pendingCount = rows.filter((t) => t.status === "pending").length;
  const need = Math.max(0, THEME_STOCK_WARNING - pendingCount);

  // ローカル状態だけ更新（テキスト入力の途中はDBに書かない）
  function update(id: string, patch: Partial<Theme>) {
    setRows((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, ...patch } : t));
      return patch.priority !== undefined ? sortByPriority(next) : next;
    });
  }

  // DBに保存（select変更時・テキストのblur時に呼ぶ）
  function commit(id: string, override?: Partial<Theme>) {
    const t = { ...rows.find((r) => r.id === id), ...override } as Theme | undefined;
    if (!t || !t.id) return;
    setErr(null);
    saveThemeAction(id, {
      title: t.title,
      categorySlug: t.categorySlug,
      targetKeyword: t.targetKeyword,
      priority: t.priority,
    }).then((r) => {
      if (!r.ok) setErr(r.error ?? "保存に失敗しました");
    });
  }

  async function remove(id: string) {
    const snapshot = rows;
    setErr(null);
    setRows((prev) => prev.filter((t) => t.id !== id));
    const r = await deleteThemeAction(id);
    if (!r.ok) {
      setRows(snapshot);
      setErr(r.error ?? "削除に失敗しました");
    }
  }

  function move(id: string, dir: -1 | 1) {
    let ordered: Theme[] = [];
    setRows((prev) => {
      const i = prev.findIndex((t) => t.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      ordered = sortByPriority(next);
      return ordered;
    });
    // 並び順をDBへ保存
    if (ordered.length > 0) {
      reorderThemesAction(ordered.map((t) => t.id)).then((r) => {
        if (!r.ok) setErr(r.error ?? "並び替えの保存に失敗しました");
      });
    }
  }

  async function addRow() {
    setBusy(true);
    setErr(null);
    const r = await addThemeAction({
      title: "",
      categorySlug: CATEGORIES[0].slug,
      targetKeyword: "",
      articleType: "A",
      priority: "medium",
    });
    setBusy(false);
    if (r.ok && r.id) {
      setRows((prev) =>
        sortByPriority([
          ...prev,
          {
            id: r.id!,
            title: "",
            categorySlug: CATEGORIES[0].slug,
            targetKeyword: "",
            articleType: "A",
            priority: "medium",
            status: "pending",
          },
        ]),
      );
    } else {
      setErr(r.error ?? "追加に失敗しました");
    }
  }

  const cell =
    "w-full rounded border border-slate-200 bg-white px-2 py-1 text-sm focus:border-navy-600 focus:outline-none";

  return (
    <div className="mx-auto max-w-6xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">テーマ管理</h1>
        <p className="mt-1 text-sm text-slate-500">
          AIがテーマ案を提案します。あなたは順番の変更・内容の修正・追加・削除で調整してください。（未生成：{pendingCount} 件 / 目安 {THEME_STOCK_WARNING} 件）
        </p>
      </div>

      {/* AIがテーマ在庫を自動でキープ */}
      <div className="mt-4 rounded-xl border border-navy-100 bg-navy-50 p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="指示（任意）例：アスベスト・産廃を多めに / 初心者向けに"
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-navy-600 focus:outline-none"
          />
          <button
            onClick={generateWithAI}
            disabled={generating}
            className="shrink-0 rounded-md bg-navy-700 px-4 py-2 text-sm font-bold text-white hover:bg-navy-600 disabled:opacity-60"
          >
            {generating
              ? "生成中…"
              : need > 0
                ? `不足分をAIで補充（あと${need}件）`
                : "在庫は充分です"}
          </button>
        </div>
        {aiMsg && <p className="mt-2 text-xs text-navy-700">{aiMsg}</p>}
      </div>

      {err && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {err}
        </div>
      )}

      <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[56rem] text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
            <tr>
              <th className="px-3 py-2.5 font-semibold">並び</th>
              <th className="px-3 py-2.5 font-semibold">テーマ名</th>
              <th className="px-3 py-2.5 font-semibold">カテゴリー</th>
              <th className="px-3 py-2.5 font-semibold">狙うキーワード</th>
              <th className="px-3 py-2.5 font-semibold">優先度</th>
              <th className="px-3 py-2.5 font-semibold"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((t, i) => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="px-3 py-2 align-top">
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-right text-sm font-bold text-slate-500">{i + 1}</span>
                    <div className="flex flex-col">
                      <button onClick={() => move(t.id, -1)} disabled={i === 0} className="text-slate-400 hover:text-navy-700 disabled:opacity-30">▲</button>
                      <button onClick={() => move(t.id, 1)} disabled={i === rows.length - 1} className="text-slate-400 hover:text-navy-700 disabled:opacity-30">▼</button>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 align-top">
                  <input value={t.title} onChange={(e) => update(t.id, { title: e.target.value })} onBlur={() => commit(t.id)} className={cell} placeholder="テーマ名" />
                </td>
                <td className="px-3 py-2 align-top">
                  <select value={t.categorySlug} onChange={(e) => { update(t.id, { categorySlug: e.target.value }); commit(t.id, { categorySlug: e.target.value }); }} className={cell}>
                    {CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2 align-top">
                  <input value={t.targetKeyword} onChange={(e) => update(t.id, { targetKeyword: e.target.value })} onBlur={() => commit(t.id)} className={cell} />
                </td>
                <td className="px-3 py-2 align-top">
                  <select value={t.priority} onChange={(e) => { update(t.id, { priority: e.target.value as ThemePriority }); commit(t.id, { priority: e.target.value as ThemePriority }); }} className={cell}>
                    {(Object.keys(PRIORITY_LABEL) as ThemePriority[]).map((p) => (
                      <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2 align-top">
                  <button onClick={() => remove(t.id)} className="text-xs text-red-600 hover:underline">削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3">
        <button
          onClick={addRow}
          disabled={busy}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
        >
          ＋ テーマを追加
        </button>
      </div>
    </div>
  );
}
