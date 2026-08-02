"use client";

import { Fragment, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  ADMIN_ARTICLES,
  qualityStatusLabel,
  type AdminArticle,
  type AdminStatus,
} from "@/lib/admin-data";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatJaDateTime } from "@/lib/format";
import {
  publishArticleAction,
  unpublishArticleAction,
  deleteArticleAction,
} from "@/app/admin/(app)/articles/actions";

// 確認待ち → 要対応 → 公開中 の順で上から並べる
const STATUS_ORDER: Record<AdminStatus, number> = {
  draft: 0,
  failed: 1,
  unpublished: 1,
  published: 2,
};

export function ArticleTable({
  show = "all",
  articles,
}: {
  show?: "review" | "published" | "all";
  articles?: AdminArticle[];
} = {}) {
  const [rows, setRows] = useState<AdminArticle[]>(articles ?? ADMIN_ARTICLES);
  const [expanded, setExpanded] = useState<string | null>(null);

  const list = useMemo(() => {
    return [...rows].sort((a, b) => {
      const s = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      if (s !== 0) return s;
      return a.createdAt < b.createdAt ? 1 : -1;
    });
  }, [rows]);

  const [isPending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);

  function setStatus(id: string, status: AdminStatus) {
    const snapshot = rows;
    setErr(null);
    setRows((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status,
              publishedAt:
                status === "published" ? a.publishedAt ?? a.createdAt : null,
            }
          : a,
      ),
    );
    startTransition(async () => {
      const res =
        status === "published"
          ? await publishArticleAction(id)
          : await unpublishArticleAction(id);
      if (!res.ok) {
        setRows(snapshot);
        setErr(res.error ?? "更新に失敗しました");
      }
    });
  }

  function remove(id: string) {
    if (!window.confirm("この記事を削除しますか？（元に戻せません）")) return;
    const snapshot = rows;
    setErr(null);
    setRows((prev) => prev.filter((a) => a.id !== id));
    startTransition(async () => {
      const res = await deleteArticleAction(id);
      if (!res.ok) {
        setRows(snapshot);
        setErr(res.error ?? "削除に失敗しました");
      }
    });
  }

  const GROUPS: {
    key: string;
    label: string;
    hint: string;
    accent: string;
    match: (a: AdminArticle) => boolean;
  }[] = [
    {
      key: "review",
      label: "AI生成・確認待ち",
      hint: "AIが作った下書き。生成に失敗した記事や公開を停止した記事もここに下書きとして入ります（バッジで状態が分かります）。確認して公開・編集、または削除してください。",
      accent: "bg-amber-400",
      match: (a) => a.status !== "published",
    },
    {
      key: "published",
      label: "公開中",
      hint: "サイトに公開中の記事。編集・公開停止・削除ができます。",
      accent: "bg-emerald-400",
      match: (a) => a.status === "published",
    },
  ];

  function ActionMenu({ a }: { a: AdminArticle }) {
    return (
      <div className="relative inline-block text-left">
        <button
          onClick={() => setMenuId(menuId === a.id ? null : a.id)}
          aria-label="操作メニュー"
          aria-haspopup="menu"
          className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-base leading-none text-slate-600 hover:bg-slate-100"
        >
          ⋯
        </button>
        {menuId === a.id && (
          <>
            <button
              aria-hidden
              tabIndex={-1}
              onClick={() => setMenuId(null)}
              className="fixed inset-0 z-10 cursor-default"
            />
            <div
              role="menu"
              className="absolute right-0 z-20 mt-1 w-36 overflow-hidden rounded-md border border-slate-200 bg-white py-1 shadow-lg"
            >
              <Link
                href={`/admin/articles/${a.id}`}
                className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                onClick={() => setMenuId(null)}
              >
                編集
              </Link>
              <Link
                href={`/admin/articles/${a.id}/preview`}
                target="_blank"
                className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                onClick={() => setMenuId(null)}
              >
                プレビュー
              </Link>
              {a.status === "published" ? (
                <button
                  onClick={() => {
                    setMenuId(null);
                    setStatus(a.id, "unpublished");
                  }}
                  className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                >
                  公開停止
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMenuId(null);
                    setStatus(a.id, "published");
                  }}
                  className="block w-full px-3 py-2 text-left text-sm font-semibold text-navy-700 hover:bg-slate-100"
                >
                  公開する
                </button>
              )}
              <button
                onClick={() => {
                  setMenuId(null);
                  remove(a.id);
                }}
                className="block w-full border-t border-slate-100 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                削除
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  function renderMobileCard(a: AdminArticle) {
    const quality = qualityStatusLabel(a);
    const isOpen = expanded === a.id;
    return (
      <li key={a.id} className="border-b border-slate-100 last:border-b-0">
        <div className="flex items-start gap-3 px-4 py-3.5">
          <button
            type="button"
            onClick={() => setExpanded(isOpen ? null : a.id)}
            className="min-w-0 flex-1 text-left active:opacity-70"
          >
            <div className="flex flex-wrap items-center gap-1.5">
              <StatusBadge status={a.status} />
              <span className="text-[11px] text-slate-400">{a.categoryName}</span>
            </div>
            <p className="mt-1.5 text-[15px] font-bold leading-snug text-ink">
              {a.title}
            </p>
            <p className="mt-1.5 text-[11px] text-slate-400">
              品質 {quality.label} · {a.charCount.toLocaleString()}字 ·{" "}
              {formatJaDateTime(a.createdAt)}
            </p>
            {a.failedChecks.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {a.failedChecks.map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-700 ring-1 ring-red-200"
                  >
                    {f}
                  </span>
                ))}
              </div>
            )}
          </button>
          <ActionMenu a={a} />
        </div>

        {isOpen && (
          <div className="space-y-3 bg-slate-50 px-4 py-3">
            <div>
              <p className="text-[11px] font-semibold text-slate-500">本文冒頭</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">
                {a.excerpt}
              </p>
            </div>
            {a.failedChecks.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-slate-500">
                  要確認項目
                </p>
                <ul className="mt-1 space-y-1 text-sm text-red-700">
                  {a.failedChecks.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <Link
                href={`/admin/articles/${a.id}`}
                className="flex-1 rounded-lg bg-navy-700 py-2.5 text-center text-sm font-bold text-white"
              >
                編集
              </Link>
              {a.status === "published" ? (
                <button
                  type="button"
                  onClick={() => setStatus(a.id, "unpublished")}
                  className="flex-1 rounded-lg border border-slate-300 py-2.5 text-sm font-bold text-slate-700"
                >
                  公開停止
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStatus(a.id, "published")}
                  className="flex-1 rounded-lg bg-brand-600 py-2.5 text-sm font-bold text-white"
                >
                  公開する
                </button>
              )}
            </div>
          </div>
        )}
      </li>
    );
  }

  function renderRow(a: AdminArticle) {
    const quality = qualityStatusLabel(a);
    const isOpen = expanded === a.id;
    return (
      <Fragment key={a.id}>
        <tr className="hover:bg-slate-50">
          <td className="px-4 py-2.5 align-top">
            <div className="flex items-center gap-2">
              <StatusBadge status={a.status} />
              <button
                onClick={() => setExpanded(isOpen ? null : a.id)}
                className="text-left font-medium text-slate-800 hover:text-navy-700"
              >
                {a.title}
              </button>
            </div>
            {a.failedChecks.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {a.failedChecks.map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center rounded bg-red-50 px-1.5 py-0.5 text-[11px] font-bold text-red-700 ring-1 ring-red-200"
                  >
                    {f}
                  </span>
                ))}
              </div>
            )}
          </td>
          <td className="px-4 py-2.5 align-top whitespace-nowrap text-slate-600">
            {a.categoryName}
          </td>
          <td className="px-4 py-2.5 align-top">
            <span
              className={quality.ok ? "text-emerald-700" : "text-amber-700"}
            >
              {quality.label}
            </span>
          </td>
          <td className="px-4 py-2.5 align-top text-slate-500">
            {a.charCount.toLocaleString()}
          </td>
          <td className="px-4 py-2.5 align-top whitespace-nowrap text-slate-500">
            {formatJaDateTime(a.createdAt)}
          </td>
          <td className="px-4 py-2.5 align-top text-right">
            <ActionMenu a={a} />
          </td>
        </tr>
        {isOpen && (
          <tr className="bg-slate-50">
            <td colSpan={6} className="px-6 py-4">
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <p className="text-xs font-semibold text-slate-500">本文冒頭</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-700">
                    {a.excerpt}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">品質</p>
                  {a.failedChecks.length === 0 ? (
                    <p className="mt-1 text-sm text-emerald-700">合格</p>
                  ) : (
                    <ul className="mt-1 space-y-1 text-sm text-red-700">
                      {a.failedChecks.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </td>
          </tr>
        )}
      </Fragment>
    );
  }

  const visibleGroups = GROUPS.filter((g) => show === "all" || g.key === show);

  return (
    <div className={`space-y-8 ${isPending ? "opacity-70" : ""}`}>
      {err && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          反映に失敗しました：{err}
        </div>
      )}
      {visibleGroups.map((g) => {
        const items = list.filter(g.match);
        return (
          <section key={g.key}>
            <div className="flex items-baseline gap-2 px-1 md:px-0">
              <span className={`h-4 w-1.5 rounded-full ${g.accent}`} />
              <h2 className="text-base font-bold text-slate-900">{g.label}</h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                {items.length}
              </span>
            </div>
            <p className="mt-1 hidden text-xs text-slate-400 md:block">
              {g.hint}
            </p>

            {/* モバイル：カードリスト */}
            <ul className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white md:hidden">
              {items.length === 0 ? (
                <li className="px-4 py-8 text-center text-sm text-slate-400">
                  この括りに記事はありません。
                </li>
              ) : (
                items.map(renderMobileCard)
              )}
            </ul>

            {/* デスクトップ：テーブル */}
            <div className="mt-2 hidden overflow-x-auto rounded-xl border border-slate-200 bg-white md:block">
              <table className="w-full min-w-[52rem] text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">タイトル</th>
                    <th className="whitespace-nowrap px-4 py-2.5 font-semibold">
                      カテゴリー
                    </th>
                    <th className="px-4 py-2.5 font-semibold">品質</th>
                    <th className="px-4 py-2.5 font-semibold">文字数</th>
                    <th className="px-4 py-2.5 font-semibold">生成日</th>
                    <th className="px-4 py-2.5 text-right font-semibold">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map(renderRow)}
                  {items.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-sm text-slate-400"
                      >
                        この括りに記事はありません。
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
