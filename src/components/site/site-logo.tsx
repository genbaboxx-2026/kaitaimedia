type SiteLogoProps = {
  className?: string;
  /** compact: モバイル向け（タグライン非表示） */
  compact?: boolean;
};

/** 解体ナレッジ ブランドロゴ（SVG＋テキスト。画像は使わない） */
export function SiteLogo({ className = "", compact = false }: SiteLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <KMark className={compact ? "h-7 w-7" : "h-10 w-10"} />
      <span className="flex min-w-0 flex-col justify-center leading-none">
        <span
          className={`font-sans font-black tracking-tight text-ink ${
            compact ? "text-[15px]" : "text-[22px]"
          }`}
        >
          解体ナレッジ
        </span>
        {!compact && (
          <span className="mt-1.5 text-[10px] font-medium tracking-wide text-slate-500">
            解体業界の今と未来をつなぐメディア
          </span>
        )}
      </span>
    </span>
  );
}

/** スタイライズド K（黒ステム＋ネイビー斜帯。間に白ギャップ） */
function KMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={`shrink-0 ${className}`}
      aria-hidden
    >
      {/* ネイビー斜帯（Kのアーム） */}
      <polygon
        points="19.5,4 35,4 26.5,20 35,36 19.5,36 25,20"
        fill="#0b2f66"
      />
      {/* 黒ステム（角丸・わずかに左へ膨らむ） */}
      <path
        d="M5.2 3.8
           C4.2 3.8 3.4 4.6 3.4 5.6
           V34.4
           C3.4 35.4 4.2 36.2 5.2 36.2
           H15
           C16 36.2 16.8 35.4 16.8 34.4
           V5.6
           C16.8 4.6 16 3.8 15 3.8
           H5.2 Z"
        fill="#1a1a1a"
      />
    </svg>
  );
}
