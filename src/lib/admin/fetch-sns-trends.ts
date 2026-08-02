import { restSelect } from "@/lib/supabase/rest";
import type { SnsTrendPost, SnsTrendStatus } from "@/lib/types";

interface SnsTrendRow {
  id: string;
  post_url: string;
  author_handle: string;
  author_name: string | null;
  text_snippet: string;
  like_count: number;
  posted_at: string | null;
  relevance_note: string | null;
  status: SnsTrendStatus;
  fetched_at: string;
  reviewed_at: string | null;
}

const SELECT =
  "id,post_url,author_handle,author_name,text_snippet,like_count,posted_at,relevance_note,status,fetched_at,reviewed_at";

function mapRow(r: SnsTrendRow): SnsTrendPost & { reviewedAt?: string } {
  return {
    id: r.id,
    postUrl: r.post_url,
    authorHandle: r.author_handle,
    authorName: r.author_name ?? undefined,
    textSnippet: r.text_snippet,
    likeCount: r.like_count,
    postedAt: r.posted_at ?? undefined,
    relevanceNote: r.relevance_note ?? undefined,
    status: r.status,
    fetchedAt: r.fetched_at,
    reviewedAt: r.reviewed_at ?? undefined,
  };
}

export async function fetchAdminSnsTrends(
  limit = 80,
): Promise<(SnsTrendPost & { reviewedAt?: string })[]> {
  const rows = await restSelect<SnsTrendRow>(
    `sns_trend_posts?select=${SELECT}&order=fetched_at.desc.nullslast,like_count.desc&limit=${limit}`,
    0,
  );
  return (rows ?? []).map(mapRow);
}
