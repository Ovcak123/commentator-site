import { defineField, defineType } from "sanity";

export default defineType({
  name: "newsItem",
  title: "News Item",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "readTimeMinutes",
      title: "Read time (minutes)",
      type: "number",
      description: "Displayed on site as “X min read” next to the headline.",
      validation: (Rule) => Rule.integer().min(1).max(30),
    }),

    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),

    defineField({
      name: "isLead",
      title: "Lead",
      type: "boolean",
      description: "Tick to make this the homepage lead story (only one allowed)",
      initialValue: false,
    }),

    defineField({
      name: "source",
      title: "Source",
      type: "string",
      description: "Optional (e.g., TechWire, Brussels Briefing).",
    }),

    defineField({
      name: "externalUrl",
      title: "External URL (optional)",
      type: "url",
      description: "Optional: if this News item links to an external source.",
      validation: (Rule) =>
        Rule.uri({
          allowRelative: false,
          scheme: ["http", "https"],
        }),
    }),

    defineField({
  name: "authors",
  title: "Authors",
  type: "array",
  description:
    "Select the author or authors responsible for this News article.",
  of: [
    {
      type: "reference",
      to: [{ type: "author" }],
    },
  ],
}),

defineField({
  name: "author",
  title: "Legacy author",
  type: "string",
  description:
    "Temporary fallback for articles not yet migrated to Author documents.",
  hidden: ({ document }) =>
    Array.isArray(document?.authors) && document.authors.length > 0,
}),

    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      description: "Short summary shown in lists / previews.",
    }),

    defineField({
      name: "body",
      title: "Body",
      type: "richText",
    }),

    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "editorialImage",
    }),

    defineField({
      name: "priority",
      title: "Homepage order (lower = higher)",
      type: "number",
      initialValue: 50,
    }),
  ],
});