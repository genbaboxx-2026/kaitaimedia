/** 依存なしの軽量 RSS 2.0 / RSS 1.0 (RDF) / Atom パーサ */

export interface ParsedFeedItem {
  title: string;
  url: string;
  publishedAt: Date | null;
  /** 媒体名のヒント（Googleニュースの " - 媒体名" など） */
  sourceHint?: string;
  imageUrl?: string;
  /** RSS description 等の短い要約（HTML除去済み） */
  summary?: string;
}

/** description / content からプレーンテキスト要約を作る（最大 maxLen 文字） */
export function extractSummaryFromItemBlock(
  block: string,
  maxLen = 400,
): string | undefined {
  const raw =
    tagContent(block, "description") ??
    tagContent(block, "summary") ??
    tagContent(block, "content:encoded") ??
    tagContent(block, "content") ??
    "";
  const text = raw
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length < 20) return undefined;
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen).replace(/\s+\S*$/, "")}…`;
}

function isUsableImageUrl(url: string): boolean {
  const u = url.toLowerCase();
  if (!/^https?:\/\//i.test(url)) return false;
  if (u.includes("favicon")) return false;
  if (u.includes("wp-includes")) return false;
  if (u.includes("1x1") || u.includes("pixel")) return false;
  if (u.includes("gravatar.com")) return false;
  if (u.includes("icon-lock")) return false;
  if (u.endsWith(".svg")) return false;
  return true;
}

/** item / entry ブロックからサムネURLを抽出 */
export function extractImageFromItemBlock(block: string): string | null {
  const mediaContent = tagAttr(block, "media:content", "url");
  if (mediaContent && isUsableImageUrl(mediaContent)) return mediaContent;

  const mediaThumb = tagAttr(block, "media:thumbnail", "url");
  if (mediaThumb && isUsableImageUrl(mediaThumb)) return mediaThumb;

  const enclosure = tagAttr(block, "enclosure", "url");
  const enclosureType = tagAttr(block, "enclosure", "type") ?? "";
  if (
    enclosure &&
    isUsableImageUrl(enclosure) &&
    (enclosureType.startsWith("image/") ||
      /\.(jpe?g|png|webp|gif)(\?|$)/i.test(enclosure))
  ) {
    return enclosure;
  }

  // content:encoded / description 内の <img>
  const rich =
    tagContent(block, "content:encoded") ??
    tagContent(block, "description") ??
    tagContent(block, "content") ??
    "";
  const imgSrcs = [
    ...rich.matchAll(/<img[^>]+src=["']([^"']+)["']/gi),
  ].map((m) => decodeXmlEntities(m[1]));
  for (const src of imgSrcs) {
    if (isUsableImageUrl(src)) return src;
  }

  // HTMLエンティティのまま残っている場合
  const encodedImgs = [
    ...block.matchAll(/src=["'](https?:\/\/[^"']+\.(?:jpe?g|png|webp)[^"']*)["']/gi),
  ].map((m) => decodeXmlEntities(m[1]));
  for (const src of encodedImgs) {
    if (isUsableImageUrl(src)) return src;
  }

  return null;
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) =>
      String.fromCharCode(parseInt(h, 16)),
    )
    .trim();
}

function tagContent(block: string, tag: string): string | null {
  const re = new RegExp(
    `<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`,
    "i",
  );
  const m = re.exec(block);
  if (!m) return null;
  return decodeXmlEntities(m[1]);
}

function tagAttr(block: string, tag: string, attr: string): string | null {
  const re = new RegExp(
    `<${tag}[^>]*\\s${attr}=["']([^"']+)["'][^>]*/?>`,
    "i",
  );
  const m = re.exec(block);
  return m ? decodeXmlEntities(m[1]) : null;
}

function parseDate(raw: string | null): Date | null {
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Googleニュース等: 「見出し - 媒体名」を分離 */
function splitTitleSource(title: string): { title: string; sourceHint?: string } {
  const idx = title.lastIndexOf(" - ");
  if (idx <= 0 || idx > title.length - 4) return { title };
  const hint = title.slice(idx + 3).trim();
  const main = title.slice(0, idx).trim();
  if (!hint || hint.length > 40) return { title };
  return { title: main, sourceHint: hint };
}

function parseRss2(xml: string): ParsedFeedItem[] {
  const items: ParsedFeedItem[] = [];
  const re = /<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const block = m[1];
    const rawTitle = tagContent(block, "title");
    const link =
      tagContent(block, "link") ??
      tagAttr(block, "link", "href") ??
      tagContent(block, "guid");
    if (!rawTitle || !link) continue;
    const { title, sourceHint } = splitTitleSource(rawTitle);
    const publishedAt =
      parseDate(tagContent(block, "pubDate")) ??
      parseDate(tagContent(block, "dc:date")) ??
      parseDate(tagContent(block, "published"));
    const imageUrl = extractImageFromItemBlock(block) ?? undefined;
    const summary = extractSummaryFromItemBlock(block);
    items.push({ title, url: link, publishedAt, sourceHint, imageUrl, summary });
  }
  return items;
}

function parseRss1(xml: string): ParsedFeedItem[] {
  const items: ParsedFeedItem[] = [];
  // RSS 1.0: <item rdf:about="url">...</item>
  const re = /<item\b([^>]*)>([\s\S]*?)<\/item>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const attrs = m[1];
    const block = m[2];
    const about = /rdf:about=["']([^"']+)["']/i.exec(attrs);
    const rawTitle = tagContent(block, "title");
    const link = tagContent(block, "link") ?? (about ? about[1] : null);
    if (!rawTitle || !link) continue;
    const { title, sourceHint } = splitTitleSource(rawTitle);
    const publishedAt =
      parseDate(tagContent(block, "dc:date")) ??
      parseDate(tagContent(block, "pubDate"));
    const imageUrl = extractImageFromItemBlock(block) ?? undefined;
    const summary = extractSummaryFromItemBlock(block);
    items.push({ title, url: link, publishedAt, sourceHint, imageUrl, summary });
  }
  return items;
}

function parseAtom(xml: string): ParsedFeedItem[] {
  const items: ParsedFeedItem[] = [];
  const re = /<entry(?:\s[^>]*)?>([\s\S]*?)<\/entry>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const block = m[1];
    const rawTitle = tagContent(block, "title");
    const link =
      tagAttr(block, "link", "href") ?? tagContent(block, "id");
    if (!rawTitle || !link) continue;
    const { title, sourceHint } = splitTitleSource(rawTitle);
    const publishedAt =
      parseDate(tagContent(block, "published")) ??
      parseDate(tagContent(block, "updated"));
    const imageUrl = extractImageFromItemBlock(block) ?? undefined;
    const summary = extractSummaryFromItemBlock(block);
    items.push({ title, url: link, publishedAt, sourceHint, imageUrl, summary });
  }
  return items;
}

export function parseFeedXml(xml: string): ParsedFeedItem[] {
  if (/<rss[\s>]/i.test(xml) || /<channel[\s>]/i.test(xml)) {
    const items = parseRss2(xml);
    if (items.length > 0) return items;
  }
  if (/rdf:RDF/i.test(xml) || /xmlns=["']http:\/\/purl\.org\/rss\/1\.0\//i.test(xml)) {
    const items = parseRss1(xml);
    if (items.length > 0) return items;
  }
  if (/<feed[\s>]/i.test(xml)) {
    return parseAtom(xml);
  }
  // フォールバック順
  const rss2 = parseRss2(xml);
  if (rss2.length > 0) return rss2;
  const rss1 = parseRss1(xml);
  if (rss1.length > 0) return rss1;
  return parseAtom(xml);
}

export async function fetchFeedXml(
  url: string,
  encoding: "utf-8" | "shift_jis" = "utf-8",
): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "kaitaimedia-news-bot/1.0 (+https://kaitaimedia.local)",
      Accept: "application/rss+xml, application/xml, text/xml, */*",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`フィード取得失敗: HTTP ${res.status} (${url})`);
  }
  const buf = await res.arrayBuffer();
  if (encoding === "shift_jis") {
    return new TextDecoder("shift-jis").decode(buf);
  }
  // XML宣言の encoding を尊重
  const head = new TextDecoder("utf-8").decode(buf.slice(0, 200));
  const enc = /encoding=["']([^"']+)["']/i.exec(head)?.[1]?.toLowerCase();
  if (enc && (enc.includes("shift") || enc === "sjis" || enc === "windows-31j")) {
    return new TextDecoder("shift-jis").decode(buf);
  }
  return new TextDecoder("utf-8").decode(buf);
}
