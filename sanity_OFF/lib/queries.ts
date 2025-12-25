// sanity/lib/queries.ts

// Commentary posts for homepage
export const allPostsQuery = `*[_type == "post"] | order(date desc) {
  _id,
  title,
  "slug": slug,
  date,
  author,
  category,
  excerpt,
  thumbnail
}`;

// Single post for article page (/posts/[slug])
export const singlePostQuery = `*[_type == "post" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug,
  date,
  author,
  category,
  heroImage,
  thumbnail,
  content
}`;

// Backwards-compatible alias if anything still imports postBySlugQuery
export const postBySlugQuery = singlePostQuery;

// News items for homepage
export const newsItemsQuery = `*[_type == "newsItem"] 
  | order(coalesce(priority, 9999) asc, coalesce(date, createdAt) desc) {
    _id,
    title,
    "slug": slug,
    "time": timeLabel,
    date,
    author,
    excerpt,
    thumbnail
}`;

// Single news article (/news/[slug])
export const singleNewsQuery = `*[_type == "newsItem" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug,
  timeLabel,
  date,
  author,
  heroImage,
  thumbnail,
  excerpt,
  content
}`;

// Seen Elsewhere links for right column
export const seenElsewhereQuery = `*[_type == "seenElsewhere"] 
  | order(coalesce(priority, 9999) asc) {
    _id,
    title,
    source,
    url
}`;

// Generic static page (e.g. About) by slug
export const pageBySlugQuery = `*[_type == "page" && slug.current == $slug][0] {
  _id,
  title,
  content
}`;
