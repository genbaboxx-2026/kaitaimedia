import { formatFeedDate } from "@/lib/format";

/** NewsPicksの「今日のニュース」相当のフィード見出し */
export function FeedSectionHeader({
  title = "今日のニュース",
  date,
  subtitle = "見出しをタップすると詳細を表示します",
}: {
  title?: string;
  date?: Date;
  /** 外部リンクであることの案内 */
  subtitle?: string | null;
}) {
  return (
    <div className="px-4 pb-1 pt-5 md:px-0">
      <h2 className="flex items-center gap-2.5 text-[22px] font-black leading-none tracking-tight text-navy-800">
        <span
          aria-hidden
          className="inline-block h-5 w-1.5 rounded-full bg-brand-500"
        />
        {title}
      </h2>
      <p className="mt-1.5 pl-4 text-[13px] font-medium text-slate-400">
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
  );
}
