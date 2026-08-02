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
    default: "解体ナレッジ | GENBABOXX",
    template: "%s | 解体ナレッジ",
  },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "解体ナレッジ",
    locale: "ja_JP",
    title: "解体ナレッジ | GENBABOXX",
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
