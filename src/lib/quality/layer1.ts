import { detectNumbers } from "@/lib/number-detection";
import type { CheckResult, QualityInput, QualityThresholds } from "@/lib/quality/types";

function charCount(body: string): number {
  return body.replace(/\s/g, "").length;
}

function extractUrls(body: string): string[] {
  const urls = new Set<string>();
  const mdLink = /\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/g;
  const bare = /(?<!\()https?:\/\/[^\s)]+/g;
  let m: RegExpExecArray | null;
  while ((m = mdLink.exec(body))) urls.add(m[1]);
  const bareMatches = body.match(bare);
  if (bareMatches) bareMatches.forEach((u) => urls.add(u));
  return [...urls];
}

async function isLinkAlive(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(url, { method: "HEAD", signal: controller.signal });
    return res.status < 400;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

// 第1層：機械判定（決定論的）。要件定義書 6.1。
export async function runLayer1(
  input: QualityInput,
  thr: QualityThresholds,
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const on = (key: string) => thr.enabled[key] !== false;

  // 数値表現の混入（最優先）
  if (on("number_detection")) {
    const hits = detectNumbers(input.body).filter(
      (h) => !thr.numberExclusions.some((ex) => h.matched.includes(ex)),
    );
    results.push({
      layer: 1,
      checkItem: "数値検出",
      passed: hits.length === 0,
      detail:
        hits.length === 0
          ? "検出なし"
          : hits.map((h) => `${h.matched}(${h.type})`).join(" / "),
    });
  }

  // 文字数
  if (on("char_count")) {
    const n = charCount(input.body);
    const passed = n >= thr.minChar && n <= thr.maxChar;
    results.push({
      layer: 1,
      checkItem: passed ? "文字数" : n < thr.minChar ? "文字数不足" : "文字数超過",
      passed,
      detail: `${n} 文字（${thr.minChar}〜${thr.maxChar}）`,
    });
  }

  // 見出し階層（H2の有無・H3がH2より前に出ないか）
  if (on("heading")) {
    const lines = input.body.split(/\r?\n/);
    const firstH2 = lines.findIndex((l) => /^##\s/.test(l));
    const firstH3 = lines.findIndex((l) => /^###\s/.test(l));
    const passed =
      firstH2 !== -1 && (firstH3 === -1 || firstH3 > firstH2);
    results.push({
      layer: 1,
      checkItem: "見出し構成",
      passed,
      detail: passed ? "H2/H3 階層OK" : "H2が無い、またはH3がH2より前にあります",
    });
  }

  // 禁止表現
  if (on("ng_expression")) {
    const found = thr.ngExpressions.filter((ng) => input.body.includes(ng));
    results.push({
      layer: 1,
      checkItem: "禁止表現",
      passed: found.length === 0,
      detail: found.length === 0 ? "なし" : `検出：${found.join(" / ")}`,
    });
  }

  // CTA有無
  if (on("cta")) {
    results.push({
      layer: 1,
      checkItem: "CTA",
      passed: input.hasCta,
      detail: input.hasCta ? "設定あり" : "CTAが設定されていません",
    });
  }

  // アイキャッチ有無
  if (on("image")) {
    results.push({
      layer: 1,
      checkItem: "アイキャッチ",
      passed: input.hasImage,
      detail: input.hasImage ? "設定あり" : "アイキャッチがありません",
    });
  }

  // SEOタイトル・メタディスクリプション長
  if (on("seo_length")) {
    const titleOk =
      input.seoTitle.length > 0 && input.seoTitle.length <= thr.seoTitleMax;
    results.push({
      layer: 1,
      checkItem: "SEOタイトル長",
      passed: titleOk,
      detail: `${input.seoTitle.length}/${thr.seoTitleMax} 文字`,
    });
    const metaOk =
      input.metaDescription.length > 0 &&
      input.metaDescription.length <= thr.metaDescMax;
    results.push({
      layer: 1,
      checkItem: "メタディスクリプション長",
      passed: metaOk,
      detail: `${input.metaDescription.length}/${thr.metaDescMax} 文字`,
    });
  }

  // リンク死活
  if (on("link_alive")) {
    const urls = extractUrls(input.body).slice(0, 10);
    if (urls.length === 0) {
      results.push({ layer: 1, checkItem: "リンク死活", passed: true, detail: "リンクなし" });
    } else {
      const alive = await Promise.all(urls.map((u) => isLinkAlive(u)));
      const dead = urls.filter((_, i) => !alive[i]);
      results.push({
        layer: 1,
        checkItem: "リンク死活",
        passed: dead.length === 0,
        detail: dead.length === 0 ? "全リンク生存" : `到達不可：${dead.join(" / ")}`,
      });
    }
  }

  // 出典URL（型Cのみ）
  if (on("source_url") && input.articleType === "C") {
    const hasSource =
      input.sourceUrls.length > 0 || extractUrls(input.body).length > 0;
    results.push({
      layer: 1,
      checkItem: "出典URL",
      passed: hasSource,
      detail: hasSource ? "出典あり" : "型Cですが出典URLがありません",
    });
  }

  return results;
}
