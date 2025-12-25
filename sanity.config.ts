'use client'

import React from 'react'
import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemaTypes'

function AIToolsAutoOpen() {
  React.useEffect(() => {
    window.open('/ai-tools', '_blank', 'noreferrer')
  }, [])

  return React.createElement(
    'div',
    { style: { padding: 16, lineHeight: 1.5 } },
    React.createElement('h2', { style: { margin: '0 0 8px 0' } }, 'AI Tools'),
    React.createElement(
      'p',
      { style: { margin: 0 } },
      'Opening /ai-tools in a new tab…'
    )
  )
}

export default defineConfig({
  basePath: '/studio',

  name: 'default',
  title: 'Commentator Studio',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,

  plugins: [
    deskTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            // Core streams
            S.documentTypeListItem('post').title('Commentary'),
            S.documentTypeListItem('newsItem').title('News'),
            S.documentTypeListItem('feedRead').title('Feed Read'),

            S.divider(),

            // Singleton site pages (editable from Studio)
            S.listItem()
              .title('About')
              .child(
                S.editor()
                  .id('aboutPageEditor')
                  .schemaType('aboutPage')
                  .documentId('aboutPage')
                  .title('About')
              ),

            S.listItem()
              .title('Freedom Reloaded')
              .child(
                S.editor()
                  .id('freedomReloadedPageEditor')
                  .schemaType('freedomReloadedPage')
                  .documentId('freedomReloadedPage')
                  .title('Freedom Reloaded')
              ),

            S.listItem()
              .title('Contact')
              .child(
                S.editor()
                  .id('contactPageEditor')
                  .schemaType('contactPage')
                  .documentId('contactPage')
                  .title('Contact')
              ),

            S.divider(),

            // AI tools
            S.listItem()
              .title('AI Tools')
              .child(S.component(AIToolsAutoOpen).title('AI Tools')),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
