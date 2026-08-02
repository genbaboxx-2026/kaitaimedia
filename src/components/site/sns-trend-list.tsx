import type { SnsTrendPost } from "@/lib/types";
import { formatRelativeJa } from "@/lib/format";

function formatLikes(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1).replace(/\.0$/, "")}万`;
  return n.toLocaleString("ja-JP");
}

/** 公開サイト用：採用済みSNSトレンド（いいね順） */
export function SnsTrendList({
  items,
  compact = false,
}: {
  items: SnsTrendPost[];
  compact?: boolean;
}) {
  if (items.length === 0) {
    return (
      <p className="px-4 py-6 text-sm text-slate-400 md:px-0">
        ただいま表示できるトレンドはありません。
      </p>
    );
  }

  return (
    <ul className={compact ? "divide-y divide-slate-100" : ""}>
      {items.map((item, index) => (
        <li key={item.id}>
          <a
            href={item.postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`group block active:bg-slate-50 ${
              compact ? "py-3" : "border-b border-slate-100 px-4 py-3.5 md:px-0"
            }`}
          >
            <div className="flex items-baseline gap-2">
              <span className="text-[11px] font-bold text-slate-400">
                {index + 1}
              </span>
              <span className="truncate text-[12px] font-bold text-navy-700">
                @{item.authorHandle || "user"}
              </span>
              <span className="shrink-0 text-[11px] text-slate-400">
                ♥ {formatLikes(item.likeCount)}
              </span>
            </div>
            <p
              className={`mt-1 text-[13px] leading-snug text-ink ${
                compact ? "line-clamp-3" : "line-clamp-4"
              }`}
            >
              {item.textSnippet}
            </p>
            {(item.postedAt || item.fetchedAt) && (
              <p className="mt-1.5 text-[11px] text-slate-400">
                {formatRelativeJa(item.postedAt ?? item.fetchedAt)}
              </p>
            )}
          </a>
        </li>
      ))}
    </ul>
  );
}
