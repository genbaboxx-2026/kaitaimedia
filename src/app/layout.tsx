import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE_URL } from "@/lib/site-url";
import { SITE_DESCRIPTION } from "@/lib/seo";
import { JsonLd } from "@/components/site/json-ld";
import { organizationWebSiteLd } from "@/lib/seo";

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
  description: SITE_DESCRIPTION,
  keywords: [
    "解体",
    "解体工事",
    "解体業",
    "見積もり",
    "産廃",
    "アスベスト",
    "建設リサイクル法",
    "GENBABOXX",
    "BAKUSOQ",
  ],
  authors: [{ name: "GENBABOXX", url: SITE_URL }],
  creator: "GENBABOXX",
  publisher: "GENBABOXX",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: "解体ナレッジ",
    locale: "ja_JP",
    title: "解体ナレッジ | GENBABOXX",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "解体ナレッジ | GENBABOXX",
    description: SITE_DESCRIPTION,
  },
  category: "business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full">
        <JsonLd data={organizationWebSiteLd()} />
        {children}
      </body>
    </html>
  );
}
