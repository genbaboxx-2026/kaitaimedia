import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";
import {
  getCategories,
  getAllArticles,
  getNewsSitemapEntries,
} from "@/lib/site-data";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, articles, news] = await Promise.all([
    getCategories(),
    getAllArticles(),
    getNewsSitemapEntries(200),
  ]);

  const staticPaths: {
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }[] = [
    { path: "", changeFrequency: "daily", priority: 1 },
    { path: "/news", changeFrequency: "hourly", priority: 0.9 },
    { path: "/articles", changeFrequency: "daily", priority: 0.85 },
    { path: "/company", changeFrequency: "monthly", priority: 0.4 },
    { path: "/bakusoq", changeFrequency: "monthly", priority: 0.5 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.4 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
    { path: "/search", changeFrequency: "weekly", priority: 0.3 },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${SITE_URL}${p.path}`,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/category/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/articles/${a.slug}`,
    lastModified: new Date(a.updatedAt ?? a.publishedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const newsEntries: MetadataRoute.Sitemap = news.map((n) => ({
    url: `${SITE_URL}/news/${n.id}`,
    lastModified: new Date(n.lastModified),
    changeFrequency: "daily",
    priority: 0.65,
  }));

  return [
    ...staticEntries,
    ...categoryEntries,
    ...articleEntries,
    ...newsEntries,
  ];
}
