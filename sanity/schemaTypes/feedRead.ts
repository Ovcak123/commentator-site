// sanity/schemaTypes/feedRead.ts
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'feedRead',
  title: 'Feed Read',
  type: 'document',

  // New docs default to Feed Read (so nothing breaks)
  initialValue: {
    section: 'feedRead',
  },

  fields: [
    // ✅ NEW: section picker (Feed Read vs Strategic Insights)
    defineField({
      name: 'section',
      title: 'Section',
      type: 'string',
      options: {
        list: [
          { title: 'Feed Read', value: 'feedRead' },
          { title: 'Strategic Insights', value: 'strategicInsights' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
    }),
    defineField({
      name: 'url',
      title: 'External URL',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
    }),
    defineField({
      name: 'priority',
      title: 'Homepage order (1 = top)',
      type: 'number',
    }),
  ],
})
