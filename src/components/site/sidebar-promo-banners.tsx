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
      className="block w-full overflow-hidden shadow-md transition-opacity hover:opacity-95"
      aria-label="解体企業向け NiNKU BOXX を見る"
    >
      <Image
        src="/promo/ninkuboxx.png"
        alt="解体企業向け NiNKU BOXX — 解体業に特化したブルーカラー人事部"
        width={1024}
        height={1536}
        className="h-auto w-full"
        sizes="(max-width: 768px) 100vw, 360px"
      />
    </a>
  );
}
