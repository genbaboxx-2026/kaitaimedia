import { CATEGORIES } from "@/lib/dummy-data";
import { isBlockedTheme } from "@/lib/generation/theme-policy";
import type { ArticleType } from "@/lib/types";

export interface ThemeSuggestion {
  title: string;
  categorySlug: string;
  targetKeyword: string;
  articleType: ArticleType;
  priority: "high" | "medium" | "low";
}

/**
 * 記事型の狙い（10本あたり A3 / B6 / C1）
 * A: 現場・見積もりの手順（計算テンプレ調は月1程度）
 * B: 経営・採用・等級/評価・広報
 * C: 業界動向・視点（稀）
 */
// AI未設定・失敗時のダミー候補（配分・方針に寄せたもの）
const MOCK_POOL: ThemeSuggestion[] = [
  // A（現場・見積もり手順）≈3/10
  { title: "解体工事の見積書の見方と比較のコツ", categorySlug: "estimate", targetKeyword: "解体 見積書 比較", articleType: "A", priority: "high" },
  { title: "解体の追加工事を防ぐ契約時の確認", categorySlug: "estimate", targetKeyword: "解体 追加工事 契約", articleType: "A", priority: "high" },
  { title: "騒音・振動の近隣クレームへの対応手順", categorySlug: "field", targetKeyword: "解体 騒音 クレーム", articleType: "A", priority: "medium" },
  // B（経営・人事・広報）≈6/10
  { title: "解体会社の採用面接で見るべき観点", categorySlug: "management", targetKeyword: "解体 採用 面接", articleType: "B", priority: "high" },
  { title: "現場職の等級制度を小さく始める方法", categorySlug: "management", targetKeyword: "解体 等級制度", articleType: "B", priority: "high" },
  { title: "解体業の人事評価で使う評価項目の作り方", categorySlug: "management", targetKeyword: "解体 人事評価", articleType: "B", priority: "high" },
  { title: "解体会社の採用広報で伝えるべき強み", categorySlug: "management", targetKeyword: "解体 採用 広報", articleType: "B", priority: "medium" },
  { title: "職長候補を育成する社内の進め方", categorySlug: "management", targetKeyword: "解体 職長 育成", articleType: "B", priority: "medium" },
  { title: "解体業の定着率を上げる面談の設計", categorySlug: "management", targetKeyword: "解体 定着 面談", articleType: "B", priority: "medium" },
  // C（動向・視点）≈1/10
  { title: "他業種の組織づくりから学ぶ解体業のヒント", categorySlug: "industry", targetKeyword: "解体 組織づくり 他業種", articleType: "C", priority: "medium" },
  // 予備
  { title: "解体現場の朝礼を短くする進め方", categorySlug: "field", targetKeyword: "解体 朝礼", articleType: "A", priority: "low" },
  { title: "協力会社との関係を保つ営業のコツ", categorySlug: "management", targetKeyword: "解体 協力会社 営業", articleType: "B", priority: "low" },
  { title: "スタートアップ視点で見る解体業の始め方", categorySlug: "industry", targetKeyword: "解体業 スタートアップ", articleType: "C", priority: "low" },
  { title: "見積もりの内訳を社内で揃える手順", categorySlug: "estimate", targetKeyword: "解体 見積 内訳", articleType: "A", priority: "medium" },
  { title: "若手職人向けの評価フィードバックの型", categorySlug: "management", targetKeyword: "解体 評価 フィードバック", articleType: "B", priority: "medium" },
];

function mock(count: number): ThemeSuggestion[] {
  const out: ThemeSuggestion[] = [];
  for (let i = 0; i < count; i += 1) out.push(MOCK_POOL[i % MOCK_POOL.length]);
  return applyTypeQuota(out);
}

function currentYear(): number {
  return new Date().getFullYear();
}

/** 過去年の「◯年版」などを現行年に直す（AIの古い知識対策） */
function sanitizeThemeYear(title: string, year: number): string {
  let t = title;
  t = t.replace(
    /\b(202[0-9]|203[0-9])\s*年版\b/g,
    (m, y: string) => {
      const n = Number(y);
      return n < year ? `${year}年版` : m;
    },
  );
  t = t.replace(/\b(20[0-2]\d)年(?!版)/g, (m, y: string) => {
    const n = Number(y);
    return n < year && n >= 2020 ? `${year}年` : m;
  });
  return t;
}

function sanitizeThemes(
  themes: ThemeSuggestion[],
  year: number,
): ThemeSuggestion[] {
  const cleaned = themes
    .map((th) => ({
      ...th,
      title: sanitizeThemeYear(th.title, year),
      articleType: (["A", "B", "C"].includes(th.articleType)
        ? th.articleType
        : "B") as ArticleType,
    }))
    .filter((th) => !isBlockedTheme(th.title, th.categorySlug));
  return applyTypeQuota(cleaned);
}

/** 10本あたり A3 / B6 / C1 に寄せる */
export function typeQuotaFor(count: number): {
  a: number;
  b: number;
  c: number;
} {
  const n = Math.max(0, Math.floor(count));
  const a = Math.round((n * 3) / 10);
  const c = Math.round((n * 1) / 10);
  const b = Math.max(0, n - a - c);
  return { a, b, c };
}

function preferredType(title: string, slug: string): ArticleType {
  const t = `${title} ${slug}`;
  if (
    /採用|等級|評価|広報|定着|育成|経営|組織|面接|等級制度|人事|ブランディング|社内制度/.test(
      t,
    )
  ) {
    return "B";
  }
  if (
    /業界動向|他業種|スタートアップ|比較から学ぶ|視点|ホワイトカラー|市場/.test(t) ||
    slug === "industry"
  ) {
    return "C";
  }
  if (
    /見積|原価|工程|現場|近隣|安全|分別|重機|職長|内訳|追加工事|挨拶/.test(t) ||
    ["estimate", "schedule", "field", "waste"].includes(slug)
  ) {
    return "A";
  }
  return "B";
}

/** AI出力の型を、希望配分に合わせて付け直す（タイトルとの相性を優先） */
function applyTypeQuota(themes: ThemeSuggestion[]): ThemeSuggestion[] {
  const n = themes.length;
  if (n === 0) return themes;
  const { a: wantA, b: wantB, c: wantC } = typeQuotaFor(n);

  const scored = themes.map((th, index) => ({
    th,
    index,
    pref: preferredType(th.title, th.categorySlug),
  }));

  const assigned: (ArticleType | null)[] = Array(n).fill(null);
  const counts = { A: 0, B: 0, C: 0 };
  const want = { A: wantA, B: wantB, C: wantC };

  // 1) 希望型が空き枠にあるものから確定
  for (const s of scored) {
    if (counts[s.pref] < want[s.pref]) {
      assigned[s.index] = s.pref;
      counts[s.pref] += 1;
    }
  }

  // 2) 未割当を空き枠へ
  const fillOrder: ArticleType[] = ["B", "A", "C"];
  for (let i = 0; i < n; i += 1) {
    if (assigned[i]) continue;
    const pref = scored.find((s) => s.index === i)?.pref ?? "B";
    const order = [pref, ...fillOrder.filter((x) => x !== pref)];
    const pick = order.find((t) => counts[t] < want[t]) ?? "B";
    assigned[i] = pick;
    counts[pick] += 1;
  }

  return themes.map((th, i) => ({
    ...th,
    articleType: assigned[i] ?? "B",
  }));
}

const CALC_HINT_RE =
  /計算テンプレ|計算式|単価×|原価の計算|実行予算の計算|人工数の計算/;

async function recentCalcTemplateUsed(): Promise<boolean> {
  try {
    const { restSelect } = await import("@/lib/supabase/rest");
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const iso = since.toISOString();
    const [articles, themes] = await Promise.all([
      restSelect<{ title: string }>(
        `articles?select=title&created_at=gte.${encodeURIComponent(iso)}`,
        0,
      ),
      restSelect<{ title: string }>(
        `themes?select=title&created_at=gte.${encodeURIComponent(iso)}`,
        0,
      ),
    ]);
    const titles = [
      ...(articles ?? []).map((r) => r.title),
      ...(themes ?? []).map((r) => r.title),
    ];
    return titles.some((t) => CALC_HINT_RE.test(t));
  } catch {
    return false;
  }
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
    const suggestModel = "claude-haiku-4-5";
    const year = currentYear();
    const slugs = CATEGORIES.map((cat) => `${cat.slug}(${cat.name})`).join("、");
    const quota = typeQuotaFor(c);
    const calcUsed = await recentCalcTemplateUsed();

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
      `priority は high/medium/low。categorySlug は次から選ぶ：${slugs}。\n` +
      `金額・単価・割合などの数値を主題にしないこと。\n` +
      `\n【絶対禁止】法令・法律・条文・許認可手続き・コンプライアンス解説を主題にしない。` +
      `「〜法の解説」「建設業許可の要件」「届出の書き方」など法律記事は出さない。` +
      `law（法規）カテゴリは原則使わない。\n` +
      `\n【記事型と件数配分（厳守）】今回${c}件のうち articleType はおおよそ` +
      ` A=${quota.a} / B=${quota.b} / C=${quota.c}（比率の目安は10本なら A3・B6・C1）。\n` +
      `- A：現場・見積もりの手順型。見積もり比較、追加工事防止、工程・現場運営の手順・確認項目。` +
      `計算式を前面に出す「計算テンプレート調」は通常出さない。\n` +
      `- B：経営・組織・人材型。経営、採用、等級制度、評価制度、広報、育成・定着。最多数にする。\n` +
      `- C：業界動向・視点型。他業種比較、スタートアップ視点など広い話題。少数。\n` +
      (calcUsed
        ? `【計算テンプレ】直近1ヶ月に計算テンプレ調の題材があるため、今回は計算式メインのテーマを出さない。見積もりは型Aの手順・確認で扱う。\n`
        : `【計算テンプレ】計算式メインのテーマは多くて月1本。出すなら型Aにし、数値は埋め込まない。今回の${c}件では0〜1本まで。\n`) +
      `\n【時点】いまは${year}年です。タイトルに過去の西暦を付けないこと。` +
      `年を入れるなら${year}年か、「最新」「現行」などぼかした表現にする。\n` +
      `\n【カテゴリーの目安】\n` +
      `- estimate：見積もり精度/内訳の揃え方/追加費用防止 → 主にA\n` +
      `- schedule：工程管理/人員計画 → 主にA\n` +
      `- field：安全管理/近隣対応/現場運営 → 主にA\n` +
      `- waste：分別・運用の実務手順（法律解説はしない） → A\n` +
      `- management：採用/等級/評価/広報/育成/経営 → 主にB\n` +
      `- industry：他業種比較、始め方の視点 → 主にC\n` +
      `- law / subsidy：原則使わない（法令・制度解説をしない方針）\n` +
      existingBlock +
      (instruction ? `追加の方針：${instruction}\n` : "") +
      `出力はJSON配列のみ。`;

    const { data } = await callJson<ThemeSuggestion[]>({
      prompt,
      model: suggestModel,
      maxTokens: 2500,
    });
    const themes = sanitizeThemes(
      Array.isArray(data) ? data.slice(0, c) : mock(c),
      year,
    );
    return { themes, source: "ai" };
  } catch {
    return { themes: mock(c), source: "mock" };
  }
}
