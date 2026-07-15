// sanity/schemaTypes/author.ts

import { defineField, defineType } from "sanity";

export default defineType({
  name: "author",
  title: "Authors",
  type: "document",

  fields: [
    defineField({
      name: "name",
      title: "Full name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description:
        "Used for the public author page, for example /authors/robin-shepherd.",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "bio",
      title: "Full biography",
      type: "array",
      description:
        "The full biography displayed on the author's public profile page. Text may include manually added hyperlinks.",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading 2", value: "h2" },
            { title: "Heading 3", value: "h3" },
          ],
          lists: [
            { title: "Bullet list", value: "bullet" },
            { title: "Numbered list", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
            ],
            annotations: [
              defineField({
                name: "link",
                title: "Link",
                type: "object",
                fields: [
                  defineField({
                    name: "href",
                    title: "URL",
                    type: "url",
                    validation: (Rule) =>
                      Rule.uri({
                        scheme: ["http", "https", "mailto"],
                      }),
                  }),
                ],
              }),
            ],
          },
        },
      ],
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "portrait",
      title: "Portrait",
      type: "image",
      options: {
        hotspot: true,
      },
    }),

    defineField({
      name: "authorFooter",
      title: "Author footer",
      type: "array",
      description:
        "One or two lines displayed automatically at the bottom of the author's articles. Add hyperlinks wherever you wish.",
      of: [
        {
          type: "block",
          styles: [{ title: "Normal", value: "normal" }],
          lists: [],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
            ],
            annotations: [
              defineField({
                name: "link",
                title: "Link",
                type: "object",
                fields: [
                  defineField({
                    name: "href",
                    title: "URL",
                    type: "url",
                    validation: (Rule) =>
                      Rule.uri({
                        scheme: ["http", "https", "mailto"],
                      }),
                  }),
                ],
              }),
            ],
          },
        },
      ],
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "tags",
      title: "Internal tags",
      type: "array",
      description:
        "Internal editorial tags for organising authors. Never displayed publicly.",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
    }),
  ],

  preview: {
    select: {
      title: "name",
      media: "portrait",
    },
  },

  orderings: [
    {
      title: "Name, A–Z",
      name: "nameAscending",
      by: [{ field: "name", direction: "asc" }],
    },
  ],
});