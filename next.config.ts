import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // satori 用フォントを API / 生成ルートに同梱
  outputFileTracingIncludes: {
    "/api/news/[id]/thumb": ["./assets/fonts/**/*"],
    "/api/generate/**/*": ["./assets/fonts/**/*"],
  },
};

export default nextConfig;
