import "server-only";
import { restSelect } from "@/lib/supabase/rest";
import type { GenLog, GenLogStatus } from "@/lib/admin-logs-data";

interface DbLog {
  id: string;
  status: string;
  revision_count: number | null;
  input_tokens: number | null;
  output_tokens: number | null;
  estimated_cost: number | null;
  started_at: string | null;
  finished_at: string | null;
  prompt_structure: string | null;
  prompt_body: string | null;
  prompt_fix: string | null;
  draft_first: string | null;
  draft_final: string | null;
  error_message: string | null;
  article: { id: string; title: string } | null;
  theme: { title: string } | null;
}

const STATUSES: GenLogStatus[] = ["published", "draft", "failed"];

const SELECT =
  "id,status,revision_count,input_tokens,output_tokens,estimated_cost," +
  "started_at,finished_at,prompt_structure,prompt_body,prompt_fix," +
  "draft_first,draft_final,error_message," +
  "article:articles(id,title),theme:themes(title)";

// 生成履歴（generation_logs）をDBから取得。接続不可なら null。
export async function fetchGenerationLogs(): Promise<GenLog[] | null> {
  const rows = await restSelect<DbLog>(
    `generation_logs?select=${SELECT}&order=started_at.desc&limit=200`,
    0,
  );
  if (!rows) return null;
  return rows.map((r) => {
    const status = (STATUSES.includes(r.status as GenLogStatus)
      ? r.status
      : "failed") as GenLogStatus;
    return {
      // 記事があれば編集リンク用に article.id を id にする（無ければログID）
      id: r.article?.id ?? r.id,
      title: r.article?.title ?? r.theme?.title ?? "（タイトル不明）",
      status,
      revisionCount: r.revision_count ?? 0,
      inputTokens: r.input_tokens ?? 0,
      outputTokens: r.output_tokens ?? 0,
      costUsd: r.estimated_cost ?? 0,
      startedAt: (r.started_at ?? "").slice(0, 10),
      finishedAt: (r.finished_at ?? "").slice(0, 10),
      promptStructure: r.prompt_structure ?? "",
      promptBody: r.prompt_body ?? "",
      promptFix: r.prompt_fix,
      draftFirst: r.draft_first ?? "",
      draftFinal: r.draft_final ?? "",
      error: r.error_message,
      checks: [],
    };
  });
}
