import type { ArticleType } from "@/lib/types";

export interface QualityInput {
  title: string;
  body: string; // Markdown
  seoTitle: string;
  metaDescription: string;
  articleType: ArticleType;
  hasCta: boolean;
  hasImage: boolean;
  sourceUrls: string[];
  /** 第2層の自己除外用（既存記事の更新時） */
  articleId?: string;
}

export interface CheckResult {
  layer: 1 | 2 | 3;
  checkItem: string;
  passed: boolean;
  detail: string;
  score?: number;
}

export interface QualityThresholds {
  minChar: number;
  maxChar: number;
  seoTitleMax: number;
  metaDescMax: number;
  titleSim: number;
  bodySim: number;
  aiPassScore: number;
  aiModel: string;
  enabled: Record<string, boolean>;
  ngExpressions: string[];
  numberExclusions: string[];
}

export interface QualityReport {
  results: CheckResult[];
  passed: boolean;
  /** 一覧タグ表示用（不合格項目の短いラベル） */
  failedItems: string[];
  passedLayers: number; // 合格した層数（3/3表示用）
  checkedLayers: number;
}
