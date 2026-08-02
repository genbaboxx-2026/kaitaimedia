import type { NewsItem } from "@/lib/types";
import { formatRelativeJa } from "@/lib/format";

const THUMB_TONES = [
  "from-[#1e3a5f] to-[#0f2744]",
  "from-[#3d2914] to-[#1f150a]",
  "from-[#1a3d32] to-[#0d211b]",
  "from-[#3b1f2b] to-[#1f1016]",
  "from-[#2a2a4a] to-[#151528]",
] as const;

function toneFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h + seed.charCodeAt(i) * 17) % 997;
  return THUMB_TONES[h % THUMB_TONES.length];
}

/**
 * NewsPicks風：左に見出し＋メタ、右にサムネ。タップで元記事（外部サイト）へ。
 */
export function NewsListItem({ item }: { item: NewsItem }) {
  const tone = toneFor(`${item.sourceId}:${item.sourceName}`);
  const displaySource = item.sourceName.replace(/^Googleニュース\s*\/\s*/, "");

  return (
    <article className="border-b border-slate-100">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex gap-3 px-4 py-4 active:bg-slate-50 md:gap-4 md:px-0 md:py-4"
        aria-label={`${item.title}（外部サイトへ移動）`}
      >
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-3 text-[16px] font-bold leading-snug tracking-tight text-ink md:font-serif md:text-base">
            {item.title}
          </h3>
          <p className="mt-2 flex flex-wrap items-center gap-x-1.5 text-[12px] leading-none text-slate-400">
            <span className="font-medium text-slate-500">{displaySource}</span>
            <span aria-hidden>·</span>
            <time dateTime={item.publishedAt}>
              {formatRelativeJa(item.publishedAt)}
            </time>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-0.5 font-medium text-slate-400">
              外部サイト
              <svg
                viewBox="0 0 24 24"
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path
                  d="M7 17L17 7M9 7h8v8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </p>
        </div>

        <div className="relative mt-0.5 aspect-[16/10] w-[104px] shrink-0 overflow-hidden rounded-md bg-slate-100 sm:w-28">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.imageUrl}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              className={`flex h-full w-full flex-col justify-between bg-gradient-to-br p-2 text-white ${tone}`}
            >
              <span className="line-clamp-1 text-[9px] font-semibold opacity-80">
                {displaySource}
              </span>
              <span className="line-clamp-3 text-[10px] font-bold leading-snug">
                {item.title}
              </span>
            </div>
          )}
        </div>
      </a>
    </article>
  );
}
