import { restSelect } from "@/lib/supabase/rest";

interface MasterRow {
  label: string | null;
}

// 指定種別のマスタのラベル一覧を取得（禁止表現・数値検出除外リストなど）。
export async function loadMasterLabels(masterType: string): Promise<string[]> {
  const rows = await restSelect<MasterRow>(
    `masters?select=label&master_type=eq.${masterType}&is_active=is.true`,
    0,
  );
  return (rows ?? [])
    .map((r) => (r.label ?? "").trim())
    .filter((l) => l.length > 0);
}

// ラベル＋値のペアで取得（用語集・記事型テンプレなど、値も生成に渡したいもの）。
export async function loadMasterPairs(
  masterType: string,
): Promise<{ label: string; value: string }[]> {
  const rows = await restSelect<{ label: string | null; value: string | null }>(
    `masters?select=label,value&master_type=eq.${masterType}&is_active=is.true`,
    0,
  );
  return (rows ?? [])
    .map((r) => ({ label: (r.label ?? "").trim(), value: (r.value ?? "").trim() }))
    .filter((r) => r.label.length > 0);
}
