// sanity/lib/client.ts
// Real Sanity client used by the Next.js app.

import { createClient } from "next-sanity";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-01-01", // fixed API date
  useCdn: false,            // always fresh data for the site
});
