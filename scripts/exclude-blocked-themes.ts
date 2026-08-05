/**
 * 待ち行列の法令・補助金系テーマを excluded にする。
 *   npx tsx scripts/exclude-blocked-themes.ts
 */
import { loadEnvLocal } from "./load-env-local";

loadEnvLocal();

async function main(): Promise<void> {
  const { restSelect, restUpdate } = await import("../src/lib/supabase/rest");
  const { isBlockedTheme } = await import("../src/lib/generation/theme-policy");

  const rows = await restSelect<{
    id: string;
    title: string;
    category: { slug: string } | null;
  }>(
    "themes?select=id,title,category:categories(slug)&status=eq.pending",
    0,
  );

  let n = 0;
  for (const t of rows ?? []) {
    if (!isBlockedTheme(t.title, t.category?.slug ?? null)) continue;
    await restUpdate(`themes?id=eq.${encodeURIComponent(t.id)}`, {
      status: "excluded",
    });
    console.log("excluded:", t.title);
    n += 1;
  }
  console.log(`done: ${n} themes excluded`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
