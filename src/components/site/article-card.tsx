import Link from "next/link";
import type { Article } from "@/lib/types";
import { getCategoryName } from "@/lib/dummy-data";
import { formatJaDate } from "@/lib/format";
import { Eyecatch } from "@/components/site/eyecatch";

export function ArticleCard({ article }: { article: Article }) {
  const categoryName = getCategoryName(article.categorySlug);

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-shadow hover:shadow-md">
      <Link href={`/articles/${article.slug}`} className="block">
        <Eyecatch
          categorySlug={article.categorySlug}
          categoryName={categoryName}
          imageUrl={article.imageUrl}
          className="aspect-video"
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

        <div className="mt-3 text-xs text-slate-400">
          <time dateTime={article.publishedAt}>
            {formatJaDate(article.publishedAt)}
          </time>
        </div>
      </div>
    </article>
  );
}
