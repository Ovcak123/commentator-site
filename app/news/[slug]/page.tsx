export const dynamic = "force-dynamic";
export const revalidate = 0;

import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "../../../components/Header";
import MobileShare from "../../../components/MobileShare";
import DesktopShare from "../../../components/DesktopShare";
import { client } from "../../../sanity/lib/client";
import { urlFor } from "../../../sanity/lib/image";
import { PortableText, type PortableTextComponents } from "next-sanity";

type SidebarItem = {
  id: string;
  title: string;
  href: string;
  readTimeMinutes?: number;
};

const singleNewsQuery = `
  *[_type == "newsItem" && slug.current == $slug][0]{
    title,
    slug,
    source,
    externalUrl,
    "author": coalesce(author, author->name, author.name, author->title, author.title),
    publishedAt,
    excerpt,
    body,
    heroImage,
    readTimeMinutes,
    "text": pt::text(body)
  }
`;

const mostReadQuery = `
  *[_type == "post"] | order(publishedAt desc, _createdAt desc)[0...5]{
    _id,
    title,
    readTimeMinutes,
    "slug": slug.current,
    "text": pt::text(body)
  }
`;

const moreNewsQuery = `
  *[_type == "newsItem" && slug.current != $slug] | order(publishedAt desc, _createdAt desc)[0...5]{
    _id,
    title,
    readTimeMinutes,
    "slug": slug.current,
    "text": pt::text(body)
  }
`;

const latestCommentaryQuery = `
  *[_type == "post"] | order(publishedAt desc, _createdAt desc)[0...5]{
    _id,
    title,
    readTimeMinutes,
    "slug": slug.current,
    "text": pt::text(body)
  }
`;

/* ---------- PortableText: first paragraph emphasis (Option A, desktop-visible) ---------- */

const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children, index }) => {
      if (index === 0) {
        return <p className="font-[540] leading-relaxed">{children}</p>;
      }
      return <p>{children}</p>;
    },
  },
};

/* ---------- helpers (read time) ---------- */

function normalizeMinutes(value: any): number | undefined {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
  if (typeof value === "string") {
    const n = Number(value);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return undefined;
}

// Fallback estimator (only used when readTimeMinutes is missing)
function estimateMinutesFromText(text: any): number | undefined {
  if (typeof text !== "string") return undefined;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (!Number.isFinite(words) || words <= 0) return undefined;

  // Conservative WPM; clamp to at least 1 minute.
  const minutes = Math.max(1, Math.round(words / 220));
  return minutes;
}

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

/* ---------- Sidebar UI helpers ---------- */

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
 * Desktop list renderer
 * Goal: match Commentary behavior:
 * - read-time inline next to headline
 * - wraps to next line ONLY if space runs out
 * - NOT forced onto its own line
 * - NOT clipped/hidden
 */
function SidebarList({
  items,
  limit = 5,
  lineClamp = 2,
  tight = false,
}: {
  items: SidebarItem[];
  limit?: number;
  lineClamp?: 1 | 2;
  tight?: boolean;
}) {
  void lineClamp; // kept for signature compatibility

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
              {it.title} <ReadTimeBadge minutes={it.readTimeMinutes} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * Mobile-only list renderer (polished).
 * (UNCHANGED — per instruction: do NOTHING to mobile.)
 */
function MobileSidebarList({
  items,
  limit = 5,
  lineClamp = 2,
  tight = false,
}: {
  items: SidebarItem[];
  limit?: number;
  lineClamp?: 1 | 2;
  tight?: boolean;
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
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* ---------- Page ---------- */

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
  const [item, mostReadDocs, moreNewsDocs, latestCommentaryDocs] = await Promise.all([
    client.fetch(singleNewsQuery, { slug: params.slug }, { cache: "no-store" }),
    client.fetch(mostReadQuery, {}, { cache: "no-store" }),
    client.fetch(moreNewsQuery, { slug: params.slug }, { cache: "no-store" }),
    client.fetch(latestCommentaryQuery, {}, { cache: "no-store" }),
  ]);

  if (!item || !item.title) notFound();

  // Fallback readtime for the main news item (if readTimeMinutes missing)
  const itemReadMinutes =
    normalizeMinutes(item?.readTimeMinutes) ??
    estimateMinutesFromText(item?.text) ??
    estimateMinutesFromText(item?.excerpt);

  // ✅ Map raw Sanity docs -> SidebarItem (ensuring readTimeMinutes ALWAYS exists via fallback)
  const mostRead: SidebarItem[] = (mostReadDocs ?? [])
    .map((d: any) => ({
      id: d._id,
      title: d.title ?? "Untitled",
      href: d.slug ? `/posts/${d.slug}` : "#",
      readTimeMinutes: normalizeMinutes(d.readTimeMinutes) ?? estimateMinutesFromText(d.text),
    }))
    .filter((x: SidebarItem) => x.href !== "#");

  const moreNews: SidebarItem[] = (moreNewsDocs ?? [])
    .map((d: any) => ({
      id: d._id,
      title: d.title ?? "Untitled",
      href: d.slug ? `/news/${d.slug}` : "#",
      readTimeMinutes: normalizeMinutes(d.readTimeMinutes) ?? estimateMinutesFromText(d.text),
    }))
    .filter((x: SidebarItem) => x.href !== "#");

  const latestCommentary: SidebarItem[] = (latestCommentaryDocs ?? [])
    .map((d: any) => ({
      id: d._id,
      title: d.title ?? "Untitled",
      href: d.slug ? `/posts/${d.slug}` : "#",
      readTimeMinutes: normalizeMinutes(d.readTimeMinutes) ?? estimateMinutesFromText(d.text),
    }))
    .filter((x: SidebarItem) => x.href !== "#");

  const heroUrl =
    item?.heroImage?.asset ? urlFor(item.heroImage).width(1600).height(900).fit("crop").url() : "";

  return (
    <main className="news min-h-screen bg-[#0B0D10] text-[#E6E9EE]">
      <Header />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_320px]">
          <div className="max-w-3xl">
            <header className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#9AA1AB]">News</p>

              {/* mobile headline sizing stays as you had it */}
              <h1 className="text-[26px] font-semibold leading-tight tracking-tight md:text-3xl">
                {item.title}
              </h1>

              {/* READ TIME + DESKTOP SHARE (TOP) — match Commentary desktop behavior */}
              <div className="mt-2 flex items-center justify-between">
                <ReadTimeBadge minutes={itemReadMinutes} />
                <div className="hidden lg:block">
                  <DesktopShare title={item.title} />
                </div>
              </div>

              {item.excerpt && (
                <p className="text-[15px] leading-relaxed text-white/75">{item.excerpt}</p>
              )}
            </header>

            <div className="mt-8 h-52 w-full rounded-xl overflow-hidden md:h-64">
              {heroUrl && (
                <img
                  src={heroUrl}
                  alt={item.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              )}
            </div>

            {/* MOBILE SHARE (TOP) — below hero, above body */}
            <div className="mt-3 flex justify-end lg:hidden">
              <MobileShare title={item.title} />
            </div>

            <section className="mt-2 md:mt-6 prose prose-invert max-w-none">
              <PortableText value={item.body ?? []} components={portableTextComponents} />
            </section>

            {/* MOBILE SHARE (BOTTOM) — end of article */}
            <div className="mt-10 flex justify-end lg:hidden">
              <MobileShare title={item.title} />
            </div>

            {/* DESKTOP SHARE (BOTTOM) — match where it currently lands on Commentary desktop */}
            <div className="mt-10 hidden lg:flex justify-center">
              <DesktopShare title={item.title} />
            </div>

            {/* MOBILE ONLY: subtle divider between article and below-article sections */}
            <div className="lg:hidden mx-4 my-6 border-t border-neutral-200/15" />

            {/* MOBILE ONLY: SECTION STACK AFTER BOTTOM SHARE */}
            <div className="mt-10 space-y-8 lg:hidden">
              <div className="space-y-4">
                <SectionHeader title="Most Read" />
                <MobileSidebarList items={mostRead} />
              </div>

              <div className="space-y-4">
                <SectionHeader title="More News" />
                <MobileSidebarList items={moreNews} />
              </div>

              <div className="space-y-4">
                <SectionHeader title="Latest Commentary" />
                <MobileSidebarList items={latestCommentary} />
              </div>
            </div>
          </div>

          {/* RIGHT RAIL — LOCKED VIEW (no inner scroll); compress to fit viewport */}
          <aside className="hidden lg:block">
            <div className="sticky top-16 w-[320px] self-start">
              <div className="origin-top scale-[0.90]">
                <div className="space-y-5">
                  <div className="space-y-4">
                    <SectionHeader title="Most Read" />
                    <SidebarList items={mostRead} limit={5} lineClamp={2} tight />
                  </div>

                  <div className="space-y-4">
                    <SectionHeader title="More News" />
                    <SidebarList items={moreNews} limit={5} lineClamp={1} tight />
                  </div>

                  <div className="space-y-4">
                    <SectionHeader title="Latest Commentary" />
                    <SidebarList items={latestCommentary} limit={5} lineClamp={1} tight />
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
