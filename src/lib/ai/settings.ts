import { restSelect } from "@/lib/supabase/rest";

// settings テーブルから生成設定を取得する。コードに定数を持たない方針のため、
// 値は必ず DB から読む。DB 取得失敗時は最小限の安全側デフォルトに倒す。

interface SettingRow {
  key: string;
  value: string | null;
}

export async function loadSettings(): Promise<Record<string, string>> {
  const rows = await restSelect<SettingRow>("settings?select=key,value", 0);
  const map: Record<string, string> = {};
  if (rows) {
    for (const r of rows) {
      if (r.value !== null) map[r.key] = r.value;
    }
  }
  return map;
}

export function getString(
  s: Record<string, string>,
  key: string,
  fallback: string,
): string {
  return s[key] ?? fallback;
}

export function getNumber(
  s: Record<string, string>,
  key: string,
  fallback: number,
): number {
  const v = Number(s[key]);
  return Number.isFinite(v) ? v : fallback;
}

export function getBool(
  s: Record<string, string>,
  key: string,
  fallback: boolean,
): boolean {
  const v = s[key];
  if (v === undefined) return fallback;
  return v === "true";
}

// 生成に使うモデル（未設定時は Opus 4.8）
export function getModel(s: Record<string, string>): string {
  return getString(s, "ai_model", "claude-opus-4-8");
}
