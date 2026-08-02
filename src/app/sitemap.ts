import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";
import { getCategories, getAllArticles } from "@/lib/site-data";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, articles] = await Promise.all([
    getCategories(),
    getAllArticles(),
  ]);

  const staticPaths = [
    "",
    "/news",
    "/articles",
    "/company",
    "/bakusoq",
    "/contact",
    "/privacy",
    "/terms",
    "/search",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${SITE_URL}${p}`,
    changeFrequency: p === "/news" ? "hourly" : "weekly",
    priority: p === "" ? 1 : p === "/news" ? 0.9 : 0.6,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/category/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/articles/${a.slug}`,
    lastModified: new Date(a.updatedAt ?? a.publishedAt),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticEntries, ...categoryEntries, ...articleEntries];
}
