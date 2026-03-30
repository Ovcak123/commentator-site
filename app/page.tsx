

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

/* ---------- typography ---------- */

const MAJOR_HEADLINE_SERIF_CLASS = "font-serif tracking-[-0.022em]";

/* ---------- excerpt tone ---------- */

const EXCERPT_TEXT_CLASS = "text-[#CBC3B8]";
const EXCERPT_HOVER_TEXT_CLASS = "group-hover:text-[#D8D0C5]";

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

function SmallSectionHeader({ title }: { title: string }) {
  return (
    <div className="space-y-2">
      <div className="inline-block">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9C9488]/92">
          {title}
        </h3>
        <span className="mt-2 block h-[2px] w-[76px] bg-[#C67C4E]/28" />
      </div>
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

function LeadHoverAccent() {
  return (
    <span className="pointer-events-none absolute -left-3 top-2 bottom-2 w-px bg-transparent transition-colors duration-150 group-hover:bg-[#C67C4E]/90" />
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
      <section className="relative overflow-hidden rounded-[5px] bg-[linear-gradient(135deg,rgba(59,8,16,0.88)_0%,rgba(85,12,23,0.88)_38%,rgba(102,16,29,0.80)_72%,rgba(77,11,21,0.86)_100%)] px-6 py-6 transition-all duration-200 group-hover:shadow-[0_10px_24px_rgba(0,0,0,0.18)] sm:px-7 sm:py-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.03),transparent_32%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.015),rgba(0,0,0,0.06))]" />

        <div className="relative">
          <h3
            className={`${MAJOR_HEADLINE_SERIF_CLASS} text-[17.5px] font-semibold leading-[1.12] text-[#F1E4D8] transition-colors duration-150 group-hover:text-[#FAF3EC]`}
          >
            Join The Commentator Club
          </h3>

          <p className="mt-4 max-w-[42ch] text-[13.35px] leading-[1.78] text-[#E8D5C7] transition-colors duration-150 group-hover:text-[#F7EDE4]">
            A private community of CEOs, founders, and political, military, and
            intelligence leaders — alongside thinkers and innovators from around the
            world. Members can comment, engage directly, submit ideas, and shape the
            conversation.
          </p>

          <div className="mt-5 inline-flex items-center gap-2 text-[13.35px] font-semibold text-[#F2E5D8] transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-white">
            <span>Join for $5 a month</span>
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
      <section className="relative overflow-hidden rounded-[4px] bg-[linear-gradient(145deg,rgba(42,7,13,0.80)_0%,rgba(58,10,18,0.82)_36%,rgba(70,14,24,0.78)_68%,rgba(50,9,17,0.82)_100%)] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition-all duration-200 group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_12px_30px_rgba(0,0,0,0.16)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(214,167,132,0.08),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.025),transparent_30%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.012),rgba(0,0,0,0.10))]" />

        <div className="relative">
          <h3
            className={`${MAJOR_HEADLINE_SERIF_CLASS} text-[16px] font-semibold leading-[1.14] text-[#F5EBDD] transition-colors duration-150 group-hover:text-[#FCF4EA]`}
          >
            Join The Commentator Club
          </h3>

          <p className="mt-3.5 text-[12.4px] leading-[1.72] text-[#E4D3C6] transition-colors duration-150 group-hover:text-[#EEDFD4]">
            A private community of CEOs, founders, and political, military, and
            intelligence leaders — alongside thinkers and innovators from around the
            world. Members can comment, engage directly, submit ideas, and shape the
            conversation.
          </p>

          <div className="mt-4 inline-flex items-center gap-1.5 text-[12.2px] font-semibold text-[#F0E2D6] transition-colors duration-150 group-hover:text-[#FAF0E6]">
            <span>Join for $5 a month</span>
            <span
              aria-hidden="true"
              className="transition-transform duration-150 group-hover:translate-x-0.5"
            >
              →
            </span>
          </div>
        </div>
      </section>
    </Link>
  );
}

function MobileMissionBlock() {
  return (
    <section className="mt-16 overflow-hidden rounded-xl bg-[linear-gradient(180deg,#18212A_0%,#202A34_100%)] px-7 py-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.025),inset_0_-1px_0_rgba(0,0,0,0.18)]">
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_top_center,rgba(255,255,255,0.02),transparent_46%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(109,139,170,0.045),transparent_56%)]" />

        <div className="relative mx-auto max-w-[19.5rem] text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#A7B5C3]">
            The Commentator’s Mission
          </p>

          <div className="mt-6">
            <p
              className={`${MAJOR_HEADLINE_SERIF_CLASS} text-[28px] font-semibold leading-[1.04] text-[#E8DFD3] sm:text-[29px]`}
            >
              Understanding Power in the Digital Revolution
            </p>

            <p
              className={`${MAJOR_HEADLINE_SERIF_CLASS} mt-5 text-[18px] leading-[1.12] text-[#B7C4D1] sm:text-[19px]`}
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
    <section className="mx-auto mt-20 mb-4 w-full max-w-[44rem] overflow-hidden rounded-[18px] bg-[linear-gradient(180deg,rgba(24,33,42,0.72)_0%,rgba(32,42,52,0.68)_100%)] px-8 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.018),inset_0_-1px_0_rgba(0,0,0,0.14)]">
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
      ? "text-[#E1D6C6] group-hover:text-[#F0E7DA]"
      : tone === "subtle"
        ? "text-[#D0C5B8] group-hover:text-[#DDD3C6]"
        : "text-[#D8CBB8] group-hover:text-[#E1D6C6]";

  const metaToneClass =
    tone === "quiet"
      ? "text-[#D1C5B6]/82"
      : tone === "subtle"
        ? "text-[#C67C4E]/90"
        : "text-[#C67C4E]";

  const separatorToneClass =
    tone === "quiet" ? "text-white/42" : tone === "subtle" ? "text-white/34" : "text-white/45";

  return (
    <ul className={tone === "subtle" ? "space-y-2.5" : "space-y-3"}>
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

function CommentaryList({ items, maxItems }: { items: CommentaryPost[]; maxItems: number }) {
  const usable = items.filter((p) => !!p.slug);

  return (
    <ul className="space-y-12">
      {usable.slice(0, maxItems).map((p) => (
        <li key={p.id} className="group relative overflow-visible">
          <HoverAccent />
          <Link
            href={`/posts/${p.slug}`}
            className="block py-3 no-underline hover:no-underline focus:outline-none transition-all duration-150 group-hover:translate-x-0.5"
            title={p.title}
          >
            <span
              className={`block text-[17px] leading-[1.16] text-[#D8CBB8] transition-colors duration-150 group-hover:text-[#E1D6C6] break-words ${MAJOR_HEADLINE_SERIF_CLASS} font-semibold`}
            >
              <InlineTitleWithReadTime title={p.title} minutes={p.readTimeMinutes} />
            </span>

            {p.excerpt ? (
              <p
                className={`mt-3.5 text-[13.5px] leading-[1.86] ${EXCERPT_TEXT_CLASS} transition-colors duration-150 ${EXCERPT_HOVER_TEXT_CLASS}`}
              >
                {p.excerpt}
              </p>
            ) : null}

            {p.author ? (
              <span className="mt-4 block text-[11px] uppercase tracking-[0.20em] text-[#C67C4E]/55 transition-colors duration-150 group-hover:text-[#C67C4E]">
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
    <article className="space-y-7">
      <div className="h-36 overflow-hidden bg-white/5 ring-1 ring-white/10 sm:h-40">
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
        <FeaturedAccent />

        <h3
          className={`${MAJOR_HEADLINE_SERIF_CLASS} text-[21px] font-semibold leading-[1.1] text-[#D8CBB8] transition-all duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-[#E1D6C6] break-words`}
        >
          <InlineTitleWithReadTime title={post.title} minutes={post.readTimeMinutes} />
        </h3>

        {post.excerpt ? (
          <p
            className={`mt-4 text-[14.5px] leading-[1.84] ${EXCERPT_TEXT_CLASS} transition-colors duration-150 ${EXCERPT_HOVER_TEXT_CLASS}`}
          >
            {post.excerpt}
          </p>
        ) : null}
        {post.author ? (
          <p className="mt-5.5 text-[11px] uppercase tracking-[0.20em] text-[#C67C4E]/55 transition-colors duration-150 group-hover:text-[#C67C4E]">
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
    <article className="group relative overflow-visible">
      <FeaturedAccent />
      <Link
        href={`/posts/${post.slug}`}
        className="block no-underline hover:no-underline focus:outline-none"
      >
        {post.heroImageUrl ? (
          <div className="mb-7 h-32 overflow-hidden bg-white/5 ring-1 ring-white/10 sm:h-36">
            <img
              src={post.heroImageUrl}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
              loading="lazy"
            />
          </div>
        ) : null}

        <h3
          className={`${MAJOR_HEADLINE_SERIF_CLASS} text-[22px] font-semibold leading-[1.08] text-[#D8CBB8] transition-colors duration-150 group-hover:text-[#E1D6C6] break-words`}
        >
          <InlineTitleWithReadTime title={post.title} minutes={post.readTimeMinutes} />
        </h3>

        {post.excerpt ? (
          <p
            className={`mt-4 text-[14.25px] leading-[1.86] ${EXCERPT_TEXT_CLASS} transition-colors duration-150 ${EXCERPT_HOVER_TEXT_CLASS}`}
          >
            {post.excerpt}
          </p>
        ) : null}

        {post.author ? (
          <p className="mt-5.5 text-[11px] uppercase tracking-[0.20em] text-[#C67C4E]/55 transition-colors duration-150 group-hover:text-[#C67C4E]">
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
    <div className="space-y-10">
      {usable.map((p, index) => (
        <article
          key={p.id}
          className={index > 0 ? "border-t border-white/10 pt-10" : ""}
        >
          <Link
            href={`/posts/${p.slug}`}
            className="group relative block overflow-visible no-underline hover:no-underline focus:outline-none"
          >
            <FeaturedAccent />

            <div className="min-w-0">
              <h4
                className={`${MAJOR_HEADLINE_SERIF_CLASS} text-[19px] font-semibold leading-[1.14] text-[#D4CABD] transition-colors duration-150 group-hover:text-[#E1D6C6] break-words`}
              >
                <InlineTitleWithReadTime title={p.title} minutes={p.readTimeMinutes} />
              </h4>

              {p.excerpt ? (
                <p
                  className={`mt-3.5 text-[14px] leading-[1.84] line-clamp-4 ${EXCERPT_TEXT_CLASS} transition-colors duration-150 ${EXCERPT_HOVER_TEXT_CLASS}`}
                >
                  {p.excerpt}
                </p>
              ) : null}

              {p.author ? (
                <p className="mt-4 text-[11px] uppercase tracking-[0.20em] text-[#C67C4E]/55 transition-colors duration-150 group-hover:text-[#C67C4E]">
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
  const secondaryWithThumbs = items.slice(1, 3);
  const secondaryTextOnly = items.slice(3, 6);

  return (
    <section id="news-point-mobile" className="space-y-9">
      <SectionHeader title="News Point" headlineTone />

      {featured ? (
        <article className="group relative overflow-visible">
          <NewsAccent />
          <Link
            href={featured.slug ? `/news/${featured.slug}` : "#"}
            className="block no-underline hover:no-underline"
          >
            {featured.heroImageUrl ? (
              <div className="mb-6 h-40 overflow-hidden bg-white/5 ring-1 ring-white/10 sm:h-44">
                <img
                  src={featured.heroImageUrl}
                  alt={featured.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                  loading="lazy"
                />
              </div>
            ) : null}

            <h3 className="text-[22px] font-semibold leading-[1.14] text-[#D8CBB8] transition-colors duration-150 group-hover:text-[#E1D6C6] break-words">
              <InlineTitleWithReadTime title={featured.title} minutes={featured.readTimeMinutes} />
            </h3>

            {featured.excerpt ? (
              <p
                className={`mt-4 text-[14.5px] leading-[1.82] ${EXCERPT_TEXT_CLASS} transition-colors duration-150 ${EXCERPT_HOVER_TEXT_CLASS}`}
              >
                {featured.excerpt}
              </p>
            ) : null}
          </Link>
        </article>
      ) : null}

      {secondaryWithThumbs.length > 0 ? (
        <div className="space-y-8 border-t border-white/10 pt-8">
          {secondaryWithThumbs.map((n) => (
            <article key={n.id} className="group relative overflow-visible">
              <NewsAccent />
              <Link
                href={n.slug ? `/news/${n.slug}` : "#"}
                className="grid grid-cols-[1fr_88px] items-start gap-4.5 no-underline hover:no-underline"
              >
                <div className="min-w-0">
                  <h4 className="text-[17px] font-semibold leading-[1.24] text-[#D8CBB8] transition-colors duration-150 group-hover:text-[#E1D6C6] break-words">
                    <InlineTitleWithReadTime title={n.title} minutes={n.readTimeMinutes} />
                  </h4>

                  {n.excerpt ? (
                    <p
                      className={`mt-3 text-[13.5px] leading-[1.8] line-clamp-3 ${EXCERPT_TEXT_CLASS} transition-colors duration-150 ${EXCERPT_HOVER_TEXT_CLASS}`}
                    >
                      {n.excerpt}
                    </p>
                  ) : null}
                </div>

                <div className="h-[68px] w-[88px] justify-self-end overflow-hidden bg-white/5 ring-1 ring-white/10">
                  {n.heroImageUrl ? (
                    <img
                      src={n.heroImageUrl}
                      alt={n.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
                      loading="lazy"
                    />
                  ) : null}
                </div>
              </Link>
            </article>
          ))}
        </div>
      ) : null}

      {secondaryTextOnly.length > 0 ? (
        <div className="space-y-7 border-t border-white/10 pt-8">
          {secondaryTextOnly.map((n) => (
            <article key={n.id} className="group relative overflow-visible">
              <NewsAccent />
              <Link
                href={n.slug ? `/news/${n.slug}` : "#"}
                className="block no-underline hover:no-underline"
              >
                <h4 className="text-[17px] font-semibold leading-[1.24] text-[#D8CBB8] transition-colors duration-150 group-hover:text-[#E1D6C6] break-words">
                  <InlineTitleWithReadTime title={n.title} minutes={n.readTimeMinutes} />
                </h4>

                {n.excerpt ? (
                  <p
                    className={`mt-3 text-[13.5px] leading-[1.82] line-clamp-4 ${EXCERPT_TEXT_CLASS} transition-colors duration-150 ${EXCERPT_HOVER_TEXT_CLASS}`}
                  >
                    {n.excerpt}
                  </p>
                ) : null}
              </Link>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function DesktopNewsPointPanel({ items }: { items: NewsItem[] }) {
  const featured = items[0];
  const secondaryWithThumbs = items.slice(1, 3);
  const secondaryTextOnly = items.slice(3, 6);
  const compact = items.slice(6, 7);

  return (
    <section className="space-y-7">
      <SectionHeader title="News Point" />

      {featured ? (
        <article className="group relative overflow-visible">
          <NewsAccent />
          <Link
            href={featured.slug ? `/news/${featured.slug}` : "#"}
            className="block no-underline hover:no-underline"
          >
            {featured.heroImageUrl ? (
              <div className="mb-6 h-30 overflow-hidden bg-white/5 ring-1 ring-white/10">
                <img
                  src={featured.heroImageUrl}
                  alt={featured.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                  loading="lazy"
                />
              </div>
            ) : null}

            <h3 className="text-[21px] font-semibold leading-[1.16] text-[#D8CBB8] transition-colors duration-150 group-hover:text-[#E1D6C6] break-words">
              <InlineTitleWithReadTime title={featured.title} minutes={featured.readTimeMinutes} />
            </h3>

            {featured.excerpt ? (
              <p
                className={`mt-3.5 text-[13px] leading-[1.74] line-clamp-3 ${EXCERPT_TEXT_CLASS} transition-colors duration-150 ${EXCERPT_HOVER_TEXT_CLASS}`}
              >
                {featured.excerpt}
              </p>
            ) : null}
          </Link>
        </article>
      ) : null}

      {secondaryWithThumbs.length > 0 ? (
        <div className="space-y-6 border-t border-white/10 pt-6">
          {secondaryWithThumbs.map((n) => (
            <article key={n.id} className="group relative overflow-visible">
              <NewsAccent />
              <Link
                href={n.slug ? `/news/${n.slug}` : "#"}
                className="grid grid-cols-[1fr_96px] items-start gap-4.5 no-underline hover:no-underline"
              >
                <div className="min-w-0">
                  <h4 className="text-[15px] font-semibold leading-[1.32] text-[#D8CBB8] transition-colors duration-150 group-hover:text-[#E1D6C6] break-words">
                    <InlineTitleWithReadTime title={n.title} minutes={n.readTimeMinutes} />
                  </h4>

                  {n.excerpt ? (
                    <p
                      className={`mt-2.5 text-[12px] leading-[1.72] line-clamp-3 ${EXCERPT_TEXT_CLASS} transition-colors duration-150 ${EXCERPT_HOVER_TEXT_CLASS}`}
                    >
                      {n.excerpt}
                    </p>
                  ) : null}
                </div>

                <div className="h-[72px] w-[96px] justify-self-end overflow-hidden bg-white/5 ring-1 ring-white/10">
                  {n.heroImageUrl ? (
                    <img
                      src={n.heroImageUrl}
                      alt={n.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
                      loading="lazy"
                    />
                  ) : null}
                </div>
              </Link>
            </article>
          ))}
        </div>
      ) : null}

      {secondaryTextOnly.length > 0 ? (
        <div className="space-y-5 border-t border-white/10 pt-6">
          {secondaryTextOnly.map((n) => (
            <article key={n.id} className="group relative overflow-visible">
              <NewsAccent />
              <Link
                href={n.slug ? `/news/${n.slug}` : "#"}
                className="block no-underline hover:no-underline"
              >
                <h4 className="text-[15px] font-semibold leading-[1.32] text-[#D8CBB8] transition-colors duration-150 group-hover:text-[#E1D6C6] break-words">
                  <InlineTitleWithReadTime title={n.title} minutes={n.readTimeMinutes} />
                </h4>

                {n.excerpt ? (
                  <p
                    className={`mt-2.5 text-[12px] leading-[1.72] line-clamp-3 ${EXCERPT_TEXT_CLASS} transition-colors duration-150 ${EXCERPT_HOVER_TEXT_CLASS}`}
                  >
                    {n.excerpt}
                  </p>
                ) : null}
              </Link>
            </article>
          ))}
        </div>
      ) : null}

      {compact.length > 0 ? (
        <div className="space-y-5 border-t border-white/10 pt-6">
          {compact.map((n) => (
            <article key={n.id} className="group relative overflow-visible">
              <NewsAccent />
              <Link
                href={n.slug ? `/news/${n.slug}` : "#"}
                className="block no-underline hover:no-underline"
              >
                <h4 className="text-[15px] font-semibold leading-[1.32] text-[#D8CBB8] transition-colors duration-150 group-hover:text-[#E1D6C6] break-words">
                  <InlineTitleWithReadTime title={n.title} minutes={n.readTimeMinutes} />
                </h4>

                {n.excerpt ? (
                  <p
                    className={`mt-2.5 text-[12px] leading-[1.72] line-clamp-3 ${EXCERPT_TEXT_CLASS} transition-colors duration-150 ${EXCERPT_HOVER_TEXT_CLASS}`}
                  >
                    {n.excerpt}
                  </p>
                ) : null}
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
    <div className="border-t border-white/10 pt-8">
      <div className="space-y-0">
        {items.map((p, index) => (
          <article
            key={p.id}
            className={index > 0 ? "mt-8 border-t border-white/10 pt-8" : ""}
          >
            <Link
              href={p.slug ? `/posts/${p.slug}` : "#"}
              className="group relative block overflow-visible no-underline hover:no-underline focus:outline-none"
            >
              <FeaturedAccent />

              <div className="grid grid-cols-[1fr_96px] items-start gap-5.5">
                <div className="min-w-0">
                  <h4
                    className={`${MAJOR_HEADLINE_SERIF_CLASS} text-[17px] font-semibold leading-[1.18] text-[#DDD1BF] transition-colors duration-150 group-hover:text-[#E6DAC9] break-words`}
                  >
                    <InlineTitleWithReadTime title={p.title} minutes={p.readTimeMinutes} />
                  </h4>

                  {p.excerpt ? (
                    <p
                      className={`mt-2.5 max-w-[62ch] text-[12.5px] leading-[1.7] line-clamp-2 ${EXCERPT_TEXT_CLASS} transition-colors duration-150 ${EXCERPT_HOVER_TEXT_CLASS}`}
                    >
                      {p.excerpt}
                    </p>
                  ) : null}

                  {p.author ? (
                    <p className="mt-3 text-[10px] uppercase tracking-[0.20em] text-[#C67C4E]/55 transition-colors duration-150 group-hover:text-[#C67C4E]">
                      {p.author}
                    </p>
                  ) : null}
                </div>

                <div className="h-[72px] w-[96px] justify-self-end overflow-hidden bg-white/5 ring-1 ring-white/10">
                  {p.heroImageUrl ? (
                    <img
                      src={p.heroImageUrl}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
                      loading="lazy"
                    />
                  ) : null}
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
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

  const desktopMiniFeatures = commentaryPosts.slice(1, 5);
  const commentaryStream = commentaryPosts.slice(5);
  const mobileCommentaryStream = commentaryPosts.slice(3);
  const mobileReentryFeature = mobileCommentaryStream[0];
  const mobileReentryList = mobileCommentaryStream.slice(1);

  return (
    <main className="min-h-screen bg-[#0B0D10] text-[#E6E9EE]">
      <Header />

      {lead && lead.slug && (
        <section className="mx-auto max-w-6xl px-6 pt-12 pb-10 lg:hidden">
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
                <FeaturedAccent />
                <h1
                  className={`${MAJOR_HEADLINE_SERIF_CLASS} mt-7 text-[42px] font-semibold leading-[1.08] text-[#D8CBB8] transition-all duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-[#E1D6C6] break-words sm:text-[44px]`}
                >
                  <InlineTitleWithReadTime title={lead.title} minutes={lead.readTimeMinutes} />
                </h1>

                {lead.excerpt && (
                  <p
                    className={`mt-4 max-w-[34ch] text-[17.5px] leading-[1.78] ${EXCERPT_TEXT_CLASS} transition-colors duration-150 ${EXCERPT_HOVER_TEXT_CLASS}`}
                  >
                    {lead.excerpt}
                  </p>
                )}

                {leadMeta ? (
                  <p className="mt-6 text-[11px] uppercase tracking-[0.20em] text-[#C67C4E]/55 transition-colors duration-150 group-hover:text-[#C67C4E]">
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
                <section className="mt-6">
                  <SectionHeader title="Commentary" headlineTone />
                  <div className="mt-8">
                    <MobileCommentaryFeature post={mobileFeaturedCommentary} />
                  </div>
                </section>
              ) : null}

              {mobilePreClubMicroCards.length > 0 ? (
                <section className="border-t border-white/10 pt-10">
                  <MobileMicroCommentaryList items={mobilePreClubMicroCards} />
                </section>
              ) : null}

              <section className="mt-12">
                <CommentatorClubPanel />
              </section>

              {mobilePostClubMicroCards.length > 0 ? (
                <section className="border-t border-white/10 pt-10">
                  <MobileMicroCommentaryList items={mobilePostClubMicroCards} />
                </section>
              ) : null}

              <section className="mt-14 border-t border-white/10 pt-10">
                <MobileNewsPointPanel items={newsItems} />
              </section>

              <section className="mt-14 space-y-5 border-t border-white/10 pt-10">
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

              <MobileMissionBlock />

              <section className="mt-16 space-y-8">
                <SmallSectionHeader title="More Commentary" />

                {mobileReentryFeature ? (
                  <div className="pt-1">
                    <MobileCommentaryReentryFeature post={mobileReentryFeature} />
                  </div>
                ) : null}

                {mobileReentryList.length > 0 ? (
                  <div className="border-t border-white/10 pt-10">
                    <CommentaryList items={mobileReentryList} maxItems={20} />
                  </div>
                ) : null}

                <div className="pt-4">
                  <Link
                    href="/commentary"
                    className="group inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/75 no-underline hover:no-underline transition-colors duration-150 hover:text-white/80"
                  >
                    <span>Archive</span>
                    <span className="h-px w-10 bg-transparent transition-colors duration-150 group-hover:bg-[#C67C4E]/80" />
                  </Link>
                </div>
              </section>

              <aside className="flex flex-col gap-16 border-t border-white/10 pt-12">
                <section className="space-y-5">
                  <SectionHeader title="Feed Read" headlineTone />
                  <AggregatorList items={feedRead} maxItems={8} tone="subtle" />
                </section>

                <section className="space-y-5">
                  <SectionHeader title="Strategic Insights" headlineTone />
                  <AggregatorList items={strategicInsights} maxItems={5} tone="quiet" />
                </section>
              </aside>
            </section>
          </div>
        </div>

        {/* ---------- desktop ---------- */}
        <div className="hidden lg:grid lg:grid-cols-[1.5fr_0.68fr] lg:gap-10 lg:pt-14">
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
                  <div className="absolute inset-0 ring-1 ring-white/10" />

                  <div className="relative z-10 flex h-full items-center px-10">
                    <div className="relative max-w-[34rem] translate-y-[6px] overflow-visible">
                      <LeadHoverAccent />

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

            <div className="grid grid-cols-[1.02fr_0.46fr] gap-10">
              <section className="space-y-12">
                <div className="hidden lg:block pt-1">
                  <SectionHeader title="Commentary" />
                </div>

                <div className="space-y-0">
                  {secondaryLead && secondaryLead.slug ? (
                    <article className="mt-0 mb-10 border-t border-white/10 pt-7">
                      <Link
                        href={`/posts/${secondaryLead.slug}`}
                        className="group relative block overflow-visible no-underline hover:no-underline focus:outline-none"
                      >
                        <FeaturedAccent />
                        <div className="grid gap-7 lg:grid-cols-[1.18fr_0.82fr] lg:items-start">
                          <div className="space-y-4.5">
                            <h3
                              className={`${MAJOR_HEADLINE_SERIF_CLASS} text-[30px] font-semibold leading-[1.09] text-[#D8CBB8] transition-colors duration-150 group-hover:text-[#E1D6C6] break-words`}
                            >
                              <InlineTitleWithReadTime
                                title={secondaryLead.title}
                                minutes={secondaryLead.readTimeMinutes}
                              />
                            </h3>

                            {secondaryLead.excerpt ? (
                              <p
                                className={`max-w-2xl text-[15px] leading-7 ${EXCERPT_TEXT_CLASS} transition-colors duration-150 ${EXCERPT_HOVER_TEXT_CLASS}`}
                              >
                                {secondaryLead.excerpt}
                              </p>
                            ) : null}

                            {secondaryLead.author ? (
                              <p className="text-[11px] uppercase tracking-[0.20em] text-[#C67C4E]/55 transition-colors duration-150 group-hover:text-[#C67C4E]">
                                {secondaryLead.author}
                              </p>
                            ) : null}
                          </div>

                          <div className="h-40 overflow-hidden bg-white/5 ring-1 ring-white/10">
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

                <div className="space-y-4 pt-12">
                  <CommentaryList items={commentaryStream} maxItems={20} />

                  <div className="pt-1">
                    <Link
                      href="/commentary"
                      className="group inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/75 no-underline hover:no-underline transition-colors duration-150 hover:text-white/80"
                    >
                      <span>Archive</span>
                      <span className="h-px w-10 bg-transparent transition-colors duration-150 group-hover:bg-[#C67C4E]/80" />
                    </Link>
                  </div>
                </div>
              </section>

              <section className="space-y-4 border-t border-white/10 pt-6">
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
          </div>

          <aside className="flex flex-col gap-18 pt-[2px]">
            <section className="space-y-4">
              <DesktopNewsPointPanel items={newsItems} />
            </section>

            <section className="mt-12 mb-14 space-y-4">
              <DesktopCommentatorClubPanel />
            </section>

            <section className="space-y-5">
              <SectionHeader title="Feed Read" headlineTone />
              <AggregatorList items={feedRead} maxItems={8} tone="subtle" />
            </section>

            <section className="mt-8 space-y-5">
              <SectionHeader title="Strategic Insights" headlineTone />
              <AggregatorList items={strategicInsights} maxItems={5} tone="quiet" />
            </section>
          </aside>
        </div>

        <div className="hidden lg:block">
          <DesktopMissionBlock />
        </div>
      </div>
    </main>
  );
}