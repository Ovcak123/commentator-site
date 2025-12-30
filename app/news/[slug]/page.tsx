export const dynamic = "force-dynamic";
export const revalidate = 0;

import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "../../../components/Header";
import { client } from "../../../sanity/lib/client";
import { urlFor } from "../../../sanity/lib/image";
import { PortableText } from "next-sanity";

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
    author,
    publishedAt,
    excerpt,
    body,
    heroImage,
    readTimeMinutes
  }
`;

const mostReadQuery = `
  *[_type == "post"] | order(publishedAt desc, _createdAt desc)[0...5]{
    _id,
    title,
    readTimeMinutes,
    "slug": slug.current
  }
`;

const moreNewsQuery = `
  *[_type == "newsItem" && slug.current != $slug] | order(publishedAt desc, _createdAt desc)[0...5]{
    _id,
    title,
    readTimeMinutes,
    "slug": slug.current
  }
`;

const latestCommentaryQuery = `
  *[_type == "post"] | order(publishedAt desc, _createdAt desc)[0...5]{
    _id,
    title,
    readTimeMinutes,
    "slug": slug.current
  }
`;

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

/* ---------- Read time UI (MATCHES HOMEPAGE) ---------- */
function ReadTimeBadge({ minutes }: { minutes?: number }) {
  const m = normalizeMinutes(minutes);
  if (!m) return null;

  return (
    <span
      className="inline-flex items-baseline gap-1.5 whitespace-nowrap"
      aria-label={`${m} min read`}
      title={`${m} min read`}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="shrink-0 text-[#C67C4E]/80 relative top-[1px]"
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

      <span className="text-[11px] font-medium leading-none text-white/55">{m} min read</span>
    </span>
  );
}

function TitleWithReadTime({
  title,
  minutes,
  titleClassName = "",
}: {
  title: string;
  minutes?: number;
  titleClassName?: string;
}) {
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className={`min-w-0 break-words ${titleClassName}`}>{title}</span>
      <ReadTimeBadge minutes={minutes} />
    </span>
  );
}

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
 * FIX: ensure read-time badge never drops to a new line.
 * - Title is clamped/truncated inside a flex row
 * - Badge is shrink-0 and always visible inline
 * - Does NOT touch sidebar flow/sticky/panel logic
 */
function SidebarTitleRow({
  title,
  minutes,
  lineClamp,
}: {
  title: string;
  minutes?: number;
  lineClamp: 1 | 2;
}) {
  const m = normalizeMinutes(minutes);

  return (
    <span className="flex items-baseline gap-2 min-w-0 flex-nowrap">
      <span
        className="min-w-0 break-words"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: lineClamp,
          WebkitBoxOrient: "vertical" as any,
          overflow: "hidden",
        }}
      >
        {title}
      </span>

      {m ? <ReadTimeBadge minutes={m} /> : null}
    </span>
  );
}

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
                <SidebarTitleRow
                  title={it.title}
                  minutes={it.readTimeMinutes}
                  lineClamp={lineClamp}
                />
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

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
  const [item, mostReadDocs, moreNewsDocs, latestCommentaryDocs] = await Promise.all([
    client.fetch(singleNewsQuery, { slug: params.slug }, { cache: "no-store" }),
    client.fetch(mostReadQuery, {}, { cache: "no-store" }),
    client.fetch(moreNewsQuery, { slug: params.slug }, { cache: "no-store" }),
    client.fetch(latestCommentaryQuery, {}, { cache: "no-store" }),
  ]);

  if (!item || !item.title) notFound();

  const heroUrl = item.heroImage?.asset
    ? urlFor(item.heroImage).width(1600).height(900).fit("crop").url()
    : "";

  const metaParts: string[] = [];
  if (item.author?.trim()) metaParts.push(item.author.trim());
  if (item.publishedAt) metaParts.push(formatDate(item.publishedAt));
  if (item.source) metaParts.push(item.source);

  const mostRead: SidebarItem[] = (mostReadDocs || [])
    .filter((p: any) => p?.slug)
    .map((p: any) => ({
      id: p._id,
      title: p.title,
      href: `/posts/${p.slug}`,
      readTimeMinutes: normalizeMinutes(p.readTimeMinutes),
    }));

  const moreNews: SidebarItem[] = (moreNewsDocs || [])
    .filter((n: any) => n?.slug)
    .map((n: any) => ({
      id: n._id,
      title: n.title,
      href: `/news/${n.slug}`,
      readTimeMinutes: normalizeMinutes(n.readTimeMinutes),
    }));

  const latestCommentary: SidebarItem[] = (latestCommentaryDocs || [])
    .filter((p: any) => p?.slug)
    .map((p: any) => ({
      id: p._id,
      title: p.title,
      href: `/posts/${p.slug}`,
      readTimeMinutes: normalizeMinutes(p.readTimeMinutes),
    }));

  return (
    <main className="news min-h-screen bg-[#0B0D10] text-[#E6E9EE]">
      <Header />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_320px]">
          {/* MAIN */}
          <div className="max-w-3xl">
            <header className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#9AA1AB]">News</p>

              <h1 className="text-2xl font-semibold leading-tight tracking-tight md:text-3xl">
                <TitleWithReadTime title={item.title} minutes={item.readTimeMinutes} />
              </h1>

              {item.excerpt && <p className="news-lede">{item.excerpt}</p>}

              {metaParts.length > 0 && (
                <p className="text-xs text-[rgba(230,233,238,0.55)]">{metaParts.join(" · ")}</p>
              )}

              {item.externalUrl && (
                <p className="text-xs">
                  <a
                    href={item.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[rgba(198,124,78,0.85)] hover:underline"
                  >
                    Read original source →
                  </a>
                </p>
              )}
            </header>

            <div className="mt-8 h-52 w-full rounded-xl bg-[rgba(255,255,255,0.06)] overflow-hidden md:h-64">
              {heroUrl && (
                <img
                  src={heroUrl}
                  alt={item.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              )}
            </div>

            <section className="mt-8 prose prose-invert max-w-none">
              <PortableText value={item.body ?? []} />
            </section>
          </div>

          {/* SIDEBAR */}
          <aside className="hidden lg:block">
            <div className="sticky top-16">
              {/* Bounded “panel” so all three sections are visible together (and stable) */}
              <div
                className="pr-3 space-y-6"
                style={{
                  maxHeight: "calc(100vh - 6rem)",
                  overflowY: "auto",
                }}
              >
                <div className="space-y-4">
                  <SectionHeader title="Most Read" />
                  <SidebarList items={mostRead} limit={5} lineClamp={2} tight showReadTime />
                </div>

                {moreNews.length > 0 ? (
                  <div className="space-y-4">
                    <SectionHeader title="More News" />
                    <SidebarList items={moreNews} limit={5} lineClamp={1} tight showReadTime />
                  </div>
                ) : null}

                {latestCommentary.length > 0 ? (
                  <div className="space-y-4">
                    <SectionHeader title="Latest Commentary" />
                    <SidebarList items={latestCommentary} limit={5} lineClamp={1} tight showReadTime />
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
