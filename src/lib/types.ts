// 公開サイトで扱うドメイン型（タスク3のダミー用サブセット）。
// タスク4で Supabase 生成型（database.types.ts）に接続する際に置き換え・拡張する。

export type ArticleType = "A" | "B" | "C";

export interface Category {
  slug: string;
  name: string;
  description: string;
}

export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading3"; text: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "image"; url: string; alt: string };

export interface ArticleSection {
  /** 目次アンカー用のID */
  id: string;
  /** H2見出し */
  heading: string;
  blocks: ContentBlock[];
}

export interface Cta {
  heading: string;
  body: string;
  buttonLabel: string;
  linkUrl: string;
}

export interface Article {
  slug: string;
  title: string;
  categorySlug: string;
  articleType: ArticleType;
  excerpt: string;
  /** アイキャッチ画像URL（実写真・AI生成PNG）。無ければイラストを表示 */
  imageUrl?: string;
  /** ISO日付 (YYYY-MM-DD) */
  publishedAt: string;
  updatedAt?: string;
  readingMinutes: number;
  sections: ArticleSection[];
  /** 型Cの出典URL */
  sourceUrls?: string[];
  relatedSlugs: string[];
}

export const ARTICLE_TYPE_LABEL: Record<ArticleType, string> = {
  A: "手順・チェックリスト",
  B: "計算テンプレート",
  C: "一次情報",
};
