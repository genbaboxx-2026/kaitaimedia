import type { ArticleSection, ContentBlock } from "@/lib/types";

// インライン装飾を素のテキストへ（公開側の ArticleBody はプレーン描画のため）
function stripInline(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, "$1$2")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, "$1（$2）")
    .trim();
}

function slugifyHeading(text: string, index: number): string {
  const base = text
    .toLowerCase()
    .replace(/[^\w぀-ヿ一-龯]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `sec-${index}-${base || "section"}`.slice(0, 60);
}

// 記事本文（Markdown）を H2 単位のセクション配列へ変換する。
// H2(## ) = セクション、H3(### ) = heading3、- / * / 1. = list、それ以外 = paragraph。
export function markdownToSections(md: string): ArticleSection[] {
  const lines = md.split(/\r?\n/);
  const sections: ArticleSection[] = [];
  let current: ArticleSection | null = null;
  let leading: ContentBlock[] = [];
  let listBuf: string[] | null = null;
  let listOrdered = false;

  const pushBlock = (b: ContentBlock) => {
    if (current) current.blocks.push(b);
    else leading.push(b);
  };
  const flushList = () => {
    if (listBuf && listBuf.length > 0) {
      pushBlock({ type: "list", ordered: listOrdered, items: listBuf.map(stripInline) });
    }
    listBuf = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushList();
      continue;
    }
    let m: RegExpExecArray | null;
    if ((m = /^!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)\s*$/.exec(line))) {
      flushList();
      pushBlock({ type: "image", url: m[2], alt: m[1] });
    } else if ((m = /^##\s+(.*)/.exec(line)) && !/^###/.test(line)) {
      flushList();
      const heading = stripInline(m[1]);
      current = { id: slugifyHeading(heading, sections.length + 1), heading, blocks: [] };
      // 先頭（H2前）に本文があれば最初のセクションへ移す
      if (leading.length > 0) {
        current.blocks.push(...leading);
        leading = [];
      }
      sections.push(current);
    } else if ((m = /^###\s+(.*)/.exec(line))) {
      flushList();
      pushBlock({ type: "heading3", text: stripInline(m[1]) });
    } else if ((m = /^\d+\.\s+(.*)/.exec(line))) {
      if (!listBuf || !listOrdered) {
        flushList();
        listBuf = [];
        listOrdered = true;
      }
      listBuf.push(m[1]);
    } else if ((m = /^[-*]\s+(.*)/.exec(line))) {
      if (!listBuf || listOrdered) {
        flushList();
        listBuf = [];
        listOrdered = false;
      }
      listBuf.push(m[1]);
    } else {
      flushList();
      pushBlock({ type: "paragraph", text: stripInline(line) });
    }
  }
  flushList();

  // H2が1つも無い場合は単一セクションにまとめる
  if (sections.length === 0 && leading.length > 0) {
    sections.push({ id: "sec-1", heading: "本文", blocks: leading });
  }
  return sections;
}
