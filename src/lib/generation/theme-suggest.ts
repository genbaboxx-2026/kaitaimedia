import { CATEGORIES } from "@/lib/dummy-data";
import type { ArticleType } from "@/lib/types";

export interface ThemeSuggestion {
  title: string;
  categorySlug: string;
  targetKeyword: string;
  articleType: ArticleType;
  priority: "high" | "medium" | "low";
}

// AI未設定・失敗時のダミー候補（動作確認用）
const MOCK_POOL: ThemeSuggestion[] = [
  { title: "解体前の近隣挨拶で伝えるべきこと", categorySlug: "neighbor", targetKeyword: "解体 近隣 挨拶", articleType: "A", priority: "high" },
  { title: "アスベスト事前調査の依頼先の選び方", categorySlug: "asbestos", targetKeyword: "アスベスト 事前調査 依頼", articleType: "A", priority: "high" },
  { title: "解体工事の見積書の見方と比較のコツ", categorySlug: "estimate", targetKeyword: "解体 見積書 比較", articleType: "A", priority: "high" },
  { title: "産業廃棄物の委託契約で確認する項目", categorySlug: "waste", targetKeyword: "産廃 委託契約", articleType: "A", priority: "medium" },
  { title: "解体工事の工程表の作り方", categorySlug: "schedule", targetKeyword: "解体 工程表", articleType: "B", priority: "medium" },
  { title: "解体現場の安全パトロールのチェック項目", categorySlug: "safety", targetKeyword: "解体 安全 パトロール", articleType: "A", priority: "medium" },
  { title: "解体工事業登録と建設業許可の違い", categorySlug: "license", targetKeyword: "解体工事業登録 建設業許可", articleType: "C", priority: "medium" },
  { title: "重機の回送計画の立て方", categorySlug: "machinery", targetKeyword: "重機 回送", articleType: "A", priority: "low" },
  { title: "空き家解体の補助金申請の流れ", categorySlug: "subsidy", targetKeyword: "空き家 解体 補助金 申請", articleType: "C", priority: "high" },
  { title: "解体の原価管理で使う実行予算書の項目", categorySlug: "cost", targetKeyword: "解体 実行予算", articleType: "B", priority: "medium" },
  { title: "人工の見積もりでよくある誤差の原因", categorySlug: "labor", targetKeyword: "人工 見積もり 誤差", articleType: "A", priority: "low" },
  { title: "解体業界の受注を増やす紹介の作り方", categorySlug: "management", targetKeyword: "解体 受注 紹介", articleType: "A", priority: "low" },
  { title: "混合廃棄物を減らす現場分別の工夫", categorySlug: "waste", targetKeyword: "混合廃棄物 分別", articleType: "A", priority: "medium" },
  { title: "解体の追加工事を防ぐ契約時の確認", categorySlug: "estimate", targetKeyword: "解体 追加工事 契約", articleType: "A", priority: "high" },
  { title: "騒音・振動の近隣クレームへの対応手順", categorySlug: "neighbor", targetKeyword: "解体 騒音 クレーム", articleType: "A", priority: "medium" },
  { title: "建設リサイクル法の対象工事の判断", categorySlug: "law", targetKeyword: "建設リサイクル法 対象", articleType: "C", priority: "high" },
  { title: "解体工事の工期が延びる主な要因", categorySlug: "schedule", targetKeyword: "解体 工期 遅延", articleType: "A", priority: "medium" },
  { title: "石綿作業主任者の役割と選任", categorySlug: "asbestos", targetKeyword: "石綿作業主任者 選任", articleType: "A", priority: "medium" },
  { title: "解体見積もりの内訳項目の標準化", categorySlug: "cost", targetKeyword: "解体 見積 内訳 標準化", articleType: "B", priority: "medium" },
  { title: "解体現場でのKY活動の進め方", categorySlug: "safety", targetKeyword: "解体 KY活動", articleType: "A", priority: "low" },
];

function mock(count: number): ThemeSuggestion[] {
  const out: ThemeSuggestion[] = [];
  for (let i = 0; i < count; i += 1) out.push(MOCK_POOL[i % MOCK_POOL.length]);
  return out;
}

// AIで記事テーマ案を生成する。ANTHROPIC_API_KEY 未設定・失敗時はダミーで返す。
export async function suggestThemes(
  count: number,
  instruction = "",
): Promise<{ themes: ThemeSuggestion[]; source: "ai" | "mock" }> {
  const c = Math.min(Math.max(count, 1), 30);
  if (!process.env.ANTHROPIC_API_KEY) {
    return { themes: mock(c), source: "mock" };
  }
  try {
    const { callJson } = await import("@/lib/ai/client");
    const { restSelect } = await import("@/lib/supabase/rest");
    // テーマ案は速い・安いモデル（Haiku）で生成する（本文生成モデルとは別。応答が速く、UIが固まらない）
    const suggestModel = "claude-haiku-4-5";
    const slugs = CATEGORIES.map((cat) => `${cat.slug}(${cat.name})`).join("、");

    // 既存の記事タイトル＋既存テーマを取得し、重複しない切り口だけを出させる
    const [articleRows, themeRows] = await Promise.all([
      restSelect<{ title: string }>("articles?select=title", 0),
      restSelect<{ title: string }>("themes?select=title", 0),
    ]);
    const existing = [
      ...(articleRows ?? []).map((r) => r.title),
      ...(themeRows ?? []).map((r) => r.title),
    ].filter(Boolean);
    const existingBlock =
      existing.length > 0
        ? `既に存在する記事・テーマ（これらと内容が重複・類似するものは絶対に出さない）：\n- ${existing.join("\n- ")}\n`
        : "";

    const prompt =
      `あなたは解体業界の専門メディアの編集者です。SEOを意識した記事テーマ案を${c}件、JSON配列だけで出力してください。\n` +
      `各要素は {"title","categorySlug","targetKeyword","articleType","priority"}。\n` +
      `articleType は A/B/C（A=手順, B=計算テンプレ, C=一次情報）。priority は high/medium/low。\n` +
      `categorySlug は次から選ぶ：${slugs}。\n` +
      `金額・単価・割合などの数値を主題にしないこと。実務者に役立つ具体的なお題にすること。\n` +
      `\n【編集方針】解体会社の経営・スタートアップ視点で役立つ幅広いテーマを、カテゴリーが偏らないよう分散させる。\n` +
      `- 人事・採用（hr）：採用/育成/定着/評価/若手が辞めない仕組み など\n` +
      `- 現場管理（field）：段取り/職長マネジメント/品質/安全と生産性の両立 など\n` +
      `- 近隣対応（neighbor）：クレーム予防/説明のコツ/信頼構築 など\n` +
      `- 業界研究（industry）：他業種比較の切り口（IT企業/ファストリテイリングなどの大手/海外の解体会社との比較）、` +
      `スタートアップが解体業を始めるとき最初にやること、ホワイトカラーから見たブルーカラーの価値 など、視点の面白いもの\n` +
      `- 見積もり/原価/工期/産廃/法改正/補助金/重機・工法/安全 も適宜バランス良く\n` +
      `同じカテゴリーに集中させず、上記ジャンルを広くカバーすること。\n` +
      existingBlock +
      (instruction ? `追加の方針：${instruction}\n` : "") +
      `出力はJSON配列のみ。`;
    const { data } = await callJson<ThemeSuggestion[]>({
      prompt,
      model: suggestModel,
      maxTokens: 2500,
    });
    const themes = Array.isArray(data) ? data.slice(0, c) : mock(c);
    return { themes, source: "ai" };
  } catch {
    return { themes: mock(c), source: "mock" };
  }
}
