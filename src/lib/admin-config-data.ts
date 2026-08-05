import type { ArticleType } from "@/lib/types";

// タスク7（生成設定・プロンプト・マスタ・CTA）のダミーデータ。
// DBの settings / prompts / masters / ctas テーブルに対応する。
// 本番はすべて DB から取得（コードに定数を固定しない）。ここは初期値の再現。

// ---------------- 生成設定 ----------------
export interface GenerationSettings {
  autoPublishEnabled: boolean;
  generationEnabled: boolean;
  generationInstruction: string;
  generationTime: string;
  articlesPerDay: number;
  /**
   * 定時生成の1日あたり最大試行回数（成功・不合格下書き・失敗を含む）。
   * 0 のときは articlesPerDay × 2 を使う。
   */
  maxScheduledAttemptsPerDay: number;
  minCharCount: number;
  maxCharCount: number;
  targetReader: string;
  writingStyle: "desu_masu" | "dearu";
  expertiseLevel: "beginner" | "intermediate" | "advanced";
  headingCount: number;
  ratioA: number;
  ratioB: number;
  ratioC: number;
  bakusoqMentionLevel: "low" | "medium" | "high";
  faqEnabled: boolean;
  maxAutoRevisions: number;
  titleSimilarityThreshold: number;
  bodySimilarityThreshold: number;
  aiQualityPassScore: number;
  seoTitleMaxLength: number;
  metaDescriptionMaxLength: number;
  monthlyAiBudgetLimit: number;
  /** 1記事あたりの推定コスト上限（USD）。0=上限なし */
  perArticleCostLimitUsd: number;
  aiModel: string;
  checks: Record<string, boolean>;
}

// リンク死活・類似度・AI定性は運用上OFFのため設定UIからも除外（DBキーは残す）。
export const CHECK_ITEMS: { key: string; label: string; layer: number }[] = [
  { key: "number_detection", label: "数値表現の検出", layer: 1 },
  { key: "char_count", label: "文字数", layer: 1 },
  { key: "heading", label: "見出し階層", layer: 1 },
  { key: "ng_expression", label: "禁止表現", layer: 1 },
  { key: "seo_length", label: "SEO文字数", layer: 1 },
];

export const AI_MODELS = ["claude-sonnet-5", "claude-opus-4-8", "claude-haiku-4-5-20251001"];

export const DEFAULT_SETTINGS: GenerationSettings = {
  autoPublishEnabled: false,
  generationEnabled: true,
  generationInstruction: "",
  generationTime: "03:00",
  articlesPerDay: 1,
  maxScheduledAttemptsPerDay: 0,
  minCharCount: 3500,
  maxCharCount: 5000,
  targetReader: "見積担当",
  writingStyle: "desu_masu",
  expertiseLevel: "intermediate",
  headingCount: 5,
  ratioA: 40,
  ratioB: 30,
  ratioC: 30,
  bakusoqMentionLevel: "medium",
  faqEnabled: true,
  maxAutoRevisions: 1,
  titleSimilarityThreshold: 0.9,
  bodySimilarityThreshold: 0.85,
  aiQualityPassScore: 3,
  seoTitleMaxLength: 32,
  metaDescriptionMaxLength: 120,
  monthlyAiBudgetLimit: 0,
  perArticleCostLimitUsd: 3,
  aiModel: "claude-sonnet-5",
  checks: Object.fromEntries(CHECK_ITEMS.map((c) => [c.key, true])),
};

// ---------------- プロンプト管理 ----------------
export type PromptStep =
  | "structure"
  | "body"
  | "seo"
  | "fix"
  | "quality"
  | "news_editorial"
  | "sns_trends";

export const PROMPT_STEP_LABEL: Record<PromptStep, string> = {
  structure: "構成生成",
  body: "本文生成",
  seo: "SEO生成",
  fix: "自動修正",
  quality: "AI品質判定",
  news_editorial: "ニュース自社解説",
  sns_trends: "SNSトレンド取得",
};

export interface PromptVersion {
  version: number;
  content: string;
  note: string;
  createdAt: string;
}

export interface PromptStepData {
  step: PromptStep;
  variables: string[];
  activeVersion: number;
  versions: PromptVersion[];
}

export const PROMPTS: PromptStepData[] = [
  {
    step: "structure",
    variables: ["{{theme}}", "{{category}}", "{{article_type}}", "{{target_keyword}}", "{{heading_count}}", "{{masters}}"],
    activeVersion: 1,
    versions: [
      {
        version: 1,
        note: "初期版",
        createdAt: "2026-08-01",
        content:
          "あなたは解体業界の専門メディアの編集者です。次のテーマの見出し構成をJSONで出力してください。\n\nテーマ: {{theme}}\n記事型: {{article_type}}\n狙うキーワード: {{target_keyword}}\n見出し数の目安: H2見出しを{{heading_count}}個程度\n\n制約：狙うキーワードを意識した構成にする。具体的な単価・金額・重量・割合・断定的な工期日数は含めない。H2/H3の階層で構成する。",
      },
    ],
  },
  {
    step: "body",
    variables: ["{{structure}}", "{{article_type}}", "{{writing_style}}", "{{expertise_level}}", "{{min_char_count}}", "{{max_char_count}}", "{{ng_expressions}}", "{{recommended_expressions}}", "{{faq_section}}", "{{masters}}"],
    activeVersion: 2,
    versions: [
      { version: 1, note: "初期版", createdAt: "2026-08-01", content: "見出し構成に沿って本文をMarkdownで書いてください。" },
      {
        version: 2,
        note: "数値不使用ルールを強調・文体/専門用語レベル/文字数/禁止表現/推奨表現/参照マスタ/FAQを明記",
        createdAt: "2026-08-01",
        content:
          "見出し構成に沿って本文をMarkdownで書いてください。\n\n文体: {{writing_style}}\n専門用語のレベル: {{expertise_level}}\n文字数: {{min_char_count}}〜{{max_char_count}}字\n禁止表現（使用禁止）: {{ng_expressions}}\n推奨表現: {{recommended_expressions}}\n参照マスタ: {{masters}}\nFAQ: {{faq_section}}\n\n最重要（違反厳禁）：金額・重量・単価・割合・断定的な工期日数を一切書かない。数量は読者が入力する前提で、計算式や確認項目として示す。本文に外部URLは載せない。法令・制度は名称と概要のみで示す。",
      },
    ],
  },
  {
    step: "seo",
    variables: ["{{title}}", "{{target_keyword}}", "{{body_excerpt}}"],
    activeVersion: 1,
    versions: [
      { version: 1, note: "初期版", createdAt: "2026-08-01", content: "SEOタイトル（全角32字以内・狙うキーワード{{target_keyword}}を自然に含める）とメタディスクリプション（全角120字以内）をJSONで出力してください。\n\nタイトル: {{title}}\n本文冒頭: {{body_excerpt}}" },
    ],
  },
  {
    step: "fix",
    variables: ["{{body}}", "{{failed_items}}", "{{ng_expressions}}"],
    activeVersion: 1,
    versions: [
      { version: 1, note: "初期版", createdAt: "2026-08-01", content: "不合格項目に沿って本文を最小限で修正してください。新たに数値を追加しないこと。\n\n対象本文: {{body}}\n不合格項目: {{failed_items}}" },
    ],
  },
  {
    step: "quality",
    variables: ["{{body}}"],
    activeVersion: 1,
    versions: [
      { version: 1, note: "初期版", createdAt: "2026-08-01", content: "本文を「自然さ」「論理の一貫性」「具体性」の3観点で1〜5点評価してください。事実の正誤判定は行わない。\n\n出力（JSON）: {\"naturalness\":n,\"consistency\":n,\"specificity\":n,\"comment\":\"...\"}" },
    ],
  },
  {
    step: "news_editorial",
    variables: ["{{title}}", "{{source_name}}", "{{summary}}", "{{topics}}"],
    activeVersion: 1,
    versions: [
      {
        version: 1,
        note: "初期版",
        createdAt: "2026-08-02",
        content:
          "見出しと要約だけを材料に、## わかりやすく解説 / ## 実務で確認できそうなこと / ## 実際の内容 の3部でMarkdown出力。\n\n見出し: {{title}}\n出典: {{source_name}}\n要約: {{summary}}\nテーマ: {{topics}}\n\n金額・重量・単価・割合・断定的な工期日数は書かない。外部URLは書かない。",
      },
    ],
  },
  {
    step: "sns_trends",
    variables: ["{{from_date}}", "{{min_likes}}", "{{max_count}}"],
    activeVersion: 1,
    versions: [
      {
        version: 1,
        note: "約10件取得を目標",
        createdAt: "2026-08-02",
        content:
          "Xを複数回検索し、解体・産廃・建設の実務向け投稿をできるだけ{{max_count}}件。いいね目安{{min_likes}}、{{from_date}}以降。JSON配列のみ。",
      },
    ],
  },
];

// ---------------- マスタ管理 ----------------
export type MasterType =
  | "glossary"
  | "faq"
  | "ng_expression"
  | "recommended_expression"
  | "number_exclusion"
  | "article_template";

export const MASTER_TABS: { type: MasterType; label: string; labelCol: string; valueCol: string }[] = [
  { type: "glossary", label: "用語集", labelCol: "用語", valueCol: "正しい表記・説明" },
  { type: "faq", label: "よくある質問", labelCol: "質問", valueCol: "回答" },
  { type: "ng_expression", label: "禁止表現", labelCol: "表現", valueCol: "理由" },
  { type: "recommended_expression", label: "推奨表現", labelCol: "表現", valueCol: "使いどころ" },
  { type: "number_exclusion", label: "数値検出の除外", labelCol: "パターン", valueCol: "理由" },
  { type: "article_template", label: "記事型テンプレ", labelCol: "型(A/B/C)", valueCol: "構成雛形" },
];

export interface MasterRow {
  id: string;
  label: string;
  value: string;
}

export const MASTERS: Record<MasterType, MasterRow[]> = {
  glossary: [
    { id: "g1", label: "人工", value: "にんく。作業に必要な人手の量。" },
    { id: "g2", label: "マニフェスト", value: "産業廃棄物管理票。" },
  ],
  faq: [
    { id: "f1", label: "見積もりは無料ですか？", value: "会社ごとの方針によります。本メディアでは断定しません。" },
  ],
  ng_expression: [
    { id: "n1", label: "必ず儲かる", value: "誇大表現のため禁止。" },
    { id: "n2", label: "業界最安", value: "根拠のない最上級表現のため禁止。" },
  ],
  recommended_expression: [
    { id: "r1", label: "〜の傾向があります", value: "断定を避けたい箇所で使う。" },
  ],
  number_exclusion: [
    { id: "x1", label: "4t車", value: "一般名詞化した規格値のため許容。" },
    { id: "x2", label: "0.25m³級", value: "重機の規格クラスのため許容。" },
    { id: "x3", label: "第◯条", value: "法令の条番号は許容。" },
  ],
  article_template: [
    { id: "at1", label: "A", value: "手順・チェックリスト型。判断順序と確認項目を示す。" },
    { id: "at2", label: "B", value: "計算テンプレート型。計算式と項目構成のみ提示。" },
    { id: "at3", label: "C", value: "一次情報型。法令名・制度名で参照を示し、外部URLは本文に載せない。" },
  ],
};

// ---------------- CTA管理 ----------------
export type CtaPosition = "inline" | "bottom" | "both";

export const CTA_POSITION_LABEL: Record<CtaPosition, string> = {
  inline: "記事中",
  bottom: "記事末尾",
  both: "両方",
};

export interface CtaRow {
  id: string;
  name: string;
  heading: string;
  body: string;
  buttonLabel: string;
  linkUrl: string;
  position: CtaPosition;
  isActive: boolean;
  categorySlug: string | null; // null=全カテゴリー共通
  articleType?: ArticleType; // 未使用（拡張用）
}

export const CTAS: CtaRow[] = [
  {
    id: "cta1",
    name: "BAKUSOQ標準",
    heading: "解体見積もりの作成を、もっと速く正確に",
    body: "拾い出しから内訳作成までの手戻りを減らし、担当者ごとのばらつきを抑えます。",
    buttonLabel: "BAKUSOQの資料を見る",
    linkUrl: "/bakusoq",
    position: "bottom",
    isActive: true,
    categorySlug: null,
  },
  {
    id: "cta2",
    name: "補助金カテゴリー用",
    heading: "解体の費用でお悩みですか？",
    body: "見積もりの考え方から、BAKUSOQでの作成支援までご案内します。",
    buttonLabel: "詳しく見る",
    linkUrl: "/bakusoq",
    position: "inline",
    isActive: true,
    categorySlug: "subsidy",
  },
];
