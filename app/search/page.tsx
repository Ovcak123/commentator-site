// app/search/page.tsx

export const dynamic = "force-dynamic";
export const revalidate = 0;

import Header from "../../components/Header";
import Link from "next/link";
import { client } from "../../sanity/lib/client";

type Hit = {
  id: string;
  title: string;
  href: string;
  kind: "Commentary" | "News Point" | "Feed Read";
  meta?: string;
};

function safeQ(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

async function getSearchResults(q: string): Promise<Hit[]> {
  if (!q) return [];

  // NOTE: GROQ `match` is the simplest workable V1 search.
  // We search title/excerpt/author for posts, title for newsItem, title/source for feedRead.
  const postsQuery = `
    *[_type == "post" && (title match $q || excerpt match $q || author match $q)]
    | order(publishedAt desc, _createdAt desc)[0...20]{
      _id, title, "slug": slug.current, author
    }
  `;

  const newsQuery = `
    *[_type == "newsItem" && (title match $q)]
    | order(publishedAt desc, _createdAt desc)[0...20]{
      _id, title, "slug": slug.current
    }
  `;

  const feedQuery = `
    *[_type == "feedRead" && (title match $q || source match $q)]
    | order(publishedAt desc, _createdAt desc)[0...20]{
      _id, title, source, url
    }
  `;

  const [posts, news, feed] = await Promise.all([
    client.fetch(postsQuery, { q }),
    client.fetch(newsQuery, { q }),
    client.fetch(feedQuery, { q }),
  ]);

  const hits: Hit[] = [];

  (posts || []).forEach((p: any) => {
    if (!p?.slug) return;
    hits.push({
      id: p._id,
      title: p.title,
      href: `/posts/${p.slug}`,
      kind: "Commentary",
      meta: p.author ? String(p.author) : undefined,
    });
  });

  (news || []).forEach((n: any) => {
    if (!n?.slug) return;
    hits.push({
      id: n._id,
      title: n.title,
      href: `/news/${n.slug}`,
      kind: "News Point",
    });
  });

  (feed || []).forEach((f: any) => {
    hits.push({
      id: f._id,
      title: f.title,
      href: f.url || "#",
      kind: "Feed Read",
      meta: f.source ? String(f.source) : undefined,
    });
  });

  return hits;
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70">
      {children}
    </span>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const q = safeQ(searchParams?.q);
  const hits = await getSearchResults(q);

  return (
    <main className="min-h-screen bg-[#0B0D10] text-[#E6E9EE]">
      <Header />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-[18px] font-semibold uppercase tracking-[0.28em] text-white/90">
              Search
            </h1>
            <span className="block h-[2px] w-[84px] bg-[#C67C4E]/35" />
          </div>

          {/* GET form so URL stays shareable: /search?q=... */}
          <form action="/search" method="get" className="space-y-3">
            <label className="sr-only" htmlFor="q">
              Search query
            </label>

            <div className="flex items-center gap-3">
              <input
                id="q"
                name="q"
                defaultValue={q}
                placeholder="Search commentary, News Point, Feed Read…"
                className="w-full rounded-md bg-white/5 px-4 py-3 text-[14px] text-white/90 placeholder:text-white/35 ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-[#C67C4E]/40"
                autoComplete="off"
              />
              <button
                type="submit"
                className="shrink-0 rounded-md bg-white/5 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/75 ring-1 ring-white/10 transition-colors duration-150 hover:text-white hover:ring-white/20"
              >
                Go
              </button>
            </div>

            <p className="text-[12px] leading-relaxed text-white/45">
              Tip: try names, countries, AI topics, or a phrase from a headline.
            </p>
          </form>

          {/* Results */}
          <div className="space-y-4 pt-2">
            {q ? (
              <p className="text-[12px] text-white/55">
                Results for{" "}
                <span className="text-white/85" style={{ fontStyle: "italic" }}>
                  “{q}”
                </span>
                : <span className="text-white/75">{hits.length}</span>
              </p>
            ) : (
              <p className="text-[12px] text-white/55">
                Enter a query to search across the site.
              </p>
            )}

            {hits.length > 0 && (
              <ul className="space-y-3">
                {hits.map((h) => {
                  const isExternal = h.href.startsWith("http");

                  const Row = (
                    <div className="group relative overflow-visible">
                      <span className="pointer-events-none absolute -left-3 top-2 bottom-2 w-px bg-transparent transition-colors group-hover:bg-[#C67C4E]/90" />
                      <div className="flex items-start justify-between gap-4 py-2">
                        <div className="min-w-0">
                          <div
                            className="text-[14px] font-semibold leading-snug text-white/88 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-white"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {h.title}
                          </div>

                          {h.meta ? (
                            <div className="mt-1 text-[11px] uppercase tracking-[0.20em] text-[#C67C4E]/55 transition-colors duration-150 group-hover:text-[#C67C4E]">
                              {h.meta}
                            </div>
                          ) : null}
                        </div>

                        <Chip>{h.kind}</Chip>
                      </div>
                    </div>
                  );

                  return (
                    <li key={h.id}>
                      {isExternal ? (
                        <a
                          href={h.href}
                          target="_blank"
                          rel="noreferrer"
                          className="block no-underline hover:no-underline"
                        >
                          {Row}
                        </a>
                      ) : (
                        <Link
                          href={h.href}
                          className="block no-underline hover:no-underline"
                        >
                          {Row}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {q && hits.length === 0 && (
              <div className="rounded-md border border-white/10 bg-white/5 p-4 text-[13px] text-white/60">
                No matches found. Try a shorter query or a different keyword.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
