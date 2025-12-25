// components/ArticleCard.tsx

import Link from "next/link";

interface ArticleCardProps {
  post: {
    id: string | number;
    slug: string;
    title: string;
    author?: string;
    date?: string;
    category?: string;
    featured?: boolean;
    heroImage?: string;
    thumbnail?: string;
    excerpt?: string;
  };
  variant?: "lead";
}

export default function ArticleCard({ post, variant }: ArticleCardProps) {
  const isLead = variant === "lead";

  return (
    <Link href={`/posts/${post.slug}`} className="block group">
      <article className="flex flex-col gap-2">
        {!isLead && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
            {post.category}
          </p>
        )}

        <h3
          className={`font-semibold leading-tight transition-colors group-hover:text-[color:var(--brand-accent)] ${
            isLead
              ? "text-[20px] text-neutral-900"
              : "text-[18px] text-neutral-900"
          }`}
        >
          {post.title}
        </h3>

        {post.excerpt && !isLead && (
          <p className="text-[14px] leading-relaxed text-neutral-700">
            {post.excerpt}
          </p>
        )}
      </article>
    </Link>
  );
}
