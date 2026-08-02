import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteBottomNav } from "@/components/site/site-bottom-nav";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <div className="flex-1 pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </div>
      {/* モバイルはボトムナビに寄せ、フッターはデスクトップのみ */}
      <div className="hidden md:block">
        <SiteFooter />
      </div>
      <SiteBottomNav />
    </div>
  );
}
