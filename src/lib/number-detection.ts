// 記事本文に混入した「具体的な数値」を機械的に検出する（要件定義書 6.1）。
// 品質チェック第1層の中核。管理画面の保存時チェックでも使う。
// タスク9で除外リスト（マスタ）と統合し、決定論的判定として整備する。

export interface NumberDetectionHit {
  type: string;
  matched: string;
}

const PATTERNS: { type: string; regex: RegExp }[] = [
  { type: "金額", regex: /[0-9０-９,，]+\s*(円|万円|千円|億円)/g },
  { type: "重量・容積", regex: /[0-9０-９.．]+\s*(t|トン|kg|キロ|m3|m³|立米)/g },
  { type: "単価", regex: /[0-9０-９,，]+\s*円\s*\/\s*(t|kg|㎡|m2|人日|台|日)/g },
  { type: "割合", regex: /[0-9０-９.．]+\s*(%|％|割|パーセント)/g },
];

// 除外パターン（誤検知防止）。本番はマスタ（number_exclusion）から取得する。
const EXCLUSIONS = [/4t車/, /2t車/, /0\.25m³級/, /0\.45m³級/, /第[0-9０-９◯]+条/, /(令和|平成)[0-9０-９◯]+年/];

export function detectNumbers(text: string): NumberDetectionHit[] {
  const hits: NumberDetectionHit[] = [];
  for (const { type, regex } of PATTERNS) {
    const re = new RegExp(regex.source, "g");
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const matched = m[0];
      if (EXCLUSIONS.some((ex) => ex.test(matched))) continue;
      hits.push({ type, matched: matched.trim() });
    }
  }
  return hits;
}
