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
            A community of founders, CEOs, policymakers, and thinkers who want to be part of the
            conversation, not outside it. Members get early insight into our ideas, contribute
            directly, and take part in discussions with the people shaping what comes next.
          </p>

          <div className="mt-5 inline-flex items-center gap-2 text-[13.35px] font-semibold text-[#F2E5D8] transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-white">
            <span>Learn more and join for $5 a month</span>
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
            A community of founders, CEOs, policymakers, and thinkers who want to be part of the
            conversation, not outside it. Members get early insight into our ideas, contribute
            directly, and take part in discussions with the people shaping what comes next.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 text-[15px] font-semibold text-[#F2E5D8] transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-white">
            <span>Learn more and join for $5 a month</span>
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
    <main className="relative min-h-screen overflow-hidden bg-[#0B0D10] text-[#E6E9EE]">
      {/* FULL-PAGE BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <img
          src="/most-popular-banner.jpg"
          alt=""
          aria-hidden="true"
          className="absolute left-0 top-[-40%] h-[170%] w-full object-cover object-[76%_10%] opacity-[0.36] scale-[1.12] md:top-[-24%] md:h-[150%] md:object-[76%_34%] md:opacity-[0.24]"
        />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(11,13,16,0.14),rgba(11,13,16,0.06)_24%,rgba(11,13,16,0.06)_56%,rgba(11,13,16,0.14)_100%)]" />

        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(11,13,16,0.012)_0%,rgba(11,13,16,0.018)_12%,rgba(11,13,16,0.040)_24%,rgba(11,13,16,0.12)_42%,rgba(11,13,16,0.20)_58%,rgba(11,13,16,0.16)_74%,rgba(11,13,16,0.12)_88%,rgba(11,13,16,0.10)_100%)]" />

        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,transparent_14%,rgba(8,10,14,0.05)_28%,rgba(8,10,14,0.12)_44%,rgba(8,10,14,0.16)_58%,rgba(8,10,14,0.10)_74%,transparent_88%)]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_54%_82%,rgba(201,122,74,0.045),transparent_22%),radial-gradient(circle_at_74%_88%,rgba(68,122,214,0.042),transparent_20%),radial-gradient(circle_at_38%_92%,rgba(255,255,255,0.018),transparent_18%)]" />

        <div className="absolute inset-x-0 top-0 h-[34%] bg-[linear-gradient(to_bottom,rgba(255,255,255,0.012),rgba(255,255,255,0.004)_26%,transparent_72%)]" />

        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(11,13,16,0.06)_0%,rgba(11,13,16,0.04)_8%,rgba(11,13,16,0.02)_16%,transparent_28%)]" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] hidden h-[22rem] bg-[linear-gradient(to_bottom,rgba(11,13,16,0.22)_0%,rgba(11,13,16,0.16)_28%,rgba(11,13,16,0.10)_52%,transparent_78%)] md:block" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-[18rem] bg-[radial-gradient(circle_at_22%_16%,rgba(68,122,214,0.10),transparent_34%),radial-gradient(circle_at_78%_18%,rgba(201,122,74,0.08),transparent_32%),linear-gradient(to_bottom,rgba(255,255,255,0.022)_0%,rgba(255,255,255,0.008)_20%,transparent_60%)] md:hidden" />
      <div className="pointer-events-none absolute right-0 top-0 z-[6] hidden h-[22rem] w-[30rem] bg-[linear-gradient(to_left,rgba(11,13,16,0.16)_0%,rgba(11,13,16,0.09)_28%,rgba(11,13,16,0.035)_54%,transparent_80%)] md:block" />

      {/* CONTENT */}
      <div className="relative z-20">
        <Header transparentOnDark />

        <section className="relative overflow-hidden px-5 pb-16 pt-24 text-left md:px-0 md:pb-20 md:pt-32">
          <div className="relative md:ml-[11.625rem] md:max-w-[46rem]">
            <h1 className="mb-14 text-[2.35rem] font-semibold tracking-[-0.032em] text-[#EEF2F7] md:text-[3.1rem]">
              {headline}
            </h1>

            <div
              className="
                prose prose-invert max-w-none text-left text-[16.2px] leading-[1.9] text-[#C0C8D3]
                md:text-[17.2px] md:leading-[1.95]

                [&_h1]:text-left
                [&_h2]:text-left
                [&_h3]:text-left

                [&_h1]:font-semibold
                [&_h2]:font-semibold
                [&_h3]:font-semibold

                [&_p]:my-0
                [&_p+p]:mt-7

                [&_strong]:font-semibold
                [&_strong]:text-[#EDF2F8]

                [&_em]:text-[#F2F5F9]

                [&_ul]:my-8
                [&_ol]:my-8
                [&_li]:my-2

                [&_blockquote]:my-10
                [&_blockquote]:border-l
                [&_blockquote]:border-[rgba(198,124,78,0.32)]
                [&_blockquote]:pl-5
                [&_blockquote]:text-[#D7DEE7]

                [&>p:first-of-type]:max-w-[42rem]
                [&>p:first-of-type]:text-[1.28rem]
                [&>p:first-of-type]:leading-[1.72]
                [&>p:first-of-type]:text-[#F0F4F9]
                [&>p:first-of-type]:md:text-[1.42rem]
                [&>p:first-of-type]:md:leading-[1.76]
                [&>p:first-of-type]:mb-10

                [&>p:first-of-type:first-letter]:!float-none
                [&>p:first-of-type:first-letter]:!m-0
                [&>p:first-of-type:first-letter]:!p-0
                [&>p:first-of-type:first-letter]:!text-[1em]
                [&>p:first-of-type:first-letter]:!font-inherit
                [&>p:first-of-type:first-letter]:!leading-[inherit]
                [&>p:first-of-type:first-letter]:!tracking-[inherit]
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
      </div>
    </main>
  );
}