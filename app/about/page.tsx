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

function BoldFirstLetterHeading({ children }: { children: any }) {
  const nodes = Children.toArray(children);
  let firstLetterHandled = false;

  return (
    <h2 className="m-0 text-left text-[2rem] font-semibold leading-[1.08] tracking-[-0.026em] text-[#E8ECF2] md:text-[2.15rem]">
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
    <h3 className="m-0 text-left text-[1.45rem] font-semibold leading-[1.18] tracking-[-0.02em] text-[#DDE3EB] md:text-[1.6rem]">
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
    <main className="min-h-screen bg-[#0B0D10] text-[#E6E9EE]">
      <Header />

      <section className="px-5 pb-16 pt-24 text-left md:px-0 md:pb-24 md:pt-32">
        <div className="md:ml-[11.625rem] md:max-w-[46rem]">
          <div className="mb-12 border-l border-[rgba(198,124,78,0.26)] pl-5 md:mb-14 md:pl-6">
            <h1 className="-mt-2 text-[2.2rem] font-semibold leading-[1.02] tracking-[-0.03em] text-[#F0F3F7] md:text-[2.85rem]">
              The Mission
            </h1>

            <p className="mt-4 max-w-[40rem] text-[1rem] leading-8 text-[#A7B0BB] md:mt-5 md:text-[1.08rem] md:leading-8">
              What The Commentator is for, how it is positioned, and why it exists.
            </p>
          </div>

          <div
            className="
              prose prose-invert max-w-none text-left text-[16.1px] leading-[1.9] text-[#B5BDC8] md:text-[17.2px] md:leading-[1.95]
              [&_h1]:text-left
              [&_h2]:mt-20
              [&_h2]:mb-8
              [&_h2]:border-t
              [&_h2]:border-[rgba(120,138,160,0.14)]
              [&_h2]:pt-10
              [&_h3]:mt-14
              [&_h3]:mb-6
              [&_p]:my-0
              [&_p+p]:mt-7
              [&_strong]:font-semibold
              [&_strong]:text-[#E8EDF3]
              [&_em]:text-[#F0F2F6]
              [&_a]:text-inherit
              [&_a]:no-underline
              [&_ul]:my-8
              [&_ol]:my-8
              [&_li]:my-2
              [&_blockquote]:my-10
              [&_blockquote]:border-l
              [&_blockquote]:border-[rgba(198,124,78,0.32)]
              [&_blockquote]:pl-5
              [&_blockquote]:text-[#D7DEE7]
              [&>p:first-of-type]:max-w-[42rem]
              [&>p:first-of-type]:text-[1.26rem]
              [&>p:first-of-type]:leading-[1.72]
              [&>p:first-of-type]:text-[#E1E6EE]
              [&>p:first-of-type]:md:text-[1.4rem]
              [&>p:first-of-type]:md:leading-[1.76]
              [&>p:first-of-type]:md:text-[#E6EBF1]
              [&>p:first-of-type]:border-l
              [&>p:first-of-type]:border-[rgba(198,124,78,0.28)]
              [&>p:first-of-type]:pl-5
              [&>p:first-of-type]:md:pl-6
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
    </main>
  );
}