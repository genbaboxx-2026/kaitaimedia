// カテゴリーごとのビジュアル定義（アクセント色・グラデーション・アイコン）。
// 外部画像を使わずにアイキャッチ／カテゴリータイルを成立させるための情報。

export type IconKey =
  | "estimate"
  | "cost"
  | "schedule"
  | "labor"
  | "waste"
  | "law"
  | "subsidy"
  | "news"
  | "asbestos"
  | "license"
  | "safety"
  | "machinery"
  | "neighbor"
  | "management";

export interface CategoryMeta {
  /** アクセント色（バッジのドット等） */
  accent: string;
  /** アイキャッチのグラデーション（濃→淡） */
  from: string;
  to: string;
  icon: IconKey;
}

const DEFAULT_META: CategoryMeta = {
  accent: "#b4600f",
  from: "#d97706",
  to: "#b45309",
  icon: "estimate",
};

// 色とりどりに見えるよう、彩度高めで14色を分散させる。
export const CATEGORY_META: Record<string, CategoryMeta> = {
  estimate: { accent: "#f97316", from: "#fb923c", to: "#ea580c", icon: "estimate" },
  cost: { accent: "#10b981", from: "#34d399", to: "#059669", icon: "cost" },
  schedule: { accent: "#3b82f6", from: "#60a5fa", to: "#2563eb", icon: "schedule" },
  labor: { accent: "#8b5cf6", from: "#a78bfa", to: "#7c3aed", icon: "labor" },
  waste: { accent: "#14b8a6", from: "#2dd4bf", to: "#0d9488", icon: "waste" },
  law: { accent: "#6366f1", from: "#818cf8", to: "#4f46e5", icon: "law" },
  subsidy: { accent: "#f43f5e", from: "#fb7185", to: "#e11d48", icon: "subsidy" },
  news: { accent: "#0ea5e9", from: "#38bdf8", to: "#0284c7", icon: "news" },
  asbestos: { accent: "#ef4444", from: "#f87171", to: "#dc2626", icon: "asbestos" },
  license: { accent: "#06b6d4", from: "#22d3ee", to: "#0891b2", icon: "license" },
  safety: { accent: "#22c55e", from: "#4ade80", to: "#16a34a", icon: "safety" },
  machinery: { accent: "#f59e0b", from: "#fbbf24", to: "#d97706", icon: "machinery" },
  neighbor: { accent: "#ec4899", from: "#f472b6", to: "#db2777", icon: "neighbor" },
  management: { accent: "#a855f7", from: "#c084fc", to: "#9333ea", icon: "management" },
  hr: { accent: "#d946ef", from: "#e879f9", to: "#c026d3", icon: "labor" },
  field: { accent: "#0891b2", from: "#22d3ee", to: "#0e7490", icon: "safety" },
  industry: { accent: "#e11d48", from: "#fb7185", to: "#be123c", icon: "news" },
};

export function getCategoryMeta(slug: string): CategoryMeta {
  return CATEGORY_META[slug] ?? DEFAULT_META;
}

export function categoryGradient(slug: string): string {
  const m = getCategoryMeta(slug);
  return `linear-gradient(135deg, ${m.from} 0%, ${m.to} 100%)`;
}
