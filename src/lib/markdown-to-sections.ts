import type { ArticleSection, ContentBlock } from "@/lib/types";

// 見出し用：装飾記号を落として素のテキストにする（目次アンカー・H2/H3表示用）
function plain(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/==(.+?)==/g, "$1")
    .replace(/\[([^\]]+)\]\((?:https?:\/\/[^\s)]+)\)/g, "$1")
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
// H2(## )=セクション、H3(### )=heading3、-/*/1.=list、![]()=image、> =callout、それ以外=paragraph。
// 段落内の **太字** ==マーカー== [リンク] は素のまま残し、表示側（ArticleBody）でリッチ描画する。
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
      pushBlock({ type: "list", ordered: listOrdered, items: [...listBuf] });
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
      pushBlock({ type: "image", url: m[2], alt: plain(m[1]) });
    } else if ((m = /^##\s+(.*)/.exec(line)) && !/^###/.test(line)) {
      flushList();
      const heading = plain(m[1]);
      current = { id: slugifyHeading(heading, sections.length + 1), heading, blocks: [] };
      if (leading.length > 0) {
        current.blocks.push(...leading);
        leading = [];
      }
      sections.push(current);
    } else if ((m = /^###\s+(.*)/.exec(line))) {
      flushList();
      pushBlock({ type: "heading3", text: plain(m[1]) });
    } else if ((m = /^#\s+(.*)/.exec(line))) {
      // 誤って単一 # で書かれた小見出しも H3 として扱う（生テキスト表示を防ぐ）
      flushList();
      pushBlock({ type: "heading3", text: plain(m[1]) });
    } else if ((m = /^>\s?(.*)/.exec(line))) {
      flushList();
      // 連続する引用行は1つのコールアウトにまとめる
      const last =
        current && current.blocks.length > 0
          ? current.blocks[current.blocks.length - 1]
          : leading.length > 0
            ? leading[leading.length - 1]
            : null;
      if (last && last.type === "callout") {
        last.text = `${last.text}\n${m[1]}`;
      } else {
        pushBlock({ type: "callout", text: m[1] });
      }
    } else if (
      /^(注意|ポイント|重要|チェック|補足|現場の要点)[：:]/.test(line)
    ) {
      // 装飾なし本文でも「注意：」系はコールアウトにする
      flushList();
      pushBlock({ type: "callout", text: line });
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
      pushBlock({ type: "paragraph", text: line });
    }
  }
  flushList();

  if (sections.length === 0 && leading.length > 0) {
    sections.push({ id: "sec-1", heading: "本文", blocks: leading });
  }
  return sections;
}
