/**
 * 画像未取得 or 汎用画像の news_items を埋める（ローカル実行用）。
 *
 *   npx tsx scripts/backfill-news-images.ts
 *   REPLACE_GENERIC=1 npx tsx scripts/backfill-news-images.ts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ensureNewsImageUrl } from "../src/lib/news/ensure-image";
import {
  isGenericNewsImageUrl,
  isUsableNewsImageUrl,
} from "../src/lib/news/og-image";
import { restSelect, restUpdate } from "../src/lib/supabase/rest";

try {
  const envPath = resolve(process.cwd(), ".env.local");
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {
  // ignore
}

interface Row {
  id: string;
  url: string;
  title: string;
  source_id: string;
  source_name: string;
  image_url: string | null;
}

async function main() {
  const limit = Number(process.env.BACKFILL_LIMIT ?? "20");
  const replaceGeneric = process.env.REPLACE_GENERIC === "1";

  const rows = await restSelect<Row>(
    `news_items?select=id,url,title,source_id,source_name,image_url&is_visible=eq.true&order=published_at.desc.nullslast&limit=${limit}`,
    0,
  );
  if (!rows?.length) {
    console.log("対象なし（取得失敗の可能性）");
    return;
  }

  const targets = rows.filter((r) => {
    if (!r.image_url) return true;
    if (!isUsableNewsImageUrl(r.image_url)) return true;
    if (replaceGeneric && isGenericNewsImageUrl(r.image_url)) return true;
    // 過去に保存した汎用画像も isUsable で弾かれるようになったので上で拾える
    return false;
  });

  console.log(`スキャン ${rows.length} / 対象 ${targets.length} 件`);
  let ok = 0;
  for (const [i, row] of targets.entries()) {
    process.stdout.write(
      `[${i + 1}/${targets.length}] ${row.source_id} ${row.title.slice(0, 28)} ... `,
    );
    try {
      const imageUrl = await ensureNewsImageUrl({
        id: row.id,
        url: row.url,
        title: row.title,
        sourceName: row.source_name,
        existingImageUrl: row.image_url,
        replaceGeneric: true,
      });
      if (imageUrl) {
        await restUpdate(`news_items?id=eq.${encodeURIComponent(row.id)}`, {
          image_url: imageUrl,
        });
        ok += 1;
        const kind = imageUrl.includes("/eyecatch/news/") ? "GEN" : "OGP";
        console.log(kind, imageUrl.slice(0, 70));
      } else {
        console.log("FAIL");
      }
    } catch (e) {
      console.log("ERR", e instanceof Error ? e.message : e);
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  console.log(`完了: ${ok}/${targets.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
