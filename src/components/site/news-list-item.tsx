"use client";

import Link from "next/link";
import { useState } from "react";
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
 * NewsPicks風：左に見出し＋メタ、右に写真サムネ。
 * imageUrl が無い場合は /api/news/[id]/thumb でOGP取得を試みる。
 */
export function NewsListItem({ item }: { item: NewsItem }) {
  const tone = toneFor(`${item.sourceId}:${item.sourceName}`);
  const displaySource = item.sourceName.replace(/^Googleニュース\s*\/\s*/, "");
  const initialSrc = item.imageUrl || `/api/news/${item.id}/thumb`;
  const [failed, setFailed] = useState(false);
  const [src, setSrc] = useState(initialSrc);

  return (
    <article className="border-b border-slate-100">
      <Link
        href={`/news/${item.id}`}
        className="group flex gap-3 px-4 py-4 active:bg-slate-50 md:gap-4 md:px-0 md:py-5"
        aria-label={item.title}
      >
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-3 text-[16px] font-bold leading-snug tracking-tight text-ink md:font-serif md:text-[17px] md:leading-snug">
            {item.title}
          </h3>
          <p className="mt-2 flex flex-wrap items-center gap-x-1.5 text-[12px] leading-none text-slate-400">
            <span className="font-medium text-slate-500">{displaySource}</span>
            <span aria-hidden>·</span>
            <time dateTime={item.publishedAt}>
              {formatRelativeJa(item.publishedAt)}
            </time>
          </p>
        </div>

        <div className="relative mt-0.5 aspect-[16/10] w-[112px] shrink-0 overflow-hidden rounded-[4px] bg-slate-200 sm:w-[128px] md:w-[140px]">
          {!failed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setFailed(true)}
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
      </Link>
    </article>
  );
}
