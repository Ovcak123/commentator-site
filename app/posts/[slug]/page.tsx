export const dynamic = "force-dynamic";
export const revalidate = 0;

import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "../../../components/Header";
import MobileShare from "../../../components/MobileShare";
import { client } from "../../../sanity/lib/client";
import { singlePostQuery } from "../../../sanity/lib/queries";
import { urlFor } from "../../../sanity/lib/image";
import { PortableText, type PortableTextComponents } from "next-sanity";

type Post = {
  _id: string;
  title: string;
  subtitle?: string;
  author?: any;
  publishedAt?: string;
  slug?: string;
  heroImage?: any;
  excerpt?: string;
  body?: any[];
  readTimeMinutes?: number;
};

type PageProps = {
  params: { slug: string };
};

type SidebarItem = {
  id: string;
  title: string;
  href: string;
  readTimeMinutes?: number;
};

/* ---------- queries ---------- */

const mostReadQuery = `
  *[_type == "post"] | order(publishedAt desc, _createdAt desc)[0...5]{
    _id,
    title,
    readTimeMinutes,
    "slug": slug.current
  }
`;

const moreCommentaryQuery = `
  *[_type == "post" && slug.current != $slug] | order(publishedAt desc, _createdAt desc)[0...5]{
    _id,
    title,
    readTimeMinutes,
    "slug": slug.current
  }
`;

const latestNewsQuery = `
  *[_type == "newsItem"] | order(publishedAt desc, _createdAt desc)[0...5]{
    _id,
    title,
    readTimeMinutes,
    "slug": slug.current
  }
`;

/* ---------- helpers ---------- */

function normalizeMinutes(value: any): number | undefined {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
  if (typeof value === "string") {
    const n = Number(value);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return undefined;
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

function formatDate(dateString?: string): string {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ---------- Read time UI (FROZEN / MATCHES HOMEPAGE) ---------- */

function ReadTimeBadge({ minutes }: { minutes?: number }) {
  const m = normalizeMinutes(minutes);
  if (!m) return null;

  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap align-baseline">
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
      <span className="text-[11px] font-medium text-white/55">{m} min read</span>
    </span>
  );
}

function InlineTitleWithReadTime({ title, minutes }: { title: string; minutes?: number }) {
  const m = normalizeMinutes(minutes);
  if (!m) return <>{title}</>;

  return (
    <>
      {title} <ReadTimeBadge minutes={m} />
    </>
  );
}

function TitleWithReadTime({ title, minutes }: { title: string; minutes?: number }) {
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className="min-w-0 break-words">{title}</span>
      <ReadTimeBadge minutes={minutes} />
    </span>
  );
}

const portableTextComponents: PortableTextComponents = {
  marks: {
    link: ({ children, value }) => {
      const href = value?.href || value?.url || "";
      const isExternal = typeof href === "string" && /^https?:\/\//i.test(href);
      if (!href) return <>{children}</>;
      return (
        <a
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noreferrer noopener" : undefined}
        >
          {children}
        </a>
      );
    },
  },
};

/* ---------- UI ---------- */

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
        <span className="h-1.5 w-1.5 bg-[#7DA2FF]" />
      </div>
    </div>
  );
}

function HoverAccent() {
  return (
    <span className="pointer-events-none absolute -left-3 top-2 bottom-2 w-px bg-transparent transition-colors group-hover:bg-[#C67C4E]/90" />
  );
}

/**
 * Shared list renderer (UNCHANGED).
 * Used by the desktop right rail AND (legacy) any other place.
 * We keep this untouched to guarantee no desktop drift.
 */
function SidebarList({
  items,
  limit = 5,
  lineClamp = 2,
  tight = false,
  showReadTime = false,
}: {
  items: SidebarItem[];
  limit?: number;
  lineClamp?: 1 | 2;
  tight?: boolean;
  showReadTime?: boolean;
}) {
  const pyClass = tight ? "py-[0.32rem]" : "py-2";

  return (
    <ul>
      {items.slice(0, limit).map((it) => (
        <li key={it.id} className={`group relative ${pyClass} pl-4 overflow-visible`}>
          <HoverAccent />
          <span className="absolute left-0 top-[0.62rem] h-[4px] w-[4px] bg-[#C67C4E]/55 transition-colors duration-150 group-hover:bg-[#C67C4E]" />

          <Link
            href={it.href}
            className="block text-[12.5px] leading-snug text-white/82 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-white"
            title={it.title}
          >
            <span className="font-medium">
              {showReadTime ? (
                <InlineTitleWithReadTime title={it.title} minutes={it.readTimeMinutes} />
              ) : (
                <span
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: lineClamp,
                    WebkitBoxOrient: "vertical" as any,
                    overflow: "hidden",
                  }}
                >
                  {it.title}
                </span>
              )}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * Mobile-only list renderer (NEW).
 * Used ONLY under the bottom Share icon on mobile.
 * Option A polish: slightly higher weight + a touch more line-height.
 */
function MobileSidebarList({
  items,
  limit = 5,
  lineClamp = 2,
  tight = false,
  showReadTime = false,
}: {
  items: SidebarItem[];
  limit?: number;
  lineClamp?: 1 | 2;
  tight?: boolean;
  showReadTime?: boolean;
}) {
  const pyClass = tight ? "py-[0.32rem]" : "py-2";

  return (
    <ul>
      {items.slice(0, limit).map((it) => (
        <li key={it.id} className={`group relative ${pyClass} pl-4 overflow-visible`}>
          <HoverAccent />
          <span className="absolute left-0 top-[0.62rem] h-[4px] w-[4px] bg-[#C67C4E]/55 transition-colors duration-150 group-hover:bg-[#C67C4E]" />

          <Link
            href={it.href}
            className="block text-[12.5px] leading-[1.45] text-white/82 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-white"
            title={it.title}
          >
            <span className="font-[540]">
              {showReadTime ? (
                <span
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: lineClamp,
                    WebkitBoxOrient: "vertical" as any,
                    overflow: "hidden",
                  }}
                >
                  <InlineTitleWithReadTime title={it.title} minutes={it.readTimeMinutes} />
                </span>
              ) : (
                <span
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: lineClamp,
                    WebkitBoxOrient: "vertical" as any,
                    overflow: "hidden",
                  }}
                >
                  {it.title}
                </span>
              )}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* ---------- page ---------- */

export default async function CommentaryArticlePage({ params }: PageProps) {
  const [post, mostReadDocs, moreDocs, latestNewsDocs] = await Promise.all([
    client.fetch(singlePostQuery, { slug: params.slug }, { cache: "no-store" as any }),
    client.fetch(mostReadQuery, {}, { cache: "no-store" as any }),
    client.fetch(moreCommentaryQuery, { slug: params.slug }, { cache: "no-store" as any }),
    client.fetch(latestNewsQuery, {}, { cache: "no-store" as any }),
  ]);

  const typedPost: Post | null = post;
  if (!typedPost || !typedPost.title) notFound();

  const authorName = normalizeAuthor(typedPost.author);
  const date = formatDate(typedPost.publishedAt);

  const heroUrl =
    typedPost.heroImage && typedPost.heroImage.asset
      ? urlFor(typedPost.heroImage).width(1600).height(900).fit("crop").url()
      : typedPost.heroImage
      ? urlFor(typedPost.heroImage).width(1600).height(900).fit("crop").url()
      : "";

  const mostRead: SidebarItem[] = (mostReadDocs || [])
    .filter((p: any) => !!p?.slug)
    .map((p: any) => ({
      id: p._id,
      title: p.title,
      href: `/posts/${p.slug}`,
      readTimeMinutes: normalizeMinutes(p.readTimeMinutes),
    }));

  const moreCommentary: SidebarItem[] = (moreDocs || [])
    .filter((p: any) => !!p?.slug)
    .map((p: any) => ({
      id: p._id,
      title: p.title,
      href: `/posts/${p.slug}`,
      readTimeMinutes: normalizeMinutes(p.readTimeMinutes),
    }));

  const latestNews: SidebarItem[] = (latestNewsDocs || [])
    .filter((n: any) => !!n?.slug)
    .map((n: any) => ({
      id: n._id,
      title: n.title,
      href: `/news/${n.slug}`,
      readTimeMinutes: normalizeMinutes(n.readTimeMinutes),
    }));

  return (
    <main className="commentary min-h-screen bg-[#0B0D10] text-[#E6E9EE]">
      <Header />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_320px]">
          {/* MAIN */}
          <div className="max-w-3xl">
            <header className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#9AA1AB]">
                Commentary
              </p>

              <h1 className="text-2xl font-semibold leading-tight tracking-tight md:text-3xl">
                <TitleWithReadTime title={typedPost.title} minutes={typedPost.readTimeMinutes} />
              </h1>

              {typedPost.subtitle ? (
                <p className="text-[15px] leading-relaxed text-white/70">{typedPost.subtitle}</p>
              ) : typedPost.excerpt ? (
                <p className="text-[15px] leading-relaxed text-white/70">{typedPost.excerpt}</p>
              ) : null}

              {authorName ? (
                <p className="text-xs">
                  <span className="uppercase tracking-[0.16em] text-[#C67C4E]">{authorName}</span>
                  {date ? (
                    <span className="text-[rgba(230,233,238,0.55)]">{` · ${date}`}</span>
                  ) : null}
                </p>
              ) : date ? (
                <p className="text-xs uppercase tracking-[0.16em] text-[rgba(230,233,238,0.55)]">
                  {date}
                </p>
              ) : null}
            </header>

            {heroUrl ? (
              <div className="mt-8 h-52 w-full overflow-hidden bg-white/5 ring-1 ring-white/10 md:h-64">
                <img
                  src={heroUrl}
                  alt={typedPost.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            ) : null}

            {/* MOBILE SHARE (TOP) — below hero, above body */}
            <div className="mt-3 flex justify-end lg:hidden">
              <MobileShare title={typedPost.title} />
            </div>

            {/* Spacing: tighter on mobile after share, looser on desktop after hero */}
            <section className="mt-4 lg:mt-10 prose prose-invert max-w-none text-[17px] leading-relaxed md:text-[18px]">
              {typedPost.body?.length ? (
                <PortableText value={typedPost.body} components={portableTextComponents} />
              ) : (
                <p>
                  This article has no body content yet in Sanity. Once you add paragraphs to the
                  “Body” field in the Commentary document, they will appear here.
                </p>
              )}
            </section>

            {/* MOBILE SHARE (BOTTOM) — end of article */}
            <div className="mt-10 flex justify-end lg:hidden">
              <MobileShare title={typedPost.title} />
            </div>
            {/* MOBILE ONLY: subtle divider between article and below-article sections */}
<div className="lg:hidden mx-4 my-6 border-t border-neutral-200/15" />


            {/* MOBILE ONLY: SECTION STACK AFTER BOTTOM SHARE */}
            <div className="mt-10 space-y-8 lg:hidden">
              <div className="space-y-4">
                <SectionHeader title="Most Read" />
                <MobileSidebarList items={mostRead} limit={5} lineClamp={2} tight showReadTime />
              </div>

              {moreCommentary.length > 0 ? (
                <div className="space-y-4">
                  <SectionHeader title="More Commentary" />
                  <MobileSidebarList
                    items={moreCommentary}
                    limit={5}
                    lineClamp={1}
                    tight
                    showReadTime
                  />
                </div>
              ) : null}

              {latestNews.length > 0 ? (
                <div className="space-y-4">
                  <SectionHeader title="Latest News" />
                  <MobileSidebarList items={latestNews} limit={5} lineClamp={1} tight showReadTime />
                </div>
              ) : null}
            </div>
          </div>

          {/* RIGHT RAIL — STICKY (tracks scroll), no clipping, no inner scrolling */}
          <aside className="hidden lg:block">
            <div className="sticky top-16 w-[320px] self-start">
              <div className="space-y-6">
                <div className="space-y-4">
                  <SectionHeader title="Most Read" />
                  <SidebarList items={mostRead} limit={5} lineClamp={2} tight showReadTime />
                </div>

                {moreCommentary.length > 0 ? (
                  <div className="space-y-4">
                    <SectionHeader title="More Commentary" />
                    <SidebarList items={moreCommentary} limit={5} lineClamp={1} tight showReadTime />
                  </div>
                ) : null}

                {latestNews.length > 0 ? (
                  <div className="space-y-4">
                    <SectionHeader title="Latest News" />
                    <SidebarList items={latestNews} limit={5} lineClamp={1} tight showReadTime />
                  </div>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
