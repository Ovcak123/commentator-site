// app/page.tsx

export const dynamic = "force-dynamic";
export const revalidate = 0;

import Header from "../components/Header";
import Link from "next/link";
import { client } from "../sanity/lib/client";
import { newsItemsQuery } from "../sanity/lib/queries";

/* ---------- types ---------- */

type CommentaryPost = {
  id: string;
  title: string;
  excerpt?: string;
  author?: string;
  date?: string;
  slug?: string;
  heroImageUrl?: string;
  readTimeMinutes?: number;
};

type NewsItem = {
  id: string;
  title: string;
  slug?: string;
  readTimeMinutes?: number;
};

type FeedDoc = {
  id: string;
  title: string;
  source?: string;
  url?: string;
  section?: "feedRead" | "strategicInsights";
  priority?: number;
  publishedAt?: string;
};

type ExternalReadItem = {
  id: string;
  title: string;
  source?: string;
  author?: string;
  href: string;
};

type MostReadItem = {
  id: string;
  title: string;
  href: string;
  readTimeMinutes?: number;
};

/* ---------- helpers ---------- */

function formatDate(dateString?: string) {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

/* ---------- Read time UI (copper icon + subtle text) ---------- */

function ReadTimeBadge({ minutes }: { minutes?: number }) {
  if (!minutes || minutes <= 0) return null;

  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap"
      aria-label={`${minutes} min read`}
      title={`${minutes} min read`}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="shrink-0 text-[#C67C4E]/80"
      >
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12 7.5v5l3.25 2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <span className="text-[11px] font-medium text-white/55">
        {minutes} min read
      </span>
    </span>
  );
}

/* ---------- queries ---------- */

const commentaryHomeQuery = `
  *[_type == "post"] | order(publishedAt desc, _createdAt desc)[0...60]{
    _id,
    title,
    excerpt,
    author,
    publishedAt,
    readTimeMinutes,
    "slug": slug.current,
    "heroImageUrl": heroImage.asset->url
  }
`;

const allFeedDocsQuery = `
  *[_type == "feedRead"]
  | order(coalesce(priority, 9999) asc, publishedAt desc, _createdAt desc){
    _id,
    title,
    source,
    url,
    section,
    priority,
    publishedAt
  }
`;

/* ---------- data loader ---------- */

async function getHomeData(): Promise<{
  commentaryPosts: CommentaryPost[];
  newsItems: NewsItem[];
  feedRead: ExternalReadItem[];
  strategicInsights: ExternalReadItem[];
  mostRead: MostReadItem[];
}> {
  const [postDocs, newsDocs, feedDocs] = await Promise.all([
    client.fetch(commentaryHomeQuery),
    client.fetch(newsItemsQuery),
    client.fetch(allFeedDocsQuery),
  ]);

  const commentaryPosts: CommentaryPost[] = (postDocs || []).map((p: any) => ({
    id: p._id,
    title: p.title,
    excerpt: p.excerpt,
    author: p.author,
    date: formatDate(p.publishedAt),
    slug: p.slug,
    heroImageUrl: p.heroImageUrl,
    readTimeMinutes:
      typeof p.readTimeMinutes === "number" ? p.readTimeMinutes : undefined,
  }));

  const newsItems: NewsItem[] = (newsDocs || []).map((n: any) => ({
    id: n._id,
    title: n.title,
    slug: n.slug,
    readTimeMinutes:
      typeof n.readTimeMinutes === "number" ? n.readTimeMinutes : undefined,
  }));

  const normalizedFeedDocs: FeedDoc[] = (feedDocs || []).map((f: any) => ({
    id: f._id,
    title: f.title,
    source: f.source,
    url: f.url,
    section: f.section,
    priority: f.priority,
    publishedAt: f.publishedAt,
  }));

  const feedRead = normalizedFeedDocs
    .filter((d) => d.section === "feedRead" || !d.section)
    .map((d) => ({
      id: d.id,
      title: d.title,
      source: d.source,
      href: d.url || "#",
    }));

  const strategicInsights = normalizedFeedDocs
    .filter((d) => d.section === "strategicInsights")
    .map((d) => ({
      id: d.id,
      title: d.title,
      source: d.source,
      href: d.url || "#",
    }));

  // Most Read: carry readTimeMinutes through (for badge)
  const mostRead = commentaryPosts
    .filter((p) => !!p.slug)
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      title: p.title,
      href: `/posts/${p.slug}`,
      readTimeMinutes: p.readTimeMinutes,
    }));

  return {
    commentaryPosts,
    newsItems,
    feedRead,
    strategicInsights,
    mostRead,
  };
}

/* ---------- UI primitives ---------- */

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="space-y-2">
      <div className="inline-flex items-center gap-3">
        <div className="inline-block">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.32em] text-[#E6E9EE]">
            {title}
          </h2>
          <span className="mt-2 block h-[2px] w-full bg-[#C67C4E]/35" />
        </div>
      </div>
    </div>
  );
}

/* Mobile top line: COMMENTARY highlighted + NEWS POINT scroll link */
function MobileModeLine() {
  return (
    <div className="lg:hidden">
      <div className="inline-flex items-end gap-8">
        <span className="inline-flex flex-col leading-none">
          <span className="text-[12px] font-semibold uppercase tracking-[0.32em] text-[#E6E9EE]">
            Commentary
          </span>
          <span className="mt-2 block h-[2px] w-full bg-[#C67C4E]/35" />
        </span>

        <a
          href="#news-point-mobile"
          className="inline-flex flex-col leading-none no-underline hover:no-underline"
        >
          <span className="text-[12px] font-semibold uppercase tracking-[0.32em] text-white/55 transition-colors duration-150 hover:text-[#E6E9EE]">
            News Point
          </span>
          <span className="mt-2 block h-[2px] w-full bg-transparent" />
        </a>
      </div>
    </div>
  );
}

/* Two thin blue lines (used as separators around mobile News Point block) */
function DoubleBlueRule() {
  return (
    <div className="space-y-2">
      <div className="h-px w-full bg-[#3B82F6]/55" />
      <div className="h-px w-full bg-[#3B82F6]/28" />
    </div>
  );
}

/* hover-only accent (used everywhere else) */
function HoverAccent() {
  return (
    <span className="pointer-events-none absolute -left-3 top-2 bottom-2 w-px bg-transparent transition-colors group-hover:bg-[#C67C4E]/90" />
  );
}

/* NEWS-specific accent: permanent but softened */
function NewsAccent() {
  return (
    <span className="pointer-events-none absolute -left-3 top-2 bottom-2 w-px bg-[#C67C4E]/25 transition-colors group-hover:bg-[#C67C4E]/90" />
  );
}

/* COMMENTARY featured accent (hero + 6 cards): permanent but softened */
function FeaturedAccent() {
  return (
    <span className="pointer-events-none absolute -left-3 top-2 bottom-2 w-px bg-[#C67C4E]/25 transition-colors group-hover:bg-[#C67C4E]/90" />
  );
}

function inlineMeta(item: ExternalReadItem): string {
  const bits = [item.author, item.source].filter(Boolean) as string[];
  return bits.join(", ");
}

/* ---------- lists ---------- */

function AggregatorList({
  items,
  maxItems,
}: {
  items: ExternalReadItem[];
  maxItems: number;
}) {
  return (
    <ul className="space-y-3">
      {items.slice(0, maxItems).map((it) => {
        const meta = inlineMeta(it);
        return (
          <li key={it.id} className="group relative overflow-visible">
            <HoverAccent />
            <a
              href={it.href}
              target="_blank"
              rel="noreferrer"
              className="block py-2 text-[13.5px] leading-snug text-white/82 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-white"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              <span className="font-medium">{it.title}</span>
              {meta && (
                <>
                  <span className="text-white/45"> — </span>
                  <span className="text-[#C67C4E] italic">{meta}</span>
                </>
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

function NewsList({
  items,
  maxItems = 6,
}: {
  items: NewsItem[];
  maxItems?: number;
}) {
  return (
    <ul className="space-y-3">
      {items.slice(0, maxItems).map((n) => (
        <li key={n.id} className="group relative overflow-visible">
          <NewsAccent />
          <Link
            href={n.slug ? `/news/${n.slug}` : "#"}
            className="block py-2 text-[13.5px] leading-snug text-white/88 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-white break-words"
          >
            <span className="font-semibold">{n.title}</span>
            <div className="mt-1">
              <ReadTimeBadge minutes={n.readTimeMinutes} />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function CommentaryList({
  items,
  maxItems,
}: {
  items: CommentaryPost[];
  maxItems: number;
}) {
  const usable = items.filter((p) => !!p.slug);

  return (
    <ul className="space-y-3">
      {usable.slice(0, maxItems).map((p) => (
        <li key={p.id} className="group relative overflow-visible">
          <HoverAccent />
          <Link
            href={`/posts/${p.slug}`}
            className="block py-2 no-underline hover:no-underline focus:outline-none text-[13.5px] leading-snug text-white/82 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-white break-words"
            title={p.title}
          >
            <span className="font-medium">{p.title}</span>
            <div className="mt-1">
              <ReadTimeBadge minutes={p.readTimeMinutes} />
            </div>

            {p.author ? (
              <span className="mt-1 block text-[11px] uppercase tracking-[0.20em] text-[#C67C4E]/55 transition-colors duration-150 group-hover:text-[#C67C4E]">
                {p.author}
              </span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * Most Read: clamp TITLE ONLY, NEVER clamp the read-time.
 * This prevents “3 min re…” truncation and missing badges.
 */
function MostReadList({
  items,
  maxItems,
}: {
  items: MostReadItem[];
  maxItems: number;
}) {
  return (
    <ul className="space-y-3">
      {items.slice(0, maxItems).map((m) => (
        <li key={m.id} className="group relative overflow-visible">
          <HoverAccent />
          <Link
            href={m.href}
            className="block py-2 text-[13.5px] leading-snug text-white/82 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-white no-underline hover:no-underline"
          >
            <span
              className="font-medium"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
              title={m.title}
            >
              {m.title}
            </span>

            <div className="mt-1">
              <ReadTimeBadge minutes={m.readTimeMinutes} />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* ---------- page ---------- */

export default async function HomePage() {
  const { commentaryPosts, newsItems, feedRead, strategicInsights, mostRead } =
    await getHomeData();

  const lead = commentaryPosts[0];
  const featuredCards = commentaryPosts.slice(1, 7);
  const commentaryStream = commentaryPosts.slice(7);

  const firstTwoCards = featuredCards.slice(0, 2);
  const remainingCards = featuredCards.slice(2);

  return (
    <main className="min-h-screen bg-[#0B0D10] text-[#E6E9EE]">
      <Header />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="pb-5">
          <MobileModeLine />
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:gap-14">
          {/* LEFT */}
          <section className="space-y-10">
            <div className="hidden lg:block">
              <SectionHeader title="Commentary" />
            </div>

            {lead && lead.slug && (
              <article className="space-y-4 lg:space-y-5">
                <div className="h-60 overflow-hidden bg-white/5 ring-1 ring-white/10">
                  {lead.heroImageUrl && (
                    <img
                      src={lead.heroImageUrl}
                      alt={lead.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  )}
                </div>

                <Link
                  href={`/posts/${lead.slug}`}
                  className="group relative block overflow-visible no-underline hover:no-underline focus:outline-none"
                >
                  <FeaturedAccent />
                  <h3 className="text-[44px] font-semibold leading-tight text-white/95 transition-all duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-white break-words">
                    {lead.title}
                  </h3>

                  <div className="mt-2">
                    <ReadTimeBadge minutes={lead.readTimeMinutes} />
                  </div>

                  {lead.excerpt && (
                    <p className="mt-3 text-[16px] leading-relaxed text-white/62 transition-colors duration-150 group-hover:text-white/70">
                      {lead.excerpt}
                    </p>
                  )}

                  {lead.author ? (
                    <p className="mt-4 text-[11px] uppercase tracking-[0.20em] text-[#C67C4E]/55 transition-colors duration-150 group-hover:text-[#C67C4E]">
                      {lead.author}
                    </p>
                  ) : null}
                </Link>
              </article>
            )}

            {/* Featured cards + (MOBILE) standalone News Point inserted between card 2 and 3 */}
            <div className="space-y-0">
              {/* First two featured cards */}
              <div className="grid grid-cols-1 gap-y-14 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-14">
                {firstTwoCards.map((p) => (
                  <div key={p.id} className="space-y-6">
                    <article className="space-y-5 sm:space-y-6">
                      <div className="h-28 overflow-hidden bg-white/5 ring-1 ring-white/10">
                        {p.heroImageUrl && (
                          <img
                            src={p.heroImageUrl}
                            alt={p.title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        )}
                      </div>

                      {p.slug ? (
                        <Link
                          href={`/posts/${p.slug}`}
                          className="group relative block overflow-visible no-underline hover:no-underline focus:outline-none"
                        >
                          <FeaturedAccent />

                          <h4 className="text-[18px] font-semibold leading-tight text-white/92 transition-all duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-white break-words">
                            {p.title}
                          </h4>

                          <div className="mt-2">
                            <ReadTimeBadge minutes={p.readTimeMinutes} />
                          </div>

                          {p.excerpt ? (
                            <p className="mt-3 text-[13.5px] leading-relaxed text-white/62 transition-colors duration-150 group-hover:text-white/70">
                              {p.excerpt}
                            </p>
                          ) : null}

                          {p.author ? (
                            <p className="mt-4 text-[11px] uppercase tracking-[0.20em] text-[#C67C4E]/55 transition-colors duration-150 group-hover:text-[#C67C4E]">
                              {p.author}
                            </p>
                          ) : null}
                        </Link>
                      ) : null}
                    </article>
                  </div>
                ))}
              </div>

              {/* MOBILE News Point block */}
              <div className="lg:hidden">
                <div className="mt-6 mb-6">
                  <DoubleBlueRule />
                </div>

                <section id="news-point-mobile" className="space-y-6">
                  <SectionHeader title="News Point" />
                  <NewsList items={newsItems} maxItems={6} />
                </section>

                <div className="mt-6 mb-6">
                  <DoubleBlueRule />
                </div>
              </div>

              {/* Remaining featured cards */}
              <div className="grid grid-cols-1 gap-y-14 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-14">
                {remainingCards.map((p) => (
                  <div key={p.id} className="space-y-6">
                    <article className="space-y-5 sm:space-y-6">
                      <div className="h-28 overflow-hidden bg-white/5 ring-1 ring-white/10">
                        {p.heroImageUrl && (
                          <img
                            src={p.heroImageUrl}
                            alt={p.title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        )}
                      </div>

                      {p.slug ? (
                        <Link
                          href={`/posts/${p.slug}`}
                          className="group relative block overflow-visible no-underline hover:no-underline focus:outline-none"
                        >
                          <FeaturedAccent />

                          <h4 className="text-[18px] font-semibold leading-tight text-white/92 transition-all duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-white break-words">
                            {p.title}
                          </h4>

                          <div className="mt-2">
                            <ReadTimeBadge minutes={p.readTimeMinutes} />
                          </div>

                          {p.excerpt ? (
                            <p className="mt-3 text-[13.5px] leading-relaxed text-white/62 transition-colors duration-150 group-hover:text-white/70">
                              {p.excerpt}
                            </p>
                          ) : null}

                          {p.author ? (
                            <p className="mt-4 text-[11px] uppercase tracking-[0.20em] text-[#C67C4E]/55 transition-colors duration-150 group-hover:text-[#C67C4E]">
                              {p.author}
                            </p>
                          ) : null}
                        </Link>
                      ) : null}
                    </article>
                  </div>
                ))}
              </div>
            </div>

            {/* Commentary stream */}
            <div className="space-y-4 pt-2">
              <CommentaryList items={commentaryStream} maxItems={20} />

              <div className="pt-1">
                <Link
                  href="/commentary"
                  className="group inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/75 no-underline hover:no-underline transition-colors duration-150 hover:text-white/80"
                >
                  <span>More</span>
                  <span className="h-px w-10 bg-transparent transition-colors duration-150 group-hover:bg-[#C67C4E]/80" />
                </Link>
              </div>
            </div>
          </section>

          {/* RIGHT (desktop sidebar) */}
          <aside className="flex flex-col gap-14">
            <section className="hidden lg:block space-y-6">
              <SectionHeader title="News Point" />
              <NewsList items={newsItems} />
            </section>

            <section className="space-y-6">
              <SectionHeader title="Feed Read" />
              <AggregatorList items={feedRead} maxItems={8} />
            </section>

            <section className="space-y-6">
              <SectionHeader title="Strategic Insights" />
              <AggregatorList items={strategicInsights} maxItems={5} />
            </section>

            <section className="space-y-6">
              <SectionHeader title="Most Read" />
              <MostReadList items={mostRead} maxItems={5} />
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
