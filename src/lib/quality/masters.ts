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
  glossary: [
    { label: "人工", value: "にんく。作業に必要な人手の量。" },
    { label: "マニフェスト", value: "産業廃棄物管理票。" },
  ],
  article_template: [
    {
      label: "A",
      value:
        "手順・チェックリスト型。実務上の判断順序と確認項目を、番号付きの手順とチェックリストで示す。具体的な単価・金額・数量は書かない。",
    },
    {
      label: "B",
      value:
        "計算テンプレート型。計算式と項目構成のみを提示し、単価は読者が入力する前提で書く。数値そのものは埋めない。",
    },
    {
      label: "C",
      value:
        "一次情報型。法改正・制度・補助金を扱う。法令名・制度名で参照を示し、外部URLは本文に載せない。",
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
