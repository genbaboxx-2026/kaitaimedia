import type { ReactNode } from "react";
import type { ArticleSection, ContentBlock } from "@/lib/types";

// 段落内のインライン装飾：**太字** / ==マーカー== / [リンク](url) / 「用語」
const INLINE =
  /(\*\*[^*]+\*\*|==[^=]+==|\[[^\]]+\]\((?:https?:\/\/)?[^)]+\)|「[^」]{2,48}」)/g;

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
    } else if (tok.startsWith("「")) {
      // 既存記事でも用語のかぎ括弧を視覚的に強調
      nodes.push(
        <strong key={key++} className="article-term">
          {tok}
        </strong>,
      );
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
      return <p>{renderInline(block.text)}</p>;
    case "heading3":
      return <h3>{block.text}</h3>;
    case "callout":
      return (
        <div className="article-callout">
          {block.text.split("\n").map((line, i) => (
            <p key={i} className="article-callout-line">
              {renderInline(line)}
            </p>
          ))}
        </div>
      );
    case "list":
      return block.ordered ? (
        <ol>
          {block.items.map((it, i) => (
            <li key={i}>{renderInline(it)}</li>
          ))}
        </ol>
      ) : (
        <ul>
          {block.items.map((it, i) => (
            <li key={i}>{renderInline(it)}</li>
          ))}
        </ul>
      );
    case "image":
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={block.url}
          alt={block.alt}
          loading="lazy"
          className="my-6 w-full rounded-lg border border-slate-200"
        />
      );
    default:
      return null;
  }
}

export function ArticleBody({ sections }: { sections: ArticleSection[] }) {
  return (
    <div className="article-body">
      {sections.map((section) => (
        <section key={section.id}>
          <h2 id={section.id}>{section.heading}</h2>
          {section.blocks.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </section>
      ))}
    </div>
  );
}
