import type { CollectionAfterChangeHook } from 'payload'

/**
 * Safe revalidation hook for blog posts.
 * Sends revalidation requests to a server endpoint WITHOUT awaiting.
 * Avoids blocking the hook execution and prevents Next.js revalidation errors.
 */
export const revalidatePosts: CollectionAfterChangeHook = ({ doc, req }) => {
  // Skip revalidation if explicitly flagged
  if (req?.context?.skipRevalidation) return doc

  try {
    const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'
    const secret = process.env.REVALIDATE_SECRET
    const paths = ['/blog', '/search']

    if ((doc as any)?.slug) {
      paths.push(`/blog/${(doc as any).slug}`)
    }

    // Fire-and-forget: Send requests without awaiting
    paths.forEach((path) => {
      fetch(`${baseUrl}/api/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, secret }),
      }).catch(() => {
        // Silent fail - don't log to avoid potential issues
      })
    })

    // Also send tag revalidation
    fetch(`${baseUrl}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag: 'posts', secret }),
    }).catch(() => {
      // Silent fail
    })
  } catch {
    // Silently ignore any errors in hook execution
  }

  return doc
}

export default revalidatePosts
