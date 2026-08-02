// 埋め込みベクトル生成（第2層の類似度判定用）。
// Anthropic は埋め込みAPIを持たないため OpenAI の text-embedding を使用する。
// OPENAI_API_KEY が未設定なら null を返し、呼び出し側で第2層をスキップする。

interface EmbeddingResponse {
  data: { embedding: number[] }[];
}

// pgvector のテキスト入力形式 "[1,2,3]"。REST の INSERT / RPC で text→vector キャストが効く。
export function toVectorLiteral(vec: number[]): string {
  return `[${vec.join(",")}]`;
}

export async function embed(text: string): Promise<number[] | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const model = process.env.EMBEDDING_MODEL || "text-embedding-3-small";
  try {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, input: text.slice(0, 8000) }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as EmbeddingResponse;
    return data.data[0]?.embedding ?? null;
  } catch {
    return null;
  }
}
