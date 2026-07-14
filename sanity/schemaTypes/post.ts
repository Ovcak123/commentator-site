import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'post',
  title: 'Commentary', // shown in Studio sidebar
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),

    // ✅ Read time (minutes)
    defineField({
      name: 'readTimeMinutes',
      title: 'Read time (minutes)',
      type: 'number',
      description: 'Displayed on site as “X min read” next to the headline.',
      validation: (rule) => rule.integer().min(1).max(30),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),

    // ✅ NEW: Lead checkbox
    defineField({
      name: 'isLead',
      title: 'Lead',
      type: 'boolean',
      description: 'Tick to make this the homepage lead story (only one allowed)',
      initialValue: false,
    }),

    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
    }),

    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
    }),

    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
    }),

    defineField({
      name: 'body',
      title: 'Body',
      type: 'richText',
    }),

    defineField({
      name: 'heroImage',
      title: 'Hero image',
      type: 'editorialImage',
    }),
  ],
})