"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  approveSnsTrendAction,
  rejectSnsTrendAction,
  resetSnsTrendAction,
} from "@/app/admin/(app)/sns-trends/actions";
import type { SnsTrendPost, SnsTrendStatus } from "@/lib/types";
import { formatRelativeJa } from "@/lib/format";

const STATUS_LABEL: Record<SnsTrendStatus, string> = {
  pending: "未審査",
  approved: "採用",
  rejected: "非採用",
};

const STATUS_STYLE: Record<SnsTrendStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-slate-200 text-slate-600",
};

type Filter = "all" | SnsTrendStatus;

export function SnsTrendManager({
  items,
}: {
  items: (SnsTrendPost & { reviewedAt?: string })[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("pending");
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered =
    filter === "all" ? items : items.filter((i) => i.status === filter);

  async function refresh() {
    setRefreshing(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/sns-trends/refresh", {
        method: "POST",
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        fetched?: number;
        upserted?: number;
        skipped?: number;
        model?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setMessage(
        `更新完了: 取得${data.fetched ?? 0}件 → 保存${data.upserted ?? 0}件（スキップ${data.skipped ?? 0}） / ${data.model ?? ""}`,
      );
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRefreshing(false);
    }
  }

  function runAction(
    id: string,
    action: (id: string) => Promise<{ ok: boolean; error?: string }>,
  ) {
    startTransition(async () => {
      setError(null);
      const result = await action(id);
      if (!result.ok) setError(result.error ?? "更新に失敗しました");
      else router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink">SNSトレンド</h1>
          <p className="mt-1 text-sm text-slate-500">
            Grokで候補を取得し、採用したものだけ公開サイト右カラムに表示します。
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={refreshing}
          className="rounded-lg bg-navy-800 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {refreshing ? "取得中…" : "候補を更新（Grok）"}
        </button>
      </div>

      {message && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["pending", "未審査"],
            ["approved", "採用"],
            ["rejected", "非採用"],
            ["all", "すべて"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              filter === key
                ? "bg-navy-800 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {label}
            {key !== "all" && (
              <span className="ml-1 opacity-70">
                ({items.filter((i) => i.status === key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
          該当する投稿がありません。「候補を更新」で取得してください。
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
          {filtered.map((item) => (
            <li key={item.id} className="px-4 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_STYLE[item.status]}`}
                    >
                      {STATUS_LABEL[item.status]}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      @{item.authorHandle || "unknown"}
                    </span>
                    <span className="text-xs text-slate-400">
                      ♥ {item.likeCount.toLocaleString("ja-JP")}
                    </span>
                    {(item.postedAt || item.fetchedAt) && (
                      <span className="text-xs text-slate-400">
                        {formatRelativeJa(item.postedAt ?? item.fetchedAt)}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink">
                    {item.textSnippet}
                  </p>
                  {item.relevanceNote && (
                    <p className="mt-1.5 text-xs text-slate-500">
                      関連: {item.relevanceNote}
                    </p>
                  )}
                  <a
                    href={item.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs font-bold text-navy-700 hover:underline"
                  >
                    投稿を確認 →
                  </a>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {item.status !== "approved" && (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => runAction(item.id, approveSnsTrendAction)}
                      className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                    >
                      採用
                    </button>
                  )}
                  {item.status !== "rejected" && (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => runAction(item.id, rejectSnsTrendAction)}
                      className="rounded-md bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 disabled:opacity-50"
                    >
                      非採用
                    </button>
                  )}
                  {item.status !== "pending" && (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => runAction(item.id, resetSnsTrendAction)}
                      className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 disabled:opacity-50"
                    >
                      未審査に戻す
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
