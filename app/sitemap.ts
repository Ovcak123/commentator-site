// app/sitemap.ts

export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { MetadataRoute } from "next";

import { siteConfig } from "../lib/siteConfig";
import { client } from "../sanity/lib/client";

type SitemapContentItem = {
  slug: string;
  lastModified: string;
};

type SitemapData = {
  commentary: SitemapContentItem[];
  news: SitemapContentItem[];
  authors: SitemapContentItem[];
};

const sitemapQuery = `
{
  "commentary": *[
    _type == "post" &&
    defined(slug.current)
  ]{
    "slug": slug.current,
    "lastModified": _updatedAt
  },

  "news": *[
    _type == "newsItem" &&
    defined(slug.current)
  ]{
    "slug": slug.current,
    "lastModified": _updatedAt
  },

  "authors": *[
    _type == "author" &&
    defined(slug.current)
  ]{
    "slug": slug.current,
    "lastModified": _updatedAt
  }
}
`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await client.fetch<SitemapData>(sitemapQuery);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
    },
    {
      url: `${siteConfig.url}/commentary`,
    },
    {
      url: `${siteConfig.url}/news`,
    },
    {
      url: `${siteConfig.url}/authors`,
    },
    {
      url: `${siteConfig.url}/about`,
    },
    {
      url: `${siteConfig.url}/freedom-reloaded`,
    },
    {
      url: `${siteConfig.url}/contact`,
    },
  ];

  const commentaryPages: MetadataRoute.Sitemap = data.commentary.map(
    (article) => ({
      url: `${siteConfig.url}/commentary/${article.slug}`,
      lastModified: article.lastModified,
    })
  );

  const newsPages: MetadataRoute.Sitemap = data.news.map((article) => ({
    url: `${siteConfig.url}/news/${article.slug}`,
    lastModified: article.lastModified,
  }));

  const authorPages: MetadataRoute.Sitemap = data.authors.map((author) => ({
    url: `${siteConfig.url}/authors/${author.slug}`,
    lastModified: author.lastModified,
  }));

  return [
    ...staticPages,
    ...commentaryPages,
    ...newsPages,
    ...authorPages,
  ];
}