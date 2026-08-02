import type { ArticleSection } from "@/lib/types";

// 記事詳細の目次。H2見出し（section）をアンカーリンクで並べる。
export function TableOfContents({ sections }: { sections: ArticleSection[] }) {
  if (sections.length === 0) return null;

  return (
    <nav
      aria-label="目次"
      className="rounded-lg border border-slate-200 bg-white p-5"
    >
      <p className="text-sm font-bold text-slate-900">目次</p>
      <ol className="mt-3 space-y-2">
        {sections.map((s, i) => (
          <li key={s.id} className="text-sm leading-relaxed">
            <a
              href={`#${s.id}`}
              className="flex gap-2 text-slate-600 hover:text-navy-700"
            >
              <span className="shrink-0 font-medium text-navy-700">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{s.heading}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
