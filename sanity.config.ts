'use client'

import React from 'react'
import {
  defineConfig,
  useClient,
  type DocumentActionComponent,
  type DocumentActionProps,
} from 'sanity'
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

function getBaseId(id: string) {
  return id.replace(/^drafts\./, '')
}

function createLeadAwarePublishAction(
  OriginalPublishAction: DocumentActionComponent
): DocumentActionComponent {
  return function LeadAwarePublishAction(props: DocumentActionProps) {
    const originalResult = OriginalPublishAction(props)
    const client = useClient({ apiVersion: '2025-03-01' })

    if (!originalResult) {
      return null
    }

    const isLead = props.draft?.isLead === true || props.published?.isLead === true

    return {
      ...originalResult,
      onHandle: async () => {
        try {
          if (isLead) {
            const baseId = getBaseId(props.id)
            const draftId = `drafts.${baseId}`

            const otherLeadIds: string[] = await client.fetch(
              `*[
                _type in ["post", "newsItem"] &&
                isLead == true &&
                !(_id in [$baseId, $draftId])
              ][]._id`,
              { baseId, draftId }
            )

            if (otherLeadIds.length > 0) {
              const tx = client.transaction()

              for (const id of otherLeadIds) {
                tx.patch(id, {
                  set: { isLead: false },
                })
              }

              await tx.commit()
            }
          }

          await originalResult.onHandle?.()
        } catch (error) {
          console.error('Lead publish action failed:', error)
        }
      },
    }
  }
}

export default defineConfig({
  basePath: '/studio',

  name: 'default',
  title: 'Commentator Studio',

  projectId: 'o6cs8ags',
  dataset: 'production',

  plugins: [
    deskTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.documentTypeListItem('post').title('Commentary'),
            S.documentTypeListItem('newsItem').title('News'),
            S.documentTypeListItem('author').title('Authors'),
            S.documentTypeListItem('feedRead').title('Feed Read'),

            S.divider(),

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

  document: {
    actions: (prev, context) => {
      if (!['post', 'newsItem'].includes(context.schemaType)) {
        return prev
      }

      return prev.map((action) => {
        return action.action === 'publish'
          ? createLeadAwarePublishAction(action)
          : action
      })
    },
  },
})