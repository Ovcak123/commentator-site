// app/authors/[slug]/page.tsx

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { notFound } from "next/navigation";
import Link from "next/link";
import { PortableText, type PortableTextComponents } from "next-sanity";

import Header from "../../../components/Header";
import { client } from "../../../sanity/lib/client";
import { urlFor } from "../../../sanity/lib/image";

type PageProps = {
  params: {
    slug: string;
  };
};

type Author = {
  _id: string;
  name: string;
  slug: string;
  bio?: any[];
  portrait?: any;
};

type AuthorArticle = {
  _id: string;
  _type: "post" | "newsItem";
  title: string;
  excerpt?: string;
  publishedAt?: string;
  readTimeMinutes?: number;
  slug?: string;
  heroImageUrl?: string;
};

const authorBySlugQuery = `
  *[_type == "author" && slug.current == $slug][0]{
    _id,
    name,
    "slug": slug.current,
    bio,
    portrait
  }
`;

const authorArticlesQuery = `
  *[
    _type in ["post", "newsItem"] &&
    references($authorId)
  ] | order(publishedAt desc, _createdAt desc)[0...20]{
    _id,
    _type,
    title,
    excerpt,
    publishedAt,
    readTimeMinutes,
    "slug": slug.current,
    "heroImageUrl": heroImage.asset->url
  }
`;

function formatDate(dateString?: string): string {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const bioComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mb-6 text-[17px] leading-[1.78] text-[#CBC3B8] md:text-[18px]">
        {children}
      </p>
    ),

    h2: ({ children }) => (
      <h2 className="mt-12 mb-5 font-serif text-[27px] font-semibold leading-tight text-[#D8CBB8]">
        {children}
      </h2>
    ),

    h3: ({ children }) => (
      <h3 className="mt-10 mb-4 font-serif text-[22px] font-semibold leading-tight text-[#D8CBB8]">
        {children}
      </h3>
    ),
  },

  list: {
    bullet: ({ children }) => (
      <ul className="mb-6 list-disc space-y-2 pl-6 text-[17px] leading-[1.7] text-[#CBC3B8]">
        {children}
      </ul>
    ),

    number: ({ children }) => (
      <ol className="mb-6 list-decimal space-y-2 pl-6 text-[17px] leading-[1.7] text-[#CBC3B8]">
        {children}
      </ol>
    ),
  },

  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-[#E0D5C5]">{children}</strong>
    ),

    em: ({ children }) => <em>{children}</em>,

    link: ({ children, value }) => {
      const href = value?.href || "";
      const isExternal =
        typeof href === "string" && /^https?:\/\//i.test(href);

      if (!href) return <>{children}</>;

      return (
        <a
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noreferrer noopener" : undefined}
          className="text-[#D08A57] underline decoration-[#D08A57]/40 underline-offset-[3px] transition-colors hover:text-[#E39A66]"
        >
          {children}
        </a>
      );
    },
  },
};

export default async function AuthorPage({ params }: PageProps) {
  const author: Author | null = await client.fetch(
    authorBySlugQuery,
    { slug: params.slug },
    { cache: "no-store" as any }
  );

  if (!author?._id || !author.name) {
    notFound();
  }

  const articles: AuthorArticle[] = await client.fetch(
    authorArticlesQuery,
    { authorId: author._id },
    { cache: "no-store" as any }
  );

  const portraitUrl = author.portrait
    ? urlFor(author.portrait).width(600).height(600).fit("crop").url()
    : "";

  return (
    <main className="min-h-screen bg-[#0B0D10] text-[#CBC3B8]">
      <Header />

      <div className="mx-auto max-w-6xl px-4 pt-12 pb-24 lg:px-6 lg:pt-24">
        <section className="mx-auto w-full max-w-[52rem]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#9C9488]">
            Author
          </p>

          <div className="mt-10 grid gap-8 md:grid-cols-[180px_1fr] md:items-center md:gap-12">
            {portraitUrl ? (
              <div className="h-36 w-36 overflow-hidden rounded-full ring-1 ring-white/10 md:h-44 md:w-44">
                <img
                  src={portraitUrl}
                  alt=""
                  aria-hidden="true"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}

            <div>
              <h1 className="font-serif text-[42px] font-semibold leading-[1.02] tracking-[-0.025em] text-[#D8CBB8] md:text-[56px]">
                {author.name}
              </h1>

              <div className="mt-6 h-[2px] w-20 bg-[#C67C4E]/55" />
            </div>
          </div>

          {author.bio?.length ? (
            <section className="mt-14 border-t border-white/10 pt-10">
              <PortableText
                value={author.bio}
                components={bioComponents}
              />
            </section>
          ) : null}

          <section className="mt-20">
            <div className="flex items-end justify-between border-b border-white/10 pb-4">
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.3em] text-[#9C9488]">
                Latest work
              </h2>

              <span className="text-[12px] text-[#817A71]">
                {articles.length} {articles.length === 1 ? "article" : "articles"}
              </span>
            </div>

            {articles.length > 0 ? (
              <div className="divide-y divide-white/10">
                {articles.map((article) => {
                  if (!article.slug) return null;

                  const href =
                    article._type === "newsItem"
                      ? `/news/${article.slug}`
                      : `/commentary/${article.slug}`;

                  const sectionLabel =
                    article._type === "newsItem" ? "News" : "Commentary";

                  const date = formatDate(article.publishedAt);

                  return (
                    <article
                      key={article._id}
                      className="group py-8 md:py-10"
                    >
                      <Link
                        href={href}
                        className="grid gap-6 no-underline hover:no-underline md:grid-cols-[1fr_180px] md:items-start"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#C67C4E]">
                              {sectionLabel}
                            </span>

                            {date ? (
                              <span className="text-[12px] text-[#817A71]">
                                {date}
                              </span>
                            ) : null}

                            {article.readTimeMinutes ? (
                              <span className="text-[12px] text-[#817A71]">
                                {article.readTimeMinutes} min read
                              </span>
                            ) : null}
                          </div>

                          <h3 className="mt-4 font-serif text-[25px] font-semibold leading-[1.08] tracking-[-0.018em] text-[#D8CBB8] transition-colors group-hover:text-[#E8DED0] md:text-[30px]">
                            {article.title}
                          </h3>

                          {article.excerpt ? (
                            <p className="mt-4 max-w-[58ch] text-[15.5px] leading-[1.72] text-[#AAA298] transition-colors group-hover:text-[#BBB2A7]">
                              {article.excerpt}
                            </p>
                          ) : null}
                        </div>

                        {article.heroImageUrl ? (
                          <div className="h-32 overflow-hidden rounded-[2px] bg-white/5 ring-1 ring-white/10 md:h-[112px]">
                            <img
                              src={article.heroImageUrl}
                              alt=""
                              aria-hidden="true"
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                            />
                          </div>
                        ) : null}
                      </Link>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="py-10 text-[15px] text-[#9C9488]">
                No published articles are currently associated with this author.
              </p>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}