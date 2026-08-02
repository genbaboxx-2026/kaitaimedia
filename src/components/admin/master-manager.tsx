"use client";

import { useState, useTransition } from "react";
import {
  MASTERS,
  MASTER_TABS,
  type MasterRow,
  type MasterType,
} from "@/lib/admin-config-data";
import { saveMastersAction } from "@/app/admin/(app)/generation/actions";

let seq = 1000;
const newId = () => `m${(seq += 1)}`;

export function MasterManager({
  initial,
}: {
  initial?: Record<MasterType, MasterRow[]>;
}) {
  const [data, setData] = useState<Record<MasterType, MasterRow[]>>(
    initial ?? MASTERS,
  );
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function update(type: MasterType, id: string, patch: Partial<MasterRow>) {
    setData((prev) => ({
      ...prev,
      [type]: prev[type].map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));
  }
  function add(type: MasterType) {
    setData((prev) => ({
      ...prev,
      [type]: [...prev[type], { id: newId(), label: "", value: "" }],
    }));
  }
  function remove(type: MasterType, id: string) {
    setData((prev) => ({ ...prev, [type]: prev[type].filter((r) => r.id !== id) }));
  }

  function save() {
    setError(null);
    const groups = MASTER_TABS.map((t) => ({
      type: t.type,
      rows: data[t.type].map((r) => ({ label: r.label, value: r.value })),
    }));
    startTransition(async () => {
      const res = await saveMastersAction(groups);
      if (res.ok) {
        setSaved(true);
        window.setTimeout(() => setSaved(false), 2500);
      } else {
        setError(res.error ?? "保存に失敗しました");
      }
    });
  }

  const cell =
    "w-full rounded border border-slate-200 px-2 py-1 text-sm focus:border-navy-600 focus:outline-none";

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">ルール管理</h1>
          <p className="mt-1 text-sm text-slate-500">
            記事の執筆・品質チェックでAIが参照する用語やルール（辞書）。すべての種別を一覧で表示しています。編集後は「保存」を押してください。
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {saved && <span className="text-sm font-semibold text-emerald-700">保存しました</span>}
          {error && <span className="text-sm font-semibold text-red-600">保存失敗</span>}
          <button
            onClick={save}
            disabled={isPending}
            className="rounded-md bg-navy-700 px-4 py-2 text-sm font-bold text-white hover:bg-navy-600 disabled:opacity-60"
          >
            {isPending ? "保存中…" : "保存"}
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-8">
        {MASTER_TABS.map((meta) => {
          const rows = data[meta.type];
          return (
            <section key={meta.type}>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-800">{meta.label}</h2>
                <button
                  onClick={() => add(meta.type)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  ＋ 追加
                </button>
              </div>

              <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full min-w-[40rem] text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
                    <tr>
                      <th className="w-1/3 px-3 py-2.5 font-semibold">{meta.labelCol}</th>
                      <th className="px-3 py-2.5 font-semibold">{meta.valueCol}</th>
                      <th className="w-16 px-3 py-2.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 align-top">
                          <input
                            value={r.label}
                            onChange={(e) => update(meta.type, r.id, { label: e.target.value })}
                            className={cell}
                          />
                        </td>
                        <td className="px-3 py-2 align-top">
                          <textarea
                            value={r.value}
                            onChange={(e) => update(meta.type, r.id, { value: e.target.value })}
                            rows={2}
                            className={cell}
                          />
                        </td>
                        <td className="px-3 py-2 align-top">
                          <button
                            onClick={() => remove(meta.type, r.id)}
                            className="text-xs text-red-600 hover:underline"
                          >
                            削除
                          </button>
                        </td>
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-3 py-6 text-center text-sm text-slate-400">
                          項目がありません。「＋ 追加」で登録してください。
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
    </div>
  );
}
