// sanity/schemaTypes/editorialImage.ts

import { defineField, defineType } from "sanity";

export default defineType({
  name: "editorialImage",
  title: "Editorial Image",
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
        "Describe the image clearly for accessibility and image search.",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as
            | {
                decorative?: boolean;
              }
            | undefined;

          if (parent?.decorative) {
            return true;
          }

          return typeof value === "string" && value.trim().length > 0
            ? true
            : "Alternative text is required unless the image is decorative.";
        }),
    }),

    defineField({
      name: "decorative",
      title: "Decorative image",
      type: "boolean",
      description:
        "Only select this when the image conveys no editorial information.",
      initialValue: false,
    }),

    defineField({
      name: "caption",
      title: "Caption",
      type: "text",
      rows: 2,
      description:
        "Optional visible caption explaining the image or its editorial context.",
    }),

    defineField({
      name: "credit",
      title: "Image credit",
      type: "string",
      description:
        "Displayed where appropriate on article pages and in print.",
      initialValue: "The Commentator / AI-generated",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "promptNotes",
      title: "Prompt and generation notes",
      type: "text",
      rows: 3,
      description:
        "Optional internal notes about how the image was generated. This will not be displayed publicly.",
    }),
  ],

  preview: {
    select: {
      title: "alt",
      subtitle: "credit",
      media: "asset",
    },

    prepare({ title, subtitle, media }) {
      return {
        title: title || "Editorial image",
        subtitle: subtitle || "The Commentator / AI-generated",
        media,
      };
    },
  },
});