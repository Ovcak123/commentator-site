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
      name: "shortBio",
      title: "Short biography",
      type: "text",
      rows: 3,
      description:
        "A concise biography for article pages, metadata and author previews.",
      validation: (Rule) => Rule.required().max(300),
    }),

    defineField({
      name: "bio",
      title: "Full biography",
      type: "array",
      description: "The full biography displayed on the author page.",
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
              {
                name: "link",
                title: "Link",
                type: "object",
                fields: [
                  {
                    name: "href",
                    title: "URL",
                    type: "url",
                    validation: (Rule) =>
                      Rule.uri({
                        scheme: ["http", "https", "mailto"],
                      }),
                  },
                ],
              },
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
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          description:
            "Describe the portrait for readers using assistive technology.",
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),

    defineField({
      name: "role",
      title: "Role or professional title",
      type: "string",
      description:
        "For example: Editor in Chief, Contributing Editor or Senior Fellow.",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "affiliation",
      title: "Affiliation",
      type: "string",
      description:
        "Optional organisation, institution or professional affiliation.",
    }),

    defineField({
      name: "expertise",
      title: "Expertise and coverage areas",
      type: "array",
      description:
        "Subjects associated with this author, such as artificial intelligence, geopolitics or economics.",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
    }),

    defineField({
      name: "email",
      title: "Public email address",
      type: "email",
      description:
        "Add only when the address is intended to be publicly displayed.",
    }),

    defineField({
      name: "xProfile",
      title: "X profile",
      type: "url",
      validation: (Rule) =>
        Rule.uri({
          scheme: ["http", "https"],
        }),
    }),

    defineField({
      name: "linkedInProfile",
      title: "LinkedIn profile",
      type: "url",
      validation: (Rule) =>
        Rule.uri({
          scheme: ["http", "https"],
        }),
    }),

    defineField({
      name: "website",
      title: "Personal or institutional website",
      type: "url",
      validation: (Rule) =>
        Rule.uri({
          scheme: ["http", "https"],
        }),
    }),

    defineField({
      name: "otherProfiles",
      title: "Other profile links",
      type: "array",
      of: [
        {
          name: "profileLink",
          title: "Profile link",
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),

            defineField({
              name: "url",
              title: "URL",
              type: "url",
              validation: (Rule) =>
                Rule.required().uri({
                  scheme: ["http", "https"],
                }),
            }),
          ],
          preview: {
            select: {
              title: "label",
              subtitle: "url",
            },
          },
        },
      ],
    }),
  ],

  preview: {
    select: {
      title: "name",
      subtitle: "role",
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