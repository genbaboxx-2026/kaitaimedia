/**
 * 公開記事の文中図版を、本文連動プロンプトで差し替える。
 *   npx tsx scripts/regen-inbody-figures.ts            # 全公開記事
 *   npx tsx scripts/regen-inbody-figures.ts <slug...>  # 指定のみ
 */
import { loadEnvLocal } from "./load-env-local";

loadEnvLocal();

const IMG_RE = /!\[([^\]]*)\]\((https?:\/\/[^)\s]+\/eyecatch\/[^)\s]*fig[^)\s]*)\)/gi;

interface Heading {
  text: string;
  lineStart: number;
  contentStart: number;
}

function parseHeadings(body: string): Heading[] {
  const re = /^##\s+(.+)$/gm;
  const out: Heading[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    out.push({
      text: m[1].trim(),
      lineStart: m.index,
      contentStart: m.index + m[0].length,
    });
  }
  return out;
}

function nearestHeading(headings: Heading[], imgIndex: number): Heading | null {
  let best: Heading | null = null;
  for (const h of headings) {
    if (h.lineStart <= imgIndex) best = h;
    else break;
  }
  return best;
}

async function main(): Promise<void> {
  const onlySlugs = process.argv.slice(2).filter(Boolean);
  const { restSelect, restUpdate } = await import("../src/lib/supabase/rest");
  const { generateAiEyecatchPng, uploadEyecatch } = await import(
    "../src/lib/image/eyecatch"
  );
  const {
    extractSectionExcerpt,
    pickFigureComposition,
    pickFigureStyle,
  } = await import("../src/lib/image/figure-prompt");
  const { requestPublicRevalidate } = await import(
    "../src/lib/request-public-revalidate"
  );

  const filter = onlySlugs.length
    ? `&slug=in.(${onlySlugs.map(encodeURIComponent).join(",")})`
    : "";
  const rows = await restSelect<{
    id: string;
    slug: string;
    title: string;
    body: string | null;
    category: { slug: string; name: string } | null;
  }>(
    `articles?select=id,slug,title,body,category:categories(slug,name)&status=eq.published${filter}&order=published_at.desc`,
    0,
  );

  if (!rows?.length) {
    console.error("対象記事がありません");
    process.exit(1);
  }

  const quality = (process.env.REGEN_IMAGE_QUALITY || "medium") as
    | "low"
    | "medium"
    | "high";
  const touchedSlugs: string[] = [];
  let totalOk = 0;
  let totalFail = 0;

  for (const article of rows) {
    const body0 = article.body ?? "";
    const matches = [...body0.matchAll(IMG_RE)];
    if (matches.length === 0) {
      console.log(`[skip] ${article.slug} — 文中図版なし`);
      continue;
    }

    console.log(
      `\n=== ${article.slug}（${matches.length}枚） ${article.title} ===`,
    );
    const headings = parseHeadings(body0);
    const categoryName = article.category?.name ?? "";
    const styleSeed = Date.now() % 97;
    let body = body0;
    let changed = 0;

    // 後ろから置換して index ズレを防ぐ
    for (let i = matches.length - 1; i >= 0; i--) {
      const m = matches[i];
      const full = m[0];
      const alt = m[1] || "";
      const oldUrl = m[2];
      const imgIndex = m.index ?? 0;
      const heading = nearestHeading(headings, imgIndex);
      const headingText = heading?.text || alt || article.title;
      const nextH = heading
        ? headings[headings.indexOf(heading) + 1]
        : undefined;
      const sectionStart = heading?.contentStart ?? imgIndex;
      const sectionEnd = nextH?.lineStart ?? body0.length;
      // 画像マークダウン自体は抜粋から除外される
      const sectionExcerpt = extractSectionExcerpt(
        body0,
        sectionStart,
        sectionEnd,
      );
      const figureIndex = i;
      const composition = pickFigureComposition(figureIndex, styleSeed);
      const style = pickFigureStyle(figureIndex, styleSeed);

      console.log(
        `[gen] ${i + 1}/${matches.length} 「${headingText.slice(0, 36)}」 excerpt=${sectionExcerpt.slice(0, 60)}…`,
      );

      const img = await generateAiEyecatchPng(headingText, categoryName, {
        quality,
        role: "figure",
        articleTitle: article.title,
        sectionExcerpt,
        figureIndex,
        figureCount: matches.length,
        style,
        variantHint: composition,
      });
      if (!img) {
        console.error(`[fail] generate ${article.slug} fig${i + 1}`);
        totalFail++;
        continue;
      }

      const objectName = `${article.slug}-fig${i + 1}-${Date.now().toString(36)}`;
      const url = await uploadEyecatch(img.png, objectName);
      if (!url) {
        console.error(`[fail] upload ${article.slug} fig${i + 1}`);
        totalFail++;
        continue;
      }

      // 同一旧URLが複数あっても、このマッチ箇所だけ置換
      const before = body.slice(0, imgIndex);
      const after = body.slice(imgIndex + full.length);
      const newMd = `![${alt || headingText}](${url})`;
      // body0 基準の index は最初のループで取っているが、後ろから置換なので
      // 未置換部分の index は body0 と同じ。body は後ろだけ変わっている前提で
      // imgIndex を body0 基準のまま使うのは、後ろからやる限り前方は不変なので OK。
      body = before + newMd + after;
      // ただし2回目以降、前の置換が後ろなので before は body（更新済み）の slice が正しい。
      // imgIndex は body0 基準。後ろからなら imgIndex より後ろだけが変わるので
      // body.slice(0, imgIndex) は body0 と同じ。OK。

      console.log(`[ok] fig${i + 1} $${img.costUsd.toFixed(3)} → ${url}`);
      changed++;
      totalOk++;
      void oldUrl;
    }

    if (changed > 0) {
      await restUpdate(`articles?id=eq.${encodeURIComponent(article.id)}`, {
        body,
        updated_at: new Date().toISOString(),
      });
      touchedSlugs.push(article.slug);
      console.log(`[saved] ${article.slug}（${changed}枚差し替え）`);
    }
  }

  if (touchedSlugs.length > 0) {
    await requestPublicRevalidate(touchedSlugs);
  }

  console.log(
    `\n完了: 成功 ${totalOk} / 失敗 ${totalFail} / 記事 ${touchedSlugs.length}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
