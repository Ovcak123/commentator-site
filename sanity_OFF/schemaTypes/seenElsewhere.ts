import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'seenElsewhere',
  title: 'Seen Elsewhere',
  type: 'document',
  fields: [
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
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'Link URL',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'priority',
      title: 'Homepage order (1 = top)',
      type: 'number',
    }),
  ],
})
