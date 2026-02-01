import type { CollectionAfterChangeHook } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * Revalidation hook for blog posts.
 * Automatically revalidates ISR cache when posts are created, updated, or deleted.
 * This ensures the blog listing and individual post pages show the latest content.
 */
export const revalidatePosts: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
}) => {
  // Skip revalidation if explicitly flagged (e.g., during bulk operations)
  if (req.context?.skipRevalidation) return doc

  try {
    // Revalidate blog listing page
    revalidatePath('/blog')

    // Revalidate specific post by slug
    if ((doc as any).slug) {
      revalidatePath(`/blog/${(doc as any).slug}`)
    }

    // Revalidate search results
    revalidatePath('/search')

    // Tag-based revalidation for related posts
    revalidateTag('posts')

    req.payload.logger.info(`✓ Revalidated post: /blog/${(doc as any).slug}`)
  } catch (err: any) {
    req.payload.logger.error(`✗ Revalidation failed: ${err?.message}`)
  }

  return doc
}

export default revalidatePosts
