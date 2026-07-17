// app/feed.xml/route.ts

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { siteConfig } from "../../lib/siteConfig";
import { client } from "../../sanity/lib/client";

type FeedItem = {
  _type: "post" | "newsItem";
  slug: string;
  title: string;
  publishedAt: string;
  excerpt?: string;
  subtitle?: string;
  authorNames?: string[];
  legacyAuthor?: string;
};

const feedQuery = `
  *[
    _type in ["post", "newsItem"] &&
    defined(slug.current) &&
    defined(title) &&
    defined(publishedAt) &&
    publishedAt <= $now
  ]
  | order(publishedAt desc)[0...100] {
    _type,
    "slug": slug.current,
    title,
    publishedAt,
    excerpt,
    subtitle,
    "authorNames": authors[]->name,
    "legacyAuthor": author
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

function createArticleUrl(item: FeedItem): string {
  const section = item._type === "post" ? "commentary" : "news";

  return `${siteConfig.url}/${section}/${encodeURIComponent(item.slug)}`;
}

function createDescription(item: FeedItem): string {
  if (typeof item.excerpt === "string" && item.excerpt.trim().length > 0) {
    return item.excerpt.trim();
  }

  if (
    item._type === "post" &&
    typeof item.subtitle === "string" &&
    item.subtitle.trim().length > 0
  ) {
    return item.subtitle.trim();
  }

  return "";
}

function createAuthorName(item: FeedItem): string | null {
  const referencedAuthors = Array.isArray(item.authorNames)
    ? item.authorNames.filter(
        (name): name is string =>
          typeof name === "string" && name.trim().length > 0
      )
    : [];

  if (referencedAuthors.length > 0) {
    return referencedAuthors.join(", ");
  }

  if (
    typeof item.legacyAuthor === "string" &&
    item.legacyAuthor.trim().length > 0
  ) {
    return item.legacyAuthor.trim();
  }

  return null;
}

export async function GET(): Promise<Response> {
  const now = new Date();

  const items = await client.fetch<FeedItem[]>(feedQuery, {
    now: now.toISOString(),
  });

  const validItems = items.filter((item) => {
    return (
      (item._type === "post" || item._type === "newsItem") &&
      typeof item.slug === "string" &&
      item.slug.length > 0 &&
      typeof item.title === "string" &&
      item.title.length > 0 &&
      typeof item.publishedAt === "string" &&
      !Number.isNaN(Date.parse(item.publishedAt))
    );
  });

  const itemXml = validItems
    .map((item) => {
      const articleUrl = createArticleUrl(item);
      const description = createDescription(item);
      const authorName = createAuthorName(item);

      return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(articleUrl)}</link>
      <guid isPermaLink="true">${escapeXml(articleUrl)}</guid>
      <pubDate>${new Date(item.publishedAt).toUTCString()}</pubDate>${
        authorName
          ? `
      <dc:creator>${escapeXml(authorName)}</dc:creator>`
          : ""
      }${
        description
          ? `
      <description>${escapeXml(description)}</description>`
          : ""
      }
    </item>`;
    })
    .join("\n");

  const feedUrl = `${siteConfig.url}/feed.xml`;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss
  version="2.0"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:atom="http://www.w3.org/2005/Atom"
>
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${escapeXml(siteConfig.url)}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>${escapeXml(siteConfig.language)}</language>
    <atom:link href="${escapeXml(
      feedUrl
    )}" rel="self" type="application/rss+xml" />
    <lastBuildDate>${now.toUTCString()}</lastBuildDate>
${itemXml}
  </channel>
</rss>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}