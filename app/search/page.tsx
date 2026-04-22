// app/search/page.tsx

export const dynamic = "force-dynamic";
export const revalidate = 0;

import Header from "../../components/Header";
import Link from "next/link";
import { client } from "../../sanity/lib/client";
import type { ReactNode } from "react";

type Hit = {
  id: string;
  title: string;
  href: string;
  kind: "Commentary" | "News Point" | "Feed Read";
  meta?: string;
};

const MAJOR_HEADLINE_SERIF_CLASS = "font-serif tracking-[-0.022em]";

function safeQ(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

async function getSearchResults(q: string): Promise<Hit[]> {
  if (!q) return [];

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

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70">
      {children}
    </span>
  );
}

function CommentatorClubPanel() {
  return (
    <Link
      href="/club"
      className="group block no-underline hover:no-underline focus:outline-none"
      aria-label="Join The Commentator Club"
    >
      <section className="relative overflow-hidden rounded-[6px] border border-[#E7C9B4]/[0.08] bg-[linear-gradient(135deg,rgba(52,7,15,0.96)_0%,rgba(88,11,24,0.95)_34%,rgba(116,18,33,0.92)_66%,rgba(79,10,21,0.96)_100%)] px-7 py-7 transition-all duration-200 group-hover:border-[#E7C9B4]/[0.14] group-hover:shadow-[0_14px_34px_rgba(0,0,0,0.28)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.085),transparent_28%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(255,220,190,0.055),transparent_24%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.035),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.28),transparent)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0.008)_24%,rgba(0,0,0,0.10)_100%)]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[38%] bg-[linear-gradient(to_left,rgba(255,255,255,0.03),transparent_72%)] opacity-80" />

        <div className="relative">
          <div className="mb-3 inline-flex items-center rounded-full border border-[#F3D9C7]/[0.08] bg-black/5 px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-[0.24em] text-[#F0D8C7]/65">
            Membership
          </div>

          <h3
            className={`${MAJOR_HEADLINE_SERIF_CLASS} text-[19px] font-semibold leading-[1.06] text-[#F4E7DB] transition-colors duration-150 group-hover:text-[#FFF5ED]`}
          >
            Join The Commentator Club
          </h3>

          <p className="mt-4 max-w-none text-[14.2px] leading-[1.9] text-[#E9D6C8] transition-colors duration-150 group-hover:text-[#FAEEE5]">
            A community of founders, CEOs, policymakers, and thinkers who want to be part of the
            conversation, not outside it. Members get early insight into our ideas, contribute
            directly, and take part in discussions with the people shaping what comes next.
          </p>

          <div className="mt-6 flex items-end justify-between gap-3">
            <div className="text-[12.5px] font-semibold tracking-[0.04em] text-[#F4E7DB]">
              $5 per month
            </div>

            <div className="inline-flex items-center gap-2 text-[14px] font-semibold text-white transition-all duration-150 group-hover:translate-x-0.5">
              <span>Learn more</span>
              <span aria-hidden="true" className="text-[17px] leading-none">
                →
              </span>
            </div>
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
      <section className="relative overflow-hidden rounded-[6px] border border-[#E7C9B4]/[0.08] bg-[linear-gradient(135deg,rgba(52,7,15,0.96)_0%,rgba(88,11,24,0.95)_34%,rgba(116,18,33,0.92)_66%,rgba(79,10,21,0.96)_100%)] px-7 py-6 transition-all duration-200 group-hover:border-[#E7C9B4]/[0.14] group-hover:shadow-[0_18px_40px_rgba(0,0,0,0.24)] lg:px-8 lg:py-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.085),transparent_28%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(255,220,190,0.055),transparent_24%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.035),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.28),transparent)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0.008)_24%,rgba(0,0,0,0.10)_100%)]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[38%] bg-[linear-gradient(to_left,rgba(255,255,255,0.03),transparent_72%)] opacity-80" />

        <div className="relative">
          <div className="mb-3 inline-flex items-center rounded-full border border-[#F3D9C7]/[0.08] bg-black/5 px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-[0.24em] text-[#F0D8C7]/65">
            Membership
          </div>

          <h3
            className={`${MAJOR_HEADLINE_SERIF_CLASS} text-[19px] font-semibold leading-[1.06] text-[#F4E7DB] transition-colors duration-150 group-hover:text-[#FFF5ED] lg:text-[20px]`}
          >
            Join The Commentator Club
          </h3>

          <p className="mt-4 max-w-[64ch] text-[15.4px] leading-[1.78] text-[#E9D6C8] transition-colors duration-150 group-hover:text-[#FAEEE5] lg:text-[16px] lg:leading-[1.82]">
            A community of founders, CEOs, policymakers, and thinkers who want to be part of the
            conversation, not outside it. Members get early insight into our ideas, contribute
            directly, and take part in discussions with the people shaping what comes next.
          </p>

          <div className="mt-6 flex items-end justify-between gap-3">
            <div className="text-[12.5px] font-semibold tracking-[0.04em] text-[#F4E7DB]">
              $5 per month
            </div>

            <div className="inline-flex items-center gap-2 text-[14px] font-semibold text-white transition-all duration-150 group-hover:translate-x-0.5">
              <span>Learn more</span>
              <span aria-hidden="true" className="text-[17px] leading-none">
                →
              </span>
            </div>
          </div>
        </div>
      </section>
    </Link>
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
    <main className="relative min-h-screen overflow-hidden bg-[#0B0D10] text-[#E6E9EE]">
            {/* FULL-PAGE BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-50 md:opacity-50">
        <img
          src="/most-popular-banner.jpg"
          alt=""
          aria-hidden="true"
          className="absolute left-0 top-[-56%] h-[198%] w-full object-cover object-[100%_24%] opacity-[0.22] scale-[1.22] md:top-[-34%] md:h-[168%] md:object-[100%_46%] md:opacity-[0.09]"
        />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(11,13,16,0.20),rgba(11,13,16,0.10)_24%,rgba(11,13,16,0.10)_56%,rgba(11,13,16,0.18)_100%)]" />

        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(11,13,16,0.028)_0%,rgba(11,13,16,0.040)_12%,rgba(11,13,16,0.070)_24%,rgba(11,13,16,0.16)_42%,rgba(11,13,16,0.24)_58%,rgba(11,13,16,0.20)_74%,rgba(11,13,16,0.16)_88%,rgba(11,13,16,0.14)_100%)]" />

        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,transparent_12%,rgba(8,10,14,0.08)_28%,rgba(8,10,14,0.16)_44%,rgba(8,10,14,0.20)_58%,rgba(8,10,14,0.14)_74%,transparent_88%)]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_54%_82%,rgba(201,122,74,0.030),transparent_22%),radial-gradient(circle_at_74%_88%,rgba(68,122,214,0.030),transparent_20%),radial-gradient(circle_at_38%_92%,rgba(255,255,255,0.012),transparent_18%)]" />

        <div className="absolute inset-x-0 top-0 h-[36%] bg-[linear-gradient(to_bottom,rgba(255,255,255,0.010),rgba(255,255,255,0.003)_26%,transparent_72%)]" />

        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(11,13,16,0.08)_0%,rgba(11,13,16,0.05)_8%,rgba(11,13,16,0.03)_16%,transparent_28%)]" />

        {/* LEFT-SIDE BODY VEIL TO KILL BAKED-IN LETTERING */}
        <div className="absolute left-0 top-[21rem] h-[24rem] w-[24%] bg-[linear-gradient(to_right,rgba(11,13,16,0.58)_0%,rgba(11,13,16,0.34)_36%,rgba(11,13,16,0.12)_64%,transparent_100%)] md:top-[21rem] md:h-[28rem] md:w-[18%]" />
      </div>

      {/* CONTENT */}
      <div className="relative z-20">
        <div className="pointer-events-none absolute right-0 top-0 z-[6] hidden h-[22rem] w-[30rem] bg-[linear-gradient(to_left,rgba(11,13,16,0.16)_0%,rgba(11,13,16,0.09)_28%,rgba(11,13,16,0.035)_54%,transparent_80%)] opacity-50 md:block" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] hidden h-[22rem] bg-[linear-gradient(to_bottom,rgba(11,13,16,0.22)_0%,rgba(11,13,16,0.16)_28%,rgba(11,13,16,0.10)_52%,transparent_78%)] opacity-50 md:block" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-[18rem] bg-[radial-gradient(circle_at_22%_16%,rgba(68,122,214,0.10),transparent_34%),radial-gradient(circle_at_78%_18%,rgba(201,122,74,0.08),transparent_32%),linear-gradient(to_bottom,rgba(255,255,255,0.022)_0%,rgba(255,255,255,0.008)_20%,transparent_60%)] md:hidden" />
        <Header transparentOnDark />

        <section className="relative overflow-hidden px-5 pb-16 pt-24 text-left md:px-0 md:pb-20 md:pt-32">
          <div className="relative md:ml-[11.625rem] md:max-w-[46rem]">
            <h1 className="mb-14 text-[2.35rem] font-semibold tracking-[-0.032em] text-[#EEF2F7] md:text-[3.1rem]">
              Search
            </h1>

            <form action="/search" method="get" className="space-y-3">
              <label className="sr-only" htmlFor="q">
                Search query
              </label>

              <div className="flex items-center gap-3">
                              <input
                  id="q"
                  name="q"
                  defaultValue={q}
                  placeholder="Type to search"
                  className="w-full rounded-md bg-white/10 px-4 py-3 text-[14px] text-white/90 placeholder:text-white/25 ring-1 ring-white/20 outline-none focus:ring-2 focus:ring-[#C67C4E]/40"
                  autoComplete="off"
                />  
                <button
                  type="submit"
                  className="shrink-0 rounded-md bg-white/5 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/75 ring-1 ring-white/10 transition-colors duration-150 hover:text-white hover:ring-white/20"
                >
                  Go
                </button>
              </div>

              <p className="text-[12px] leading-relaxed text-white/55">
                Tip: try names, countries, AI topics, or a phrase from a headline.
              </p>
            </form>

            <div className="space-y-4 pt-8">
                            {q ? (
                <p className="text-[12px] text-white/55">
                  Results for{" "}
                  <span className="text-white/85" style={{ fontStyle: "italic" }}>
                    “{q}”
                  </span>
                  : <span className="text-white/75">{hits.length}</span>
                </p>
              ) : null}

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

            <div className="mt-16 md:hidden">
              <CommentatorClubPanel />
            </div>

            <div className="mt-20 hidden md:block">
              <DesktopCommentatorClubPanel />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}