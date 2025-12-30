export const dynamic = "force-dynamic";
export const revalidate = 0;

import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "../../../components/Header";
import { client } from "../../../sanity/lib/client";
import { singlePostQuery } from "../../../sanity/lib/queries";
import { urlFor } from "../../../sanity/lib/image";
import { PortableText, type PortableTextComponents } from "next-sanity";

type Post = {
  _id: string;
  title: string;
  subtitle?: string;
  author?: string;
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
      {title}{" "}
      <ReadTimeBadge minutes={m} />
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

function SidebarList({
  items,
  limit = 5,
  showReadTime = false,
}: {
  items: SidebarItem[];
  limit?: number;
  showReadTime?: boolean;
}) {
  return (
    <ul>
      {items.slice(0, limit).map((it) => (
        <li key={it.id} className="group relative py-[0.32rem] pl-4 overflow-visible">
          <HoverAccent />
          <span className="absolute left-0 top-[0.62rem] h-[4px] w-[4px] bg-[#C67C4E]/55 group-hover:bg-[#C67C4E]" />
          <Link
            href={it.href}
            className="block text-[12.5px] leading-snug text-white/82 group-hover:text-white"
          >
            <span className="font-medium">
              {showReadTime ? (
                <InlineTitleWithReadTime title={it.title} minutes={it.readTimeMinutes} />
              ) : (
                it.title
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

  if (!post || !post.title) notFound();

  const heroUrl =
    post.heroImage?.asset
      ? urlFor(post.heroImage).width(1600).height(900).fit("crop").url()
      : "";

  const mostRead = mostReadDocs.map((p: any) => ({
    id: p._id,
    title: p.title,
    href: `/posts/${p.slug}`,
    readTimeMinutes: normalizeMinutes(p.readTimeMinutes),
  }));

  const moreCommentary = moreDocs.map((p: any) => ({
    id: p._id,
    title: p.title,
    href: `/posts/${p.slug}`,
    readTimeMinutes: normalizeMinutes(p.readTimeMinutes),
  }));

  const latestNews = latestNewsDocs.map((n: any) => ({
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
            <h1 className="text-2xl md:text-3xl font-semibold">
              <TitleWithReadTime title={post.title} minutes={post.readTimeMinutes} />
            </h1>
            {heroUrl && (
              <img src={heroUrl} alt={post.title} className="mt-8 w-full object-cover" />
            )}
            <section className="mt-10 prose prose-invert max-w-none">
              <PortableText value={post.body ?? []} />
            </section>
          </div>

          {/* SIDEBAR — FIXED */}
          <aside className="hidden lg:block">
            <div
              className="sticky top-16 pr-3 space-y-6 overflow-y-auto"
              style={{ maxHeight: "calc(100vh - 6rem)" }}
            >
              <div className="space-y-4">
                <SectionHeader title="Most Read" />
                <SidebarList items={mostRead} showReadTime />
              </div>

              <div className="space-y-4">
                <SectionHeader title="More Commentary" />
                <SidebarList items={moreCommentary} showReadTime />
              </div>

              <div className="space-y-4">
                <SectionHeader title="Latest News" />
                <SidebarList items={latestNews} showReadTime />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
