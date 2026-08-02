/** 見出しの表記ゆれを潰して重複判定用キーにする */
export function normalizeNewsTitleKey(title: string): string {
  return title
    .normalize("NFKC")
    .toLowerCase()
    .replace(/【[^】]*】/g, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/（[^）]*）/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[／/|:：・\-–—_]/g, "")
    .replace(/[\s\u3000「」『』\[\]【】、。,.!?！？]/g, "")
    .slice(0, 48);
}

/** 漢字・カタカナ・数字の塊（話題の固有部分） */
function contentChunks(key: string): string[] {
  return key.match(/[\u4e00-\u9fff\u30a0-\u30ff0-9]{2,}/g) ?? [];
}

function trigrams(s: string): Set<string> {
  const set = new Set<string>();
  if (s.length < 3) {
    if (s) set.add(s);
    return set;
  }
  for (let i = 0; i <= s.length - 3; i++) set.add(s.slice(i, i + 3));
  return set;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter += 1;
  return inter / (a.size + b.size - inter);
}

function chunksSoftMatch(c: string, d: string): boolean {
  if (c === d) return true;
  if (c.length >= 3 && d.includes(c)) return true;
  if (d.length >= 3 && c.includes(d)) return true;
  let prefix = 0;
  const n = Math.min(c.length, d.length);
  while (prefix < n && c[prefix] === d[prefix]) prefix += 1;
  return prefix >= 3;
}

/** 同じ話題とみなすか（別メディアの別見出しを吸収） */
export function isSameNewsStory(titleA: string, titleB: string): boolean {
  const a = normalizeNewsTitleKey(titleA);
  const b = normalizeNewsTitleKey(titleB);
  if (a.length < 8 || b.length < 8) return false;
  if (a === b) return true;

  const shorter = a.length <= b.length ? a : b;
  const longer = a.length <= b.length ? b : a;
  if (shorter.length >= 12 && longer.includes(shorter)) return true;

  const tri = jaccard(trigrams(a), trigrams(b));
  if (tri >= 0.42) return true;

  const ca = contentChunks(a);
  const cb = contentChunks(b);
  let shared = 0;
  let sharedLong = 0;
  const used = new Set<number>();
  for (const c of ca) {
    let hit = -1;
    for (let i = 0; i < cb.length; i++) {
      if (used.has(i)) continue;
      if (chunksSoftMatch(c, cb[i])) {
        hit = i;
        break;
      }
    }
    if (hit < 0) continue;
    used.add(hit);
    shared += 1;
    if (Math.min(c.length, cb[hit].length) >= 4) sharedLong += 1;
  }
  // 固有フレーズ1つ＋地名/時期などもう2点、または長い固有フレーズ2つ
  if (sharedLong >= 2) return true;
  if (sharedLong >= 1 && shared >= 3) return true;
  if (shared >= 3 && tri >= 0.22) return true;
  return false;
}

/** 新しい順の配列を、同じ話題は先頭1件だけ残す */
export function dedupeNewsByStory<T extends { title: string }>(
  items: T[],
): T[] {
  const out: T[] = [];
  for (const item of items) {
    if (out.some((kept) => isSameNewsStory(kept.title, item.title))) continue;
    out.push(item);
  }
  return out;
}
