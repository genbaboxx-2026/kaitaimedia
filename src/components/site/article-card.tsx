import Link from "next/link";
import type { Article } from "@/lib/types";
import { getCategoryName } from "@/lib/dummy-data";
import { formatJaDate } from "@/lib/format";
import { ArticleTypeBadge } from "@/components/site/badges";
import { Eyecatch } from "@/components/site/eyecatch";

export function ArticleCard({ article }: { article: Article }) {
  const categoryName = getCategoryName(article.categorySlug);

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-shadow hover:shadow-md">
      <Link href={`/articles/${article.slug}`} className="block">
        <Eyecatch
          categorySlug={article.categorySlug}
          categoryName={categoryName}
          className="aspect-[16/10]"
        />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-serif text-[1.05rem] font-bold leading-snug text-slate-900">
          <Link
            href={`/articles/${article.slug}`}
            className="decoration-navy-600 decoration-2 underline-offset-4 group-hover:underline"
          >
            {article.title}
          </Link>
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
          {article.excerpt}
        </p>

        <div className="mt-3 flex items-center gap-2.5 text-xs text-slate-400">
          <ArticleTypeBadge type={article.articleType} />
          <span className="ml-auto flex items-center gap-2">
            <time dateTime={article.publishedAt}>
              {formatJaDate(article.publishedAt)}
            </time>
            <span aria-hidden>·</span>
            <span>約{article.readingMinutes}分</span>
          </span>
        </div>
      </div>
    </article>
  );
}
