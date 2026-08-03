import { getCategoryMeta } from "@/lib/categories-meta";
import { CategoryIcon } from "@/components/site/icons";

interface EyecatchProps {
  categorySlug: string;
  categoryName: string;
  /** 実画像URL（あればイラストの代わりに表示） */
  imageUrl?: string;
  /** サムネイルに載せるタイトル（省略時は装飾のみ） */
  title?: string;
  titleAs?: "h2" | "h3" | "p";
  className?: string;
  titleClassName?: string;
  children?: React.ReactNode;
}

// 工事現場のスカイライン＋設計図グリッドの、落ち着いたフラットイラスト。
function ConstructionScene() {
  return (
    <>
      {/* 設計図グリッド */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          opacity: 0.25,
        }}
      />
      {/* スカイライン */}
      <svg
        viewBox="0 0 400 96"
        preserveAspectRatio="xMidYMax slice"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 w-full"
        aria-hidden="true"
      >
        {/* ビル群 */}
        <g fill="#cbd5e1">
          <rect x="12" y="46" width="42" height="50" />
          <rect x="60" y="24" width="46" height="72" />
          <rect x="250" y="34" width="44" height="62" />
          <rect x="300" y="52" width="36" height="44" />
          <rect x="342" y="28" width="46" height="68" />
        </g>
        {/* 窓 */}
        <g fill="#eef2f6">
          <rect x="70" y="34" width="10" height="10" />
          <rect x="86" y="34" width="10" height="10" />
          <rect x="70" y="52" width="10" height="10" />
          <rect x="86" y="52" width="10" height="10" />
          <rect x="352" y="40" width="10" height="10" />
          <rect x="368" y="40" width="10" height="10" />
          <rect x="352" y="58" width="10" height="10" />
          <rect x="368" y="58" width="10" height="10" />
        </g>
        {/* 解体中のビル（階段状の頂部） */}
        <path
          d="M150 96 V44 H166 V36 H182 V50 H198 V40 H214 V96 Z"
          fill="#94a3b8"
        />
        {/* がれき */}
        <path d="M120 96 l14 -16 l14 16 Z" fill="#b8c2cf" />
        {/* クレーン */}
        <g stroke="#0b2f66" strokeWidth="3" fill="none" strokeLinecap="round">
          <path d="M138 96 V18 M138 18 H238 M138 30 L176 18" />
          <path d="M214 18 V34" />
        </g>
        <rect x="209" y="34" width="10" height="8" fill="#0b2f66" />
      </svg>
    </>
  );
}

// 記事サムネイル。実画像があればそれを、無ければイラストを表示する。
export function Eyecatch({
  categorySlug,
  categoryName,
  imageUrl,
  title,
  titleAs: TitleTag = "p",
  className = "aspect-video",
  titleClassName = "text-base sm:text-lg",
  children,
}: EyecatchProps) {
  const meta = getCategoryMeta(categorySlug);

  return (
    <div
      className={`relative flex flex-col overflow-hidden border-b border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 ${className}`}
    >
      {imageUrl ? (
        // 図解サムネは上部にタイトル帯があるため、切れる場合は上基準で残す
        <div
          className="absolute inset-0 bg-cover bg-top"
          style={{ backgroundImage: `url(${imageUrl})` }}
          role="img"
          aria-label={categoryName}
        />
      ) : (
        <>
          <ConstructionScene />
          {/* カテゴリーモチーフ */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-8">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/70 shadow-sm ring-1 ring-slate-200">
              <CategoryIcon
                icon={meta.icon}
                className="h-8 w-8"
                style={{ color: meta.accent }}
              />
            </span>
          </div>
        </>
      )}

      {/* タイトル（任意） */}
      {title && (
        <div className="relative z-10 mt-auto bg-gradient-to-t from-black/55 to-transparent px-4 pb-4 pt-10">
          <TitleTag
            className={`font-serif font-bold leading-snug text-white line-clamp-3 ${titleClassName}`}
          >
            {title}
          </TitleTag>
        </div>
      )}

      {children}
    </div>
  );
}
