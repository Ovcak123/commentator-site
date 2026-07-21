// app/authors/page.tsx

export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { Metadata } from "next";
import Link from "next/link";

import Header from "../../components/Header";
import JsonLd from "../../components/JsonLd";
import { client } from "../../sanity/lib/client";
import { urlFor } from "../../sanity/lib/image";
import { siteConfig } from "../../lib/siteConfig";

type AuthorRecord = {
  _id: string;
  name: string;
  slug: string;
  bio?: any[];
  portrait?: any;
};

const authorsQuery = `
  *[
    _type == "author" &&
    defined(name) &&
    defined(slug.current)
  ] | order(name asc){
    _id,
    name,
    "slug": slug.current,
    bio,
    portrait
  }
`;

function portableTextToPlainText(value?: any[]): string {
  if (!Array.isArray(value)) return "";

  return value
    .filter(
      (block) =>
        block?._type === "block" &&
        Array.isArray(block.children)
    )
    .map((block) =>
      block.children
        .map((child: any) =>
          typeof child?.text === "string" ? child.text : ""
        )
        .join("")
    )
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function createBiographyExcerpt(bio?: any[]): string {
  const plainText = portableTextToPlainText(bio);

  if (!plainText) {
    return "Read this author's latest work in The Commentator.";
  }

  if (plainText.length <= 220) {
    return plainText;
  }

  return `${plainText.slice(0, 217).trimEnd()}...`;
}

export const metadata: Metadata = {
  title: "Authors",

  description:
    "Meet the writers and contributors behind The Commentator's coverage of artificial intelligence, frontier technology, geopolitics, democracy, economics, and national security.",

  alternates: {
    canonical: "/authors",
  },

  openGraph: {
    type: "website",
    url: "/authors",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    title: `Authors | ${siteConfig.name}`,
    description:
      "Meet the writers and contributors behind The Commentator.",
  },

  twitter: {
    card: "summary",
    title: `Authors | ${siteConfig.name}`,
    description:
      "Meet the writers and contributors behind The Commentator.",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default async function AuthorsPage() {
    const authors: AuthorRecord[] = await client.fetch(
    authorsQuery,
    {},
    { cache: "no-store" as any }
  );

  const authorsUrl = `${siteConfig.url}/authors`;
  const authorsPageId = `${authorsUrl}#webpage`;
  const authorsListId = `${authorsUrl}#authors`;

  const authorsJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": authorsPageId,
        url: authorsUrl,
        name: `Authors | ${siteConfig.name}`,
        description:
          "Meet the writers and contributors behind The Commentator's coverage of artificial intelligence, frontier technology, geopolitics, democracy, economics, and national security.",
        inLanguage: siteConfig.language,
        isPartOf: {
          "@id": siteConfig.websiteId,
        },
        mainEntity: {
          "@id": authorsListId,
        },
      },
      {
        "@type": "ItemList",
        "@id": authorsListId,
        name: `${siteConfig.name} authors`,
        numberOfItems: authors.length,
        itemListElement: authors.map((author, index) => {
          const authorUrl = `${siteConfig.url}/authors/${author.slug}`;

          return {
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@id": `${authorUrl}#person`,
              "@type": "Person",
              name: author.name,
              url: authorUrl,
            },
          };
        }),
      },
    ],
  };

  return (
      <main className="min-h-screen bg-[#0B0D10] text-[#CBC3B8]">
      <JsonLd data={authorsJsonLd} />
      <Header />  

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-12 lg:px-6 lg:pt-24">
        <section className="mx-auto w-full max-w-[58rem]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#9C9488]">
            The Commentator
          </p>

          <h1 className="mt-6 font-serif text-[42px] font-semibold leading-[1.02] tracking-[-0.025em] text-[#D8CBB8] md:text-[58px]">
            Authors
          </h1>

          <p className="mt-6 max-w-[46rem] text-[17px] leading-[1.75] text-[#AAA298] md:text-[18px]">
            Meet the writers and contributors examining how power is changing
            in the digital revolution.
          </p>

          <div className="mt-8 h-[2px] w-20 bg-[#C67C4E]/55" />

          {authors.length > 0 ? (
            <section className="mt-16 divide-y divide-white/10 border-t border-white/10">
              {authors.map((author) => {
                const portraitUrl = author.portrait
                  ? urlFor(author.portrait)
                      .width(500)
                      .height(500)
                      .fit("crop")
                      .url()
                  : "";

                const biographyExcerpt = createBiographyExcerpt(author.bio);

                return (
                  <article key={author._id} className="py-10 md:py-12">
                    <Link
                      href={`/authors/${author.slug}`}
                      className="group grid gap-7 no-underline hover:no-underline md:grid-cols-[144px_1fr] md:items-center md:gap-10"
                    >
                      {portraitUrl ? (
                        <div className="h-32 w-32 overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10 md:h-36 md:w-36">
                          <img
                            src={portraitUrl}
                            alt=""
                            aria-hidden="true"
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                          />
                        </div>
                      ) : null}

                      <div className="min-w-0">
                        <h2 className="font-serif text-[29px] font-semibold leading-[1.08] tracking-[-0.018em] text-[#D8CBB8] transition-colors group-hover:text-[#E8DED0] md:text-[34px]">
                          {author.name}
                        </h2>

                        <p className="mt-4 max-w-[60ch] text-[15.5px] leading-[1.75] text-[#AAA298] transition-colors group-hover:text-[#BBB2A7] md:text-[16px]">
                          {biographyExcerpt}
                        </p>

                        <span className="mt-5 inline-block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C67C4E]">
                          View author
                        </span>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </section>
          ) : (
            <p className="mt-16 border-t border-white/10 py-10 text-[15px] text-[#9C9488]">
              No author profiles are currently available.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}