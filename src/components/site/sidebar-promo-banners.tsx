import Image from "next/image";
import { BakusoqSidebarBanner } from "@/components/site/bakusoq-modal";

const NINKUBOXX_URL = "https://genbaboxx.co.jp/ninkuboxx";

export { BakusoqSidebarBanner };

/** バナー左上に載せる PR バッジ（理想モック準拠） */
function PrBadge() {
  return (
    <span className="pointer-events-none absolute left-2.5 top-2.5 z-10 rounded-md bg-navy-800 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white shadow-sm">
      PR
    </span>
  );
}

/** サイドバー：NiNKUBOXX 案内（左上 PR バッジ） */
export function NinkuboxxSidebarBanner() {
  return (
    <a
      href={NINKUBOXX_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="relative block w-full overflow-hidden shadow-sm transition-opacity hover:opacity-95"
      aria-label="NiNKU BOXX を見る"
    >
      <PrBadge />
      <Image
        src="/promo/ninkuboxx.png"
        alt="NiNKU BOXX — 属人経営を卒業する。解体会社のための人事制度。"
        width={1024}
        height={1536}
        className="h-auto w-full"
        sizes="(max-width: 768px) 100vw, 360px"
      />
    </a>
  );
}

/** BAKUSOQ / NiNKU を並べる */
export function SidebarPromoStack({ className = "" }: { className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      <BakusoqSidebarBanner />
      <NinkuboxxSidebarBanner />
    </div>
  );
}
