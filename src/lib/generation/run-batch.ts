import { getBool, getNumber, loadSettings } from "@/lib/ai/settings";
import {
  runGenerationPipeline,
  type ManualThemeInput,
  type PipelineResult,
} from "@/lib/generation/pipeline";
import { restSelect, restUpdate } from "@/lib/supabase/rest";

export interface RunBatchOptions {
  /** 生成する本数。未指定なら settings.articles_per_day */
  count?: number;
  /** 管理画面手動：自動生成OFFでも1本生成する */
  force?: boolean;
  /**
   * true（既定・バッチ）: 自動公開ONなら先に下書きを公開して新規生成をスキップ
   * false（管理画面手動）: 常に新規生成する
   */
  drainDraftsFirst?: boolean;
  /** 管理画面で指定したテーマ */
  manualTheme?: ManualThemeInput;
}

export interface RunBatchResult {
  results: PipelineResult[];
  publishedDrafts: number;
}

/**
 * 記事生成バッチ本体（CLI / 管理画面 API 共通）。
 */
export async function runGenerationBatch(
  opts: RunBatchOptions = {},
): Promise<RunBatchResult> {
  const settings = await loadSettings();
  const perDay = Math.max(
    0,
    opts.count ?? getNumber(settings, "articles_per_day", 1),
  );
  if (perDay === 0) {
    return {
      results: [
        {
          status: "skipped",
          message: "articles_per_day=0 のため生成をスキップしました。",
        },
      ],
      publishedDrafts: 0,
    };
  }

  const drain = opts.drainDraftsFirst !== false;
  if (drain && getBool(settings, "auto_publish_enabled", false)) {
    const drafts = await restSelect<{ id: string; title: string }>(
      `articles?select=id,title&status=eq.draft&order=created_at.asc&limit=${perDay}`,
      0,
    );
    if (drafts && drafts.length > 0) {
      for (const d of drafts) {
        await restUpdate(`articles?id=eq.${encodeURIComponent(d.id)}`, {
          status: "published",
          published_at: new Date().toISOString(),
        });
      }
      return {
        results: [
          {
            status: "published",
            message: `下書き在庫 ${drafts.length} 件を公開しました（新規生成は次回以降）。`,
          },
        ],
        publishedDrafts: drafts.length,
      };
    }
  }

  const results: PipelineResult[] = [];
  for (let i = 0; i < perDay; i++) {
    const result = await runGenerationPipeline({
      force: opts.force,
      manualTheme: opts.manualTheme,
    });
    results.push(result);
    if (result.status === "skipped") break;
  }
  return { results, publishedDrafts: 0 };
}
