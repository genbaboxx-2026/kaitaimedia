import type { ReactNode } from "react";
import { markdownToSections } from "@/lib/markdown-to-sections";
import type { ContentBlock } from "@/lib/types";

const INLINE = /(\*\*[^*]+\*\*|==[^=]+==|\[[^\]]+\]\((?:https?:\/\/)?[^)]+\))/g;

const SECTION_STYLE: Record<
  string,
  { eyebrow: string; title: string; accent: string }
> = {
  わかりやすく解説: {
    eyebrow: "POINT 1",
    title: "わかりやすく解説",
    accent: "text-navy-700",
  },
  実務で確認できそうなこと: {
    eyebrow: "POINT 2",
    title: "実務で確認できそうなこと",
    accent: "text-navy-700",
  },
  実際の内容: {
    eyebrow: "POINT 3",
    title: "実際の内容",
    accent: "text-navy-700",
  },
};

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = 0;
  INLINE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = INLINE.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) {
      nodes.push(<strong key={key++}>{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith("==")) {
      nodes.push(<mark key={key++}>{tok.slice(2, -2)}</mark>);
    } else {
      const mm = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(tok);
      if (mm) {
        nodes.push(
          <a key={key++} href={mm[2]} target="_blank" rel="noopener noreferrer">
            {mm[1]}
          </a>,
        );
      } else {
        nodes.push(tok);
      }
    }
    last = m.index + tok.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="text-[16px] leading-8 text-slate-700">
          {renderInline(block.text)}
        </p>
      );
    case "heading3":
      return (
        <h3 className="mt-4 text-[16px] font-bold text-ink">{block.text}</h3>
      );
    case "callout":
      return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] leading-7 text-slate-600">
          {renderInline(block.text)}
        </div>
      );
    case "list":
      return block.ordered ? (
        <ol className="list-decimal space-y-2 pl-5 text-[16px] leading-8 text-slate-700">
          {block.items.map((it, i) => (
            <li key={i}>{renderInline(it)}</li>
          ))}
        </ol>
      ) : (
        <ul className="list-disc space-y-2 pl-5 text-[16px] leading-8 text-slate-700">
          {block.items.map((it, i) => (
            <li key={i}>{renderInline(it)}</li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}

/** ニュース自社解説（3部構成Markdown）を表示 */
export function NewsEditorialBody({ markdown }: { markdown: string }) {
  const sections = markdownToSections(markdown);
  return (
    <div className="space-y-8">
      {sections.map((section) => {
        const style = SECTION_STYLE[section.heading];
        const title = style?.title ?? section.heading;
        const showHeading = section.heading !== "本文";
        return (
          <section key={section.id} className="space-y-3">
            {showHeading ? (
              <header>
                {style ? (
                  <p className="text-[11px] font-bold tracking-[0.08em] text-slate-400">
                    {style.eyebrow}
                  </p>
                ) : null}
                <h2
                  className={`mt-0.5 text-[20px] font-black tracking-tight ${style?.accent ?? "text-ink"}`}
                >
                  {title}
                </h2>
              </header>
            ) : null}
            <div className="space-y-3">
              {section.blocks.map((block, i) => (
                <Block key={i} block={block} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
