/**
 * 画像未取得の news_items を埋める（ローカル実行用）。
 * Googleニュースは出版社URLへ展開して OGP を取る。
 *
 *   npx tsx scripts/backfill-news-images.ts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { resolveNewsImageUrl, isUsableNewsImageUrl } from "../src/lib/news/og-image";
import { restSelect, restUpdate } from "../src/lib/supabase/rest";

// Next 外なので .env.local を手動ロード
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
}

async function main() {
  const limit = Number(process.env.BACKFILL_LIMIT ?? "20");
  const rows = await restSelect<Row>(
    `news_items?select=id,url,title,source_id&is_visible=eq.true&image_url=is.null&order=published_at.desc.nullslast&limit=${limit}`,
    0,
  );
  if (!rows?.length) {
    console.log("対象なし");
    return;
  }

  console.log(`対象 ${rows.length} 件`);
  let ok = 0;
  for (const [i, row] of rows.entries()) {
    process.stdout.write(`[${i + 1}/${rows.length}] ${row.source_id} ${row.title.slice(0, 30)} ... `);
    try {
      const imageUrl = await resolveNewsImageUrl(row.url);
      if (imageUrl && isUsableNewsImageUrl(imageUrl)) {
        await restUpdate(`news_items?id=eq.${encodeURIComponent(row.id)}`, {
          image_url: imageUrl,
        });
        ok += 1;
        console.log("OK", imageUrl.slice(0, 70));
      } else {
        console.log("NO_IMAGE");
      }
    } catch (e) {
      console.log("ERR", e instanceof Error ? e.message : e);
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  console.log(`完了: ${ok}/${rows.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
