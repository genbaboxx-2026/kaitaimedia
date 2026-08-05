import { restSelect } from "@/lib/supabase/rest";

interface MasterRow {
  label: string | null;
}

// ルール管理UIは廃止。ほぼ固定の辞書はコードの既定値として保持し、
// DBに登録があればそちらを優先、無ければ既定値を使う（品質チェック・生成を壊さない）。
const LABEL_DEFAULTS: Record<string, string[]> = {
  // 数値検出の「除外」＝正当な数字表現（規格・条番号など）。誤検知を防ぐ。
  number_exclusion: [
    "4t車",
    "2t車",
    "10t車",
    "0.25m³級",
    "0.7m³級",
    "第◯条",
    "第○項",
    "24時間",
    "1階",
    "2階",
    "3階",
    "4号",
  ],
  // 誇大・根拠のない表現の禁止（数値ルールは別途 number-detection が担保）。
  ng_expression: [
    "必ず儲かる",
    "業界最安",
    "日本一",
    "絶対に安全",
    "100%成功",
    "確実に儲かる",
  ],
  recommended_expression: [],
};

const PAIR_DEFAULTS: Record<string, { label: string; value: string }[]> = {
  // glossary（用語集）は記事偏りの原因になるため既定値なし・生成にも使わない
  glossary: [],
  article_template: [
    {
      label: "A",
      value:
        "現場・見積もりの手順型。見積もり・原価・工程・現場運営などの判断順序と確認項目を手順で示す。計算式を全面に出す構成は稀（月1本程度）とし、通常は数値を埋めず確認の観点で書く。法令・条文・許認可手続きの解説はしない。",
    },
    {
      label: "B",
      value:
        "経営・組織・人材型。経営、採用、等級制度、評価制度、広報・採用ブランディング、育成・定着など会社づくりを扱う。計算テンプレートにはしない。法令・条文・許認可手続きの解説はしない。",
    },
    {
      label: "C",
      value:
        "業界動向・視点型。業界の動き、他業種比較、スタートアップ視点など広い視野のテーマを扱う（全体の約1割）。法令・条文・許認可手続きの解説はしない。制度名に触れる場合も概要のみ。",
    },
  ],
};

// 指定種別のマスタのラベル一覧を取得（禁止表現・数値検出除外リストなど）。DBが空なら既定値。
export async function loadMasterLabels(masterType: string): Promise<string[]> {
  const rows = await restSelect<MasterRow>(
    `masters?select=label&master_type=eq.${masterType}&is_active=is.true`,
    0,
  );
  const labels = (rows ?? [])
    .map((r) => (r.label ?? "").trim())
    .filter((l) => l.length > 0);
  if (labels.length > 0) return labels;
  return LABEL_DEFAULTS[masterType] ?? [];
}

// ラベル＋値のペアで取得（用語集・記事型テンプレなど）。DBが空なら既定値。
export async function loadMasterPairs(
  masterType: string,
): Promise<{ label: string; value: string }[]> {
  const rows = await restSelect<{ label: string | null; value: string | null }>(
    `masters?select=label,value&master_type=eq.${masterType}&is_active=is.true`,
    0,
  );
  const pairs = (rows ?? [])
    .map((r) => ({ label: (r.label ?? "").trim(), value: (r.value ?? "").trim() }))
    .filter((r) => r.label.length > 0);
  if (pairs.length > 0) return pairs;
  return PAIR_DEFAULTS[masterType] ?? [];
}
