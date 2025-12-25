// pages/index.tsx

import Header from "../components/Header";
import FeaturedArticle from "../components/FeaturedArticle";
import ArticleCard from "../components/ArticleCard";
import { posts } from "../data/posts";

export default function HomePage() {
  const featured = posts.find((p) => p.featured);
  const others = posts.filter((p) => !p.featured);

  return (
    <>
      <Header />

      <main className="grid grid-cols-[2fr_1.2fr] gap-6 mt-4 max-md:grid-cols-1">
        <section>
          <FeaturedArticle post={featured} />
        </section>

        <aside className="flex flex-col gap-4">
          {others.map((post) => (
            <ArticleCard key={post.id} post={post} />
          ))}
        </aside>
      </main>
    </>
  );
}
