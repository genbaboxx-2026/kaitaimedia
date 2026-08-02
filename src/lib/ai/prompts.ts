import { restSelect } from "@/lib/supabase/rest";

// プロンプトは prompts テーブルから取得する（コードに直書きしない — CLAUDE.md 規約2）。
export type PromptStep =
  | "structure"
  | "body"
  | "seo"
  | "fix"
  | "quality"
  | "news_editorial";

interface PromptRow {
  content: string;
}

export async function getActivePrompt(step: PromptStep): Promise<string> {
  const rows = await restSelect<PromptRow>(
    `prompts?select=content&step=eq.${step}&is_active=is.true&limit=1`,
    0,
  );
  if (!rows || rows.length === 0) {
    throw new Error(
      `有効なプロンプトが見つかりません (step=${step})。prompts テーブルを確認してください。`,
    );
  }
  return rows[0].content;
}

// {{var}} を差し込み変数で置換する。未定義の変数はそのまま残す（検知しやすくするため）。
export function interpolate(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) =>
    key in vars ? vars[key] : `{{${key}}}`,
  );
}
