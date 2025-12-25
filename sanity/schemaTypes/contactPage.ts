// sanity/schemaTypes/contactPage.ts
import { defineType, defineField } from "sanity";

export default defineType({
  name: "contactPage",
  title: "Contact",
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
