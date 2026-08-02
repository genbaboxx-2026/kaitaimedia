import Link from "next/link";
import { formatFeedDate } from "@/lib/format";
import { PlayCircleIcon } from "@/components/site/nav-icons";

/** NewsPicksの「今日のニュース」相当のフィード見出し */
export function FeedSectionHeader({
  title = "今日のニュース",
  date,
  subtitle = "見出しをタップすると外部の元記事へ移動します",
}: {
  title?: string;
  date?: Date;
  /** 外部リンクであることの案内 */
  subtitle?: string | null;
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 pb-1 pt-5 md:px-0">
      <div>
        <h2 className="text-[22px] font-black leading-none tracking-tight text-ink">
          {title}
        </h2>
        <p className="mt-1.5 text-[13px] text-slate-400">
          {formatFeedDate(date)}
          {subtitle ? (
            <>
              <span aria-hidden className="mx-1.5">
                ·
              </span>
              <span>{subtitle}</span>
            </>
          ) : null}
        </p>
      </div>
      <Link
        href="/bakusoq"
        className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full border border-navy-600 px-3 py-1.5 text-[12px] font-bold text-navy-700 active:bg-navy-50"
      >
        <PlayCircleIcon className="h-4 w-4" />
        見積もり
      </Link>
    </div>
  );
}
