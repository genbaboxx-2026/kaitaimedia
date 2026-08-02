"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * 記事管理画面から AI 記事を1本生成する。
 */
export function GenerateArticleButton() {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (running) return;
    if (
      !window.confirm(
        "AIで記事を1本生成します。数分かかることがあります。よろしいですか？",
      )
    ) {
      return;
    }
    setRunning(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/generate", { method: "POST" });
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
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-1 sm:items-end">
      <button
        type="button"
        onClick={generate}
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
      {error && (
        <p className="max-w-md text-xs font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}
