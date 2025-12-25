// sanity/lib/queries.ts

/**
 * Canonical GROQ queries used by the Next.js frontend.
 * Keep ALL commonly-imported queries here to prevent broken imports.
 */

/** Homepage + listings (Commentary posts) */
export const postsQuery = `
  *[_type == "post"] | order(publishedAt desc, _createdAt desc){
    _id,
    title,
    excerpt,
    subtitle,
    author,
    publishedAt,
    "slug": slug.current,
    "heroImageUrl": heroImage.asset->url
  }
`;

/** ✅ Single post for article page (/posts/[slug]) */
export const singlePostQuery = `
  *[_type == "post" && slug.current == $slug][0]{
    _id,
    title,
    subtitle,
    excerpt,
    author,
    publishedAt,
    "slug": slug.current,
    heroImage,
    body
  }
`;

/** ✅ Static page content (About / Freedom Reloaded) */
export const pageBySlugQuery = `
  *[_type == "page" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    content
  }
`;

/** News items */
export const newsItemsQuery = `
  *[_type == "newsItem"] | order(publishedAt desc, _createdAt desc){
    _id,
    title,
    source,
    publishedAt,
    "slug": slug.current
  }
`;

/** Feed Read */
export const feedReadItemsQuery = `
  *[_type == "feedRead" && section == "feedRead"]
  | order(coalesce(priority, 9999) asc, publishedAt desc, _createdAt desc){
    _id,
    title,
    source,
    url,
    publishedAt
  }
`;

/** Strategic Insights */
export const strategicInsightsQuery = `
  *[_type == "feedRead" && section == "strategicInsights"]
  | order(coalesce(priority, 9999) asc, publishedAt desc, _createdAt desc){
    _id,
    title,
    source,
    url,
    publishedAt
  }
`;
