import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE_URL } from "@/lib/site-url";

const DESCRIPTION =
  "解体業界の実務者向け専門メディア。GENBABOXX が運営し、見積もり・原価管理・法改正など実務の判断に役立つ情報を発信します。";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "解体業界特化メディア | GENBABOXX",
    template: "%s | 解体業界特化メディア",
  },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "解体業界特化メディア",
    locale: "ja_JP",
    title: "解体業界特化メディア | GENBABOXX",
    description: DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
