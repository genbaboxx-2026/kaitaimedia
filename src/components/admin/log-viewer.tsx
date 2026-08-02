"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import {
  GEN_LOGS,
  GEN_LOG_STATUS_LABEL,
  type GenLog,
  type GenLogStatus,
} from "@/lib/admin-logs-data";
import { formatJaDate } from "@/lib/format";

const STATUS_STYLE: Record<GenLogStatus, string> = {
  published: "bg-emerald-100 text-emerald-800",
  draft: "bg-amber-100 text-amber-800",
  failed: "bg-red-100 text-red-700",
};

export function LogViewer({ logs }: { logs?: GenLog[] }) {
  const [filter, setFilter] = useState<GenLogStatus | "all">("all");
  const [open, setOpen] = useState<string | null>(null);

  const all = logs ?? GEN_LOGS;
  const rows = all.filter((l) => filter === "all" || l.status === filter);
  const errorCount = all.filter((l) => l.status === "failed").length;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">生成履歴</h1>
          <p className="mt-1 text-sm text-slate-500">
            使用プロンプト・初稿/最終稿・品質チェック結果・トークン/コストを確認できます。失敗 {errorCount} 件。
          </p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as GenLogStatus | "all")}
          className="rounded-md border border-slate-300 px-2.5 py-2 text-sm"
        >
          <option value="all">すべて</option>
          <option value="published">公開</option>
          <option value="draft">下書き</option>
          <option value="failed">失敗（エラーログ）</option>
        </select>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[52rem] text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
            <tr>
              <th className="px-4 py-2.5 font-semibold">記事</th>
              <th className="px-4 py-2.5 font-semibold">結果</th>
              <th className="px-4 py-2.5 font-semibold">修正</th>
              <th className="px-4 py-2.5 font-semibold">トークン</th>
              <th className="px-4 py-2.5 font-semibold">コスト</th>
              <th className="px-4 py-2.5 font-semibold">実行日</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((log) => {
              const isOpen = open === log.id;
              return (
                <Fragment key={log.id}>
                  <tr className="cursor-pointer hover:bg-slate-50" onClick={() => setOpen(isOpen ? null : log.id)}>
                    <td className="max-w-sm truncate px-4 py-3 text-slate-800">{log.title}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_STYLE[log.status]}`}>
                        {GEN_LOG_STATUS_LABEL[log.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{log.revisionCount} 回</td>
                    <td className="px-4 py-3 text-slate-500">
                      {(log.inputTokens + log.outputTokens).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-500">${log.costUsd.toFixed(4)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">{formatJaDate(log.startedAt)}</td>
                  </tr>
                  {isOpen && (
                    <tr className="bg-slate-50">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="grid gap-4 lg:grid-cols-2">
                          <div>
                            <p className="text-xs font-semibold text-slate-500">品質チェック結果</p>
                            <ul className="mt-1 space-y-1 text-sm">
                              {log.checks.map((c) => (
                                <li key={c.layer} className={c.passed ? "text-emerald-700" : "text-red-700"}>
                                  第{c.layer}層：{c.detail}
                                </li>
                              ))}
                            </ul>
                            {log.error && (
                              <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                                {log.error}
                              </p>
                            )}
                            <p className="mt-3 text-xs text-slate-500">
                              トークン：入力 {log.inputTokens.toLocaleString()} / 出力 {log.outputTokens.toLocaleString()}・推定コスト ${log.costUsd.toFixed(4)}
                            </p>
                            <Link
                              href={`/admin/articles/${log.id}`}
                              className="mt-3 inline-block text-sm font-semibold text-navy-700 hover:underline"
                            >
                              この記事を編集する →
                            </Link>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-semibold text-slate-500">使用プロンプト</p>
                              <p className="mt-1 text-xs leading-relaxed text-slate-600">構成：{log.promptStructure}</p>
                              <p className="mt-1 text-xs leading-relaxed text-slate-600">本文：{log.promptBody}</p>
                              {log.promptFix && (
                                <p className="mt-1 text-xs leading-relaxed text-slate-600">修正：{log.promptFix}</p>
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500">初稿 → 最終稿</p>
                              <p className="mt-1 line-clamp-2 text-xs text-slate-600">{log.draftFirst}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
