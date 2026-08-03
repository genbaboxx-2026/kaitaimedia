import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // native バイナリを webpack に食わせない
  serverExternalPackages: ["@resvg/resvg-js", "satori", "sharp"],
  // satori / YouTubeサムネ用フォントを API / 生成ルートに同梱
  outputFileTracingIncludes: {
    "/api/news/[id]/thumb": ["./assets/fonts/**/*"],
    "/api/generate/**/*": ["./assets/fonts/**/*"],
  },
};

export default nextConfig;
