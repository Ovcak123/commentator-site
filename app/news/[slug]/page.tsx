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
  excerpt?: string;
  author?: string;
  heroImageUrl?: string;
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
    excerpt,
    readTimeMinutes,
    "slug": slug.current,
    "author": coalesce(author, author->name, author.name, author->title, author.title),
    "heroImageUrl": heroImage.asset->url,
    "text": pt::text(body)
  }
`;

const moreNewsQuery = `
  *[_type == "newsItem" && slug.current != $slug] | order(publishedAt desc, _createdAt desc)[0...6]{
    _id,
    title,
    excerpt,
    readTimeMinutes,
    "slug": slug.current,
    "author": coalesce(author, author->name, author.name, author->title, author.title),
    "heroImageUrl": heroImage.asset->url,
    "text": pt::text(body)
  }
`;

/* ---------- PortableText ---------- */

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

/* ---------- helpers ---------- */

const MAJOR_HEADLINE_SERIF_CLASS = "font-serif tracking-[-0.022em]";

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

// Fallback estimator (only used when readTimeMinutes is missing)
function estimateMinutesFromText(text: any): number | undefined {
  if (typeof text !== "string") return undefined;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (!Number.isFinite(words) || words <= 0) return undefined;
  return Math.max(1, Math.round(words / 220));
}

/* ---------- read time ---------- */

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
      <span className="text-[11px] font-medium text-[#A79F95]">{m} min read</span>
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
    <span className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-2">
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
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.32em] text-[#9C9488]">
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
      <section className="relative overflow-hidden rounded-[5px] bg-[linear-gradient(135deg,rgba(59,8,16,0.90)_0%,rgba(85,12,23,0.90)_38%,rgba(102,16,29,0.82)_72%,rgba(77,11,21,0.88)_100%)] px-6 py-5 transition-all duration-200 group-hover:shadow-[0_18px_40px_rgba(0,0,0,0.24)] lg:px-7 lg:py-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.03),transparent_32%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.015),rgba(0,0,0,0.06))]" />

        <div className="relative">
          <h3
            className={`${MAJOR_HEADLINE_SERIF_CLASS} text-[18px] font-semibold leading-[1.08] text-[#F1E4D8] transition-colors duration-150 group-hover:text-[#FAF3EC] lg:text-[18.5px]`}
          >
            Join The Commentator Club
          </h3>

          <p className="mt-4 max-w-[50ch] text-[14.3px] leading-[1.68] text-[#E8D5C7] transition-colors duration-150 group-hover:text-[#F7EDE4] lg:text-[14.9px] lg:leading-[1.72]">
            A private community of CEOs, founders, and political, military, and
            intelligence leaders — alongside thinkers and innovators from around the
            world. Members can comment, engage directly, submit ideas, and shape the
            conversation.
          </p>

          <div className="mt-5 inline-flex items-center gap-2 text-[14.4px] font-semibold text-[#F2E5D8] transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-white">
            <span>Join for $5 a month</span>
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
    <section className="mx-auto max-w-[780px] overflow-hidden rounded-[22px] bg-[linear-gradient(180deg,#18212A_0%,#202A34_100%)] px-8 py-9 shadow-[inset_0_1px_0_rgba(255,255,255,0.025),inset_0_-1px_0_rgba(0,0,0,0.18)] lg:px-12 lg:py-11">
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_top_center,rgba(255,255,255,0.02),transparent_46%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(109,139,170,0.045),transparent_56%)]" />

        <div className="relative mx-auto max-w-[34rem] text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-[#C4D1DD]">
            The Commentator’s Mission
          </p>

          <div className="mt-6">
            <p
              className={`${MAJOR_HEADLINE_SERIF_CLASS} text-[34px] font-semibold leading-[0.98] text-[#E8DFD3] lg:text-[40px]`}
            >
              Understanding Power in the Digital Revolution
            </p>

            <p
              className={`${MAJOR_HEADLINE_SERIF_CLASS} mt-5 text-[18px] leading-[1.12] text-[#B7C4D1] lg:text-[19px]`}
            >
              Where bridges are built in a polarized world
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function MobileArticleCloser() {
  return (
    <>
      <div className="mt-14 mb-10 h-[2px] w-full bg-white/30" />

      <div className="mt-16 mb-6 text-center">
        <div className="mx-auto w-full max-w-[20rem] space-y-8">
          <Link
            href="/mission"
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
    </>
  );
}

function DesktopArticleCloser() {
  return (
    <div className="text-center">
      <div className="mx-auto w-full max-w-[24rem] space-y-10">
        <Link
          href="/mission"
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

      <p className="mt-20 text-[14px] text-white/38">
        The Commentator. © Robin Shepherd, 2026. All rights reserved.
      </p>
    </div>
  );
}

function MobileMostPopularSection({
  commentaryItems,
  newsItems,
}: {
  commentaryItems: SidebarItem[];
  newsItems: SidebarItem[];
}) {
  return (
    <section className="space-y-8">
      <SectionHeader title="Most Popular" />

      <div className="space-y-8">
        <div>
          <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#C2B9AD]">
            Commentary
          </div>

          <div>
            {commentaryItems.slice(0, 5).map((item, index) => (
              <article key={item.id}>
                <Link
                  href={item.href}
                  className="group grid grid-cols-[28px_1fr] gap-3 py-3 no-underline hover:no-underline focus:outline-none"
                  title={item.title}
                >
                  <div
                    className={`${MAJOR_HEADLINE_SERIF_CLASS} text-[32px] font-semibold leading-[0.84] text-[#F1E7DA]`}
                  >
                    {index + 1}
                  </div>

                  <div className="min-w-0 pt-[3px]">
                    <h3
                      className={`${MAJOR_HEADLINE_SERIF_CLASS} break-words text-[17px] font-semibold leading-[1.16] text-[#E4D8C9] transition-colors duration-150 group-hover:text-[#F0E7DA]`}
                    >
                      {item.title}
                    </h3>

                    {item.readTimeMinutes ? (
                      <div className="mt-1.5">
                        <ReadTimeBadge minutes={item.readTimeMinutes} />
                      </div>
                    ) : null}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#C2B9AD]">
            News
          </div>

          <div>
            {newsItems.slice(0, 5).map((item, index) => (
              <article key={item.id}>
                <Link
                  href={item.href}
                  className="group grid grid-cols-[28px_1fr] gap-3 py-3 no-underline hover:no-underline focus:outline-none"
                  title={item.title}
                >
                  <div
                    className={`${MAJOR_HEADLINE_SERIF_CLASS} text-[32px] font-semibold leading-[0.84] text-[#F1E7DA]`}
                  >
                    {index + 1}
                  </div>

                  <div className="min-w-0 pt-[3px]">
                    <h3
                      className={`${MAJOR_HEADLINE_SERIF_CLASS} break-words text-[17px] font-semibold leading-[1.16] text-[#E4D8C9] transition-colors duration-150 group-hover:text-[#F0E7DA]`}
                    >
                      {item.title}
                    </h3>

                    {item.readTimeMinutes ? (
                      <div className="mt-1.5">
                        <ReadTimeBadge minutes={item.readTimeMinutes} />
                      </div>
                    ) : null}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DesktopMostPopularSection({
  commentaryItems,
  newsItems,
}: {
  commentaryItems: SidebarItem[];
  newsItems: SidebarItem[];
}) {
  return (
    <section className="space-y-10">
      <SectionHeader title="Most Popular" />

      <div className="space-y-12">
        <div>
          <div className="mb-5 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#C2B9AD]">
            Commentary
          </div>

          <div>
            {commentaryItems.slice(0, 5).map((item, index) => (
              <article key={item.id}>
                <Link
                  href={item.href}
                  className="group grid grid-cols-[30px_1fr] gap-4 py-3 no-underline hover:no-underline focus:outline-none"
                  title={item.title}
                >
                  <div
                    className={`${MAJOR_HEADLINE_SERIF_CLASS} text-[40px] font-semibold leading-[0.84] text-[#F1E7DA]`}
                  >
                    {index + 1}
                  </div>

                  <div className="min-w-0 pt-[2px]">
                    <h3
                      className={`${MAJOR_HEADLINE_SERIF_CLASS} break-words text-[19px] font-semibold leading-[1.08] text-[#E4D8C9] transition-colors duration-150 group-hover:text-[#F0E7DA]`}
                    >
                      {item.title}
                    </h3>

                    {item.readTimeMinutes ? (
                      <div className="mt-2">
                        <ReadTimeBadge minutes={item.readTimeMinutes} />
                      </div>
                    ) : null}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-5 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#C2B9AD]">
            News
          </div>

          <div>
            {newsItems.slice(0, 5).map((item, index) => (
              <article key={item.id}>
                <Link
                  href={item.href}
                  className="group grid grid-cols-[30px_1fr] gap-4 py-3 no-underline hover:no-underline focus:outline-none"
                  title={item.title}
                >
                  <div
                    className={`${MAJOR_HEADLINE_SERIF_CLASS} text-[40px] font-semibold leading-[0.84] text-[#F1E7DA]`}
                  >
                    {index + 1}
                  </div>

                  <div className="min-w-0 pt-[2px]">
                    <h3
                      className={`${MAJOR_HEADLINE_SERIF_CLASS} break-words text-[19px] font-semibold leading-[1.08] text-[#E4D8C9] transition-colors duration-150 group-hover:text-[#F0E7DA]`}
                    >
                      {item.title}
                    </h3>

                    {item.readTimeMinutes ? (
                      <div className="mt-2">
                        <ReadTimeBadge minutes={item.readTimeMinutes} />
                      </div>
                    ) : null}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MobileNewsThumbnailSection({ items }: { items: SidebarItem[] }) {
  const leadItem = items[0];
  const thumbnailItems = items.slice(1, 6);

  return (
    <section className="space-y-6">
      <SectionHeader title="More News" />

      <div className="space-y-10">
        {leadItem ? (
          <article className="group relative overflow-visible">
            <Link
              href={leadItem.href}
              className="block no-underline hover:no-underline focus:outline-none"
              title={leadItem.title}
            >
              {leadItem.heroImageUrl ? (
                <div className="mb-8 h-56 overflow-hidden rounded-[2px] bg-white/5 ring-1 ring-white/10 sm:h-64">
                  <img
                    src={leadItem.heroImageUrl}
                    alt={leadItem.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                    loading="lazy"
                  />
                </div>
              ) : null}

              <h3 className="break-words text-[22px] font-semibold leading-[1.14] text-[#D8CBB8] transition-colors duration-150 group-hover:text-[#E6DBCC]">
                <InlineTitleWithReadTime
                  title={leadItem.title}
                  minutes={leadItem.readTimeMinutes}
                />
              </h3>

              {leadItem.excerpt ? (
                <p className="mt-4 text-[15.75px] leading-[1.78] text-[#DDD4C8] transition-colors duration-150 group-hover:text-[#E7DED2]">
                  {leadItem.excerpt}
                </p>
              ) : null}

              {leadItem.author ? (
                <p className="mt-5 text-[12px] font-medium uppercase tracking-[0.24em] text-[#D08B5E]/88 transition-colors duration-150 group-hover:text-[#E29A69]">
                  {leadItem.author}
                </p>
              ) : null}
            </Link>
          </article>
        ) : null}

        {thumbnailItems.length > 0 ? (
          <div className="space-y-8">
            {thumbnailItems.map((item) => (
              <article key={item.id} className="group relative overflow-visible">
                <Link
                  href={item.href}
                  className="grid grid-cols-[104px_1fr] items-stretch gap-4 no-underline hover:no-underline focus:outline-none"
                  title={item.title}
                >
                  <div className="h-[112px] w-[104px] shrink-0 overflow-hidden rounded-[2px] bg-white/5 ring-1 ring-white/10">
                    {item.heroImageUrl ? (
                      <img
                        src={item.heroImageUrl}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full bg-white/[0.04]" />
                    )}
                  </div>

                  <div className="flex h-[112px] min-w-0 flex-col justify-between pr-1">
                    <div className="min-w-0">
                      <h3 className="line-clamp-3 break-words text-[16px] font-semibold leading-[1.1] text-[#D8CBB8] transition-colors duration-150 group-hover:text-[#E6DBCC]">
                        {item.title}
                      </h3>

                      {item.readTimeMinutes ? (
                        <div className="mt-2">
                          <ReadTimeBadge minutes={item.readTimeMinutes} />
                        </div>
                      ) : null}
                    </div>

                    {item.author ? (
                      <p className="pt-3 text-[10px] font-medium uppercase tracking-[0.17em] leading-[1.2] text-[#D08B5E]/84 transition-colors duration-150 group-hover:text-[#E29A69]">
                        {item.author}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function DesktopNewsSection({ items }: { items: SidebarItem[] }) {
  const leadItem = items[0];
  const thumbnailItems = items.slice(1, 6);

  return (
    <section className="space-y-8">
      <SectionHeader title="More News" />

      <div className="space-y-10">
        {leadItem ? (
          <article className="group relative overflow-visible">
            <Link
              href={leadItem.href}
              className="block no-underline hover:no-underline focus:outline-none"
              title={leadItem.title}
            >
              {leadItem.heroImageUrl ? (
                <div className="mb-7 max-w-[580px] aspect-[1.18/1] overflow-hidden rounded-[2px] bg-white/5 ring-1 ring-white/10">
                  <img
                    src={leadItem.heroImageUrl}
                    alt={leadItem.title}
                    className="block h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                    loading="lazy"
                  />
                </div>
              ) : null}

              <h3
                className={`${MAJOR_HEADLINE_SERIF_CLASS} max-w-[18.5ch] break-words text-[22px] font-semibold leading-[1.03] text-[#D8CBB8] transition-colors duration-150 group-hover:text-[#E6DBCC]`}
              >
                <InlineTitleWithReadTime
                  title={leadItem.title}
                  minutes={leadItem.readTimeMinutes}
                />
              </h3>

              {leadItem.excerpt ? (
                <p className="mt-4 max-w-[42rem] text-[15.6px] leading-[1.76] text-[#DDD4C8] transition-colors duration-150 group-hover:text-[#E7DED2]">
                  {leadItem.excerpt}
                </p>
              ) : null}

              {leadItem.author ? (
                <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.22em] text-[#D08B5E]/88 transition-colors duration-150 group-hover:text-[#E29A69]">
                  {leadItem.author}
                </p>
              ) : null}
            </Link>
          </article>
        ) : null}

        {thumbnailItems.length > 0 ? (
          <div className="space-y-7">
            {thumbnailItems.map((item) => (
              <article key={item.id} className="group relative overflow-visible">
                <Link
                  href={item.href}
                  className="grid grid-cols-[104px_1fr] items-stretch gap-4 no-underline hover:no-underline focus:outline-none"
                  title={item.title}
                >
                  <div className="h-[104px] w-[104px] shrink-0 overflow-hidden rounded-[2px] bg-white/5 ring-1 ring-white/10">
                    {item.heroImageUrl ? (
                      <img
                        src={item.heroImageUrl}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full bg-white/[0.04]" />
                    )}
                  </div>

                  <div className="flex h-[104px] min-w-0 flex-col justify-between pr-1">
                    <div className="min-w-0">
                      <h3
                        className={`${MAJOR_HEADLINE_SERIF_CLASS} line-clamp-3 break-words text-[16px] font-semibold leading-[1.08] text-[#D8CBB8] transition-colors duration-150 group-hover:text-[#E6DBCC]`}
                      >
                        {item.title}
                      </h3>

                      {item.readTimeMinutes ? (
                        <div className="mt-1.5">
                          <ReadTimeBadge minutes={item.readTimeMinutes} />
                        </div>
                      ) : null}
                    </div>

                    {item.author ? (
                      <p className="pt-2.5 text-[10px] font-medium uppercase tracking-[0.18em] leading-[1.2] text-[#D08B5E]/84 transition-colors duration-150 group-hover:text-[#E29A69]">
                        {item.author}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* ---------- sidebar UI ---------- */

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
            <span className="font-medium">
              {it.title} <ReadTimeBadge minutes={it.readTimeMinutes} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

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

/* ---------- page ---------- */

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
  const [item, mostReadDocs, moreNewsDocs] = await Promise.all([
    client.fetch(singleNewsQuery, { slug: params.slug }, { cache: "no-store" }),
    client.fetch(mostReadQuery, {}, { cache: "no-store" }),
    client.fetch(moreNewsQuery, { slug: params.slug }, { cache: "no-store" }),
  ]);

  if (!item || !item.title) notFound();

  const itemReadMinutes =
    normalizeMinutes(item?.readTimeMinutes) ??
    estimateMinutesFromText(item?.text) ??
    estimateMinutesFromText(item?.excerpt);

  const authorName = normalizeAuthor(item?.author);
  const date = formatDate(item?.publishedAt);

  const mostRead: SidebarItem[] = (mostReadDocs ?? [])
    .map((d: any) => ({
      id: d._id,
      title: d.title ?? "Untitled",
      href: d.slug ? `/posts/${d.slug}` : "#",
      readTimeMinutes: normalizeMinutes(d.readTimeMinutes) ?? estimateMinutesFromText(d.text),
      excerpt: typeof d.excerpt === "string" ? d.excerpt : undefined,
      author: normalizeAuthor(d.author),
      heroImageUrl: typeof d.heroImageUrl === "string" ? d.heroImageUrl : undefined,
    }))
    .filter((x: SidebarItem) => x.href !== "#");

  const moreNews: SidebarItem[] = (moreNewsDocs ?? [])
    .map((d: any) => ({
      id: d._id,
      title: d.title ?? "Untitled",
      href: d.slug ? `/news/${d.slug}` : "#",
      readTimeMinutes: normalizeMinutes(d.readTimeMinutes) ?? estimateMinutesFromText(d.text),
      excerpt: typeof d.excerpt === "string" ? d.excerpt : undefined,
      author: normalizeAuthor(d.author),
      heroImageUrl: typeof d.heroImageUrl === "string" ? d.heroImageUrl : undefined,
    }))
    .filter((x: SidebarItem) => x.href !== "#");

  const heroUrl = item?.heroImage?.asset ? urlFor(item.heroImage).url() : "";

  return (
    <main className="news min-h-screen bg-[#0B0D10] text-[#E6E9EE]">
      <Header />

      <div className="mx-auto max-w-[1100px] px-4 py-10">
        <div className="mx-auto max-w-[860px]">
          <header className="pt-1 lg:pt-14">
            <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_max-content] lg:items-start lg:gap-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#9C9488]">
                  News
                </p>

                <h1 className="mt-10 text-[2.12rem] font-semibold leading-[1.03] tracking-tight text-[#D2C5B3] md:text-3xl lg:mt-8 lg:max-w-[42rem] lg:text-[1.94rem] lg:leading-[1.08]">
                  <span className="lg:hidden">
                    <TitleWithReadTime title={item.title} minutes={itemReadMinutes} />
                  </span>
                  <span className="hidden lg:inline">{item.title}</span>
                </h1>

                <div className="hidden lg:mt-4 lg:block">
                  <ReadTimeBadge minutes={itemReadMinutes} />
                </div>

                {item.excerpt ? (
                  <p className="mt-5 max-w-[36ch] text-[16.5px] leading-[1.62] text-[#CBC3B8] md:max-w-none md:text-[15px] md:leading-[1.7] lg:mt-5 lg:max-w-[46rem] lg:text-[16px] lg:leading-[1.76]">
                    {item.excerpt}
                  </p>
                ) : null}

                {authorName ? (
                  <p className="mt-5 text-xs lg:mt-5">
                    <span className="uppercase tracking-[0.16em] text-[#C67C4E]">{authorName}</span>
                    {date ? <span className="text-[#A79F95]">{` · ${date}`}</span> : null}
                  </p>
                ) : date ? (
                  <p className="mt-5 text-xs uppercase tracking-[0.16em] text-[#A79F95] lg:mt-5">
                    {date}
                  </p>
                ) : null}
              </div>

              <div className="hidden lg:flex lg:justify-end lg:pr-2 lg:pt-[1.05rem]">
                <DesktopShare title={item.title} />
              </div>
            </div>
          </header>

          {heroUrl ? (
            <div className="mt-9 max-w-[760px] overflow-hidden rounded-[2px] bg-white/5 ring-1 ring-white/10 lg:mt-8 lg:aspect-[2.08/1]">
              <img
                src={heroUrl}
                alt={item.title}
                className="block h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          ) : null}

          <div className="mt-4 flex justify-end lg:hidden">
            <MobileShare title={item.title} />
          </div>

          <section
            className="mt-0 max-w-none prose prose-invert lg:mt-10 lg:max-w-[760px]
            prose-headings:text-[#D8CBB8]
            prose-p:text-[#CBC3B8]
            prose-strong:text-[#D8CBB8]
            prose-em:text-[#CBC3B8]
            prose-li:text-[#CBC3B8]
            prose-blockquote:text-[#CBC3B8]
            prose-a:text-[#D8CBB8]
            prose-code:text-[#D8CBB8]
            prose-pre:text-[#CBC3B8]
            prose-hr:border-white/10

            [&_p]:text-[19px] [&_p]:leading-[1.82]
            md:[&_p]:text-[19.4px] md:[&_p]:leading-[1.84]
            lg:[&_p]:text-[17.7px] lg:[&_p]:leading-[1.78]

            [&_li]:text-[18.4px] [&_li]:leading-[1.75]
            md:[&_li]:text-[18.8px] md:[&_li]:leading-[1.78]
            lg:[&_li]:text-[17.2px] lg:[&_li]:leading-[1.72]

            [&_blockquote]:text-[18.4px] [&_blockquote]:leading-[1.75]
            md:[&_blockquote]:text-[18.8px] md:[&_blockquote]:leading-[1.78]
            lg:[&_blockquote]:text-[17.2px] lg:[&_blockquote]:leading-[1.72]"
          >
            <PortableText value={item.body ?? []} components={portableTextComponents} />
          </section>

          <div className="mt-10 flex justify-end lg:hidden">
            <MobileShare title={item.title} />
          </div>

          <div className="mt-12 hidden justify-end lg:flex">
            <DesktopShare title={item.title} />
          </div>

          <div className="mt-6 mb-2 flex justify-center lg:hidden">
            <div className="h-[2px] w-20 bg-white/25" />
          </div>

          <section className="mt-16 mb-10 lg:hidden">
            <CommentatorClubPanel />
          </section>

          <div className="mt-20 space-y-14 lg:hidden">
            <MobileMostPopularSection commentaryItems={mostRead} newsItems={moreNews} />

            {moreNews.length > 0 ? <MobileNewsThumbnailSection items={moreNews} /> : null}

            <div className="pt-2 pb-2">
              <MobileMissionBlock />
            </div>

            <MobileArticleCloser />
          </div>

          <div className="hidden lg:block">
            <div className="mt-10 flex justify-center">
              <div className="h-[2px] w-[220px] bg-white/28" />
            </div>

            <section className="mt-16 max-w-[760px]">
              <DesktopCommentatorClubPanel />
            </section>

            <section className="mt-24 max-w-[760px]">
              <DesktopMostPopularSection commentaryItems={mostRead} newsItems={moreNews} />
            </section>

            {moreNews.length > 0 ? (
              <section className="mt-24 max-w-[760px]">
                <DesktopNewsSection items={moreNews} />
              </section>
            ) : null}

            <section className="mt-24">
              <DesktopMissionBlock />
            </section>

            <section className="mt-24 pb-20">
              <DesktopArticleCloser />
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}