

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
  source?: string;
  author?: string;
  heroImageUrl?: string;
};

type HomeLead = {
  id: string;
  type: "post" | "newsItem";
  title: string;
  excerpt?: string;
  slug?: string;
  heroImageUrl?: string;
  readTimeMinutes?: number;
  author?: string;
  source?: string;
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
  section: "commentary" | "news";
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

function getLeadHref(lead?: HomeLead) {
  if (!lead?.slug) return "#";
  return lead.type === "newsItem" ? `/news/${lead.slug}` : `/posts/${lead.slug}`;
}

function getLeadMetaLabel(lead?: HomeLead) {
  if (!lead) return undefined;
  if (lead.type === "newsItem") {
    return lead.source || lead.author;
  }
  return lead.author;
}

function getNewsByline(item?: Pick<NewsItem, "author" | "source">) {
  if (!item) return undefined;
  return item.author || item.source;
}

/* ---------- typography ---------- */

const MAJOR_HEADLINE_SERIF_CLASS = "font-serif tracking-[-0.022em]";

/* ---------- excerpt tone ---------- */

const EXCERPT_TEXT_CLASS = "text-[#CBC3B8]";
const EXCERPT_HOVER_TEXT_CLASS = "group-hover:text-[#D8D0C5]";

/* ---------- surface / divider system ---------- */

const THICK_DIVIDER_CLASS = "border-t border-white/[0.10]";
const MID_DIVIDER_CLASS = "border-t border-white/[0.12]";
const THIN_DIVIDER_CLASS = "border-t border-white/[0.08]";
const MOBILE_SECTION_RULE_CLASS =
  "h-px w-full bg-gradient-to-r from-transparent via-white/14 to-transparent";
const MOBILE_SECTION_RULE_SOFT_CLASS =
  "h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent";
const MOBILE_SECTION_RULE_SPACER_TOP_CLASS = "pt-0";
const MOBILE_SECTION_RULE_SPACER_BOTTOM_CLASS = "pb-0";
const EDITORIAL_PANEL_CLASS =
  "rounded-[18px] border border-white/[0.06] bg-[linear-gradient(180deg,rgba(13,17,24,0.86)_0%,rgba(9,13,20,0.90)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.025),0_14px_36px_rgba(0,0,0,0.18)]";
const INTELLIGENCE_PANEL_CLASS =
  "rounded-[18px] border border-white/[0.05] bg-[linear-gradient(180deg,rgba(10,13,18,0.95)_0%,rgba(7,10,15,0.97)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.018)]";

/* ---------- Read time UI ---------- */
/**
 * IMPORTANT:
 * - inline-flex + nowrap
 * - spacing handled by literal space {" "}
 * - never use margin-left on the badge
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

function InlineTitleWithReadTime({
  title,
  minutes,
}: {
  title: string;
  minutes?: number;
}) {
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

const explicitLeadQuery = `
  *[
    _type in ["post", "newsItem"] &&
    isLead == true
  ] | order(_updatedAt desc)[0]{
    _id,
    _type,
    title,
    excerpt,
    "author": coalesce(author, author->name, author.name, author->title, author.title),
    source,
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
  lead?: HomeLead;
  commentaryPosts: CommentaryPost[];
  newsItems: NewsItem[];
  feedRead: ExternalReadItem[];
  strategicInsights: ExternalReadItem[];
  mostRead: MostReadItem[];
}> {
  const [postDocs, newsDocs, feedDocs, explicitLeadDoc] = await Promise.all([
    client.fetch(commentaryHomeQuery),
    client.fetch(newsItemsQuery),
    client.fetch(allFeedDocsQuery),
    client.fetch(explicitLeadQuery),
  ]);

  const rawCommentaryPosts: CommentaryPost[] = (postDocs || []).map((p: any) => ({
    id: p._id,
    title: p.title,
    excerpt: p.excerpt,
    author: normalizeAuthor(p.author),
    date: formatDate(p.publishedAt),
    slug: p.slug,
    heroImageUrl: p.heroImageUrl,
    readTimeMinutes: typeof p.readTimeMinutes === "number" ? p.readTimeMinutes : undefined,
  }));

  const rawNewsItems: NewsItem[] = (newsDocs || []).map((n: any) => ({
    id: n._id,
    title: n.title,
    excerpt: n.excerpt,
    slug: n.slug,
    readTimeMinutes: typeof n.readTimeMinutes === "number" ? n.readTimeMinutes : undefined,
    source: typeof n.source === "string" ? n.source : undefined,
    author: normalizeAuthor(n.author),
    heroImageUrl: n.heroImageUrl,
  }));

  const explicitLead: HomeLead | undefined = explicitLeadDoc
    ? {
        id: explicitLeadDoc._id,
        type: explicitLeadDoc._type,
        title: explicitLeadDoc.title,
        excerpt: explicitLeadDoc.excerpt,
        slug: explicitLeadDoc.slug,
        heroImageUrl: explicitLeadDoc.heroImageUrl,
        readTimeMinutes:
          typeof explicitLeadDoc.readTimeMinutes === "number"
            ? explicitLeadDoc.readTimeMinutes
            : undefined,
        author: normalizeAuthor(explicitLeadDoc.author),
        source: typeof explicitLeadDoc.source === "string" ? explicitLeadDoc.source : undefined,
      }
    : undefined;

  const fallbackLead: HomeLead | undefined = rawCommentaryPosts[0]
    ? {
        id: rawCommentaryPosts[0].id,
        type: "post",
        title: rawCommentaryPosts[0].title,
        excerpt: rawCommentaryPosts[0].excerpt,
        slug: rawCommentaryPosts[0].slug,
        heroImageUrl: rawCommentaryPosts[0].heroImageUrl,
        readTimeMinutes: rawCommentaryPosts[0].readTimeMinutes,
        author: rawCommentaryPosts[0].author,
      }
    : undefined;

  const lead = explicitLead || fallbackLead;

  const commentaryPosts = rawCommentaryPosts.filter((p) => p.id !== lead?.id);
  const newsItems = rawNewsItems.filter((n) => n.id !== lead?.id);

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

  const mostRead = [
    ...commentaryPosts
      .filter((p) => !!p.slug)
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        title: p.title,
        href: `/posts/${p.slug}`,
        readTimeMinutes: p.readTimeMinutes,
        section: "commentary" as const,
      })),
    ...newsItems
      .filter((n) => !!n.slug)
      .slice(0, 5)
      .map((n) => ({
        id: n.id,
        title: n.title,
        href: `/news/${n.slug}`,
        readTimeMinutes: n.readTimeMinutes,
        section: "news" as const,
      })),
  ];

  return {
    lead,
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
    <div className="space-y-7">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2
            className={`whitespace-nowrap text-[12px] font-semibold uppercase tracking-[0.30em] ${
              headlineTone ? "text-[#E6DDD0]" : "text-[#9C9488]"
            }`}
          >
            {title}
          </h2>
          <div className="mt-2.5 flex items-center gap-2.5">
            <span className="block h-[2px] w-[54px] shrink-0 rounded-full bg-white/40" />
            <span className="block h-px min-w-0 flex-1 bg-white/12" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SmallSectionHeader({ title }: { title: string }) {
  return (
    <div className="space-y-2.5">
      <div className="inline-block min-w-0">
        <h3 className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.26em] text-[#9C9488]/92">
          {title}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="block h-[2px] w-[64px] rounded-full bg-[#C67C4E]/42" />
          <span className="block h-px w-10 bg-white/10" />
        </div>
      </div>
    </div>
  );
}

function HoverAccent() {
  return (
    <>
      <span className="pointer-events-none absolute -left-3 top-2 bottom-2 w-px bg-white/[0.08]" />
      <span className="pointer-events-none absolute -left-3 top-2 bottom-2 w-[2px] bg-transparent transition-colors duration-200 group-hover:bg-[#C67C4E]/92" />
    </>
  );
}

function NewsAccent() {
  return (
    <>
      <span className="pointer-events-none absolute -left-3 top-2 bottom-2 w-px bg-white/[0.10]" />
      <span className="pointer-events-none absolute -left-3 top-2 bottom-2 w-[2px] bg-[#C67C4E]/28 transition-colors duration-200 group-hover:bg-[#C67C4E]/92" />
    </>
  );
}

function FeaturedAccent() {
  return (
    <>
      <span className="pointer-events-none absolute -left-3 top-2 bottom-2 w-px bg-white/[0.10]" />
      <span className="pointer-events-none absolute -left-3 top-2 bottom-2 w-[2px] bg-[#C67C4E]/30 transition-colors duration-200 group-hover:bg-[#C67C4E]/92" />
    </>
  );
}

function LeadHoverAccent() {
  return (
    <>
      <span className="pointer-events-none absolute -left-3 top-2 bottom-2 w-px bg-white/[0.08]" />
      <span className="pointer-events-none absolute -left-3 top-2 bottom-2 w-[2px] bg-transparent transition-colors duration-150 group-hover:bg-[#C67C4E]/92" />
    </>
  );
}

function MobileCommentaryQuoteMark() {
  return (
    <span
      aria-hidden="true"
      className="relative left-[-5px] top-[2px] mr-[5px] inline-block text-[30px] leading-[0.9] text-[#F6EEE3]"
    >
      “
    </span>
  );
}

function inlineMeta(item: ExternalReadItem): string {
  const bits = [item.author, item.source].filter(Boolean) as string[];
  return bits.join(", ");
}

/* ---------- membership panels ---------- */

function CommentatorClubPanel() {
  return (
    <Link
      href="/club"
      className="group block no-underline hover:no-underline focus:outline-none"
      aria-label="Join The Commentator Club"
    >
      <section className="relative overflow-hidden rounded-[5px] bg-[linear-gradient(135deg,rgba(59,8,16,0.88)_0%,rgba(85,12,23,0.88)_38%,rgba(102,16,29,0.80)_72%,rgba(77,11,21,0.86)_100%)] px-7 py-7 transition-all duration-200 group-hover:shadow-[0_10px_24px_rgba(0,0,0,0.18)] sm:px-7 sm:py-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.03),transparent_32%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.015),rgba(0,0,0,0.06))]" />

        <div className="relative">
          <h3
            className={`${MAJOR_HEADLINE_SERIF_CLASS} text-[18.5px] font-semibold leading-[1.1] text-[#F1E4D8] transition-colors duration-150 group-hover:text-[#FAF3EC]`}
          >
            Join The Commentator Club
          </h3>

          <p className="mt-4 max-w-none text-[14.7px] leading-[1.84] text-[#E8D5C7] transition-colors duration-150 group-hover:text-[#F7EDE4]">
            A community of founders, CEOs, policymakers, and thinkers who 
            want to be part of the conversation, not outside it.
            Members get early insight into our ideas, contribute directly, and take
            part in discussions with the people shaping what comes next.
          </p>

          <div className="mt-5 inline-flex items-center gap-2 text-[13.35px] font-semibold text-[#F2E5D8] transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-white">
            <span>Learn more and join for $5 a month</span>
            <span aria-hidden="true">→</span>
          </div>
        </div>
      </section>
    </Link>
  );
}

function DesktopCommentatorClubPanel() {
  return (
    <Link
      href="/club"
      className="group block no-underline hover:no-underline focus:outline-none"
      aria-label="Join The Commentator Club"
    >
      <section className="relative overflow-hidden rounded-[5px] bg-[linear-gradient(135deg,rgba(59,8,16,0.90)_0%,rgba(85,12,23,0.90)_38%,rgba(102,16,29,0.82)_72%,rgba(77,11,21,0.88)_100%)] px-7 py-6 transition-all duration-200 group-hover:shadow-[0_18px_40px_rgba(0,0,0,0.24)] lg:px-8 lg:py-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.03),transparent_32%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.015),rgba(0,0,0,0.06))]" />

        <div className="relative">
          <h3
            className={`${MAJOR_HEADLINE_SERIF_CLASS} text-[19px] font-semibold leading-[1.06] text-[#F1E4D8] transition-colors duration-150 group-hover:text-[#FAF3EC] lg:text-[20px]`}
          >
            Join The Commentator Club
          </h3>

          <p className="mt-4 max-w-[64ch] text-[15.4px] leading-[1.78] text-[#E8D5C7] transition-colors duration-150 group-hover:text-[#F7EDE4] lg:text-[16px] lg:leading-[1.82]">
            A community of founders, CEOs, policymakers, and thinkers
            who want to be part of the conversation, not outside it.
            Members get early insight into our ideas, contribute directly, and take
            part in discussions with the people shaping what comes next.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 text-[15px] font-semibold text-[#F2E5D8] transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-white">
            <span>Learn more and join for $5 a month</span>
            <span aria-hidden="true">→</span>
          </div>
        </div>
      </section>
    </Link>
  );
}

function MobileMissionBlock() {
  return (
        <section className="overflow-hidden rounded-xl bg-[linear-gradient(180deg,#18212A_0%,#202A34_100%)] px-7 py-11 shadow-[inset_0_1px_0_rgba(255,255,255,0.025),inset_0_-1px_0_rgba(0,0,0,0.18)]">
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_top_center,rgba(255,255,255,0.02),transparent_46%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(109,139,170,0.045),transparent_56%)]" />

        <div className="relative mx-auto max-w-[19.5rem] text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#A7B5C3]">
            The Commentator’s Mission
          </p>

          <div className="mt-7">
            <p
              className={`${MAJOR_HEADLINE_SERIF_CLASS} text-[28px] font-semibold leading-[1.04] text-[#E8DFD3] sm:text-[29px]`}
            >
              Understanding Power in the Digital Revolution
            </p>

            <p
              className={`${MAJOR_HEADLINE_SERIF_CLASS} mt-6 text-[18px] leading-[1.12] text-[#B7C4D1] sm:text-[19px]`}
            >
              Where bridges are built in a polarized world
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function DesktopMissionBlock() {
  return (
        <section className="mx-auto mt-8 mb-4 w-full max-w-[44rem] overflow-hidden rounded-[18px] bg-[linear-gradient(180deg,rgba(24,33,42,0.72)_0%,rgba(32,42,52,0.68)_100%)] px-8 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.018),inset_0_-1px_0_rgba(0,0,0,0.14)]">
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_top_center,rgba(255,255,255,0.014),transparent_48%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(109,139,170,0.028),transparent_60%)]" />

        <div className="relative mx-auto max-w-[36rem] text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#A7B5C3]/92">
            The Commentator’s Mission
          </p>

          <div className="mt-4">
            <p
              className={`${MAJOR_HEADLINE_SERIF_CLASS} text-[28px] font-semibold leading-[1.04] text-[#E6DDD0]`}
            >
              Understanding Power in the Digital Revolution
            </p>

            <p
              className={`${MAJOR_HEADLINE_SERIF_CLASS} mt-2.5 text-[18px] leading-[1.12] text-[#B3C0CC]`}
            >
              Where bridges are built in a polarized world
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SubmitNewsTipsBand({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href="/contact"
      className={`group block no-underline hover:no-underline focus:outline-none ${className}`}
      aria-label="To submit news tips, please click here"
    >
      <div
        className={`rounded-[14px] bg-[linear-gradient(180deg,#0C5F48_0%,#084C3A_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.045),0_8px_22px_rgba(0,0,0,0.18)] transition-all duration-150 group-hover:translate-y-[-1px] group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.22)] ${
          compact ? "px-4 py-3" : "px-5 py-3.5"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <span
            className={`font-semibold uppercase text-white/92 ${
              compact ? "text-[12px] tracking-[0.18em]" : "text-[11px] tracking-[0.28em] lg:text-[10.5px]"
            }`}
          >
            To submit news tips, please click here
          </span>
          <span
            aria-hidden="true"
            className={`shrink-0 font-semibold text-white/88 transition-transform duration-150 group-hover:translate-x-0.5 ${
              compact ? "text-[14px]" : "text-[16px]"
            }`}
          >
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

function MostPopularRankedList({
  items,
  sectionTitle,
  startIndex = 1,
}: {
  items: MostReadItem[];
  sectionTitle: string;
  startIndex?: number;
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#E6DDD0]/88">
        {sectionTitle}
      </h3>

      <ol className="space-y-7">
        {items.map((item, index) => {
          const rank = startIndex + index;

          return (
            <li key={item.id} className="group">
              <Link
                href={item.href}
                className="grid grid-cols-[22px_1fr] items-start gap-3 no-underline transition-all duration-150 hover:no-underline group-hover:translate-x-0.5"
              >
                <span
                  className={`${MAJOR_HEADLINE_SERIF_CLASS} text-[22px] font-semibold leading-[1] text-[#EDE3D6]/90`}
                >
                  {rank}
                </span>

                <div className="min-w-0 pt-[1px]">
                  <span
                    className={`${MAJOR_HEADLINE_SERIF_CLASS} block text-[17px] font-semibold leading-[1.12] text-[#E7DDD0] transition-colors duration-150 group-hover:text-[#F3EBE0]`}
                  >
                    {item.title}
                  </span>

                  {item.readTimeMinutes ? (
                    <div className="mt-2">
                      <ReadTimeBadge minutes={item.readTimeMinutes} />
                    </div>
                  ) : null}
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function MobileMostPopularRankedList({
  items,
  sectionTitle,
  hrefBuilder,
  startIndex = 1,
}: {
  items: Array<{
    id: string;
    title: string;
    slug?: string;
    readTimeMinutes?: number;
  }>;
  sectionTitle: string;
  hrefBuilder: (slug?: string) => string;
  startIndex?: number;
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.30em] text-[#E6DDD0]/88">
        {sectionTitle}
      </h3>

      <ol className="space-y-7">
        {items.map((item, index) => {
          const rank = startIndex + index;

          return (
            <li key={item.id} className="group">
              <Link
                href={hrefBuilder(item.slug)}
                className="grid grid-cols-[28px_1fr] items-start gap-4 no-underline transition-all duration-150 hover:no-underline group-hover:translate-x-0.5"
                title={item.title}
              >
                <span
                  className={`${MAJOR_HEADLINE_SERIF_CLASS} text-[32px] font-semibold leading-[0.84] text-[#F1E7DA]`}
                >
                  {rank}
                </span>

                <div className="min-w-0 pt-[3px]">
                  <span
                    className={`${MAJOR_HEADLINE_SERIF_CLASS} block break-words text-[17px] font-semibold leading-[1.14] text-[#E7DDD0] transition-colors duration-150 group-hover:text-[#F3EBE0]`}
                  >
                    {item.title}
                  </span>

                  {item.readTimeMinutes ? (
                    <div className="mt-2">
                      <ReadTimeBadge minutes={item.readTimeMinutes} />
                    </div>
                  ) : null}
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function MobileMostPopularSection({
  commentaryItems,
  newsItems,
}: {
  commentaryItems: CommentaryPost[];
  newsItems: NewsItem[];
}) {
  return (
    <section className="relative mx-auto max-w-[34rem] pt-6">
      <div className="relative overflow-visible">
        {/* TOP IMAGE */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[392px] overflow-hidden">
          <img
            src="/most-popular-banner.jpg"
            alt="What readers are engaging with right now"
            className="absolute inset-0 h-full w-full object-cover object-[14%_top] opacity-[0.98]"
          />

          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(11,13,16,0.10),rgba(11,13,16,0.04)_24%,rgba(11,13,16,0.05)_56%,rgba(11,13,16,0.14)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(11,13,16,0.00)_0%,rgba(11,13,16,0.015)_16%,rgba(11,13,16,0.04)_38%,rgba(11,13,16,0.10)_68%,rgba(11,13,16,0.18)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_24%,rgba(255,255,255,0.18),rgba(255,255,255,0.08)_16%,transparent_34%)]" />
        </div>

        {/* FULL-HEIGHT BACKGROUND */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <img
            src="/most-popular-banner.jpg"
            alt=""
            aria-hidden="true"
                        className="absolute inset-0 h-full w-full object-cover object-[82%_38%] opacity-[0.52]"
          />

          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(11,13,16,0.15),rgba(11,13,16,0.07)_24%,rgba(11,13,16,0.08)_56%,rgba(11,13,16,0.16)_100%)]" />

          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(11,13,16,0.07)_0%,rgba(11,13,16,0.07)_16%,rgba(11,13,16,0.10)_30%,rgba(11,13,16,0.20)_42%,rgba(11,13,16,0.24)_54%,rgba(11,13,16,0.17)_68%,rgba(11,13,16,0.12)_82%,rgba(11,13,16,0.10)_100%)]" />

          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,transparent_28%,rgba(8,10,14,0.18)_36%,rgba(8,10,14,0.30)_46%,rgba(8,10,14,0.32)_56%,rgba(8,10,14,0.18)_66%,transparent_78%)]" />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_54%_82%,rgba(201,122,74,0.075),transparent_22%),radial-gradient(circle_at_74%_88%,rgba(68,122,214,0.070),transparent_20%),radial-gradient(circle_at_38%_92%,rgba(255,255,255,0.035),transparent_18%)]" />

          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(255,255,255,0.018)_0%,rgba(255,255,255,0.010)_10%,transparent_24%)]" />
        </div>

        {/* SIDE DISSOLVES */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-[linear-gradient(to_right,#0B0D10,rgba(11,13,16,0.62),rgba(11,13,16,0.22),transparent)]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-[linear-gradient(to_left,#0B0D10,rgba(11,13,16,0.62),rgba(11,13,16,0.22),transparent)]" />

        {/* CONTENT */}
        <div className="relative z-20 px-6 pt-[352px] pb-8">
          <div className="space-y-14">
            {commentaryItems.length > 0 ? (
              <MobileMostPopularRankedList
                items={commentaryItems}
                sectionTitle="Commentary"
                hrefBuilder={(slug) => (slug ? `/posts/${slug}` : "#")}
              />
            ) : null}

            {newsItems.length > 0 ? (
              <MobileMostPopularRankedList
                items={newsItems}
                sectionTitle="News"
                hrefBuilder={(slug) => (slug ? `/news/${slug}` : "#")}
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
/* ---------- lists ---------- */

function AggregatorList({
  items,
  maxItems,
  tone = "default",
  showAccent = true,
}: {
  items: ExternalReadItem[];
  maxItems: number;
  tone?: "default" | "subtle" | "quiet";
  showAccent?: boolean;
}) {
  const linkToneClass =
    tone === "quiet"
      ? "text-[#D6CEC2] group-hover:text-[#EEE4D6]"
      : tone === "subtle"
        ? "text-[#C9C0B3] group-hover:text-[#DED5C8]"
        : "text-[#DCCFBC] group-hover:text-[#E8DDCF]";

  const metaToneClass =
    tone === "quiet"
      ? "text-[#D1C5B6]/82"
      : tone === "subtle"
        ? "text-[#C67C4E]/90"
        : "text-[#C67C4E]";

  const separatorToneClass =
    tone === "quiet" ? "text-white/42" : tone === "subtle" ? "text-white/34" : "text-white/45";

  return (
    <ul className="space-y-0">
      {items.slice(0, maxItems).map((it, index) => {
        const meta = inlineMeta(it);
        const isInternal = it.href?.startsWith("/");
        const highlight = index === 0;

        const TitleRow = (
          <span className="font-medium">
            <InlineTitleWithReadTime title={it.title} minutes={it.readTimeMinutes} />
          </span>
        );

        return (
          <li
            key={it.id}
            className={`group relative overflow-visible ${highlight ? "rounded-[12px] bg-white/[0.015]" : ""}`}
          >
            {showAccent ? <HoverAccent /> : null}

            {isInternal ? (
              <Link
                href={it.href}
                className={`block px-0 py-3 text-[13.5px] leading-snug transition-all duration-150 group-hover:translate-x-0.5 no-underline hover:no-underline ${linkToneClass}`}
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
                className={`block px-0 py-3 text-[13.5px] leading-snug transition-all duration-150 group-hover:translate-x-0.5 ${linkToneClass}`}
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

function CommentaryList({ items, maxItems }: { items: CommentaryPost[]; maxItems: number }) {
  const usable = items.filter((p) => !!p.slug);

  return (
    <ul className="space-y-0">
      {usable.slice(0, maxItems).map((p, index) => (
        <li
          key={p.id}
          className="group relative overflow-visible"
        >
          <Link
            href={`/posts/${p.slug}`}
            className={`block no-underline hover:no-underline focus:outline-none transition-all duration-150 group-hover:translate-x-0.5 ${
  index === 0 ? "pt-1 pb-6" : "py-6"
}`}
            title={p.title}
          >
                        <div>
              <span
                className={`block break-words text-[17.25px] font-semibold leading-[1.12] text-[#D8CBB8] transition-colors duration-150 group-hover:text-[#E6DBCC] md:text-[17px] ${MAJOR_HEADLINE_SERIF_CLASS}`}
              >
                {p.title}
              </span>

              {p.readTimeMinutes ? (
                <div className="mt-2">
                  <ReadTimeBadge minutes={p.readTimeMinutes} />
                </div>
              ) : null}
            </div>

                                    {p.excerpt ? (
              <p className="mt-4 max-w-[56ch] text-[15px] leading-[1.8] text-[#D4CCC1] transition-colors duration-150 group-hover:text-[#E0D7CB]">
                {p.excerpt}
              </p>
            ) : null}

            {p.author ? (
              <span className="mt-5 block text-[12px] font-medium uppercase tracking-[0.24em] text-[#D08B5E]/88 transition-colors duration-150 group-hover:text-[#E29A69] md:mt-4 md:text-[11px] md:tracking-[0.20em] md:text-[#D08B5E]/84 md:group-hover:text-[#E29A69]">
                {p.author}
              </span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function MobileCommentaryFeature({ post }: { post: CommentaryPost }) {
  if (!post.slug) return null;

  return (
    <article className="space-y-10">
      <div className="h-64 overflow-hidden rounded-[2px] bg-white/5 ring-1 ring-white/10 sm:h-72">
        {post.heroImageUrl ? (
          <img
            src={post.heroImageUrl}
            alt={post.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : null}
      </div>

      <Link
        href={`/posts/${post.slug}`}
        className="group relative block overflow-visible no-underline hover:no-underline focus:outline-none"
      >
                <h3
          className={`${MAJOR_HEADLINE_SERIF_CLASS} break-words text-[22px] font-semibold leading-[1.1] text-[#D8CBB8] transition-all duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-[#E6DBCC] md:text-[21px] md:leading-[1.1]`}
        >
          <MobileCommentaryQuoteMark />
          <InlineTitleWithReadTime title={post.title} minutes={post.readTimeMinutes} />
        </h3>

        {post.excerpt ? (
          <p className="mt-4 text-[15.75px] leading-[1.78] text-[#DDD4C8] transition-colors duration-150 group-hover:text-[#E7DED2] md:mt-4 md:text-[15.25px] md:leading-[1.84]">
            {post.excerpt}
          </p>
        ) : null}

        {post.author ? (
          <p className="mt-5 text-[12px] font-medium uppercase tracking-[0.24em] text-[#D08B5E]/88 transition-colors duration-150 group-hover:text-[#E29A69] md:text-[11px] md:tracking-[0.20em] md:text-[#C67C4E]/60 md:group-hover:text-[#C67C4E]">
            {post.author}
          </p>
        ) : null}
      </Link>
    </article>
  );
}

function MobileCommentaryReentryFeature({ post }: { post: CommentaryPost }) {
  if (!post.slug) return null;

  return (
    <article className="group relative overflow-visible pb-14">
      <Link
        href={`/posts/${post.slug}`}
        className="block no-underline hover:no-underline focus:outline-none"
      >
                {post.heroImageUrl ? (
          <div className="mb-10 h-64 overflow-hidden rounded-[2px] bg-white/5 ring-1 ring-white/10 sm:h-72">
            <img
              src={post.heroImageUrl}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
              loading="lazy"
            />
          </div>
        ) : null}

                <h3
          className={`${MAJOR_HEADLINE_SERIF_CLASS} break-words text-[22px] font-semibold leading-[1.1] text-[#D8CBB8] transition-colors duration-150 group-hover:text-[#E6DBCC]`}
        >
          <MobileCommentaryQuoteMark />
          <InlineTitleWithReadTime title={post.title} minutes={post.readTimeMinutes} />
        </h3>

        {post.excerpt ? (
          <p className="mt-4 text-[15.75px] leading-[1.78] text-[#DDD4C8] transition-colors duration-150 group-hover:text-[#E7DED2]">
            {post.excerpt}
          </p>
        ) : null}

        {post.author ? (
          <p className="mt-5 text-[12px] font-medium uppercase tracking-[0.24em] text-[#D08B5E]/88 transition-colors duration-150 group-hover:text-[#E29A69]">
            {post.author}
          </p>
        ) : null}
      </Link>
    </article>
  );
}

function MobileMicroCommentaryList({ items }: { items: CommentaryPost[] }) {
  const usable = items.filter((p) => !!p.slug);

  return (
    <div className="space-y-0">
      {usable.map((p, index) => (
        <article
          key={p.id}
          className={`group relative overflow-visible ${
            index < usable.length - 1 ? "pb-14" : ""
          }`}
        >
          <Link
            href={`/posts/${p.slug}`}
            className="block no-underline hover:no-underline focus:outline-none"
            title={p.title}
          >
            <div className="min-w-0">
                            <h4
                className={`${MAJOR_HEADLINE_SERIF_CLASS} block break-words text-[18px] font-semibold leading-[1.1] text-[#D8CBB8] transition-colors duration-150 group-hover:text-[#E1D6C6]`}
              >
                <MobileCommentaryQuoteMark />
                <InlineTitleWithReadTime title={p.title} minutes={p.readTimeMinutes} />
              </h4>

              {p.excerpt ? (
                <p className="mt-4 text-[15.5px] leading-[1.8] text-[#DDD4C8] transition-colors duration-150 group-hover:text-[#E7DED2]">
                  {p.excerpt}
                </p>
              ) : null}

              {p.author ? (
                <p className="mt-5 text-[12px] font-medium uppercase tracking-[0.24em] text-[#D08B5E]/88 transition-colors duration-150 group-hover:text-[#E29A69]">
                  {p.author}
                </p>
              ) : null}
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
}

function MobileNewsPointPanel({ items }: { items: NewsItem[] }) {
  const featured = items[0];
  const secondaryItems = items.slice(1, 10);
  const hasMoreAfterFeatured = secondaryItems.length > 0;

  return (
    <section id="news-point-mobile" className="space-y-0">
      <div className="mb-12 flex items-end justify-between gap-5">
        <div className="min-w-0 flex-1">
          <h2
            className={`${MAJOR_HEADLINE_SERIF_CLASS} whitespace-nowrap text-[18px] font-semibold uppercase tracking-[0.12em] text-[#E1C29F]`}
          >
            News Point
          </h2>
          <div className="mt-3.5 flex items-center gap-2.5">
            <span className="block h-[2px] w-[78px] shrink-0 rounded-full bg-[#E1C29F]/95" />
            
          </div>
        </div>

        <a
          href="#mobile-commentary-start"
          className="mb-[6px] inline-flex shrink-0 items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/72 no-underline transition-colors duration-150 hover:text-white hover:no-underline"
        >
          <span>Commentary</span>
          <span className="h-px w-6 bg-white/30" />
        </a>
      </div>

      {featured ? (
        <article className={`group relative overflow-visible ${hasMoreAfterFeatured ? "pb-14" : ""}`}>
          <Link
            href={featured.slug ? `/news/${featured.slug}` : "#"}
            className="block pt-3 no-underline hover:no-underline"
          >
            {featured.heroImageUrl ? (
              <div className="mb-8 h-64 overflow-hidden rounded-[2px] bg-white/5 ring-1 ring-white/10 sm:h-72">
                <img
                  src={featured.heroImageUrl}
                  alt={featured.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                  loading="lazy"
                />
              </div>
            ) : null}

            <h3 className="break-words text-[22px] font-semibold leading-[1.14] text-[#EDE7DE] transition-colors duration-150 group-hover:text-[#F6F0E7]">
              {featured.title}
            </h3>

            {featured.readTimeMinutes ? (
              <div className="mt-4">
                <ReadTimeBadge minutes={featured.readTimeMinutes} />
              </div>
            ) : null}

            {featured.excerpt ? (
              <p className="mt-4 text-[15.5px] leading-[1.8] text-[#DDD4C8] transition-colors duration-150 group-hover:text-[#E7DED2]">
                {featured.excerpt}
              </p>
            ) : null}

            {getNewsByline(featured) ? (
              <p className="mt-5 text-[12px] font-medium uppercase tracking-[0.24em] text-[#D08B5E]/88 transition-colors duration-150 group-hover:text-[#E29A69]">
                {getNewsByline(featured)}
              </p>
            ) : null}
          </Link>
        </article>
      ) : null}

      {hasMoreAfterFeatured ? (
        <div className="space-y-0">
          {secondaryItems.map((n, index) => (
            <article
  key={n.id}
  className={`group relative overflow-visible ${
    index < secondaryItems.length - 1 ? "pb-16" : ""
  }`}
>
  <Link
    href={n.slug ? `/news/${n.slug}` : "#"}
    className="grid grid-cols-[104px_1fr] items-stretch gap-3 no-underline hover:no-underline focus:outline-none"
  >
    <div className="h-[112px] w-[104px] shrink-0 overflow-hidden rounded-[2px] bg-white/5 ring-1 ring-white/10">
      {n.heroImageUrl ? (
        <img
          src={n.heroImageUrl}
          alt={n.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          loading="lazy"
        />
      ) : (
        <div aria-hidden="true" className="h-full w-full bg-white/[0.04]" />
      )}
    </div>

    <div className="flex h-[112px] min-w-0 flex-col justify-between pr-1">
      <div className="min-w-0">
        <h4 className="line-clamp-3 break-words text-[16px] font-semibold leading-[1.1] text-[#D8CBB8] transition-colors duration-150 group-hover:text-[#E6DBCC]">
          {n.title}
        </h4>

        {n.readTimeMinutes ? (
          <div className="mt-2">
            <ReadTimeBadge minutes={n.readTimeMinutes} />
          </div>
        ) : null}
      </div>

      {getNewsByline(n) ? (
        <p className="pt-3 text-[10px] font-medium uppercase tracking-[0.17em] leading-[1.2] text-[#D08B5E]/84 transition-colors duration-150 group-hover:text-[#E29A69]">
          {getNewsByline(n)}
        </p>
      ) : null}
    </div>
  </Link>
</article>
          ))}
          <div className="pt-10 space-y-10">
            <div className="flex justify-end">
              <Link
                href="/news"
                className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/72 no-underline transition-colors duration-150 hover:text-white hover:no-underline"
              >
                <span>View all</span>
                <span className="h-px w-6 bg-white/30" />
              </Link>
            </div>

            <SubmitNewsTipsBand compact />
          </div>
        </div>
      ) : (
        <div className="mt-14">
          <SubmitNewsTipsBand compact />
        </div>
      )}
    </section>
  );
}

function DesktopNewsPointPanel({ items }: { items: NewsItem[] }) {
  const featured = items[0];
  const secondaryItems = items.slice(1, 10);
  const upperRows = secondaryItems.slice(0, 4);
  const lowerRows = secondaryItems.slice(4);

  return (
    <section className="space-y-8">
      <SectionHeader title="News Point" />

      {featured ? (
        <article className="group">
          <Link
            href={featured.slug ? `/news/${featured.slug}` : "#"}
            className="block no-underline hover:no-underline"
          >
            {featured.heroImageUrl ? (
              <div className="mb-10 h-[220px] overflow-hidden rounded-[2px] bg-white/5 ring-1 ring-white/10">
                <img
                  src={featured.heroImageUrl}
                  alt={featured.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                  loading="lazy"
                />
              </div>
            ) : null}

            <h3 className="break-words text-[21px] font-semibold leading-[1.16] text-[#E6E1D8] transition-colors duration-150 group-hover:text-[#F0EADF]">
              <InlineTitleWithReadTime title={featured.title} minutes={featured.readTimeMinutes} />
            </h3>

                        {featured.excerpt ? (
              <p
                className={`mt-3.5 text-[14px] leading-[1.78] line-clamp-3 ${EXCERPT_TEXT_CLASS} transition-colors duration-150 ${EXCERPT_HOVER_TEXT_CLASS}`}
              >
                {featured.excerpt}
              </p>
            ) : null}

            {getNewsByline(featured) ? (
              <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-[#C67C4E]/58 transition-colors duration-150 group-hover:text-[#C67C4E]">
                {getNewsByline(featured)}
              </p>
            ) : null}
          </Link>
        </article>
      ) : null}

      {upperRows.length > 0 ? (
        <div className="space-y-8">
          {upperRows.map((n) => (
            <article key={n.id} className="group">
              <Link
                href={n.slug ? `/news/${n.slug}` : "#"}
                className="grid grid-cols-[1fr_112px] items-end gap-5 no-underline hover:no-underline"
              >
                <div className="min-w-0 self-end">
                  <h4 className="break-words text-[15px] font-semibold leading-[1.28] text-[#E0D7CA] transition-colors duration-150 group-hover:text-[#F0EADF]">
                    <InlineTitleWithReadTime title={n.title} minutes={n.readTimeMinutes} />
                  </h4>

                                    {n.excerpt ? (
                    <p
                      className={`mt-2.5 text-[14px] leading-[1.78] line-clamp-3 ${EXCERPT_TEXT_CLASS} transition-colors duration-150 ${EXCERPT_HOVER_TEXT_CLASS}`}
                    >
                      {n.excerpt}
                    </p>
                  ) : null}

                  {getNewsByline(n) ? (
                    <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-[#C67C4E]/58 transition-colors duration-150 group-hover:text-[#C67C4E]">
                      {getNewsByline(n)}
                    </p>
                  ) : null}
                </div>

                <div className="h-[84px] w-[112px] self-end justify-self-end overflow-hidden rounded-[2px] bg-white/5 ring-1 ring-white/10">
                  {n.heroImageUrl ? (
                    <img
                      src={n.heroImageUrl}
                      alt={n.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
                      loading="lazy"
                    />
                  ) : (
                    <div aria-hidden="true" className="h-full w-full bg-white/[0.04]" />
                  )}
                </div>
              </Link>
            </article>
          ))}
        </div>
      ) : null}

      {lowerRows.length > 0 ? (
        <div className="space-y-8">
          {lowerRows.map((n) => (
            <article key={n.id} className="group">
              <Link
                href={n.slug ? `/news/${n.slug}` : "#"}
                className="grid grid-cols-[1fr_112px] items-end gap-5 no-underline hover:no-underline"
              >
                <div className="min-w-0 self-end">
                  <h4 className="break-words text-[15px] font-semibold leading-[1.28] text-[#E0D7CA] transition-colors duration-150 group-hover:text-[#F0EADF]">
                    <InlineTitleWithReadTime title={n.title} minutes={n.readTimeMinutes} />
                  </h4>

                                    {n.excerpt ? (
                    <p
                      className={`mt-2.5 text-[14px] leading-[1.78] line-clamp-3 ${EXCERPT_TEXT_CLASS} transition-colors duration-150 ${EXCERPT_HOVER_TEXT_CLASS}`}
                    >
                      {n.excerpt}
                    </p>
                  ) : null}

                  {getNewsByline(n) ? (
                    <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-[#C67C4E]/58 transition-colors duration-150 group-hover:text-[#C67C4E]">
                      {getNewsByline(n)}
                    </p>
                  ) : null}
                </div>

                <div className="h-[84px] w-[112px] self-end justify-self-end overflow-hidden rounded-[2px] bg-white/5 ring-1 ring-white/10">
                  {n.heroImageUrl ? (
                    <img
                      src={n.heroImageUrl}
                      alt={n.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
                      loading="lazy"
                    />
                  ) : (
                    <div aria-hidden="true" className="h-full w-full bg-white/[0.04]" />
                  )}
                </div>
              </Link>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function DesktopCommentaryMiniStack({ items }: { items: CommentaryPost[] }) {
  return (
    <div className="pt-6">
      <div className="space-y-10">
        {items.map((p) => (
          <article key={p.id}>
            <Link
              href={p.slug ? `/posts/${p.slug}` : "#"}
              className="group block no-underline hover:no-underline focus:outline-none"
            >
              <div className="grid grid-cols-[1fr_112px] items-end gap-5">
                <div className="min-w-0 self-end">
                  <h4
                    className={`${MAJOR_HEADLINE_SERIF_CLASS} break-words text-[17px] font-semibold leading-[1.16] text-[#DDD1BF] transition-colors duration-150 group-hover:text-[#E6DAC9]`}
                  >
                    <InlineTitleWithReadTime title={p.title} minutes={p.readTimeMinutes} />
                  </h4>

                  {p.excerpt ? (
                    <p
                      className={`mt-3.5 max-w-[62ch] text-[15px] leading-[1.8] line-clamp-2 text-[#D4CCC1] transition-colors duration-150 group-hover:text-[#E0D7CB]`}
                    >
                      {p.excerpt}
                    </p>
                  ) : null}

                  {p.author ? (
                    <p className="mt-4 text-[10px] uppercase tracking-[0.20em] text-[#D08B5E]/84 transition-colors duration-150 group-hover:text-[#E29A69]">
                      {p.author}
                    </p>
                  ) : null}
                </div>

                <div className="h-[84px] w-[112px] self-end justify-self-end overflow-hidden rounded-[2px] bg-white/5 ring-1 ring-white/10">
                  {p.heroImageUrl ? (
                    <img
                      src={p.heroImageUrl}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
                      loading="lazy"
                    />
                  ) : (
                    <div aria-hidden="true" className="h-full w-full bg-white/[0.04]" />
                  )}
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}

function DesktopCommentaryReentryFeature({ post }: { post: CommentaryPost }) {
  if (!post.slug) return null;

  return (
    <article className="group relative overflow-visible py-6">
      <Link
        href={`/posts/${post.slug}`}
        className="block no-underline hover:no-underline focus:outline-none"
      >
        {post.heroImageUrl ? (
          <div className="mb-7 h-[178px] w-full overflow-hidden rounded-[2px] bg-white/5 ring-1 ring-white/10">
            <img
              src={post.heroImageUrl}
              alt={post.title}
              className="h-full w-full object-cover object-[50%_32%] transition-transform duration-500 group-hover:scale-[1.01]"
              loading="lazy"
            />
          </div>
        ) : null}

                <h3
          className={`${MAJOR_HEADLINE_SERIF_CLASS} block break-words text-[17.25px] font-semibold leading-[1.12] text-[#D8CBB8] transition-colors duration-150 group-hover:text-[#E6DBCC] md:text-[17px]`}
        >
          <InlineTitleWithReadTime title={post.title} minutes={post.readTimeMinutes} />
        </h3>

        {post.excerpt ? (
          <p className="mt-4 max-w-[56ch] text-[15px] leading-[1.8] text-[#D4CCC1] transition-colors duration-150 group-hover:text-[#E0D7CB]">
            {post.excerpt}
          </p>
        ) : null}

        {post.author ? (
          <p className="mt-5 text-[10px] uppercase tracking-[0.20em] text-[#D08B5E]/84 transition-colors duration-150 group-hover:text-[#E29A69]">
            {post.author}
          </p>
        ) : null}
      </Link>
    </article>
  );
}

function MobileMoreCommentaryList({ items }: { items: CommentaryPost[] }) {
  const usable = items.filter((p) => !!p.slug);

  return (
    <div className="space-y-0">
      {usable.map((p, index) => {
        const useThumbnailLayout = !!p.heroImageUrl && index % 3 === 1;

                        if (useThumbnailLayout) {
          return (
            <article
              key={p.id}
              className={`group relative overflow-visible ${
                index < usable.length - 1 ? "pb-14" : ""
              }`}
            >
              <Link
                href={`/posts/${p.slug}`}
                className="block no-underline hover:no-underline focus:outline-none"
                title={p.title}
              >
                <h4
                  className={`${MAJOR_HEADLINE_SERIF_CLASS} break-words text-[18px] font-semibold leading-[1.1] text-[#D8CBB8] transition-colors duration-150 group-hover:text-[#E1D6C6]`}
                >
                  <MobileCommentaryQuoteMark />
                  <InlineTitleWithReadTime title={p.title} minutes={p.readTimeMinutes} />
                </h4>

                <div className="mt-4 grid grid-cols-[96px_minmax(0,1fr)] items-start gap-4">
                  <div className="h-[118px] w-[96px] shrink-0 overflow-hidden rounded-[2px] bg-white/5 ring-1 ring-white/10">
                    <img
                      src={p.heroImageUrl}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                  </div>

                  <div className="min-w-0">
                    {p.excerpt ? (
                      <p className="line-clamp-4 text-[15.5px] leading-[1.8] text-[#DDD4C8] transition-colors duration-150 group-hover:text-[#E7DED2]">
                        {p.excerpt}
                      </p>
                    ) : null}

                    {p.author ? (
                      <p className="mt-5 text-[12px] font-medium uppercase tracking-[0.24em] text-[#D08B5E]/88 transition-colors duration-150 group-hover:text-[#E29A69]">
                        {p.author}
                      </p>
                    ) : null}
                  </div>
                </div>
              </Link>
            </article>
          );
        }

        return (
          <article
            key={p.id}
            className={`group relative overflow-visible ${
              index < usable.length - 1 ? "pb-14" : ""
            }`}
          >
            <Link
              href={`/posts/${p.slug}`}
              className="block no-underline hover:no-underline focus:outline-none"
              title={p.title}
            >
              <div className="min-w-0">
                <h4
                  className={`${MAJOR_HEADLINE_SERIF_CLASS} block break-words text-[18px] font-semibold leading-[1.1] text-[#D8CBB8] transition-colors duration-150 group-hover:text-[#E1D6C6]`}
                >
                  <MobileCommentaryQuoteMark />
                  <InlineTitleWithReadTime title={p.title} minutes={p.readTimeMinutes} />
                </h4>

                {p.excerpt ? (
                  <p className="mt-4 text-[15.5px] leading-[1.8] text-[#DDD4C8] transition-colors duration-150 group-hover:text-[#E7DED2]">
                    {p.excerpt}
                  </p>
                ) : null}

                {p.author ? (
                  <p className="mt-5 text-[12px] font-medium uppercase tracking-[0.24em] text-[#D08B5E]/88 transition-colors duration-150 group-hover:text-[#E29A69]">
                    {p.author}
                  </p>
                ) : null}
              </div>
            </Link>
          </article>
        );
      })}
    </div>
  );
}

/* ---------- page ---------- */

export default async function HomePage() {
  const { lead, commentaryPosts, newsItems, feedRead, strategicInsights, mostRead } =
    await getHomeData();

  const leadHref = getLeadHref(lead);
  const leadMeta = getLeadMetaLabel(lead);

  const secondaryLead = commentaryPosts[0];

    const mobileFeaturedCommentary = commentaryPosts[0];
  const mobilePreClubMicroCards = commentaryPosts.slice(1, 2);
  const mobilePostClubMicroCards = commentaryPosts.slice(2, 3);
  const mobileMostPopularCommentary = commentaryPosts.slice(0, 5);
const mobileMostPopularNews = newsItems.slice(0, 5);

    const desktopMiniFeatures = commentaryPosts.slice(1, 5);
  const commentaryStream = commentaryPosts.slice(5);

  const desktopMoreCommentaryBeforePenultimate =
    commentaryStream.length > 1 ? commentaryStream.slice(0, -2) : [];

  const desktopMoreCommentaryPenultimate =
    commentaryStream.length > 1
      ? commentaryStream[commentaryStream.length - 2]
      : undefined;

  const desktopMoreCommentaryLast =
    commentaryStream.length > 0
      ? commentaryStream[commentaryStream.length - 1]
      : undefined;

  const mobileCommentaryStream = commentaryPosts.slice(3);
  const mobileReentryFeature = mobileCommentaryStream[0];
  const mobileReentryList = mobileCommentaryStream.slice(1);

  const mobileMoreCommentaryBeforePenultimate =
    mobileReentryList.length > 1 ? mobileReentryList.slice(0, -2) : [];

  const mobileMoreCommentaryPenultimate =
    mobileReentryList.length > 1
      ? mobileReentryList[mobileReentryList.length - 2]
      : undefined;

  const mobileMoreCommentaryLast =
    mobileReentryList.length > 0
      ? mobileReentryList[mobileReentryList.length - 1]
      : undefined;

  const desktopMostPopularCommentary = mostRead.filter((item) => item.section === "commentary");
  const desktopMostPopularNews = mostRead.filter((item) => item.section === "news");

  return (
    <main className="min-h-screen bg-[#0B0D10] text-[#E6E9EE]">
      <Header />

      {lead && lead.slug && (
        <section
  id={lead?.type === "post" ? "mobile-commentary-start" : undefined}
  className="mx-auto max-w-6xl px-6 pt-12 pb-10 lg:hidden"
>
          <Link
            href={leadHref}
            className="group block no-underline hover:no-underline focus:outline-none"
          >
            <article className="space-y-5">
              <div className="h-64 overflow-hidden bg-white/5 ring-1 ring-white/10 sm:h-72">
                {lead.heroImageUrl && (
                  <img
                    src={lead.heroImageUrl}
                    alt={lead.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                )}
              </div>

              <div className="relative overflow-visible">
                <h1
                  className={`${MAJOR_HEADLINE_SERIF_CLASS} mt-7 text-[42px] font-semibold leading-[1.08] text-[#D8CBB8] transition-all duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-[#E1D6C6] break-words sm:text-[44px]`}
                >
                  <InlineTitleWithReadTime title={lead.title} minutes={lead.readTimeMinutes} />
                </h1>

                {lead.excerpt && (
                  <p className="mt-4 max-w-[34ch] text-[18px] leading-[1.8] text-[#DDD4C8] transition-colors duration-150 group-hover:text-[#E7DED2]">
                    {lead.excerpt}
                  </p>
                )}

                {leadMeta ? (
                  <p className="mt-6 text-[12px] font-medium uppercase tracking-[0.24em] text-white/72 transition-colors duration-150 group-hover:text-[#C67C4E]">
                    {leadMeta}
                  </p>
                ) : null}
              </div>
            </article>
          </Link>
        </section>
      )}

      <div className="mx-auto max-w-6xl px-6 pb-10">
        {/* ---------- mobile ---------- */}
        <div className="lg:hidden">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:gap-14">
            <section className="space-y-14">
              {mobileFeaturedCommentary ? (
                <section
  id={lead?.type !== "post" ? "mobile-commentary-start" : undefined}
  className="mt-6"
>
                                    <div className="mb-12 flex items-end justify-between gap-5">
                    <div className="min-w-0 flex-1">
                      <h2
                        className={`${MAJOR_HEADLINE_SERIF_CLASS} whitespace-nowrap text-[14px] font-semibold uppercase tracking-[0.12em] text-[#E1C29F]`}
                      >
                        Commentary
                      </h2>
                      <div className="mt-3.5 flex items-center gap-2.5">
                        <span className="block h-[2px] w-[78px] shrink-0 rounded-full bg-[#E1C29F]/95" />
                      </div>
                    </div>

                    <a
                      href="#news-point-mobile"
                      className="pt-[18px] inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/72 no-underline transition-colors duration-150 hover:text-white hover:no-underline"
                    >
                      <span>News Point</span>
                      <span className="h-px w-6 bg-white/30" />
                    </a>
                  </div>
                  <div>
                    <MobileCommentaryFeature post={mobileFeaturedCommentary} />
                  </div>
                </section>
              ) : null}

                            {mobilePreClubMicroCards.length > 0 ? (
                <section className="mt-12">
                  <MobileMicroCommentaryList items={mobilePreClubMicroCards} />
                </section>
              ) : null}

              <section className="mt-10">
  <CommentatorClubPanel />
</section>

                            {mobilePostClubMicroCards.length > 0 ? (
                <section className="mt-16">
                  <MobileMicroCommentaryList items={mobilePostClubMicroCards} />
                </section>
              ) : null}

              <section className="mt-13">
                <MobileNewsPointPanel items={newsItems} />
              </section>

                                          <section className="mt-0 pt-0">
                <MobileMostPopularSection
                  commentaryItems={mobileMostPopularCommentary}
                  newsItems={mobileMostPopularNews}
                />
              </section>
              <div className="pt-6 pb-6">
                <MobileMissionBlock />
              </div>

              <section className="mt-0">
                <div className="space-y-0">
                  <div className="mt-10 mb-3">
                    <div className="text-[12px] tracking-[0.18em] text-white/60 uppercase">
                      More Commentary
                    </div>
                    <div className="mt-2 h-px w-14 bg-[#8B8F96]" />
                  </div>

                                    
                                        {mobileReentryFeature ? (
                    <div className="pt-[36px]">
                      <MobileCommentaryReentryFeature post={mobileReentryFeature} />
                    </div>
                  ) : null}

                  {mobileMoreCommentaryBeforePenultimate.length > 0 ? (
  <MobileMoreCommentaryList items={mobileMoreCommentaryBeforePenultimate} />
) : null}

                  {mobileMoreCommentaryPenultimate ? (
                    <div className="pt-8">
                      <MobileCommentaryReentryFeature post={mobileMoreCommentaryPenultimate} />
                    </div>
                  ) : null}

                                    {mobileMoreCommentaryLast ? (
  <div className="pb-14">
    <MobileMoreCommentaryList items={[mobileMoreCommentaryLast]} />
  </div>
) : null}

                  
                </div>
              </section>

                                                                                                                                                                                                                                                                                                                                                                                                                                    <aside className="flex flex-col gap-14 pt-0">
                <section className="space-y-0">
                  <SectionHeader title="Feed Read" headlineTone />
                  <div className="mt-16">
                    <AggregatorList
                      items={feedRead}
                      maxItems={8}
                      tone="subtle"
                      showAccent={false}
                    />
                  </div>
                </section>

                <section className="space-y-0">
                  <SectionHeader title="Strategic Insights" headlineTone />
                  <div className="mt-16">
                    <AggregatorList
                      items={strategicInsights}
                      maxItems={5}
                      tone="quiet"
                      showAccent={false}
                    />
                  </div>
                </section>
              </aside>

                            <div className="mt-14 mb-10 h-[2px] w-full bg-white/30" />

              <div className="mt-16 mb-6 text-center">
                <div className="mx-auto w-full max-w-[20rem] space-y-8">
                  <Link
                    href="/about"
                    className="block text-[15px] font-semibold uppercase tracking-[0.34em] text-[#D7A27B] no-underline transition-colors duration-150 hover:text-[#E6B089] hover:no-underline"
                  >
                    ABOUT
                  </Link>

                  <Link
                    href="/club"
                    className="block text-[15px] font-semibold uppercase tracking-[0.34em] text-[#D7A27B] no-underline transition-colors duration-150 hover:text-[#E6B089] hover:no-underline"
                  >
                    COMMENTATOR CLUB
                  </Link>

                  <Link
                    href="/search"
                    className="block text-[15px] font-semibold uppercase tracking-[0.34em] text-[#D7A27B] no-underline transition-colors duration-150 hover:text-[#E6B089] hover:no-underline"
                  >
                    SEARCH
                  </Link>

                                                      <Link
                    href="/contact"
                    className="block text-[15px] font-semibold uppercase tracking-[0.34em] text-[#D7A27B] no-underline transition-colors duration-150 hover:text-[#E6B089] hover:no-underline"
                  >
                    CONTACT
                  </Link>
                </div>

                                <div className="mt-12 mb-12 flex justify-center">
  <div className="h-[2px] w-40 bg-white/30" />
</div>
              </div>
            </section>
          </div>
        </div>

        {/* ---------- desktop ---------- */}
        <div className="hidden lg:grid lg:grid-cols-[1.5fr_0.68fr] lg:gap-14 lg:pt-14">
          <div className="space-y-16">
            {lead && lead.slug ? (
              <Link
                href={leadHref}
                className="group block no-underline hover:no-underline focus:outline-none"
              >
                <article className="relative h-[332px] overflow-hidden bg-white/5 lg:-ml-4 lg:w-[calc(100%+1rem)]">
                  {lead.heroImageUrl && (
                    <img
                      src={lead.heroImageUrl}
                      alt={lead.title}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D10] via-[#0B0D10]/84 via-[22%] via-[#0B0D10]/48 via-[46%] to-[#0B0D10]/12" />
                  <div className="absolute left-0 top-0 h-full w-[13rem] bg-gradient-to-r from-[#0B0D10] via-[#0B0D10]/68 to-transparent" />
                  <div className="absolute left-0 top-0 h-full w-[34%] bg-[#0B0D10]/14" />
                  <div className="absolute left-0 top-0 h-full w-[78%] bg-[radial-gradient(circle_at_left_center,rgba(11,13,16,0.58),rgba(11,13,16,0.34)_34%,rgba(11,13,16,0.12)_60%,transparent_84%)]" />
                  <div className="absolute -left-[6%] top-0 h-full w-[26%] bg-[radial-gradient(circle_at_left_center,rgba(11,13,16,0.92),rgba(11,13,16,0.42)_50%,rgba(11,13,16,0.08)_78%,transparent_100%)]" />
                  <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(11,13,16,0.14),rgba(11,13,16,0.30))]" />

                  <div className="relative z-10 flex h-full items-center px-10">
                    <div className="relative max-w-[34rem] translate-y-[6px] overflow-visible">
                      <h1
                        className={`${MAJOR_HEADLINE_SERIF_CLASS} text-[42px] font-semibold leading-[1.08] text-[#E6DDD0] [text-shadow:0_1px_2px_rgba(0,0,0,0.42)] transition-all duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-[#F0E7D9] break-words`}
                      >
                        <InlineTitleWithReadTime title={lead.title} minutes={lead.readTimeMinutes} />
                      </h1>

                      {lead.excerpt && (
                        <p className="mt-4 max-w-[32ch] text-[16px] leading-[1.72] text-[#D6CCBF] transition-colors duration-150 group-hover:text-[#E1D7CA]">
                          {lead.excerpt}
                        </p>
                      )}

                      {leadMeta ? (
                        <p className="mt-4 text-[11px] uppercase tracking-[0.20em] text-[#C67C4E] transition-colors duration-150 group-hover:text-[#D58B5D]">
                          {leadMeta}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </article>
              </Link>
            ) : null}

            <div>
              <section className="space-y-12">
                <div className="hidden lg:block pt-1">
                  <SectionHeader title="Commentary" />
                </div>

                <div className="space-y-0">
                        {secondaryLead && secondaryLead.slug ? (
        <article className="mt-0 mb-8 pt-3">
          <Link
            href={`/posts/${secondaryLead.slug}`}
            className="group block no-underline hover:no-underline focus:outline-none"
          >
            <div className="grid gap-7 lg:grid-cols-[1.18fr_0.82fr] lg:items-stretch">
              <div className="flex h-[260px] flex-col justify-between">
                <div className="-mt-[8px]">
                  <h3
                    className={`${MAJOR_HEADLINE_SERIF_CLASS} max-w-[20ch] text-[30px] font-semibold leading-[1.09] text-[#D8CBB8] transition-colors duration-150 group-hover:text-[#E1D6C6] break-words`}
                  >
                    <InlineTitleWithReadTime
                      title={secondaryLead.title}
                      minutes={secondaryLead.readTimeMinutes}
                    />
                  </h3>

                  {secondaryLead.excerpt ? (
                    <p
                      className={`mt-6 max-w-[34rem] text-[15px] leading-7 ${EXCERPT_TEXT_CLASS} transition-colors duration-150 ${EXCERPT_HOVER_TEXT_CLASS}`}
                    >
                      {secondaryLead.excerpt}
                    </p>
                  ) : null}
                            </div>

                            {secondaryLead.author ? (
                              <p className="text-[11px] uppercase tracking-[0.20em] text-[#D08B5E]/88 transition-colors duration-150 group-hover:text-[#E29A69]">
                                {secondaryLead.author}
                              </p>
                            ) : null}
                          </div>

                          <div className="h-[260px] overflow-hidden rounded-[2px] bg-white/5 ring-1 ring-white/10">
                            {secondaryLead.heroImageUrl ? (
                              <img
                                src={secondaryLead.heroImageUrl}
                                alt={secondaryLead.title}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.012]"
                                loading="lazy"
                              />
                            ) : null}
                          </div>
                        </div>
                      </Link>
                    </article>
                  ) : null}

                  {desktopMiniFeatures.length > 0 ? (
                    <DesktopCommentaryMiniStack items={desktopMiniFeatures} />
                  ) : null}
                </div>

                <section className="w-full max-w-none pt-10 pb-4">
                  <DesktopCommentatorClubPanel />
                </section>

                <div className="pt-8 pb-0">
                  <div className="text-[10px] uppercase tracking-[0.24em] text-white/60">
                    More Commentary
                  </div>
                </div>

                                <div className="space-y-4 mt-0">
                                    {desktopMoreCommentaryBeforePenultimate.length > 0 ? (
                    <div className="space-y-10">
                      {desktopMoreCommentaryBeforePenultimate.map((p, index) => {
                        const useThumbnailLayout =
                          !!p.heroImageUrl && (index === 0 || index === 2 || index === 5);

                        if (useThumbnailLayout) {
                          return (
                            <article key={p.id}>
                              <Link
                                href={p.slug ? `/posts/${p.slug}` : "#"}
                                className="group block no-underline hover:no-underline focus:outline-none"
                              >
                                <h4
                                  className={`${MAJOR_HEADLINE_SERIF_CLASS} break-words text-[17.25px] font-semibold leading-[1.12] text-[#D8CBB8] transition-colors duration-150 group-hover:text-[#E6DBCC] md:text-[17px]`}
                                >
                                  <InlineTitleWithReadTime
                                    title={p.title}
                                    minutes={p.readTimeMinutes}
                                  />
                                </h4>

                                <div className="mt-4 grid grid-cols-[112px_minmax(0,1fr)] items-start gap-5">
                                  <div className="h-[96px] w-[112px] shrink-0 overflow-hidden rounded-[2px] bg-white/5 ring-1 ring-white/10">
                                    <img
                                      src={p.heroImageUrl}
                                      alt={p.title}
                                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
                                      loading="lazy"
                                    />
                                  </div>

                                  <div className="min-w-0">
                                    {p.excerpt ? (
                                      <p className="text-[15px] leading-[1.8] text-[#D4CCC1] transition-colors duration-150 group-hover:text-[#E0D7CB]">
                                        {p.excerpt}
                                      </p>
                                    ) : null}

                                    {p.author ? (
                                      <p className="mt-5 text-[10px] uppercase tracking-[0.20em] text-[#D08B5E]/84 transition-colors duration-150 group-hover:text-[#E29A69]">
                                        {p.author}
                                      </p>
                                    ) : null}
                                  </div>
                                </div>
                              </Link>
                            </article>
                          );
                        }

                        return (
                          <article key={p.id}>
                            <Link
                              href={p.slug ? `/posts/${p.slug}` : "#"}
                              className="group block no-underline hover:no-underline focus:outline-none"
                            >
                              <h4
                                className={`${MAJOR_HEADLINE_SERIF_CLASS} break-words text-[17.25px] font-semibold leading-[1.12] text-[#D8CBB8] transition-colors duration-150 group-hover:text-[#E6DBCC] md:text-[17px]`}
                              >
                                <InlineTitleWithReadTime
                                  title={p.title}
                                  minutes={p.readTimeMinutes}
                                />
                              </h4>

                              {p.excerpt ? (
                                <p className="mt-4 max-w-[56ch] text-[15px] leading-[1.8] text-[#D4CCC1] transition-colors duration-150 group-hover:text-[#E0D7CB]">
                                  {p.excerpt}
                                </p>
                              ) : null}

                              {p.author ? (
                                <p className="mt-5 text-[10px] uppercase tracking-[0.20em] text-[#D08B5E]/84 transition-colors duration-150 group-hover:text-[#E29A69]">
                                  {p.author}
                                </p>
                              ) : null}
                            </Link>
                          </article>
                        );
                      })}
                    </div>
                  ) : null}

                  {desktopMoreCommentaryPenultimate ? (
                    <DesktopCommentaryReentryFeature post={desktopMoreCommentaryPenultimate} />
                  ) : null}

                  {desktopMoreCommentaryLast ? (
                    <CommentaryList items={[desktopMoreCommentaryLast]} maxItems={1} />
                  ) : null}

                  
                </div>

    <section className="relative max-w-[34rem] pt-16">
  <div className="relative overflow-visible">

    {/* TOP IMAGE */}
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[392px] overflow-hidden">
      <img
        src="/most-popular-banner.jpg"
        alt="What readers are engaging with right now"
        className="absolute inset-0 h-full w-full object-cover object-[28%_top] opacity-[0.98]"
      />

      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(11,13,16,0.10),rgba(11,13,16,0.04)_24%,rgba(11,13,16,0.05)_56%,rgba(11,13,16,0.14)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(11,13,16,0.00)_0%,rgba(11,13,16,0.015)_16%,rgba(11,13,16,0.04)_38%,rgba(11,13,16,0.10)_68%,rgba(11,13,16,0.18)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_24%,rgba(255,255,255,0.18),rgba(255,255,255,0.08)_16%,transparent_34%)]" />
    </div>

        {/* FULL-HEIGHT BACKGROUND */}
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <img
        src="/most-popular-banner.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-[74%_28%] opacity-[0.52]"
      />

      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(11,13,16,0.15),rgba(11,13,16,0.07)_24%,rgba(11,13,16,0.08)_56%,rgba(11,13,16,0.16)_100%)]" />

      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(11,13,16,0.07)_0%,rgba(11,13,16,0.07)_16%,rgba(11,13,16,0.10)_30%,rgba(11,13,16,0.20)_42%,rgba(11,13,16,0.24)_54%,rgba(11,13,16,0.17)_68%,rgba(11,13,16,0.12)_82%,rgba(11,13,16,0.10)_100%)]" />

      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,transparent_28%,rgba(8,10,14,0.18)_36%,rgba(8,10,14,0.30)_46%,rgba(8,10,14,0.32)_56%,rgba(8,10,14,0.18)_66%,transparent_78%)]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_54%_82%,rgba(201,122,74,0.075),transparent_22%),radial-gradient(circle_at_74%_88%,rgba(68,122,214,0.070),transparent_20%),radial-gradient(circle_at_38%_92%,rgba(255,255,255,0.035),transparent_18%)]" />

      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(255,255,255,0.018)_0%,rgba(255,255,255,0.010)_10%,transparent_24%)]" />
    </div>

    {/* SIDE DISSOLVES */}
    <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-[linear-gradient(to_right,#0B0D10,rgba(11,13,16,0.62),rgba(11,13,16,0.22),transparent)]" />
    <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-[linear-gradient(to_left,#0B0D10,rgba(11,13,16,0.62),rgba(11,13,16,0.22),transparent)]" />

    {/* CONTENT */}
        <div className="relative z-20 px-6 pt-[352px] pb-8">
      <div className="space-y-14">
        {desktopMostPopularCommentary.length > 0 ? (
          <MostPopularRankedList
            items={desktopMostPopularCommentary}
            sectionTitle="Commentary"
          />
        ) : null}

        {desktopMostPopularNews.length > 0 ? (
          <MostPopularRankedList
            items={desktopMostPopularNews}
            sectionTitle="News"
          />
        ) : null}
      </div>
    </div>
  </div>
</section>
</section>
</div>
</div>

          <aside className="flex flex-col gap-12 pt-[2px]">
  <section className="space-y-4">
    <DesktopNewsPointPanel items={newsItems} />
  </section>

  {/* --- Submit News Tips (NEW POSITION) --- */}
  <div className="pt-6 pb-6">
    <SubmitNewsTipsBand />
  </div>

    <section className="mt-8 space-y-5">
    <SectionHeader title="Feed Read" headlineTone />
    <AggregatorList
      items={feedRead}
      maxItems={8}
      tone="subtle"
      showAccent={false}
    />
  </section>

  <section className="mt-4 space-y-5">
    <SectionHeader title="Strategic Insights" headlineTone />
    <AggregatorList
      items={strategicInsights}
      maxItems={5}
      tone="quiet"
      showAccent={false}
    />
  </section>
</aside>
        </div>

                        <div className="hidden lg:block pt-28 pb-8">
          <DesktopMissionBlock />
        </div>
      </div>
    </main>
  );
}














        





