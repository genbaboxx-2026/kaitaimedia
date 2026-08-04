/**
 * 公開記事の表紙サムネを作り直してアップロードし、キャッシュを破棄する。
 *   npx tsx scripts/regen-eyecatch.ts <slug> [slug...]
 */
import { loadEnvLocal } from "./load-env-local";

loadEnvLocal();

async function main(): Promise<void> {
  const slugs = process.argv.slice(2).filter(Boolean);
  if (slugs.length === 0) {
    console.error("Usage: npx tsx scripts/regen-eyecatch.ts <slug> [slug...]");
    process.exit(1);
  }

  const { restSelect, restUpdate } = await import("../src/lib/supabase/rest");
  const { generateYoutubeEyecatchPng, uploadEyecatch } = await import(
    "../src/lib/image/eyecatch"
  );
  const { requestPublicRevalidate } = await import(
    "../src/lib/request-public-revalidate"
  );

  for (const slug of slugs) {
    const rows = await restSelect<{
      id: string;
      title: string;
      category: { slug: string; name: string } | null;
    }>(
      `articles?select=id,title,category:categories(slug,name)&slug=eq.${encodeURIComponent(slug)}&limit=1`,
      0,
    );
    const article = rows?.[0];
    if (!article) {
      console.error(`[skip] not found: ${slug}`);
      continue;
    }

    const categoryName = article.category?.name ?? "";
    const categorySlug = article.category?.slug ?? "news";
    // 再生成のたびに違う構図になるよう時刻を混ぜる
    const seed = (Date.now() ^ slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) >>> 0;

    console.log(`[regen] ${slug} — ${article.title}`);
    const cover = await generateYoutubeEyecatchPng(article.title, categoryName, {
      categorySlug,
      seed,
    });
    if (!cover) {
      console.error(`[fail] generate: ${slug}`);
      continue;
    }
    console.log(`[regen] style=${cover.styleId ?? "?"} cost≈$${cover.costUsd.toFixed(3)}`);

    // Versioned path for cache-bust; also upsert canonical `${slug}.png`.
    const versionedName = `${slug}-${seed.toString(36)}`;
    const url = await uploadEyecatch(cover.png, versionedName);
    if (!url) {
      console.error(`[fail] upload versioned: ${slug}`);
      continue;
    }
    const canonical = await uploadEyecatch(cover.png, slug);
    if (!canonical) {
      console.warn(`[warn] canonical upsert failed: ${slug}.png (versioned ok)`);
    } else {
      console.log(`[ok] canonical ${canonical}`);
    }

    await restUpdate(`articles?id=eq.${encodeURIComponent(article.id)}`, {
      eyecatch_url: url,
      updated_at: new Date().toISOString(),
    });
    console.log(`[ok] db eyecatch_url=${url}`);
  }

  await requestPublicRevalidate(slugs);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
