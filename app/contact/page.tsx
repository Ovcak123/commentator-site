// app/contact/page.tsx

import Header from "../../components/Header";
import { client } from "../../sanity/lib/client";
import { PortableText } from "next-sanity";

export const revalidate = 0;

const contactPageQuery = `
  *[_type == "contactPage"][0]{
    headline,
    body
  }
`;

async function getContactPage() {
  return await client.fetch(contactPageQuery);
}

export default async function ContactPage() {
  const page = await getContactPage();

  const headline = page?.headline || "Contact";
  const body = page?.body;

  return (
    <main className="min-h-screen bg-[#0B0D10] text-[#E6E9EE]">
      <Header />

      <section className="w-full px-4 pb-16 pt-10 md:px-0">
        <div className="max-w-3xl md:ml-[180px] lg:ml-[180px]">
          <h1 className="mb-6 text-2xl font-semibold tracking-tight">{headline}</h1>

          <div
            className="
              prose prose-invert max-w-none text-[15px] leading-relaxed text-[#9AA1AB]
              [&_p:first-of-type:first-letter]:float-none
              [&_p:first-of-type:first-letter]:mr-0
              [&_p:first-of-type:first-letter]:text-inherit
              [&_p:first-of-type:first-letter]:font-inherit
              [&_p:first-of-type:first-letter]:text-[1em]
              [&_p:first-of-type:first-letter]:leading-[inherit]
            "
          >
            {body ? (
              <PortableText value={body} />
            ) : (
              <p>
                No Contact content found in Sanity yet. Open Sanity → Contact → add Body text →
                Publish.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}