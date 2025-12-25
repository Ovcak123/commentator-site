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
      <section className="mx-auto max-w-3xl px-4 pb-16 pt-10">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">{headline}</h1>

        <div className="prose prose-invert max-w-none text-[15px] leading-relaxed text-[#9AA1AB]">
          {body ? (
            <PortableText value={body} />
          ) : (
            <p>
              No Contact content found in Sanity yet. Open Sanity → Contact → add Body text →
              Publish.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
