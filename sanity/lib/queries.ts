// sanity/lib/queries.ts

/**
 * Canonical GROQ queries used by the Next.js frontend.
 * Keep ALL commonly imported queries here to prevent broken imports.
 */

/** Homepage + listings (Commentary posts) */
export const postsQuery = `
  *[_type == "post"] | order(publishedAt desc, _createdAt desc){
    _id,
    title,
    excerpt,
    subtitle,
    "author": coalesce(
      author->name,
      author.name,
      author->title,
      author.title,
      author
    ),
    publishedAt,
    readTimeMinutes,
    "slug": slug.current,
    "heroImageUrl": heroImage.asset->url
  }
`;

/** Single Commentary article page (/commentary/[slug]) */
export const singlePostQuery = `
  *[_type == "post" && slug.current == $slug][0]{
    _id,
    title,
    subtitle,
    excerpt,

    "author": select(
      count(authors) > 0 => authors[0]->{
        _id,
        name,
        "slug": slug.current,
        portrait,
        authorFooter
      },
      defined(author) => author,
      null
    ),

    publishedAt,
    readTimeMinutes,
    "slug": slug.current,
    heroImage,
    body
  }
`;

/** Static page content (About / Freedom Reloaded) */
export const pageBySlugQuery = `
  *[_type == "page" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    content
  }
`;

/** News items for homepage and listings */
export const newsItemsQuery = `
  *[_type == "newsItem"] | order(publishedAt desc, _createdAt desc){
    _id,
    title,
    excerpt,
    "author": select(
      count(authors) > 0 => authors[0]->name,
      defined(author) => author,
      null
    ),
    source,
    publishedAt,
    readTimeMinutes,
    "slug": slug.current,
    "heroImageUrl": heroImage.asset->url
  }
`;

/** Single News article page (/news/[slug]) */
export const singleNewsItemQuery = `
  *[_type == "newsItem" && slug.current == $slug][0]{
    _id,
    title,
    excerpt,

    "author": select(
      count(authors) > 0 => authors[0]->{
        _id,
        name,
        "slug": slug.current,
        portrait,
        authorFooter
      },
      defined(author) => author,
      null
    ),

    source,
    externalUrl,
    publishedAt,
    readTimeMinutes,
    "slug": slug.current,
    heroImage,
    body
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