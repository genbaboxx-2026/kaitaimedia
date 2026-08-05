import { BakusoqSidebarBanner } from "@/components/site/bakusoq-modal";
import { NinkuboxxSidebarBanner } from "@/components/site/ninkuboxx-modal";

export { BakusoqSidebarBanner, NinkuboxxSidebarBanner };

/** BAKUSOQ / NiNKU を並べる */
export function SidebarPromoStack({ className = "" }: { className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      <BakusoqSidebarBanner />
      <NinkuboxxSidebarBanner />
    </div>
  );
}
