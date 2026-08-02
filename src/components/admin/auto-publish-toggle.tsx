"use client";

import { useState, useTransition } from "react";
import { setSettingAction } from "@/app/admin/(app)/generation/actions";

// 完全自動公開トグル。押すと settings.auto_publish_enabled をDBに保存する。
export function AutoPublishToggle({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    const next = !on;
    setOn(next); // 楽観的更新
    setError(null);
    startTransition(async () => {
      const res = await setSettingAction(
        "auto_publish_enabled",
        next ? "true" : "false",
      );
      if (!res.ok) {
        setOn(!next); // 失敗したら戻す
        setError("保存失敗");
      }
    });
  }

  return (
    <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2">
      <span className="text-sm text-slate-600">完全自動公開</span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        disabled={isPending}
        onClick={toggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-60 ${
          on ? "bg-emerald-500" : "bg-slate-300"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
            on ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
      <span
        className={`w-9 text-xs font-bold ${on ? "text-emerald-700" : "text-slate-500"}`}
      >
        {on ? "ON" : "OFF"}
      </span>
      {error && <span className="text-xs font-bold text-red-600">{error}</span>}
    </div>
  );
}
