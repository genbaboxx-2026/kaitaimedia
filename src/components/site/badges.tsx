import { ARTICLE_TYPE_LABEL, type ArticleType } from "@/lib/types";
import { getCategoryMeta } from "@/lib/categories-meta";

export function CategoryBadge({
  slug,
  name,
}: {
  slug: string;
  name: string;
}) {
  const meta = getCategoryMeta(slug);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700">
      <span
        aria-hidden
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: meta.accent }}
      />
      {name}
    </span>
  );
}

export function ArticleTypeBadge({ type }: { type: ArticleType }) {
  return (
    <span
      className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500"
      title={`記事型${type}：${ARTICLE_TYPE_LABEL[type]}`}
    >
      {ARTICLE_TYPE_LABEL[type]}
    </span>
  );
}
