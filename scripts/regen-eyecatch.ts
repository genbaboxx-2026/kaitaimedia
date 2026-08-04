/**
 * 公開記事の表紙サムネを作り直してアップロードし、キャッシュを破棄する。
 *   npx tsx scripts/regen-eyecatch.ts <slug> [slug...]
 *   npx tsx scripts/regen-eyecatch.ts --palette=sky-white <slug>
 *   npx tsx scripts/regen-eyecatch.ts --bright <slug>   # 明るいパレットからランダム
 */
import { loadEnvLocal } from "./load-env-local";

loadEnvLocal();

async function main(): Promise<void> {
  const args = process.argv.slice(2).filter(Boolean);
  let paletteId: string | undefined;
  let brightOnly = false;
  const slugs: string[] = [];

  for (const a of args) {
    if (a === "--bright") {
      brightOnly = true;
      continue;
    }
    if (a.startsWith("--palette=")) {
      paletteId = a.slice("--palette=".length);
      continue;
    }
    slugs.push(a);
  }

  if (slugs.length === 0) {
    console.error(
      "Usage: npx tsx scripts/regen-eyecatch.ts [--bright|--palette=ID] <slug> [slug...]",
    );
    process.exit(1);
  }

  const { restSelect, restUpdate } = await import("../src/lib/supabase/rest");
  const { generateYoutubeEyecatchPng, uploadEyecatch } = await import(
    "../src/lib/image/eyecatch"
  );
  const { requestPublicRevalidate } = await import(
    "../src/lib/request-public-revalidate"
  );
  const { DIAGRAM_PALETTES } = await import("../src/lib/image/diagram-styles");

  if (brightOnly && !paletteId) {
    const light = DIAGRAM_PALETTES.filter((p) => p.tone === "light");
    paletteId = light[Math.floor(Math.random() * light.length)]?.id;
    console.log(`[regen] forced bright palette=${paletteId}`);
  }

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
    const seed =
      (Date.now() ^
        slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) >>>
      0;

    console.log(`[regen] ${slug} — ${article.title}`);
    const cover = await generateYoutubeEyecatchPng(article.title, categoryName, {
      categorySlug,
      seed,
      paletteId,
    });
    if (!cover) {
      console.error(`[fail] generate: ${slug}`);
      continue;
    }
    console.log(
      `[regen] style=${cover.styleId ?? "?"} cost≈$${cover.costUsd.toFixed(3)}`,
    );

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
