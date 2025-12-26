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
};

type NewsItem = {
  id: string;
  title: string;
  slug?: string;
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

/* ---------- queries ---------- */

const commentaryHomeQuery = `
  *[_type == "post"] | order(publishedAt desc, _createdAt desc)[0...60]{
    _id,
    title,
    excerpt,
    author,
    publishedAt,
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
  }));

  const newsItems: NewsItem[] = (newsDocs || []).map((n: any) => ({
    id: n._id,
    title: n.title,
    slug: n.slug,
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

  const mostRead = commentaryPosts
    .filter((p) => !!p.slug)
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      title: p.title,
      href: `/posts/${p.slug}`,
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
          {/* Copper underline (text width only) */}
          <span className="mt-2 block h-[2px] w-full bg-[#C67C4E]/35" />
        </div>
      </div>
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

function DoubleBlueRules() {
  return (
    <div className="space-y-1">
      <div className="h-px w-full bg-[#7DA2FF]/25" />
      <div className="h-px w-full bg-[#7DA2FF]/25" />
    </div>
  );
}

/* Mobile-only mode indicator: COMMENTARY (active) · NEWS POINT (jump) */
function MobileModeLine() {
  return (
    <div className="lg:hidden">
      {/* Use identical vertical structure for both labels to guarantee baseline alignment */}
      <div className="inline-flex items-end gap-3">
        {/* Active: Commentary */}
        <span className="inline-flex flex-col leading-none">
          <span className="text-[12px] font-semibold uppercase tracking-[0.32em] text-[#E6E9EE]">
            Commentary
          </span>
          <span className="mt-2 block h-[2px] w-full bg-[#C67C4E]/35" />
        </span>

        <span className="text-white/35 leading-none">·</span>

        {/* Inactive but clickable: News Point (with invisible underline spacer for perfect alignment) */}
        <a
          href="#news-point-mobile"
          className="inline-flex flex-col leading-none no-underline hover:no-underline"
        >
          <span className="text-[12px] font-semibold uppercase tracking-[0.32em] text-[#9AA1AB] transition-colors duration-150 hover:text-[#E6E9EE]">
            News Point
          </span>
          {/* spacer underline to match Commentary’s underline height */}
          <span className="mt-2 block h-[2px] w-full bg-transparent" />
        </a>
      </div>
    </div>
  );
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
  compact = false,
}: {
  items: NewsItem[];
  maxItems?: number;
  compact?: boolean;
}) {
  return (
    <ul className={compact ? "space-y-2" : "space-y-3"}>
      {items.slice(0, maxItems).map((n) => (
        <li key={n.id} className="group relative overflow-visible">
          <NewsAccent />
          <Link
            href={n.slug ? `/news/${n.slug}` : "#"}
            className={[
              "block text-[13.5px] leading-snug text-white/88 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-white",
              compact ? "py-1.5" : "py-2",
            ].join(" ")}
          >
            <span
              className="font-semibold"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {n.title}
            </span>
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
            className="block py-2 no-underline hover:no-underline focus:outline-none text-[13.5px] leading-snug text-white/82 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-white"
            title={p.title}
          >
            <span
              className="block"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              <span className="font-medium">{p.title}</span>
            </span>

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

/* ---------- page ---------- */

export default async function HomePage() {
  const { commentaryPosts, newsItems, feedRead, strategicInsights, mostRead } =
    await getHomeData();

  const lead = commentaryPosts[0];

  // Featured cards (desktop: 6; mobile insertion after first 2)
  const featuredCards = commentaryPosts.slice(1, 7);
  const featuredFirstTwo = featuredCards.slice(0, 2);
  const featuredRest = featuredCards.slice(2);

  const listStartIndex = 7;
  const commentaryStream = commentaryPosts.slice(listStartIndex);

  return (
    <main className="min-h-screen bg-[#0B0D10] text-[#E6E9EE]">
      <Header />

      {/* Mobile: reduce top padding (cuts nav→mode-line gap); Desktop unchanged */}
      <div className="mx-auto max-w-6xl px-6 py-6 lg:py-10">
        <div className="grid grid-cols-1 gap-12 lg:gap-14 lg:grid-cols-[1.35fr_0.65fr]">
          {/* LEFT */}
          <section className="space-y-6 lg:space-y-10">
            {/* Desktop header stays exactly as before; mobile uses the mode line instead */}
            <div className="hidden lg:block">
              <SectionHeader title="Commentary" />
            </div>

            {/* MOBILE-ONLY: Commentary (active) · News Point (jump) */}
            <MobileModeLine />

            {lead && lead.slug && (
              <article className="space-y-5">
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
                  <h3 className="text-[44px] font-semibold leading-tight text-white/95 transition-all duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-white">
                    {lead.title}
                  </h3>

                  {lead.excerpt && (
                    <p className="mt-4 text-[16px] leading-relaxed text-white/62 transition-colors duration-150 group-hover:text-white/70">
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

            {/* FEATURED: desktop stays 3x2; mobile we insert News Point after first two cards */}
            <div className="grid grid-cols-1 gap-y-14 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-14">
              {/* First two featured cards */}
              {featuredFirstTwo.map((p) => (
                <article key={p.id} className="space-y-6">
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
                      <h4 className="text-[18px] font-semibold leading-tight text-white/92 transition-all duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-white">
                        {p.title}
                      </h4>

                      {p.excerpt ? (
                        <p className="mt-4 text-[13.5px] leading-relaxed text-white/62 transition-colors duration-150 group-hover:text-white/70">
                          {p.excerpt}
                        </p>
                      ) : null}

                      {p.author ? (
                        <p className="mt-4 text-[11px] uppercase tracking-[0.20em] text-[#C67C4E]/55 transition-colors duration-150 group-hover:text-[#C67C4E]">
                          {p.author}
                        </p>
                      ) : null}
                    </Link>
                  ) : (
                    <>
                      <h4 className="text-[18px] font-semibold leading-tight text-white/92">
                        {p.title}
                      </h4>

                      {p.excerpt ? (
                        <p className="text-[13.5px] leading-relaxed text-white/62">
                          {p.excerpt}
                        </p>
                      ) : null}

                      {p.author ? (
                        <p className="mt-4 text-[11px] uppercase tracking-[0.20em] text-[#C67C4E]/55">
                          {p.author}
                        </p>
                      ) : null}
                    </>
                  )}
                </article>
              ))}

              {/* MOBILE-ONLY: News Point inserted here (after hero + two commentaries) */}
              {/* Key fix: counteract the grid row-gap above/below this block (mobile only) */}
              <div
                id="news-point-mobile"
                className="sm:col-span-2 lg:hidden -my-7"
              >
                <div className="space-y-2">
                  <DoubleBlueRules />

                  {/* Tighten inner spacing as well */}
                  <div className="space-y-4 pt-0">
                    <SectionHeader title="News Point" />
                    <NewsList items={newsItems} compact />
                  </div>

                  <DoubleBlueRules />
                </div>
              </div>

              {/* Remaining featured cards */}
              {featuredRest.map((p) => (
                <article key={p.id} className="space-y-6">
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
                      <h4 className="text-[18px] font-semibold leading-tight text-white/92 transition-all duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-white">
                        {p.title}
                      </h4>

                      {p.excerpt ? (
                        <p className="mt-4 text-[13.5px] leading-relaxed text-white/62 transition-colors duration-150 group-hover:text-white/70">
                          {p.excerpt}
                        </p>
                      ) : null}

                      {p.author ? (
                        <p className="mt-4 text-[11px] uppercase tracking-[0.20em] text-[#C67C4E]/55 transition-colors duration-150 group-hover:text-[#C67C4E]">
                          {p.author}
                        </p>
                      ) : null}
                    </Link>
                  ) : (
                    <>
                      <h4 className="text-[18px] font-semibold leading-tight text-white/92">
                        {p.title}
                      </h4>

                      {p.excerpt ? (
                        <p className="text-[13.5px] leading-relaxed text-white/62">
                          {p.excerpt}
                        </p>
                      ) : null}

                      {p.author ? (
                        <p className="mt-4 text-[11px] uppercase tracking-[0.20em] text-[#C67C4E]/55">
                          {p.author}
                        </p>
                      ) : null}
                    </>
                  )}
                </article>
              ))}
            </div>

            {/* Commentary stream (Feed Read-style) */}
            <div className="space-y-4 pt-2">
              <CommentaryList items={commentaryStream} maxItems={20} />

              <div className="pt-2">
                <Link
                  href="/commentary"
                  className="group inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/55 no-underline hover:no-underline transition-colors duration-150 hover:text-white/80"
                >
                  <span>More</span>
                  <span className="h-px w-10 bg-transparent transition-colors duration-150 group-hover:bg-[#C67C4E]/80" />
                </Link>
              </div>
            </div>

            {/* MOBILE-ONLY: below commentary, the rest in desired order */}
            <div className="space-y-14 lg:hidden pt-6">
              <section className="space-y-6">
                <SectionHeader title="Most Read" />
                <AggregatorList
                  items={mostRead.map((m) => ({
                    id: m.id,
                    title: m.title,
                    href: m.href,
                  }))}
                  maxItems={5}
                />
              </section>

              <section className="space-y-6">
                <SectionHeader title="Feed Read" />
                <AggregatorList items={feedRead} maxItems={8} />
              </section>

              <section className="space-y-6">
                <SectionHeader title="Strategic Insights" />
                <AggregatorList items={strategicInsights} maxItems={5} />
              </section>
            </div>
          </section>

          {/* RIGHT (desktop/laptop only — unchanged) */}
          <aside className="hidden lg:block space-y-14">
            <section className="space-y-6">
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
              <AggregatorList
                items={mostRead.map((m) => ({
                  id: m.id,
                  title: m.title,
                  href: m.href,
                }))}
                maxItems={5}
              />
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
