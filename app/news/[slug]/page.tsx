export const dynamic = "force-dynamic";
export const revalidate = 0;

import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "../../../components/Header";
import MobileShare from "../../../components/MobileShare";
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
            <span className="font-medium line-clamp-2">{it.title}</span>
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

  // ✅ Map raw Sanity docs -> SidebarItem (so Link always gets a real href)
  const mostRead: SidebarItem[] = (mostReadDocs ?? [])
    .map((d: any) => ({
      id: d._id,
      title: d.title ?? "Untitled",
      href: d.slug ? `/posts/${d.slug}` : "#",
      readTimeMinutes: d.readTimeMinutes,
    }))
    .filter((x: SidebarItem) => x.href !== "#");

  const moreNews: SidebarItem[] = (moreNewsDocs ?? [])
    .map((d: any) => ({
      id: d._id,
      title: d.title ?? "Untitled",
      href: d.slug ? `/news/${d.slug}` : "#",
      readTimeMinutes: d.readTimeMinutes,
    }))
    .filter((x: SidebarItem) => x.href !== "#");

  const latestCommentary: SidebarItem[] = (latestCommentaryDocs ?? [])
    .map((d: any) => ({
      id: d._id,
      title: d.title ?? "Untitled",
      href: d.slug ? `/posts/${d.slug}` : "#",
      readTimeMinutes: d.readTimeMinutes,
    }))
    .filter((x: SidebarItem) => x.href !== "#");

  const heroUrl = item.heroImage?.asset
    ? urlFor(item.heroImage).width(1600).height(900).fit("crop").url()
    : "";

  return (
    <main className="news min-h-screen bg-[#0B0D10] text-[#E6E9EE]">
      <Header />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_320px]">
          <div className="max-w-3xl">
            <header className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#9AA1AB]">News</p>

              <h1 className="text-2xl font-semibold leading-tight tracking-tight md:text-3xl">
                {item.title}
              </h1>

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

            <section className="mt-8 prose prose-invert max-w-none">
              <PortableText value={item.body ?? []} components={portableTextComponents} />
            </section>

            {/* MOBILE SHARE (BOTTOM) — end of article */}
            <div className="mt-10 flex justify-end lg:hidden">
              <MobileShare title={item.title} />
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-16 w-[320px]">
              <div className="space-y-6">
                <SectionHeader title="Most Read" />
                <SidebarList items={mostRead} />

                <SectionHeader title="More News" />
                <SidebarList items={moreNews} />

                <SectionHeader title="Latest Commentary" />
                <SidebarList items={latestCommentary} />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
