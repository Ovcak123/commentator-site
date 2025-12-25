// data/posts.ts

export interface Post {
  id: number;
  slug: string;
  title: string;
  author: string;
  date: string;
  category: string;
  featured: boolean;
  heroImage: string;
  thumbnail?: string;
  excerpt: string;
  content: string; // full article text
}

export const posts: Post[] = [
  {
    id: 1,
    slug: "ai-tsunami-vs-old-democracy",
    title: "AI Tsunami vs. Old Democracy",
    author: "Robin Shepherd",
    date: "Nov 30, 2025",
    category: "Opinion",
    featured: true,
    heroImage:
      "https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=1200",
    thumbnail:
      "https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=400",
    excerpt:
      "An AI-driven unemployment shock is colliding with exhausted 18th-century institutions. The problem is not the tools themselves but our refusal to redesign democracy.",
    content: `This is where the full article for “AI Tsunami vs. Old Democracy” will go.

For now this is placeholder text. You can replace it with a real essay: multiple paragraphs, quotes, whatever you like.

Each blank line between paragraphs will create a new paragraph on the article page.`,
  },
  {
    id: 2,
    slug: "democracy-after-the-job-shock",
    title: "Democracy After the Job Shock",
    author: "Robin Shepherd",
    date: "Nov 28, 2025",
    category: "Analysis",
    featured: false,
    heroImage:
      "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=1200",
    thumbnail:
      "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=400",
    excerpt:
      "When millions lose their jobs to automation, the real danger is not just economic—it is the collapse of trust in institutions that look frozen in another age.",
    content: `Placeholder full text for “Democracy After the Job Shock”. Later you can paste the full article here.`,
  },
  {
    id: 3,
    slug: "citizen-3-0-has-logged-in",
    title: "Citizen 3.0 Has Logged In",
    author: "Robin Shepherd",
    date: "Nov 25, 2025",
    category: "Essay",
    featured: false,
    heroImage:
      "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=1200",
    thumbnail:
      "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=400",
    excerpt:
      "The public is more informed, connected, and capable than ever before—and less willing than ever to accept a political architecture that treats them like spectators.",
    content: `Placeholder full text for “Citizen 3.0 Has Logged In”.`,
  },
];
