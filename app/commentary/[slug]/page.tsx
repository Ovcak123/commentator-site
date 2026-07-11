export const dynamic = "force-dynamic";
export const revalidate = 0;

import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "../../../components/Header";
import CommentatorClubCard from "../../../components/CommentatorClubCard";
import MobileShare from "../../../components/MobileShare";
import DesktopShare from "../../../components/DesktopShare";
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
  excerpt?: string;
  author?: string;
  heroImageUrl?: string;
};

type ExplicitLead = {
  id: string;
  type: "post" | "newsItem";
  title: string;
  excerpt?: string;
  slug?: string;
  heroImageUrl?: string;
  readTimeMinutes?: number;
  author?: string;
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
  *[_type == "post" && slug.current != $slug] | order(publishedAt desc, _createdAt desc)[0...6]{
    _id,
    title,
    excerpt,
    readTimeMinutes,
    "slug": slug.current,
    "author": coalesce(author, author->name, author.name, author->title, author.title),
    "heroImageUrl": heroImage.asset->url
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
    readTimeMinutes,
    "slug": slug.current,
    "heroImageUrl": heroImage.asset->url
  }
`;

/* ---------- helpers ---------- */

const MAJOR_HEADLINE_SERIF_CLASS = "font-serif tracking-[-0.022em]";

function normalizeMinutes(value: any): number | undefined {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : undefined;
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
            A community of founders, CEOs, policymakers, and thinkers
            who want to be part of the conversation, not outside it.
            Members get early insight into our ideas, contribute directly, and take
            part in discussions with the people shaping what comes next.
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
            A community of founders, CEOs, policymakers, and thinkers
            who want to be part of the conversation, not outside it.
            Members get early insight into our ideas, contribute directly, and take
            part in discussions with the people shaping what comes next.
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

function MobileArticleCloser() {
  return (
    <>
      <div className="mt-40 h-[2px] w-full bg-white/30" />

      <div className="pt-24 pb-12 text-center">
        <div className="mx-auto w-full max-w-[20rem] space-y-8">
          <Link
            href="/about"
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

function MobileMostPopularSection({
  commentaryItems,
  newsItems,
}: {
  commentaryItems: SidebarItem[];
  newsItems: SidebarItem[];
}) {
  return (
    <section className="relative mx-auto max-w-[34rem] pt-6">
      <div className="relative overflow-visible">
        {/* TOP IMAGE */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[392px] overflow-hidden">
          <img
            src="/most-popular-banner.jpg"
            alt="What readers are engaging with right now"
            className="absolute inset-0 h-full w-full object-cover object-[14%_top] opacity-[0.98]"
          />

          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(11,13,16,0.10),rgba(11,13,16,0.04)_24%,rgba(11,13,16,0.05)_56%,rgba(11,13,16,0.14)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(11,13,16,0.00)_0%,rgba(11,13,16,0.015)_16%,rgba(11,13,16,0.04)_38%,rgba(11,13,16,0.10)_68%,rgba(11,13,16,0.18)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_24%,rgba(255,255,255,0.18),rgba(255,255,255,0.08)_16%,transparent_34%)]" />
        </div>

        {/* FULL-HEIGHT BACKGROUND */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <img
            src="/most-popular-banner.jpg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-[82%_38%] opacity-[0.52]"
          />

          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(11,13,16,0.15),rgba(11,13,16,0.07)_24%,rgba(11,13,16,0.08)_56%,rgba(11,13,16,0.16)_100%)]" />

          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(11,13,16,0.07)_0%,rgba(11,13,16,0.07)_16%,rgba(11,13,16,0.10)_30%,rgba(11,13,16,0.20)_42%,rgba(11,13,16,0.24)_54%,rgba(11,13,16,0.17)_68%,rgba(11,13,16,0.12)_82%,rgba(11,13,16,0.10)_100%)]" />

          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,transparent_28%,rgba(8,10,14,0.18)_36%,rgba(8,10,14,0.30)_46%,rgba(8,10,14,0.32)_56%,rgba(8,10,14,0.18)_66%,transparent_78%)]" />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_54%_82%,rgba(201,122,74,0.075),transparent_22%),radial-gradient(circle_at_74%_88%,rgba(68,122,214,0.070),transparent_20%),radial-gradient(circle_at_38%_92%,rgba(255,255,255,0.035),transparent_18%)]" />

          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(255,255,255,0.018)_0%,rgba(255,255,255,0.010)_10%,transparent_24%)]" />
        </div>

        {/* SIDE DISSOLVES */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-[linear-gradient(to_right,#0B0D10,rgba(11,13,16,0.62),rgba(11,13,16,0.22),transparent)]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-[linear-gradient(to_left,#0B0D10,rgba(11,13,16,0.62),rgba(11,13,16,0.22),transparent)]" />

        {/* CONTENT */}
        <div className="relative z-20 px-6 pt-[352px] pb-16">
          <div className="space-y-14">
            {commentaryItems.length > 0 ? (
              <MostPopularRankedList
                items={commentaryItems}
                sectionTitle="Commentary"
              />
            ) : null}

            {newsItems.length > 0 ? (
              <MostPopularRankedList
                items={newsItems}
                sectionTitle="News"
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function MostPopularRankedList({
  items,
  sectionTitle,
  startIndex = 1,
}: {
  items: SidebarItem[];
  sectionTitle: string;
  startIndex?: number;
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#E6DDD0]/88">
        {sectionTitle}
      </h3>

      <ol className="space-y-7">
        {items.slice(0, 5).map((item, index) => {
          const rank = startIndex + index;

          return (
            <li key={item.id} className="group">
              <Link
                href={item.href}
                className="grid grid-cols-[22px_1fr] items-start gap-3 no-underline transition-all duration-150 hover:no-underline group-hover:translate-x-0.5"
              >
                <span
                  className={`${MAJOR_HEADLINE_SERIF_CLASS} text-[22px] font-semibold leading-[1] text-[#EDE3D6]/90`}
                >
                  {rank}
                </span>

                <div className="min-w-0 pt-[1px]">
                  <span
                    className={`${MAJOR_HEADLINE_SERIF_CLASS} block text-[17px] font-semibold leading-[1.12] text-[#E7DDD0] transition-colors duration-150 group-hover:text-[#F3EBE0]`}
                  >
                    {item.title}
                  </span>

                  {item.readTimeMinutes ? (
                    <div className="mt-2">
                      <ReadTimeBadge minutes={item.readTimeMinutes} />
                    </div>
                  ) : null}
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
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
    <section className="relative mx-auto max-w-[34rem] pt-16">
      <div className="relative overflow-visible">
        {/* TOP IMAGE */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[392px] overflow-hidden">
          <img
            src="/most-popular-banner.jpg"
            alt="What readers are engaging with right now"
            className="absolute inset-0 h-full w-full object-cover object-[28%_top] opacity-[0.98]"
          />

          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(11,13,16,0.10),rgba(11,13,16,0.04)_24%,rgba(11,13,16,0.05)_56%,rgba(11,13,16,0.14)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(11,13,16,0.00)_0%,rgba(11,13,16,0.015)_16%,rgba(11,13,16,0.04)_38%,rgba(11,13,16,0.10)_68%,rgba(11,13,16,0.18)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_24%,rgba(255,255,255,0.18),rgba(255,255,255,0.08)_16%,transparent_34%)]" />
        </div>

        {/* FULL-HEIGHT BACKGROUND */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <img
            src="/most-popular-banner.jpg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-[74%_28%] opacity-[0.52]"
          />

          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(11,13,16,0.15),rgba(11,13,16,0.07)_24%,rgba(11,13,16,0.08)_56%,rgba(11,13,16,0.16)_100%)]" />

          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(11,13,16,0.07)_0%,rgba(11,13,16,0.07)_16%,rgba(11,13,16,0.10)_30%,rgba(11,13,16,0.20)_42%,rgba(11,13,16,0.24)_54%,rgba(11,13,16,0.17)_68%,rgba(11,13,16,0.12)_82%,rgba(11,13,16,0.10)_100%)]" />

          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,transparent_28%,rgba(8,10,14,0.18)_36%,rgba(8,10,14,0.30)_46%,rgba(8,10,14,0.32)_56%,rgba(8,10,14,0.18)_66%,transparent_78%)]" />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_54%_82%,rgba(201,122,74,0.075),transparent_22%),radial-gradient(circle_at_74%_88%,rgba(68,122,214,0.070),transparent_20%),radial-gradient(circle_at_38%_92%,rgba(255,255,255,0.035),transparent_18%)]" />

          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(255,255,255,0.018)_0%,rgba(255,255,255,0.010)_10%,transparent_24%)]" />
        </div>

        {/* SIDE DISSOLVES */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-[linear-gradient(to_right,#0B0D10,rgba(11,13,16,0.62),rgba(11,13,16,0.22),transparent)]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-[linear-gradient(to_left,#0B0D10,rgba(11,13,16,0.62),rgba(11,13,16,0.22),transparent)]" />

        {/* CONTENT */}
        <div className="relative z-20 px-6 pt-[352px] pb-8">
          <div className="space-y-14">
            {commentaryItems.length > 0 ? (
              <MostPopularRankedList
                items={commentaryItems}
                sectionTitle="Commentary"
              />
            ) : null}

            {newsItems.length > 0 ? (
              <MostPopularRankedList
                items={newsItems}
                sectionTitle="News"
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function MobileCommentaryThumbnailSection({ items }: { items: SidebarItem[] }) {
  const leadItem = items[0];
  const thumbnailItems = items.slice(1, 6);

  return (
    <section className="space-y-12">
      <SectionHeader title="More Commentary" />

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

              <h3
                className={`${MAJOR_HEADLINE_SERIF_CLASS} break-words text-[22px] font-semibold leading-[1.1] text-[#D8CBB8] transition-colors duration-150 group-hover:text-[#E6DBCC]`}
              >
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
                      <h3
                        className={`${MAJOR_HEADLINE_SERIF_CLASS} line-clamp-3 break-words text-[16px] font-semibold leading-[1.1] text-[#D8CBB8] transition-colors duration-150 group-hover:text-[#E6DBCC]`}
                      >
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

function DesktopCommentarySection({ items }: { items: SidebarItem[] }) {
  const leadItem = items[0];
  const thumbnailItems = items.slice(1, 6);

  return (
    <section className="space-y-6">
      <SectionHeader title="More Commentary" />

      <div className="space-y-10">
        {leadItem && (
          <article className="group relative overflow-visible">
            <Link
              href={leadItem.href}
              className="block no-underline hover:no-underline focus:outline-none"
              title={leadItem.title}
            >
              {leadItem.heroImageUrl && (
                <div className="mt-10 mb-14 w-[480px] max-w-full overflow-hidden rounded-[2px] bg-white/5 ring-1 ring-white/10">
                  <img
                    src={leadItem.heroImageUrl}
                    alt={leadItem.title}
                    className="block h-auto w-full"
                    loading="lazy"
                  />
                </div>
              )}

              <h3
                className={`${MAJOR_HEADLINE_SERIF_CLASS} max-w-[20ch] text-[30px] font-semibold leading-[1.09] text-[#D8CBB8] transition-colors duration-150 group-hover:text-[#E1D6C6] break-words`}
              >
                <InlineTitleWithReadTime
                  title={leadItem.title}
                  minutes={leadItem.readTimeMinutes}
                />
              </h3>

              {leadItem.excerpt && (
                <p className="mt-6 max-w-[34rem] text-[15px] leading-7 text-[#DDD4C8] transition-colors duration-150 group-hover:text-[#E7DED2]">
                  {leadItem.excerpt}
                </p>
              )}

              {leadItem.author && (
                <p className="mt-5 text-[11px] uppercase tracking-[0.20em] text-[#D08B5E]/88 transition-colors duration-150 group-hover:text-[#E29A69]">
                  {leadItem.author}
                </p>
              )}
            </Link>
          </article>
        )}

        {thumbnailItems.length > 0 && (
          <div className="space-y-8">
            {thumbnailItems.map((item) => (
              <article key={item.id} className="group relative overflow-visible">
                <Link
                  href={item.href}
                  className="grid grid-cols-[112px_1fr] items-stretch gap-5 no-underline hover:no-underline focus:outline-none"
                  title={item.title}
                >
                  <div className="h-[124px] w-[112px] shrink-0 overflow-hidden rounded-[2px] bg-white/5 ring-1 ring-white/10">
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

                  <div className="flex h-[124px] min-w-0 flex-col justify-between">
                    <div className="min-w-0">
                      <h3
                        className={`${MAJOR_HEADLINE_SERIF_CLASS} break-words text-[17px] font-semibold leading-[1.12] text-[#D8CBB8] transition-colors duration-150 group-hover:text-[#E6DBCC]`}
                      >
                        {item.title}
                      </h3>

                      {item.readTimeMinutes && (
                        <div className="mt-2">
                          <ReadTimeBadge minutes={item.readTimeMinutes} />
                        </div>
                      )}
                    </div>

                    {item.author && (
                      <p className="text-[10px] font-medium uppercase tracking-[0.17em] leading-[1.2] text-[#D08B5E]/84 transition-colors duration-150 group-hover:text-[#E29A69]">
                        {item.author}
                      </p>
                    )}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
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
            className="block text-[12.5px] leading-snug text-[#CBC3B8] transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-[#E1D6C6]"
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
 * Mobile-only list renderer (kept for future use if needed).
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
            className="block text-[12.5px] leading-[1.45] text-[#CBC3B8] transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-[#E1D6C6]"
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
  const [post, mostReadDocs, moreDocs, latestNewsDocs, explicitLeadDoc] = await Promise.all([
    client.fetch(singlePostQuery, { slug: params.slug }, { cache: "no-store" as any }),
    client.fetch(mostReadQuery, {}, { cache: "no-store" as any }),
    client.fetch(moreCommentaryQuery, { slug: params.slug }, { cache: "no-store" as any }),
    client.fetch(latestNewsQuery, {}, { cache: "no-store" as any }),
    client.fetch(explicitLeadQuery, {}, { cache: "no-store" as any }),
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

  const explicitLead: ExplicitLead | undefined = explicitLeadDoc
    ? {
        id: explicitLeadDoc._id,
        type: explicitLeadDoc._type,
        title: explicitLeadDoc.title,
        excerpt: explicitLeadDoc.excerpt,
        slug: explicitLeadDoc.slug,
        heroImageUrl: explicitLeadDoc.heroImageUrl,
        readTimeMinutes: normalizeMinutes(explicitLeadDoc.readTimeMinutes),
        author: normalizeAuthor(explicitLeadDoc.author),
      }
    : undefined;

  const mostRead: SidebarItem[] = (mostReadDocs || [])
    .filter((p: any) => !!p?.slug)
    .map((p: any) => ({
      id: p._id,
      title: p.title,
      href: `/commentary/${p.slug}`,
      readTimeMinutes: normalizeMinutes(p.readTimeMinutes),
    }));

  const rawMoreCommentary: SidebarItem[] = (moreDocs || [])
    .filter((p: any) => !!p?.slug)
    .map((p: any) => ({
      id: p._id,
      title: p.title,
      href: `/commentary/${p.slug}`,
      readTimeMinutes: normalizeMinutes(p.readTimeMinutes),
      excerpt: typeof p.excerpt === "string" ? p.excerpt : undefined,
      author: normalizeAuthor(p.author),
      heroImageUrl: typeof p.heroImageUrl === "string" ? p.heroImageUrl : undefined,
    }));

  const heroCommentaryLead: SidebarItem | undefined =
    explicitLead &&
    explicitLead.type === "post" &&
    explicitLead.slug &&
    explicitLead.id !== typedPost._id &&
    explicitLead.slug !== typedPost.slug
      ? {
          id: explicitLead.id,
          title: explicitLead.title,
          href: `/commentary/${explicitLead.slug}`,
          readTimeMinutes: explicitLead.readTimeMinutes,
          excerpt: explicitLead.excerpt,
          author: explicitLead.author,
          heroImageUrl: explicitLead.heroImageUrl,
        }
      : undefined;

  const moreCommentary = [
    ...(heroCommentaryLead ? [heroCommentaryLead] : []),
    ...rawMoreCommentary,
  ]
    .filter(
      (item, index, arr) =>
        item.id !== typedPost._id &&
        arr.findIndex((candidate) => candidate.id === item.id) === index
    )
    .slice(0, 6);

  const latestNews: SidebarItem[] = (latestNewsDocs || [])
    .filter((n: any) => !!n?.slug)
    .map((n: any) => ({
      id: n._id,
      title: n.title,
      href: `/news/${n.slug}`,
      readTimeMinutes: normalizeMinutes(n.readTimeMinutes),
    }));

  return (
    <main className="commentary min-h-screen bg-[#0B0D10] text-[#CBC3B8]">
      <div className="print-edition">
        <div className="print-edition-masthead">
          <div className="print-edition-mark">C</div>
          <div className="print-edition-title">THE COMMENTATOR</div>
          <div className="print-edition-tagline">Freedom in the Age of AI</div>
        </div>

        <article className="print-edition-article">
          <hr className="print-edition-rule" />

          <h1 className="print-edition-headline">{typedPost.title}</h1>

          <div className="print-edition-meta">
            {authorName ? <span>{authorName}</span> : null}
            {date ? <span>{date}</span> : null}
            {typedPost.readTimeMinutes ? (
              <span>{typedPost.readTimeMinutes} min read</span>
            ) : null}
          </div>

          {typedPost.excerpt ? (
            <p className="print-edition-excerpt">{typedPost.excerpt}</p>
          ) : null}

          {heroUrl ? (
            <img
              src={heroUrl}
              alt={typedPost.title}
              className="print-edition-hero"
            />
          ) : null}

          <section className="print-edition-body">
            {typedPost.body?.length ? (
              <PortableText value={typedPost.body} components={portableTextComponents} />
            ) : null}
          </section>

          <p className="print-edition-mission">
            Understanding Power in the Digital Revolution.
          </p>

          <section className="print-edition-club">
            <div className="print-edition-club-mark">C</div>
            <div>
              <h2>Join The Commentator Club</h2>
              <p>
                Become part of our community of founders, policymakers,
                investors and thinkers.
              </p>
            </div>
            <div>
              <h3>Members receive:</h3>
              <ul>
                <li>Revolution Rewired newsletter</li>
                <li>Comment privileges</li>
                <li>Editorial discussions</li>
                <li>Exclusive member benefits</li>
              </ul>
            </div>
            <div>
              <strong>$5 per month</strong>
              <span>thecommentator.ai/club</span>
            </div>
          </section>

          <div className="print-edition-url">
            Originally published at https://thecommentator.ai/commentary/{typedPost.slug}
          </div>

          <div className="print-edition-copyright">
            © 2026 Commentator Media LLC. All rights reserved.
          </div>
        </article>
      </div>

      <div className="screen-edition">
      <Header />

      <div className="mx-auto max-w-6xl px-4 py-10 lg:px-6 lg:pt-16">
        <div className="grid grid-cols-1">
          <div className="mx-auto w-full max-w-[52rem]">
            <header className="pt-1 lg:pt-14">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#9C9488]">
                Commentary
              </p>

              <h1 className="mt-10 text-[2.12rem] font-semibold leading-[1.03] tracking-tight text-[#D2C5B3] md:text-3xl">
                <span className="lg:hidden">
                  <TitleWithReadTime title={typedPost.title} minutes={typedPost.readTimeMinutes} />
                </span>
                <span className="hidden lg:inline">{typedPost.title}</span>
              </h1>

              <div className="hidden items-center justify-between lg:mt-4 lg:flex">
                <ReadTimeBadge minutes={typedPost.readTimeMinutes} />
                <DesktopShare title={typedPost.title} />
              </div>

              {typedPost.excerpt ? (
                <p className="mt-5 max-w-[42ch] text-[16.5px] leading-[1.62] text-[#CBC3B8] md:max-w-none md:text-[15px] md:leading-[1.7]">
                  {typedPost.excerpt}
                </p>
              ) : null}

              {authorName ? (
                <p className="mt-6 text-xs">
                  <span className="uppercase tracking-[0.16em] text-[#C67C4E]">{authorName}</span>
                  {date ? <span className="text-[#CBC3B8]">{` • ${date}`}</span> : null}
                </p>
              ) : date ? (
                <p className="mt-6 text-xs uppercase tracking-[0.16em] text-[#CBC3B8]">{date}</p>
              ) : null}
            </header>

            {heroUrl ? (
              <div className="mt-10 overflow-hidden bg-white/5 ring-1 ring-white/10">
                <img
                  src={heroUrl}
                  alt={typedPost.title}
                  className="h-auto w-full"
                  loading="lazy"
                />
              </div>
            ) : null}

            {/* MOBILE SHARE (TOP) — below hero, above body */}
            <div className="mt-3 flex justify-end lg:hidden">
              <MobileShare title={typedPost.title} />
            </div>

            <section
              className="mt-0 max-w-none prose prose-invert text-[16.8px] leading-[1.58] md:text-[18px] lg:mt-10 lg:leading-relaxed
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
"
            >
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

            {/* DESKTOP SHARE (BOTTOM) — end of article (bottom-right, like mobile) */}
            <div className="mt-10 hidden justify-end lg:flex">
              <DesktopShare title={typedPost.title} />
            </div>

            {/* DIVIDER ABOVE CLUB */}
            <div className="mt-14 mb-14 flex justify-center">
              <div className="h-[2px] w-32 bg-white/30 lg:w-44" />
            </div>

            {/* MOBILE ONLY: earned membership ask immediately after article */}
            <section className="lg:hidden">
              <CommentatorClubCard />
            </section>

            {/* DESKTOP ONLY: earned membership ask immediately after article */}
            <section className="hidden lg:block">
              <CommentatorClubCard />
            </section>

            {/* MOBILE ONLY: post-article stack */}
            <div className="mt-20 space-y-0 lg:hidden">
  <MobileMostPopularSection commentaryItems={mostRead} newsItems={latestNews} />

  {moreCommentary.length > 0 ? (
    <div className="pt-12">
      <MobileCommentaryThumbnailSection items={moreCommentary} />
    </div>
  ) : null}

  <div className="pt-16 pb-16">
    <MobileMissionBlock />
  </div>

  <MobileArticleCloser />
</div>

            {/* DESKTOP ONLY: centered post-article flow */}
            <div className="mt-20 hidden space-y-16 lg:block">
              <div className="mx-auto w-full max-w-[44rem]">
                <DesktopMostPopularSection commentaryItems={mostRead} newsItems={latestNews} />
              </div>

              {moreCommentary.length > 0 ? (
                <div className="mx-auto w-full max-w-[44rem]">
                  <DesktopCommentarySection items={moreCommentary} />
                </div>
              ) : null}

              <div className="pt-2 pb-2">
                <DesktopMissionBlock />
              </div>

              <div className="mx-auto w-full max-w-[44rem]">
                <div className="mt-16 mb-6 text-center">
                  <div className="mx-auto w-full max-w-[20rem] space-y-8">
                    <Link
                      href="/about"
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
          </div>
</main>
  );
}