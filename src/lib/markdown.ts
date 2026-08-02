// 管理画面プレビュー用の軽量 Markdown レンダラ。
// 本番の記事表示はタスク4以降で整えるが、編集プレビューにはこれで十分。
// HTMLをエスケープしてから最小限の記法を変換する（生HTMLの注入を防ぐ）。

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inline(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, "$1<em>$2</em>")
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
    );
}

export function renderMarkdownToHtml(md: string): string {
  const lines = escapeHtml(md).split(/\r?\n/);
  const out: string[] = [];
  let listType: "ul" | "ol" | null = null;

  const closeList = () => {
    if (listType) {
      out.push(`</${listType}>`);
      listType = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      closeList();
      continue;
    }
    let m: RegExpExecArray | null;
    if ((m = /^###\s+(.*)/.exec(line))) {
      closeList();
      out.push(`<h3>${inline(m[1])}</h3>`);
    } else if ((m = /^##\s+(.*)/.exec(line))) {
      closeList();
      out.push(`<h2>${inline(m[1])}</h2>`);
    } else if ((m = /^#\s+(.*)/.exec(line))) {
      closeList();
      out.push(`<h2>${inline(m[1])}</h2>`);
    } else if ((m = /^>\s?(.*)/.exec(line))) {
      closeList();
      out.push(`<blockquote>${inline(m[1])}</blockquote>`);
    } else if ((m = /^\d+\.\s+(.*)/.exec(line))) {
      if (listType !== "ol") {
        closeList();
        out.push("<ol>");
        listType = "ol";
      }
      out.push(`<li>${inline(m[1])}</li>`);
    } else if ((m = /^[-*]\s+(.*)/.exec(line))) {
      if (listType !== "ul") {
        closeList();
        out.push("<ul>");
        listType = "ul";
      }
      out.push(`<li>${inline(m[1])}</li>`);
    } else {
      closeList();
      out.push(`<p>${inline(line)}</p>`);
    }
  }
  closeList();
  return out.join("\n");
}
