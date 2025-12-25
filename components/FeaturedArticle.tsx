// components/FeaturedArticle.tsx

import type { Post } from "../data/posts";

interface Props {
  post: Post | undefined;
}

export default function FeaturedArticle({ post }: Props) {
  if (!post) return null;

  return (
    <article className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
      <div
        className="w-full h-56 bg-neutral-200 bg-cover bg-center"
        style={{ backgroundImage: `url(${post.heroImage})` }}
      />
      <div className="p-5">
        <div className="text-xs font-semibold uppercase text-red-700 mb-1">
          {post.category}
        </div>
        <h2 className="font-serif text-2xl leading-tight mb-2">
          {post.title}
        </h2>
        <div className="text-xs text-neutral-500 mb-3">
          {post.author} · {post.date}
        </div>
        <p className="text-sm">{post.excerpt}</p>
      </div>
    </article>
  );
}
