import Image from "next/image";

const NINKUBOXX_URL = "https://genbaboxx.co.jp/ninkuboxx";

/** サイドバー：BAKUSOQ 案内（押下で紹介モーダルを表示） */
export { BakusoqSidebarBanner } from "@/components/site/bakusoq-modal";

/** サイドバー：NiNKUBOXX 案内（提供画像をそのまま表示） */
export function NinkuboxxSidebarBanner() {
  return (
    <a
      href={NINKUBOXX_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full max-w-[280px] overflow-hidden shadow-md transition-opacity hover:opacity-95 md:max-w-[260px]"
      aria-label="NiNKU BOXX を見る"
    >
      <Image
        src="/promo/ninkuboxx.png"
        alt="NiNKU BOXX — 人財の定着と成長を両立させる、未来志向の組織設計"
        width={819}
        height={1024}
        className="h-auto w-full"
        sizes="280px"
      />
    </a>
  );
}
