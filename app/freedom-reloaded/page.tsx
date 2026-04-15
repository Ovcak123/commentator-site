// app/freedom-reloaded/page.tsx

import Link from "next/link";
import Header from "../../components/Header";
import { client } from "../../sanity/lib/client";
import { PortableText } from "next-sanity";

export const revalidate = 0;

const freedomReloadedQuery = `
  *[_type == "freedomReloadedPage"][0]{
    headline,
    body
  }
`;

const MAJOR_HEADLINE_SERIF_CLASS = "font-serif tracking-[-0.022em]";

async function getFreedomReloadedPage() {
  return await client.fetch(freedomReloadedQuery);
}

function CommentatorClubPanel() {
  return (
    <Link
      href="/club"
      className="group block no-underline hover:no-underline focus:outline-none"
      aria-label="Join The Commentator Club"
    >
      <section className="relative overflow-hidden rounded-[5px] bg-[linear-gradient(135deg,rgba(59,8,16,0.88)_0%,rgba(85,12,23,0.88)_38%,rgba(102,16,29,0.80)_72%,rgba(77,11,21,0.86)_100%)] px-7 py-7 transition-all duration-200 group-hover:shadow-[0_10px_24px_rgba(0,0,0,0.18)] sm:px-7 sm:py-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.03),transparent_32%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.015),rgba(0,0,0,0.06))]" />

        <div className="relative">
          <h3
            className={`${MAJOR_HEADLINE_SERIF_CLASS} text-[18.5px] font-semibold leading-[1.1] text-[#F1E4D8] transition-colors duration-150 group-hover:text-[#FAF3EC]`}
          >
            Join The Commentator Club
          </h3>

          <p className="mt-4 max-w-none text-[14.7px] leading-[1.84] text-[#E8D5C7] transition-colors duration-150 group-hover:text-[#F7EDE4]">
            A community of founders, CEOs, policymakers, and thinkers,
            alongside readers who want to be part of the conversation, not outside it.
            Members get early insight into our ideas, contribute directly, and take
            part in discussions with the people shaping what comes next.
          </p>

          <div className="mt-5 inline-flex items-center gap-2 text-[13.35px] font-semibold text-[#F2E5D8] transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-white">
            <span>Learn more about the Club and join for $5 a month</span>
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
      <section className="relative overflow-hidden rounded-[5px] bg-[linear-gradient(135deg,rgba(59,8,16,0.90)_0%,rgba(85,12,23,0.90)_38%,rgba(102,16,29,0.82)_72%,rgba(77,11,21,0.88)_100%)] px-7 py-6 transition-all duration-200 group-hover:shadow-[0_18px_40px_rgba(0,0,0,0.24)] lg:px-8 lg:py-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.03),transparent_32%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.015),rgba(0,0,0,0.06))]" />

        <div className="relative">
          <h3
            className={`${MAJOR_HEADLINE_SERIF_CLASS} text-[19px] font-semibold leading-[1.06] text-[#F1E4D8] transition-colors duration-150 group-hover:text-[#FAF3EC] lg:text-[20px]`}
          >
            Join The Commentator Club
          </h3>

          <p className="mt-4 max-w-[64ch] text-[15.4px] leading-[1.78] text-[#E8D5C7] transition-colors duration-150 group-hover:text-[#F7EDE4] lg:text-[16px] lg:leading-[1.82]">
            A community of founders, CEOs, policymakers, and thinkers,
            alongside readers who want to be part of the conversation, not outside it.
            Members get early insight into our ideas, contribute directly, and take
            part in discussions with the people shaping what comes next.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 text-[15px] font-semibold text-[#F2E5D8] transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-white">
            <span>Learn more about the Club and join for $5 a month</span>
            <span aria-hidden="true">→</span>
          </div>
        </div>
      </section>
    </Link>
  );
}

export default async function FreedomReloadedPage() {
  const page = await getFreedomReloadedPage();

  const headline = page?.headline || "Freedom Reloaded";
  const body = page?.body;

  return (
    <main className="min-h-screen bg-[#0B0D10] text-[#E6E9EE]">
      <Header />

      <section className="px-5 pb-16 pt-24 text-left md:px-0 md:pb-20 md:pt-32">
        <div className="md:ml-[11.625rem] md:max-w-3xl">
          <h1 className="mb-12 text-2xl font-semibold tracking-tight">{headline}</h1>

          <div
            className="
              prose prose-invert max-w-none text-left text-[15px] leading-relaxed text-[#9AA1AB]
              [&_h1]:text-left
              [&_h2]:text-left
              [&_h3]:text-left
              [&_h1]:font-semibold
              [&_h2]:font-semibold
              [&_h3]:font-semibold
              [&_p:first-of-type:first-letter]:!float-none
              [&_p:first-of-type:first-letter]:!m-0
              [&_p:first-of-type:first-letter]:!p-0
              [&_p:first-of-type:first-letter]:!text-[1em]
              [&_p:first-of-type:first-letter]:!font-inherit
              [&_p:first-of-type:first-letter]:!leading-[inherit]
              [&_p:first-of-type:first-letter]:!tracking-[inherit]
            "
          >
            {body ? (
              <PortableText value={body} />
            ) : (
              <p>
                No Freedom Reloaded content found in Sanity yet. Open Sanity → Freedom Reloaded →
                add Body text → Publish.
              </p>
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
    </main>
  );
}