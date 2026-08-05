import Link from "next/link";
import type { Article } from "@/lib/types";
import { getCategoryName } from "@/lib/dummy-data";
import { getCategoryMeta } from "@/lib/categories-meta";
import { formatRelativeJa } from "@/lib/format";
import { CategoryIcon } from "@/components/site/icons";

/**
 * NewsPicks風：左に見出し＋メタ、右にサムネ。
 * デスクトップでも同じリストトーンを維持。
 */
export function ArticleListItem({ article }: { article: Article }) {
  const categoryName = getCategoryName(article.categorySlug);
  const meta = getCategoryMeta(article.categorySlug);

  return (
    <article className="border-b border-slate-100">
      <Link
        href={`/articles/${article.slug}`}
        className="group flex gap-3 px-4 py-4 active:bg-slate-50 md:gap-4 md:px-0 md:py-4"
      >
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-3 text-[16px] font-bold leading-snug tracking-tight text-ink md:font-serif md:text-base">
            {article.title}
          </h3>

          <p className="mt-2 text-[12px] leading-none text-slate-400">
            <span className="font-medium text-slate-500">{categoryName}</span>
            <span aria-hidden className="mx-1.5">
              ·
            </span>
            <time dateTime={article.publishedAt}>
              {formatRelativeJa(article.publishedAt)}
            </time>
          </p>
        </div>

        <div className="relative mt-0.5 aspect-video w-[104px] shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-slate-100 to-slate-200 sm:w-28">
          {article.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.imageUrl}
              alt=""
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center">
              <CategoryIcon
                icon={meta.icon}
                className="h-8 w-8 text-slate-300"
              />
            </span>
          )}
        </div>
      </Link>
    </article>
  );
}
