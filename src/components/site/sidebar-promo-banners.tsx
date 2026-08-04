import Image from "next/image";
import { BakusoqSidebarBanner } from "@/components/site/bakusoq-modal";

const NINKUBOXX_URL = "https://genbaboxx.co.jp/ninkuboxx";

export { BakusoqSidebarBanner };

/** サイドバー：NiNKUBOXX 案内（PR枠） */
export function NinkuboxxSidebarBanner() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-2.5 py-1.5">
        <span className="text-[10px] font-bold tracking-[0.16em] text-slate-400">
          PR
        </span>
        <span className="text-[10px] text-slate-400">広告</span>
      </div>
      <a
        href={NINKUBOXX_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full overflow-hidden transition-opacity hover:opacity-95"
        aria-label="NiNKU BOXX を見る"
      >
        <Image
          src="/promo/ninkuboxx.png"
          alt="NiNKU BOXX — 人財の定着と成長を両立させる、未来志向の組織設計"
          width={819}
          height={1024}
          className="h-auto w-full"
          sizes="(max-width: 768px) 100vw, 360px"
        />
      </a>
    </div>
  );
}

/** BAKUSOQ / NiNKU を PR 枠として並べる */
export function SidebarPromoStack({ className = "" }: { className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      <BakusoqSidebarBanner />
      <NinkuboxxSidebarBanner />
    </div>
  );
}
