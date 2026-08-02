import Link from "next/link";

interface PaginationProps {
  basePath: string; // 例: "/articles"
  currentPage: number;
  totalPages: number;
}

function pageHref(basePath: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}?page=${page}`;
}

export function Pagination({
  basePath,
  currentPage,
  totalPages,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const baseItem =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm transition-colors";

  return (
    <nav
      aria-label="ページネーション"
      className="mt-10 flex items-center justify-center gap-2"
    >
      {hasPrev ? (
        <Link
          href={pageHref(basePath, currentPage - 1)}
          className={`${baseItem} border-slate-200 bg-white text-slate-700 hover:border-navy-700 hover:text-navy-700`}
          rel="prev"
        >
          前へ
        </Link>
      ) : (
        <span className={`${baseItem} border-slate-100 bg-slate-50 text-slate-300`}>
          前へ
        </span>
      )}

      {pages.map((p) =>
        p === currentPage ? (
          <span
            key={p}
            aria-current="page"
            className={`${baseItem} border-navy-700 bg-navy-700 font-semibold text-white`}
          >
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={pageHref(basePath, p)}
            className={`${baseItem} border-slate-200 bg-white text-slate-700 hover:border-navy-700 hover:text-navy-700`}
          >
            {p}
          </Link>
        ),
      )}

      {hasNext ? (
        <Link
          href={pageHref(basePath, currentPage + 1)}
          className={`${baseItem} border-slate-200 bg-white text-slate-700 hover:border-navy-700 hover:text-navy-700`}
          rel="next"
        >
          次へ
        </Link>
      ) : (
        <span className={`${baseItem} border-slate-100 bg-slate-50 text-slate-300`}>
          次へ
        </span>
      )}
    </nav>
  );
}
