// app/news-sitemap.xml/route.ts

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { siteConfig } from "../../lib/siteConfig";
import { client } from "../../sanity/lib/client";

type NewsSitemapItem = {
  _type: "post" | "newsItem";
  slug: string;
  title: string;
  publishedAt: string;
};

const newsSitemapQuery = `
  *[
    _type in ["post", "newsItem"] &&
    defined(slug.current) &&
    defined(title) &&
    defined(publishedAt) &&
    publishedAt >= $cutoff &&
    publishedAt <= $now
  ] | order(publishedAt desc) {
    _type,
    "slug": slug.current,
    title,
    publishedAt
  }
`;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function createArticleUrl(article: NewsSitemapItem): string {
  const section = article._type === "post" ? "commentary" : "news";

  return `${siteConfig.url}/${section}/${encodeURIComponent(article.slug)}`;
}

export async function GET(): Promise<Response> {
  const now = new Date();
  const cutoff = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  const articles = await client.fetch<NewsSitemapItem[]>(
    newsSitemapQuery,
    {
      cutoff: cutoff.toISOString(),
      now: now.toISOString(),
    }
  );

  const entries = articles
    .filter((article) => {
      return (
        (article._type === "post" || article._type === "newsItem") &&
        typeof article.slug === "string" &&
        article.slug.length > 0 &&
        typeof article.title === "string" &&
        article.title.length > 0 &&
        typeof article.publishedAt === "string" &&
        !Number.isNaN(Date.parse(article.publishedAt))
      );
    })
    .map((article) => {
      const articleUrl = createArticleUrl(article);

      return `  <url>
    <loc>${escapeXml(articleUrl)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(siteConfig.publisher)}</news:name>
        <news:language>${escapeXml(siteConfig.language)}</news:language>
      </news:publication>
      <news:publication_date>${escapeXml(
        new Date(article.publishedAt).toISOString()
      )}</news:publication_date>
      <news:title>${escapeXml(article.title)}</news:title>
    </news:news>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
>
${entries}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}