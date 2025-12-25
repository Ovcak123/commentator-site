// sanity/schemaTypes/freedomReloadedPage.ts
import { defineType, defineField } from "sanity";

export default defineType({
  name: "freedomReloadedPage",
  title: "Freedom Reloaded",
  type: "document",
  fields: [
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [{ type: "block" }],
    }),
  ],
});
