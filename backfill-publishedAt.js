const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: 'o6cs8ags',
  dataset: 'production',
  apiVersion: '2023-01-01',
  token: 'sk5ri9Fg7DAbwBegHkOSA83uGKz8IL5YXzZAfT39JeWg7WXQWAU6ZwgQsLiX9L76G7lDDUddxvLvSMGlwbFSFbqkOmV9ks5n0mJAYBoFDNDmfGdm9cgsGthDY2NL11HBd6b7qjtbxOxalLZV0O25xMyNgxHbVDpo4JSdPG0L1VqPSMF5sYU0',
  useCdn: false,
})

async function run() {
  const docs = await client.fetch(`
    *[_type in ["post", "newsItem"] && !defined(publishedAt)]{
      _id,
      _createdAt
    }
  `)

  console.log("Updating", docs.length, "documents")

  for (const doc of docs) {
    await client
      .patch(doc._id)
      .set({ publishedAt: doc._createdAt })
      .commit()

    console.log("Updated", doc._id)
  }

  console.log("Done")
}

run().catch(console.error)