/**
 * ニュース見出しから、自社オリジナルの紹介文・確認ポイントを組み立てる。
 * 元記事本文の要約・転載ではなく、解体実務向けの読み方ガイド。
 */

const TOPIC_HINTS: { match: RegExp; label: string; points: string[] }[] = [
  {
    match: /アスベスト|石綿/,
    label: "アスベスト",
    points: [
      "事前調査・届出の要否を、元記事とあわせて確認する",
      "作業計画と周辺への周知タイミングを整理する",
      "産廃としての処理ルートが明確か見直す",
    ],
  },
  {
    match: /産廃|産業廃棄物|マニフェスト|不法投棄/,
    label: "産廃",
    points: [
      "排出事業者・収集運搬・処分の役割分担を確認する",
      "マニフェスト運用や委託契約の抜けがないか点検する",
      "現場保管の状態が近隣トラブルの原因にならないか見る",
    ],
  },
  {
    match: /リサイクル|建設リサイクル|再資源/,
    label: "建設リサイクル",
    points: [
      "分別解体・再資源化の対象範囲を元記事で確認する",
      "自治体・発注者への報告義務の有無を点検する",
      "現場での分別ルールを作業員へ共有できているか見直す",
    ],
  },
  {
    match: /補助金|助成|交付金/,
    label: "補助金",
    points: [
      "対象条件・申請期限・必要書類を元記事で確認する",
      "自社案件が対象になり得るか、制度名ベースで照合する",
      "見積・工程に申請スケジュールを織り込む余地があるか検討する",
    ],
  },
  {
    match: /法改正|改正|届出|許認可|建設業法|労働安全/,
    label: "法規・届出",
    points: [
      "施行日と経過措置の有無を元記事で確認する",
      "自社の許認可・届出フローへの影響を洗い出す",
      "現場・営業・管理のどこに周知が必要か整理する",
    ],
  },
  {
    match: /解体工事|解体作業|撤去|取り壊し|除却/,
    label: "解体工事",
    points: [
      "工事の種類（建物／工作物／部分撤去）と範囲を確認する",
      "近隣説明・安全管理・産廃処理の論点を洗い出す",
      "見積・工程に影響する条件が書かれていないか元記事で見る",
    ],
  },
  {
    match: /風力|風車|太陽光|発電/,
    label: "工作物・設備撤去",
    points: [
      "対象設備の規模・工程・完了予定を元記事で確認する",
      "特殊重機や搬出経路が必要になりそうか検討する",
      "廃棄物区分と処分先の見通しを立てる",
    ],
  },
  {
    match: /空き家|公園|公共|庁舎|学校|資料館/,
    label: "公共・空き家",
    points: [
      "発注主体と工事の位置づけ（公告・お知らせ等）を確認する",
      "周辺利用への影響や工期の制約がないか見る",
      "今後の入札・見積案件のヒントになり得るか検討する",
    ],
  },
];

const DEFAULT_POINTS = [
  "事実関係・日付・対象地域は元記事で確認する",
  "自社の見積・工程・産廃・近隣対応のどれに関わるか整理する",
  "必要なら社内で共有し、関連する解説記事もあわせて読む",
];

export function extractNewsTopics(title: string): string[] {
  const topics: string[] = [];
  for (const t of TOPIC_HINTS) {
    if (t.match.test(title) && !topics.includes(t.label)) {
      topics.push(t.label);
    }
  }
  return topics.slice(0, 4);
}

export function buildNewsBriefing(
  title: string,
  sourceName: string,
): { lead: string; points: string[]; topics: string[] } {
  const topics = extractNewsTopics(title);
  const matched = TOPIC_HINTS.filter((t) => t.match.test(title));
  const pointSet = new Set<string>();
  for (const m of matched) {
    for (const p of m.points) pointSet.add(p);
  }
  const points =
    pointSet.size > 0 ? Array.from(pointSet).slice(0, 4) : DEFAULT_POINTS;

  const topicText =
    topics.length > 0
      ? `テーマの目安は「${topics.join("・")}」です。`
      : "解体・建設・産廃の実務に関わりそうな話題です。";

  const lead = `「${title}」は、${sourceName}が伝えているニュースです。${topicText}当サイトでは本文を転載せず、解体実務の視点で読むときの確認ポイントだけ整理しています。詳細・正確な内容は必ず元記事をご確認ください。`;

  return { lead, points, topics };
}

/** 関連記事検索用の短いキーワード（助詞などを除いた断片） */
export function newsSearchKeywords(title: string): string[] {
  const topics = extractNewsTopics(title);
  const raw = title
    .replace(/[「」『』【】\[\]（）()、。・\s]/g, " ")
    .split(" ")
    .map((s) => s.trim())
    .filter((s) => s.length >= 2 && s.length <= 12);
  const preferred = [
    ...topics,
    ...raw.filter((s) =>
      /解体|産廃|アスベスト|石綿|補助金|リサイクル|届出|許認可|撤去|工事/.test(
        s,
      ),
    ),
  ];
  return Array.from(new Set(preferred)).slice(0, 5);
}
