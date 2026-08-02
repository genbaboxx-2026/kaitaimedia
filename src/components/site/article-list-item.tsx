import Link from "next/link";
import type { Article } from "@/lib/types";
import { getCategoryName } from "@/lib/dummy-data";
import { getCategoryMeta } from "@/lib/categories-meta";
import { formatJaDate } from "@/lib/format";
import { CategoryIcon } from "@/components/site/icons";

// 新聞の見出しリスト風（小サムネ＋テキスト）。
export function ArticleListItem({ article }: { article: Article }) {
  const categoryName = getCategoryName(article.categorySlug);
  const meta = getCategoryMeta(article.categorySlug);

  return (
    <article className="group flex gap-4 border-b border-slate-200 py-4">
      <Link
        href={`/articles/${article.slug}`}
        className="relative flex aspect-[4/3] w-28 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 sm:w-32"
      >
        <CategoryIcon icon={meta.icon} className="h-10 w-10 text-slate-300" />
      </Link>

      <div className="min-w-0 flex-1">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-700">
          <span
            aria-hidden
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: meta.accent }}
          />
          {categoryName}
        </span>
        <h3 className="mt-1 font-serif text-base font-bold leading-snug text-slate-900">
          <Link
            href={`/articles/${article.slug}`}
            className="decoration-navy-600 decoration-2 underline-offset-4 group-hover:underline"
          >
            {article.title}
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-500">
          {article.excerpt}
        </p>
        <p className="mt-1.5 text-xs text-slate-400">
          {formatJaDate(article.publishedAt)}
        </p>
      </div>
    </article>
  );
}
