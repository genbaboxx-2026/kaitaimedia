// 構造化データ（JSON-LD）を出力する。
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // 構造化データはビルド時/サーバーで生成した静的オブジェクト。
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
