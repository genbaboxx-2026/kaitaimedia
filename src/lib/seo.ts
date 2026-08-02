import type { Article } from "@/lib/types";
import { OPERATOR_NAME, SITE_NAME } from "@/lib/dummy-data";
import { SITE_URL } from "@/lib/site-url";

/** サイト全体のデフォルト説明文 */
export const SITE_DESCRIPTION =
  "解体業界の実務者向け専門メディア。見積もり・原価管理・工程・産廃・法改正など、解体企業の判断に役立つ情報を GENBABOXX が発信します。";

/** SEO用：表示タイトル・説明の解決 */
export function articleSeoTitle(a: Article): string {
  return a.seoTitle || a.title;
}

export function articleSeoDescription(a: Article): string {
  const d = a.metaDescription || a.excerpt || "";
  return d.slice(0, 160);
}

/** Organization + WebSite の JSON-LD（ルートで共用） */
export function organizationWebSiteLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: OPERATOR_NAME,
        url: SITE_URL,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "ja-JP",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

/** 記事ページ用 Article JSON-LD */
export function articleJsonLd(article: Article, categoryName: string) {
  const url = `${SITE_URL}/articles/${article.slug}`;
  const title = articleSeoTitle(article);
  const description = articleSeoDescription(article);
  const wordCount = article.sections.reduce((n, s) => {
    const text = s.blocks
      .map((b) =>
        "text" in b ? b.text : "items" in b ? b.items.join("") : "",
      )
      .join("");
    return n + text.replace(/\s/g, "").length;
  }, 0);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    inLanguage: "ja-JP",
    articleSection: categoryName,
    wordCount: wordCount || undefined,
    keywords: article.tags?.length ? article.tags.join(", ") : undefined,
    image: article.imageUrl
      ? [{ "@type": "ImageObject", url: article.imageUrl }]
      : undefined,
    author: {
      "@type": "Organization",
      name: OPERATOR_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: OPERATOR_NAME,
      url: SITE_URL,
    },
  };
}
