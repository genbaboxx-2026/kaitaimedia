import Image from "next/image";

type SiteLogoProps = {
  className?: string;
  /** compact: モバイル向け（タグライン非表示） */
  compact?: boolean;
};

/** 解体ナレッジ ブランドロゴ（Kマーク＋サイト名） */
export function SiteLogo({ className = "", compact = false }: SiteLogoProps) {
  const height = compact ? 36 : 56;
  const width = Math.round(height * (466 / 339));

  return (
    <span
      className={`inline-flex items-center ${compact ? "gap-2.5" : "gap-3"} ${className}`}
    >
      <Image
        src="/brand/logo-mark-v2.png"
        alt=""
        width={width}
        height={height}
        className="shrink-0"
        priority
        unoptimized
      />
      <span className="flex min-w-0 flex-col justify-center leading-none">
        <span
          className={`font-sans font-black tracking-tight text-navy-800 ${
            compact ? "text-[17px]" : "text-[26px]"
          }`}
        >
          解体
          <span className="text-brand-500">ナレッジ</span>
        </span>
        {!compact && (
          <span className="mt-1.5 text-[11px] font-bold tracking-wide text-brand-600/80">
            解体業界の今と未来をつなぐメディア
          </span>
        )}
      </span>
    </span>
  );
}
