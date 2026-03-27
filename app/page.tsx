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
  excerpt?: string;
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
  readTimeMinutes?: number;
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

function normalizeAuthor(value: any): string | undefined {
  if (typeof value === "string") {
    const s = value.trim();
    return s ? s : undefined;
  }
  if (value && typeof value === "object") {
    const candidate =
      value.name ??
      value.title ??
      value.fullName ??
      value.displayName ??
      value.author ??
      undefined;
    if (typeof candidate === "string") {
      const s = candidate.trim();
      return s ? s : undefined;
    }
  }
  return undefined;
}

/* ---------- typography test ---------- */
/**
 * Controlled serif test:
 * - Applied only to the homepage's major commentary headlines
 * - Keeps masthead, nav, sidebars, metadata, and utility text in sans
 * - Uses the platform serif stack (font-serif) for a clean, reversible editorial test
 */
const MAJOR_HEADLINE_SERIF_CLASS = "font-serif tracking-[-0.022em]";

/* ---------- Read time UI (copper icon + subtle text) ---------- */
/**
 * IMPORTANT: This badge is inline (inline-flex) + nowrap.
 * Spacing is handled by the caller using a literal space {" "},
 * NOT margin classes like ml-2 (which can indent on wrap).
 */
function ReadTimeBadge({ minutes }: { minutes?: number }) {
  if (!minutes || minutes <= 0) return null;

  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap align-baseline"
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

      <span className="text-[11px] font-medium text-white/55">{minutes} min read</span>
    </span>
  );
}

/**
 * Inline-flow title + badge, to enforce your exact rule:
 * - Badge stays on same line as last word unless there is truly no room.
 * - If forced, badge drops to the next line flush-left (no indent).
 *
 * This is achieved by normal inline text layout + a nowrap badge,
 * with spacing provided by a literal space text-node.
 */
function InlineTitleWithReadTime({ title, minutes }: { title: string; minutes?: number }) {
  if (!minutes || minutes <= 0) return <>{title}</>;

  return (
    <>
      {title}
      {" "}
      <ReadTimeBadge minutes={minutes} />
    </>
  );
}

/* ---------- queries ---------- */

const commentaryHomeQuery = `
  *[_type == "post"] | order(publishedAt desc, _createdAt desc)[0...60]{
    _id,
    title,
    excerpt,
    "author": coalesce(author, author->name, author.name, author->title, author.title),
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
    author: normalizeAuthor(p.author),
    date: formatDate(p.publishedAt),
    slug: p.slug,
    heroImageUrl: p.heroImageUrl,
    readTimeMinutes: typeof p.readTimeMinutes === "number" ? p.readTimeMinutes : undefined,
  }));

  const newsItems: NewsItem[] = (newsDocs || []).map((n: any) => ({
    id: n._id,
    title: n.title,
    excerpt: n.excerpt,
    slug: n.slug,
    readTimeMinutes: typeof n.readTimeMinutes === "number" ? n.readTimeMinutes : undefined,
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

function SectionHeader({
  title,
  headlineTone = false,
}: {
  title: string;
  headlineTone?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="inline-flex items-center gap-3">
        <div className="inline-block">
          <h2
            className={`text-[12px] font-semibold uppercase tracking-[0.32em] ${
              headlineTone ? "text-[#9C9488]" : "text-[#9C9488]"
            }`}
          >
            {title}
          </h2>
          <span className="mt-2 block h-[2px] w-full bg-[#C67C4E]/35" />
        </div>
      </div>
    </div>
  );
}

function MobileModeLine() {
  return (
    <div className="lg:hidden">
      <div className="inline-flex items-end gap-6">
        <span className="inline-flex flex-col leading-none">
          <span className="text-[12px] font-semibold uppercase tracking-[0.26em] text-[#9C9488]">
            Commentary
          </span>
          <span className="mt-1.5 block h-[2px] w-full bg-[#C67C4E]/50" />
        </span>

        <a
          href="#news-point-mobile"
          className="inline-flex flex-col leading-none no-underline hover:no-underline"
        >
          <span className="text-[12px] font-semibold uppercase tracking-[0.30em] text-[#9C9488] transition-colors duration-150 hover:text-[#B3AA9D]">
            News Point
          </span>
          <span className="mt-1.5 block h-[2px] w-full bg-transparent" />
        </a>
      </div>
    </div>
  );
}

function DoubleBlueRule() {
  return (
    <div className="space-y-2">
      <div className="h-px w-full bg-[#3B82F6]/55" />
      <div className="h-px w-full bg-[#3B82F6]/28" />
    </div>
  );
}

function HoverAccent() {
  return (
    <span className="pointer-events-none absolute -left-3 top-2 bottom-2 w-px bg-transparent transition-colors group-hover:bg-[#C67C4E]/90" />
  );
}

function NewsAccent() {
  return (
    <span className="pointer-events-none absolute -left-3 top-2 bottom-2 w-px bg-[#C67C4E]/25 transition-colors group-hover:bg-[#C67C4E]/90" />
  );
}

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
  tone = "default",
}: {
  items: ExternalReadItem[];
  maxItems: number;
  tone?: "default" | "subtle" | "quiet";
}) {
  const linkToneClass =
    tone === "quiet"
      ? "text-[#D8CBB8] group-hover:text-[#E1D6C6]"
      : tone === "subtle"
        ? "text-[#D8CBB8] group-hover:text-[#E1D6C6]"
        : "text-[#D8CBB8] group-hover:text-[#E1D6C6]";

  const metaToneClass =
    tone === "quiet" ? "text-[#C67C4E]/82" : tone === "subtle" ? "text-[#C67C4E]/90" : "text-[#C67C4E]";

  const separatorToneClass = tone === "quiet" ? "text-white/38" : "text-white/45";

  return (
    <ul className="space-y-3">
      {items.slice(0, maxItems).map((it) => {
        const meta = inlineMeta(it);
        const isInternal = it.href?.startsWith("/");

        const TitleRow = (
          <span className="font-medium">
            <InlineTitleWithReadTime title={it.title} minutes={it.readTimeMinutes} />
          </span>
        );

        return (
          <li key={it.id} className="group relative overflow-visible">
            <HoverAccent />

            {isInternal ? (
              <Link
                href={it.href}
                className={`block py-2 text-[13.5px] leading-snug transition-all duration-150 group-hover:translate-x-0.5 no-underline hover:no-underline ${linkToneClass}`}
              >
                {TitleRow}

                {meta && (
                  <>
                    <span className={separatorToneClass}> — </span>
                    <span className={`italic ${metaToneClass}`}>{meta}</span>
                  </>
                )}
              </Link>
            ) : (
              <a
                href={it.href}
                target="_blank"
                rel="noreferrer"
                className={`block py-2 text-[13.5px] leading-snug transition-all duration-150 group-hover:translate-x-0.5 ${linkToneClass}`}
              >
                {TitleRow}

                {meta && (
                  <>
                    <span className={separatorToneClass}> — </span>
                    <span className={`italic ${metaToneClass}`}>{meta}</span>
                  </>
                )}
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function NewsList({ items, maxItems = 6 }: { items: NewsItem[]; maxItems?: number }) {
  return (
    <ul className="space-y-5">
      {items.slice(0, maxItems).map((n) => (
        <li key={n.id} className="group relative overflow-visible">
          <NewsAccent />
          <Link
            href={n.slug ? `/news/${n.slug}` : "#"}
            className="block py-2 no-underline hover:no-underline transition-all duration-150 group-hover:translate-x-0.5"
          >
            <span className="block text-[14px] font-semibold leading-[1.34] text-[#D8CBB8] transition-colors duration-150 group-hover:text-[#E1D6C6] break-words">
              {n.title}
            </span>

            {n.readTimeMinutes ? (
              <div className="mt-2">
                <ReadTimeBadge minutes={n.readTimeMinutes} />
              </div>
            ) : null}

            {n.excerpt ? (
              <p className="mt-3 text-[11.5px] leading-[1.7] text-[#B8B1A6] transition-colors duration-150 group-hover:text-[#C7C0B5]">
                {n.excerpt}
              </p>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function CommentaryList({ items, maxItems }: { items: CommentaryPost[]; maxItems: number }) {
  const usable = items.filter((p) => !!p.slug);

  return (
    <ul className="space-y-3">
      {usable.slice(0, maxItems).map((p) => (
        <li key={p.id} className="group relative overflow-visible">
          <HoverAccent />
          <Link
            href={`/posts/${p.slug}`}
            className="block py-2 no-underline hover:no-underline focus:outline-none text-[13.5px] leading-snug text-[#D8CBB8] transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-[#E1D6C6] break-words"
            title={p.title}
          >
            <span className="font-medium">
              <InlineTitleWithReadTime title={p.title} minutes={p.readTimeMinutes} />
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
  const { commentaryPosts, newsItems, feedRead, strategicInsights, mostRead } = await getHomeData();

  const lead = commentaryPosts[0];
  const secondaryLead = commentaryPosts[1];
  const desktopMidFeature = commentaryPosts[4];

  const mobileFirstTwoCards = commentaryPosts.slice(1, 3);
  const mobilePostNewsFirstTwoCards = commentaryPosts.slice(3, 5);
  const mobilePostNewsRemainingCards = commentaryPosts.slice(5, 7);

  const desktopFirstTwoCards = commentaryPosts.slice(2, 4);
  const desktopRemainingCards = commentaryPosts.slice(5, 7);

  const commentaryStream = commentaryPosts.slice(7);

  return (
    <main className="min-h-screen bg-[#0B0D10] text-[#E6E9EE]">
      <Header />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="pb-2">
          <MobileModeLine />
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:gap-14">
          <section className="space-y-10">
            <div className="hidden lg:block">
              <SectionHeader title="Commentary" />
            </div>

            {lead && lead.slug && (
              <article className="space-y-4 pb-8 lg:space-y-5 lg:pb-0">
                <div className="h-64 overflow-hidden bg-white/5 ring-1 ring-white/10 sm:h-72 lg:h-60">
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
                  <h3
                    className={`${MAJOR_HEADLINE_SERIF_CLASS} mt-6 text-[42px] font-semibold leading-[1.12] text-[#D8CBB8] transition-all duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-[#E1D6C6] break-words sm:text-[44px] lg:text-[44px]`}
                  >
                    <InlineTitleWithReadTime title={lead.title} minutes={lead.readTimeMinutes} />
                  </h3>

                  {lead.excerpt && (
                    <p className="mt-3 max-w-[36ch] text-[17px] leading-relaxed text-[#B8B1A6] transition-colors duration-150 group-hover:text-[#C7C0B5] lg:max-w-none lg:text-[16px]">
                      {lead.excerpt}
                    </p>
                  )}

                  {lead.author ? (
                    <p className="mt-5 text-[11px] uppercase tracking-[0.20em] text-[#C67C4E]/55 transition-colors duration-150 group-hover:text-[#C67C4E]">
                      {lead.author}
                    </p>
                  ) : null}
                </Link>
              </article>
            )}

            <div className="space-y-0 mt-8">
              {secondaryLead && secondaryLead.slug && (
                <article className="hidden lg:block mt-2 mb-12 border-t border-white/10 pt-8">
                  <Link
                    href={`/posts/${secondaryLead.slug}`}
                    className="group block no-underline hover:no-underline focus:outline-none"
                  >
                    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
                      <div className="space-y-4">
                        <h3
                          className={`${MAJOR_HEADLINE_SERIF_CLASS} text-[31px] font-semibold leading-[1.08] text-[#D8CBB8] transition-colors duration-150 group-hover:text-[#E1D6C6] break-words`}
                        >
                          <InlineTitleWithReadTime
                            title={secondaryLead.title}
                            minutes={secondaryLead.readTimeMinutes}
                          />
                        </h3>

                        {secondaryLead.excerpt && (
                          <p className="max-w-2xl text-[15px] leading-7 text-[#B8B1A6] transition-colors duration-150 group-hover:text-[#C7C0B5]">
                            {secondaryLead.excerpt}
                          </p>
                        )}

                        {secondaryLead.author ? (
                          <p className="text-[11px] uppercase tracking-[0.20em] text-[#C67C4E]/55 transition-colors duration-150 group-hover:text-[#C67C4E]">
                            {secondaryLead.author}
                          </p>
                        ) : null}
                      </div>

                      <div className="h-44 overflow-hidden bg-white/5 ring-1 ring-white/10">
                        {secondaryLead.heroImageUrl && (
                          <img
                            src={secondaryLead.heroImageUrl}
                            alt={secondaryLead.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
                            loading="lazy"
                          />
                        )}
                      </div>
                    </div>
                  </Link>
                </article>
              )}

              <div className="lg:hidden">
                <div className="grid grid-cols-1 gap-y-14 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-14">
                  {mobileFirstTwoCards.map((p) => (
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

                            <h4
                              className={`${MAJOR_HEADLINE_SERIF_CLASS} text-[18px] font-semibold leading-tight text-[#D8CBB8] transition-all duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-[#E1D6C6] break-words`}
                            >
                              <InlineTitleWithReadTime title={p.title} minutes={p.readTimeMinutes} />
                            </h4>

                            {p.excerpt ? (
                              <p className="mt-3 text-[13.5px] leading-relaxed text-[#B8B1A6] transition-colors duration-150 group-hover:text-[#C7C0B5]">
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
                            <h4
                              className={`${MAJOR_HEADLINE_SERIF_CLASS} text-[18px] font-semibold leading-tight text-[#D8CBB8] break-words`}
                            >
                              <InlineTitleWithReadTime title={p.title} minutes={p.readTimeMinutes} />
                            </h4>

                            {p.excerpt ? (
                              <p className="text-[13.5px] leading-relaxed text-[#B8B1A6]">{p.excerpt}</p>
                            ) : null}

                            {p.author ? (
                              <p className="mt-4 text-[11px] uppercase tracking-[0.20em] text-[#C67C4E]/55">
                                {p.author}
                              </p>
                            ) : null}
                          </>
                        )}
                      </article>
                    </div>
                  ))}
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="grid grid-cols-1 gap-y-14 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-14">
                  {desktopFirstTwoCards.map((p) => (
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

                            <h4 className="text-[18px] font-semibold leading-tight text-[#D8CBB8] transition-all duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-[#E1D6C6] break-words">
                              <InlineTitleWithReadTime title={p.title} minutes={p.readTimeMinutes} />
                            </h4>

                            {p.excerpt ? (
                              <p className="mt-3 text-[13.5px] leading-relaxed text-[#B8B1A6] transition-colors duration-150 group-hover:text-[#C7C0B5]">
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
                            <h4 className="text-[18px] font-semibold leading-tight text-[#D8CBB8] break-words">
                              <InlineTitleWithReadTime title={p.title} minutes={p.readTimeMinutes} />
                            </h4>

                            {p.excerpt ? (
                              <p className="text-[13.5px] leading-relaxed text-[#B8B1A6]">{p.excerpt}</p>
                            ) : null}

                            {p.author ? (
                              <p className="mt-4 text-[11px] uppercase tracking-[0.20em] text-[#C67C4E]/55">
                                {p.author}
                              </p>
                            ) : null}
                          </>
                        )}
                      </article>
                    </div>
                  ))}
                </div>
              </div>

              {desktopMidFeature && desktopMidFeature.slug && (
                <article className="hidden lg:block border-t border-white/10 pt-8 pb-6 mt-12">
                  <Link
                    href={`/posts/${desktopMidFeature.slug}`}
                    className="group block no-underline hover:no-underline focus:outline-none"
                  >
                    <div className="space-y-5">
                      <div className="h-44 overflow-hidden bg-white/5 ring-1 ring-white/10">
                        {desktopMidFeature.heroImageUrl && (
                          <img
                            src={desktopMidFeature.heroImageUrl}
                            alt={desktopMidFeature.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
                            loading="lazy"
                          />
                        )}
                      </div>

                      <div className="max-w-3xl">
                        <h3
                          className={`${MAJOR_HEADLINE_SERIF_CLASS} text-[28px] font-semibold leading-[1.1] text-[#D8CBB8] transition-colors duration-150 group-hover:text-[#E1D6C6] break-words`}
                        >
                          <InlineTitleWithReadTime
                            title={desktopMidFeature.title}
                            minutes={desktopMidFeature.readTimeMinutes}
                          />
                        </h3>

                        {desktopMidFeature.excerpt && (
                          <p className="mt-3 text-[15px] leading-7 text-[#B8B1A6] transition-colors duration-150 group-hover:text-[#C7C0B5]">
                            {desktopMidFeature.excerpt}
                          </p>
                        )}

                        {desktopMidFeature.author ? (
                          <p className="mt-4 text-[11px] uppercase tracking-[0.20em] text-[#C67C4E]/55 transition-colors duration-150 group-hover:text-[#C67C4E]">
                            {desktopMidFeature.author}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                </article>
              )}

              <section className="hidden lg:block mt-16 border-t border-white/15 pt-10 mb-8 space-y-5">
                <SectionHeader title="Most Read" headlineTone />
                <AggregatorList
                  items={mostRead.map((m) => ({
                    id: m.id,
                    title: m.title,
                    href: m.href,
                    readTimeMinutes: m.readTimeMinutes,
                  }))}
                  maxItems={5}
                />
              </section>

              <div className="lg:hidden">
                <div className="mt-8 mb-8">
                  <DoubleBlueRule />
                </div>

                <section id="news-point-mobile" className="space-y-6">
                  <SectionHeader title="News Point" />
                  <NewsList items={newsItems} maxItems={6} />
                </section>

                <div className="mt-8 mb-8">
                  <DoubleBlueRule />
                </div>
              </div>

              <div className="lg:hidden">
                <div className="grid grid-cols-1 gap-y-16 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-14">
                  {mobilePostNewsFirstTwoCards.map((p) => (
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

                            <h4 className="text-[18px] font-semibold leading-tight text-[#D8CBB8] transition-all duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-[#E1D6C6] break-words">
                              <InlineTitleWithReadTime title={p.title} minutes={p.readTimeMinutes} />
                            </h4>

                            {p.excerpt ? (
                              <p className="mt-3 text-[13.5px] leading-relaxed text-[#B8B1A6] transition-colors duration-150 group-hover:text-[#C7C0B5]">
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
                            <h4 className="text-[18px] font-semibold leading-tight text-[#D8CBB8] break-words">
                              <InlineTitleWithReadTime title={p.title} minutes={p.readTimeMinutes} />
                            </h4>

                            {p.excerpt ? (
                              <p className="text-[13.5px] leading-relaxed text-[#B8B1A6]">{p.excerpt}</p>
                            ) : null}

                            {p.author ? (
                              <p className="mt-4 text-[11px] uppercase tracking-[0.20em] text-[#C67C4E]/55">
                                {p.author}
                              </p>
                            ) : null}
                          </>
                        )}
                      </article>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:hidden">
                <section className="mt-10 mb-8 space-y-5 border-t border-white/15 pt-8">
                  <SectionHeader title="Most Read" headlineTone />
                  <AggregatorList
                    items={mostRead.map((m) => ({
                      id: m.id,
                      title: m.title,
                      href: m.href,
                      readTimeMinutes: m.readTimeMinutes,
                    }))}
                    maxItems={5}
                  />
                </section>
              </div>

              <div className="lg:hidden">
                <div className="grid grid-cols-1 gap-y-16 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-14">
                  {mobilePostNewsRemainingCards.map((p) => (
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

                            <h4 className="text-[18px] font-semibold leading-tight text-[#D8CBB8] transition-all duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-[#E1D6C6] break-words">
                              <InlineTitleWithReadTime title={p.title} minutes={p.readTimeMinutes} />
                            </h4>

                            {p.excerpt ? (
                              <p className="mt-3 text-[13.5px] leading-relaxed text-[#B8B1A6] transition-colors duration-150 group-hover:text-[#C7C0B5]">
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
                            <h4 className="text-[18px] font-semibold leading-tight text-[#D8CBB8] break-words">
                              <InlineTitleWithReadTime title={p.title} minutes={p.readTimeMinutes} />
                            </h4>

                            {p.excerpt ? (
                              <p className="text-[13.5px] leading-relaxed text-[#B8B1A6]">{p.excerpt}</p>
                            ) : null}

                            {p.author ? (
                              <p className="mt-4 text-[11px] uppercase tracking-[0.20em] text-[#C67C4E]/55">
                                {p.author}
                              </p>
                            ) : null}
                          </>
                        )}
                      </article>
                    </div>
                  ))}
                </div>
              </div>

              <div className="hidden lg:block pt-10">
                <div className="grid grid-cols-1 gap-y-16 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-14">
                  {desktopRemainingCards.map((p) => (
                    <div key={p.id} className="space-y-6">
                      <article className="space-y-5 sm:space-y-6">
                        <div className="h-28 overflow-hidden bg-white/5 ring-1 ring-white/10">
                          {p.heroImageUrl && (
                            <img
                              src={p.heroImageUrl}
                              alt={p.title}
                              className="h-full w-full object-cover opacity-[0.92] transition-all duration-300 group-hover:opacity-100"
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

                            <h4 className="text-[18px] font-semibold leading-tight text-[#D8CBB8] transition-all duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-[#E1D6C6] break-words">
                              <InlineTitleWithReadTime title={p.title} minutes={p.readTimeMinutes} />
                            </h4>

                            {p.excerpt ? (
                              <p className="mt-3 text-[13.5px] leading-relaxed text-[#B8B1A6] transition-colors duration-150 group-hover:text-[#C7C0B5]">
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
                            <h4 className="text-[18px] font-semibold leading-tight text-[#D8CBB8] break-words">
                              <InlineTitleWithReadTime title={p.title} minutes={p.readTimeMinutes} />
                            </h4>

                            {p.excerpt ? (
                              <p className="text-[13.5px] leading-relaxed text-[#B8B1A6]">{p.excerpt}</p>
                            ) : null}

                            {p.author ? (
                              <p className="mt-4 text-[11px] uppercase tracking-[0.20em] text-[#C67C4E]/55">
                                {p.author}
                              </p>
                            ) : null}
                          </>
                        )}
                      </article>
                    </div>
                  ))}
                </div>
              </div>
            </div>

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

          <aside className="flex flex-col gap-14">
            <section className="hidden lg:block space-y-4">
              <SectionHeader title="News Point" />
              <NewsList items={newsItems} />
            </section>

            <section className="space-y-4">
              <SectionHeader title="Feed Read" headlineTone />
              <AggregatorList items={feedRead} maxItems={8} tone="subtle" />
            </section>

            <section className="space-y-4">
              <SectionHeader title="Strategic Insights" headlineTone />
              <AggregatorList items={strategicInsights} maxItems={5} tone="quiet" />
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}