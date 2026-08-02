import type { ArticleSection, ContentBlock } from "@/lib/types";

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "paragraph":
      return <p>{block.text}</p>;
    case "heading3":
      return <h3>{block.text}</h3>;
    case "list":
      return block.ordered ? (
        <ol>
          {block.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ol>
      ) : (
        <ul>
          {block.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      );
    case "image":
      // 本文中のAI生成図版（外部Storageの動的URLのため next/image ではなく img を使用）
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

// タスク3のダミーは構造化ブロックでレンダリングする。
// タスク4で Supabase の Markdown 本文をレンダリングする実装に置き換える。
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
