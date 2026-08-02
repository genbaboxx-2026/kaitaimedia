import { createAndUploadNewsThumb } from "@/lib/news/generate-thumb";
import {
  isGenericNewsImageUrl,
  isUsableNewsImageUrl,
  resolveNewsImageUrl,
} from "@/lib/news/og-image";

export interface EnsureNewsImageInput {
  id: string;
  url: string;
  title: string;
  sourceName: string;
  existingImageUrl?: string | null;
  /** true なら既存が汎用画像でも作り直す */
  replaceGeneric?: boolean;
}

/**
 * 使える実写OGPがあればそれを、なければタイトル入り個別サムネを生成して返す。
 */
export async function ensureNewsImageUrl(
  input: EnsureNewsImageInput,
): Promise<string | null> {
  const existing = input.existingImageUrl ?? null;

  // すでに個別生成済み、または固有の実写なら再利用
  if (existing?.includes("/storage/v1/object/public/eyecatch/news/")) {
    return existing;
  }
  if (
    existing &&
    isUsableNewsImageUrl(existing) &&
    !isGenericNewsImageUrl(existing)
  ) {
    return existing;
  }

  const og = await resolveNewsImageUrl(input.url);
  if (og && isUsableNewsImageUrl(og) && !isGenericNewsImageUrl(og)) {
    return og;
  }

  return createAndUploadNewsThumb({
    id: input.id,
    title: input.title,
    sourceName: input.sourceName,
  });
}
