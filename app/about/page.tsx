// app/about/page.tsx

import Link from "next/link";
import { Children, Fragment } from "react";
import Header from "../../components/Header";
import { client } from "../../sanity/lib/client";
import { PortableText, type PortableTextComponents } from "next-sanity";

export const revalidate = 0;

const aboutPageQuery = `
  *[_type == "aboutPage"][0]{
    body
  }
`;

const MAJOR_HEADLINE_SERIF_CLASS = "font-serif tracking-[-0.022em]";

async function getAboutPage() {
  return await client.fetch(aboutPageQuery);
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

function BoldFirstLetterHeading({ children }: { children: any }) {
  const nodes = Children.toArray(children);
  let firstLetterHandled = false;

  return (
    <h2 className="m-0 text-left text-[2rem] font-semibold leading-[1.08] tracking-[-0.026em] text-[#E6EBF1] md:text-[2.15rem]">
      {nodes.map((node, index) => {
        if (firstLetterHandled) {
          return <Fragment key={index}>{node}</Fragment>;
        }

        if (typeof node === "string" && node.length > 0) {
          firstLetterHandled = true;
          return (
            <Fragment key={index}>
              <span className="font-bold">{node.charAt(0)}</span>
              {node.slice(1)}
            </Fragment>
          );
        }

        return <Fragment key={index}>{node}</Fragment>;
      })}
    </h2>
  );
}

function SectionSubheading({ children }: { children: any }) {
  return (
    <h3 className="m-0 text-left text-[1.45rem] font-semibold leading-[1.18] tracking-[-0.02em] text-[#E1E7EF] md:text-[1.6rem]">
      {children}
    </h3>
  );
}

const portableTextComponents: PortableTextComponents = {
  block: {
    h2: ({ children }) => <BoldFirstLetterHeading>{children}</BoldFirstLetterHeading>,
    h3: ({ children }) => <SectionSubheading>{children}</SectionSubheading>,
  },
};

export default async function AboutPage() {
  const page = await getAboutPage();
  const body = page?.body;

  return (
            <main className="relative min-h-screen overflow-hidden bg-[#0B0D10] text-[#E6E9EE]">
            {/* FULL-PAGE BACKGROUND */}
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden md:opacity-50">
                                <img
          src="/most-popular-banner.jpg"
          alt=""
          aria-hidden="true"
          className="absolute left-0 top-[-40%] h-[170%] w-full object-cover object-[76%_10%] opacity-[0.36] scale-[1.12] md:top-[-24%] md:h-[150%] md:object-[76%_34%] md:opacity-[0.09]"
        />

                                                        {/* no separate header-band veil */}

        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(11,13,16,0.14),rgba(11,13,16,0.06)_24%,rgba(11,13,16,0.06)_56%,rgba(11,13,16,0.14)_100%)]" />

                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(11,13,16,0.012)_0%,rgba(11,13,16,0.018)_12%,rgba(11,13,16,0.040)_24%,rgba(11,13,16,0.12)_42%,rgba(11,13,16,0.20)_58%,rgba(11,13,16,0.16)_74%,rgba(11,13,16,0.12)_88%,rgba(11,13,16,0.10)_100%)]" />

        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,transparent_14%,rgba(8,10,14,0.05)_28%,rgba(8,10,14,0.12)_44%,rgba(8,10,14,0.16)_58%,rgba(8,10,14,0.10)_74%,transparent_88%)]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_54%_82%,rgba(201,122,74,0.045),transparent_22%),radial-gradient(circle_at_74%_88%,rgba(68,122,214,0.042),transparent_20%),radial-gradient(circle_at_38%_92%,rgba(255,255,255,0.018),transparent_18%)]" />

                                     <div className="absolute inset-x-0 top-0 h-[34%] bg-[linear-gradient(to_bottom,rgba(255,255,255,0.012),rgba(255,255,255,0.004)_26%,transparent_72%)]" />   

        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(11,13,16,0.06)_0%,rgba(11,13,16,0.04)_8%,rgba(11,13,16,0.02)_16%,transparent_28%)]" />
      </div>                  

      {/* SIDE DISSOLVES */}
            

            {/* CONTENT */}
      <div className="relative z-20">
        <div className="pointer-events-none absolute right-0 top-0 z-[6] hidden h-[22rem] w-[30rem] bg-[linear-gradient(to_left,rgba(11,13,16,0.16)_0%,rgba(11,13,16,0.09)_28%,rgba(11,13,16,0.035)_54%,transparent_80%)] opacity-50 md:block" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] hidden h-[22rem] bg-[linear-gradient(to_bottom,rgba(11,13,16,0.22)_0%,rgba(11,13,16,0.16)_28%,rgba(11,13,16,0.10)_52%,transparent_78%)] opacity-50 md:block" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-[18rem] bg-[radial-gradient(circle_at_22%_16%,rgba(68,122,214,0.10),transparent_34%),radial-gradient(circle_at_78%_18%,rgba(201,122,74,0.08),transparent_32%),linear-gradient(to_bottom,rgba(255,255,255,0.022)_0%,rgba(255,255,255,0.008)_20%,transparent_60%)] md:hidden" />
        <Header transparentOnDark />

        <section className="relative overflow-hidden px-5 pb-16 pt-24 text-left md:px-0 md:pb-24 md:pt-32">
          <div className="relative md:ml-[11.625rem] md:max-w-[46rem]">
          <div className="mb-12 pl-0 md:mb-14">
            <h1 className="-mt-2 text-[2.2rem] font-semibold leading-[1.02] tracking-[-0.03em] text-[#EAEFF5] md:text-[2.85rem]">
              The Mission
            </h1>

            <p className="mt-4 max-w-[40rem] text-[1rem] leading-8 text-[#AEB8C4] md:mt-5 md:text-[1.08rem] md:leading-8">
              What The Commentator is for, how it is positioned, and why it exists.
            </p>
          </div>

          <div
            className="
              prose prose-invert max-w-none text-left text-[16.1px] leading-[1.92] text-[#C0C8D3] md:text-[17.2px] md:leading-[1.96]
              [&_h1]:text-left
              [&_h2]:mt-20
              [&_h2]:mb-8
              [&_h2]:border-t
              [&_h2]:border-[rgba(120,138,160,0.16)]
              [&_h2]:pt-10
              [&_h3]:mt-14
              [&_h3]:mb-6
              [&_p]:my-0
              [&_p+p]:mt-7
              [&_strong]:font-semibold
              [&_strong]:text-[#EDF2F8]
              [&_em]:text-[#F2F5F9]
              [&_a]:text-inherit
              [&_a]:no-underline
              [&_ul]:my-8
              [&_ol]:my-8
              [&_li]:my-2
              [&_blockquote]:my-10
              [&_blockquote]:border-l
              [&_blockquote]:border-[rgba(198,124,78,0.34)]
              [&_blockquote]:pl-5
              [&_blockquote]:text-[#DEE5EE]
              [&>p:first-of-type]:max-w-[42rem]
              [&>p:first-of-type]:text-[1.26rem]
              [&>p:first-of-type]:leading-[1.72]
              [&>p:first-of-type]:text-[#E7EDF4]
              [&>p:first-of-type]:md:text-[1.4rem]
              [&>p:first-of-type]:md:leading-[1.76]
              
              [&>p:first-of-type]:mb-12
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
              <PortableText value={body} components={portableTextComponents} />
            ) : (
              <p>
                No Mission content found in Sanity yet. Open Sanity → About → add Body text →
                Publish.
              </p>
            )}
          </div>

          <div className="mt-16 md:hidden">
            <CommentatorClubPanel />
          </div>

          <div className="mt-24 hidden md:block">
            <DesktopCommentatorClubPanel />
          </div>
        </div>
              </section>
      </div>
    </main>
  );
}