import type { IconKey } from "@/lib/categories-meta";

type IconProps = { className?: string };

// カテゴリー用アイコン（線画・currentColor）。24x24 viewBox。
const PATHS: Record<IconKey, React.ReactNode> = {
  estimate: (
    <>
      <path d="M9 3h6a1 1 0 0 1 1 1v1h1a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h1V4a1 1 0 0 1 1-1Z" />
      <path d="m9 13 2 2 4-4" />
    </>
  ),
  cost: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8 7h8M8 11h2M12 11h4M8 15h2M12 15h4" />
    </>
  ),
  schedule: (
    <>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
    </>
  ),
  labor: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M15 8a3 3 0 1 1 0 0M3 20a6 6 0 0 1 12 0M15 14a6 6 0 0 1 6 6" />
    </>
  ),
  waste: (
    <>
      <path d="M7 7l-2 3 3 2M17 7l2 3-3 2M12 20l-2-3 3-1" />
      <path d="M9.5 4.5 12 3l2.5 1.5M19 13.5 20 17l-3.5.5M5 17l-1-3.5 3.5-.5" />
    </>
  ),
  law: (
    <>
      <path d="M12 3v18M7 21h10" />
      <path d="M5 7h14M8 7l-3 6a3 3 0 0 0 6 0L8 7ZM16 7l-3 6a3 3 0 0 0 6 0l-3-6Z" />
    </>
  ),
  subsidy: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
    </>
  ),
  news: (
    <>
      <path d="M4 5h13a1 1 0 0 1 1 1v13a1 1 0 0 0 1 1 1 1 0 0 0 1-1V8" />
      <path d="M4 5v14a1 1 0 0 0 1 1h13M7 9h7M7 13h7M7 17h4" />
    </>
  ),
  asbestos: (
    <>
      <path d="M12 3 2 20h20L12 3Z" />
      <path d="M12 10v5M12 18h.01" />
    </>
  ),
  license: (
    <>
      <circle cx="12" cy="9" r="5" />
      <path d="m9 13-2 8 5-3 5 3-2-8" />
      <path d="m10 9 1.5 1.5L15 7" />
    </>
  ),
  safety: (
    <>
      <path d="M12 3 5 6v5c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  machinery: (
    <>
      <path d="M3 17h11v-4l4-1 3 5M14 13V8h3l1 4" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </>
  ),
  neighbor: (
    <>
      <path d="M4 11 12 4l8 7" />
      <path d="M6 10v9h5v-5h2v5h5v-9" />
    </>
  ),
  management: (
    <>
      <path d="M4 19h16" />
      <path d="m5 15 4-4 3 3 6-6M18 8h3v3" />
    </>
  ),
};

export function CategoryIcon({
  icon,
  className,
  style,
}: IconProps & { icon: IconKey; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {PATHS[icon]}
    </svg>
  );
}

export function ArrowIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
