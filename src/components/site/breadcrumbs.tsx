import Link from "next/link";

export interface Crumb {
  label: string;
  href?: string;
}

// 視覚的なパンくず。構造化データ（BreadcrumbList）はタスク4で付与する。
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="パンくずリスト" className="text-xs text-slate-500">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-navy-700">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "text-slate-700" : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span aria-hidden className="text-slate-300">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
