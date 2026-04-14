// app/about/page.tsx

import Header from "../../components/Header";
import { client } from "../../sanity/lib/client";
import { PortableText } from "next-sanity";

export const revalidate = 0;

const aboutPageQuery = `
  *[_type == "aboutPage"][0]{
    body
  }
`;

async function getAboutPage() {
  return await client.fetch(aboutPageQuery);
}

export default async function AboutPage() {
  const page = await getAboutPage();
  const body = page?.body;

  return (
    <main className="min-h-screen bg-[#0B0D10] text-[#E6E9EE]">
      <Header />

      <section className="px-5 pb-16 pt-24 text-left md:px-0 md:pb-20 md:pt-32">
        <div className="md:ml-[11.625rem] md:max-w-3xl">
          <h1 className="mb-6 text-2xl font-semibold tracking-tight">The Mission</h1>

          <div
            className="
              prose prose-invert max-w-none text-left text-[15px] leading-relaxed text-[#9AA1AB]
              [&_h1]:text-left
              [&_h2]:text-left
              [&_h3]:text-left
              [&_h1]:font-semibold
              [&_h2]:font-semibold
              [&_h3]:font-semibold

              /* FIX: preserve bold first letters for headings like 'Who and What We Are' */
              [&_h2]:font-semibold
              [&_h2:first-of-type]:font-semibold
              [&_h2:first-of-type:first-letter]:!font-semibold

              /* Remove drop caps only for paragraphs, NOT headings */
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
                No Mission content found in Sanity yet. Open Sanity → About → add Body text →
                Publish.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}