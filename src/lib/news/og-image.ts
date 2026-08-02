/** サムネイル取得（OGP → 必要なら Jina で本文から抽出）。無料・依存なし */

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/** Googleニュースが返す汎用ロゴ（記事画像ではない） */
const GOOGLE_NEWS_DEFAULT_IMAGE =
  "J6_coFbogxhRI9iM864NL_liGXvsQp2AupsKei7z0cNNfDvGUmWUy20nuUhkREQyrpY4bEeIBuc";

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#0*38;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function isUsableNewsImageUrl(url: string): boolean {
  const u = url.toLowerCase();
  if (!/^https?:\/\//i.test(url) && !u.startsWith("//")) return false;
  if (u.includes("favicon")) return false;
  if (u.includes("wp-includes")) return false;
  if (u.includes("1x1") || u.includes("pixel")) return false;
  if (u.includes("gravatar.com")) return false;
  if (u.includes("icon-lock")) return false;
  if (u.includes("/icon-") || u.includes("/icons/")) return false;
  if (u.includes("logo.") || u.includes("/logo/")) return false;
  if (u.includes("ogp_noimage") || u.includes("noimage") || u.includes("no_image"))
    return false;
  if (u.includes("/common/images/") && !u.includes("/news/thumb")) return false;
  if (u.includes("/common/sfw/")) return false;
  if (u.endsWith(".svg")) return false;
  if (url.includes(GOOGLE_NEWS_DEFAULT_IMAGE)) return false;
  if (u.includes("gnews/logo")) return false;
  // 極小サムネ（64m など2桁）を除外。150m以上は許可
  if (/\/\d{1,2}m\//i.test(u)) return false;
  return true;
}

function absolutizeUrl(maybe: string, base?: string): string {
  if (maybe.startsWith("//")) return `https:${maybe}`;
  if (/^https?:\/\//i.test(maybe)) return maybe;
  if (base) {
    try {
      return new URL(maybe, base).toString();
    } catch {
      return maybe;
    }
  }
  return maybe;
}

export function isGoogleNewsArticleUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return (
      (u.hostname === "news.google.com" || u.hostname.endsWith(".google.com")) &&
      /\/articles\//i.test(u.pathname)
    );
  } catch {
    return false;
  }
}

/**
 * Googleニュースの暗号化URLを出版社の元記事URLに解決する。
 * ページ内 signature/timestamp → batchexecute(Fbv4je)
 */
export async function resolveGoogleNewsPublisherUrl(
  googleUrl: string,
  timeoutMs = 15000,
): Promise<string | null> {
  if (!isGoogleNewsArticleUrl(googleUrl)) return null;

  const articleId = decodeURIComponent(
    googleUrl.match(/\/articles\/([^/?#]+)/i)?.[1] ?? "",
  );
  if (!articleId) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const pageUrl = `https://news.google.com/articles/${articleId}?hl=ja&gl=JP&ceid=JP:ja`;
    const pageRes = await fetch(pageUrl, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
      },
      redirect: "follow",
      signal: controller.signal,
    });
    if (!pageRes.ok) return null;
    const html = await pageRes.text();
    const signature = html.match(/data-n-a-sg="([^"]+)"/)?.[1];
    const timestamp = html.match(/data-n-a-ts="([^"]+)"/)?.[1];
    if (!signature || !timestamp) return null;

    const rpcArg = JSON.stringify([
      "garturlreq",
      [
        ["X", "X", ["X", "X"], null, null, 1, 1, "US:en", null, 1, null, null, null, null, null, 0, 1],
        "X",
        "X",
        1,
        [1, 1, 1],
        1,
        1,
        null,
        0,
        0,
        null,
        0,
      ],
      articleId,
      Number(timestamp),
      signature,
    ]);
    const body =
      "f.req=" +
      encodeURIComponent(JSON.stringify([[["Fbv4je", rpcArg]]]));

    const batchRes = await fetch(
      "https://news.google.com/_/DotsSplashUi/data/batchexecute?rpcids=Fbv4je",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          "User-Agent": UA,
        },
        body,
        signal: controller.signal,
      },
    );
    if (!batchRes.ok) return null;
    const text = await batchRes.text();
    const m =
      text.match(/garturlres","(https?:\\?\/\\?\/[^"]+)"/) ??
      text.match(/garturlres","(https?:\/\/[^"]+)"/);
    if (!m?.[1]) return null;
    return m[1].replace(/\\\//g, "/");
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Markdown中の画像から記事サムネらしいものを選ぶ */
export function pickBestImageFromMarkdown(text: string): string | null {
  const images = [...text.matchAll(/!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/g)].map(
    (m) => decodeEntities(m[1]),
  );

  let best: string | null = null;
  let bestScore = -1;
  for (const img of images) {
    if (!isUsableNewsImageUrl(img)) continue;
    const u = img.toLowerCase();
    let score = 10;
    if (u.includes("mwimgs")) score += 80;
    if (u.includes("wp-content/uploads")) score += 70;
    if (u.includes("viewer-data")) score += 60;
    if (u.includes("/uploads/")) score += 50;
    if (/\.jpe?g(\?|$)/i.test(u)) score += 20;
    if (/\.webp(\?|$)/i.test(u)) score += 15;
    if (/\.png(\?|$)/i.test(u)) score += 5;
    const sizeHint = /\/(\d{2,4})m\//i.exec(u);
    if (sizeHint) score += Math.min(40, Number(sizeHint[1]) / 10);
    if (score > bestScore) {
      bestScore = score;
      best = img;
    }
  }
  return best;
}

/** Jina Markdown から元記事URL（出版社）を推定 */
export function extractPublisherUrl(markdown: string): string | null {
  const links = [
    ...markdown.matchAll(
      /\]\((https?:\/\/(?!news\.google\.com|www\.google\.com|r\.jina\.ai)[^)\s]+)\)/g,
    ),
  ]
    .map((m) => decodeEntities(m[1]))
    .filter(
      (l) =>
        !/facebook\.com|twitter\.com|x\.com|line\.me|sharer\.php|intent\/tweet/i.test(
          l,
        ),
    );

  const articleLike = links.find((l) =>
    /\/articles?\/|\/news\/|\/story\/|\/article\//i.test(l),
  );
  return articleLike ?? links[0] ?? null;
}

function extractOgImage(html: string): string | null {
  const patterns = [
    /property=["']og:image(?::secure_url)?["'][^>]*content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]*property=["']og:image(?::secure_url)?["']/i,
    /name=["']twitter:image(?::src)?["'][^>]*content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]*name=["']twitter:image(?::src)?["']/i,
  ];
  for (const re of patterns) {
    const m = re.exec(html);
    if (m?.[1]) {
      const url = decodeEntities(m[1]);
      if (isUsableNewsImageUrl(url)) return url;
    }
  }
  return null;
}

export async function fetchOgImage(
  url: string,
  timeoutMs = 10000,
): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
      },
      redirect: "follow",
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const slice = buf.byteLength > 600_000 ? buf.slice(0, 600_000) : buf;
    const html = new TextDecoder("utf-8").decode(slice);
    const og = extractOgImage(html);
    if (!og) return null;
    const abs = absolutizeUrl(og, res.url);
    return isUsableNewsImageUrl(abs) ? abs : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export function jinaEndpoint(articleUrl: string): string {
  // encode すると Jina が 403 を返すことがあるため、生URLをパスに載せる。
  // ただし ?oc=5 などが r.jina.ai のクエリに食い込むので除去する。
  try {
    const u = new URL(articleUrl);
    u.search = "";
    u.hash = "";
    return `https://r.jina.ai/${u.toString()}`;
  } catch {
    return `https://r.jina.ai/${articleUrl.split("?")[0]}`;
  }
}

export async function fetchImageViaJina(
  url: string,
  timeoutMs = 20000,
): Promise<string | null> {
  const endpoint = jinaEndpoint(url);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(endpoint, {
      headers: {
        Accept: "text/plain",
        "User-Agent": UA,
        "X-Return-Format": "markdown",
      },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const text = await res.text();
    const fromMd = pickBestImageFromMarkdown(text);
    if (fromMd) return fromMd;

    const publisher = extractPublisherUrl(text);
    if (publisher) {
      const og = await fetchOgImage(publisher, 6000);
      if (og) return og;
    }
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function resolveNewsImageUrl(
  url: string,
  options?: { preferJina?: boolean },
): Promise<string | null> {
  // Googleニュースは必ず出版社URLに展開してから画像を取る
  let target = url;
  if (isGoogleNewsArticleUrl(url)) {
    const publisher = await resolveGoogleNewsPublisherUrl(url);
    if (!publisher) return null;
    target = publisher;
    const og = await fetchOgImage(target);
    if (og) return og;
    const viaJina = await fetchImageViaJina(target);
    if (viaJina) return viaJina;
    return null;
  }

  if (!options?.preferJina) {
    const og = await fetchOgImage(target);
    if (og) return og;
  }
  const viaJina = await fetchImageViaJina(target);
  if (viaJina) return viaJina;
  if (options?.preferJina) {
    return fetchOgImage(target);
  }
  return null;
}

/** 並列数を抑えて不足サムネを埋める */
export async function fillMissingImages<
  T extends { url: string; imageUrl?: string | null },
>(
  rows: T[],
  options?: {
    concurrency?: number;
    preferJina?: boolean;
    onProgress?: (done: number, total: number, withImage: number) => void;
  },
): Promise<T[]> {
  const concurrency = options?.concurrency ?? 3;
  const missing = rows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => !row.imageUrl || !isUsableNewsImageUrl(row.imageUrl));

  if (missing.length === 0) return rows;

  const out = rows.map((r) => ({ ...r }));
  let cursor = 0;
  let done = 0;
  let withImage = rows.filter((r) => r.imageUrl && isUsableNewsImageUrl(r.imageUrl))
    .length;

  async function worker(): Promise<void> {
    while (cursor < missing.length) {
      const i = cursor++;
      const { row, index } = missing[i];
      const imageUrl = await resolveNewsImageUrl(row.url, {
        preferJina: options?.preferJina,
      });
      if (imageUrl) {
        out[index] = { ...out[index], imageUrl };
        withImage += 1;
      }
      done += 1;
      options?.onProgress?.(done, missing.length, withImage);
      if (options?.preferJina) {
        await sleep(150);
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, missing.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return out;
}
