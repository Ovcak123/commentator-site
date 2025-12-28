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
          <span className="mt-2 block h-[2px] w-full bg-[#C67C4E]/35" />
        </div>
      </div>
    </div>
  );
}

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
          <span className="text-[12px] font-semibold uppercase tracking-[0.32em] text-white/55 hover:text-[#E6E9EE]">
            News Point
          </span>
          <span className="mt-2 block h-[2px] w-full bg-transparent" />
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

/* ---------- page ---------- */

export default async function HomePage() {
  const { commentaryPosts, newsItems, feedRead, strategicInsights, mostRead } =
    await getHomeData();

  const lead = commentaryPosts[0];
  const featuredCards = commentaryPosts.slice(1, 7);
  const commentaryStream = commentaryPosts.slice(7);

  return (
    <main className="min-h-screen bg-[#0B0D10] text-[#E6E9EE]">
      <Header />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="pb-5">
          <MobileModeLine />
        </div>

        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1.35fr_0.65fr]">
          <section className="space-y-10">
            <div className="hidden lg:block">
              <SectionHeader title="Commentary" />
            </div>

            {lead && lead.slug && (
              <article className="space-y-5">
                <div className="h-60 overflow-hidden bg-white/5 ring-1 ring-white/10">
                  <img
                    src={lead.heroImageUrl}
                    alt={lead.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                <Link href={`/posts/${lead.slug}`} className="group relative block">
                  <FeaturedAccent />
                  <h3 className="text-[44px] font-semibold leading-tight">
                    {lead.title}
                  </h3>
                </Link>
              </article>
            )}

            <div className="grid grid-cols-1 gap-y-14 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-14">
              {featuredCards.map((p, idx) => (
                <div key={p.id} className="space-y-6">
                  <article className="space-y-6">
                    <div className="h-28 overflow-hidden bg-white/5 ring-1 ring-white/10">
                      <img
                        src={p.heroImageUrl}
                        alt={p.title}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <Link href={`/posts/${p.slug}`} className="group relative block">
                      <FeaturedAccent />
                      <h4 className="text-[18px] font-semibold">
                        {p.title}
                      </h4>
                    </Link>
                  </article>

                  {idx === 1 && (
                    <div className="lg:hidden -mb-7">
                      {/* TOP blue rule (unchanged) */}
                      <div className="my-4">
                        <DoubleBlueRule />
                      </div>

                      <section id="news-point-mobile" className="space-y-6">
                        <SectionHeader title="News Point" />
                        <NewsList items={newsItems} maxItems={6} />
                      </section>

                      {/* BOTTOM blue rule — nudged ONE notch lower */}
                      <div className="my-5">
                        <DoubleBlueRule />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
