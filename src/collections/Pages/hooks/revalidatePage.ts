import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import type { Page } from '../../../payload-types'

/**
 * Safe revalidation hook for pages.
 * Sends revalidation requests to a server endpoint WITHOUT awaiting.
 * Avoids blocking the hook and prevents Next.js revalidation errors during admin renders.
 */
export const revalidatePage: CollectionAfterChangeHook<Page> = ({ doc, previousDoc, req }) => {
  if (!req || req?.context?.disableRevalidate) return doc

  try {
    const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'
    const secret = process.env.REVALIDATE_SECRET

    if (doc._status === 'published') {
      const path = doc.slug === 'home' ? '/' : `/${doc.slug}`

      // Fire-and-forget request
      fetch(`${baseUrl}/api/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, secret }),
      }).catch(() => {
        // Silent fail
      })
    }

    // If the page was previously published, revalidate the old path
    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      const oldPath = previousDoc.slug === 'home' ? '/' : `/${previousDoc.slug}`

      // Fire-and-forget request
      fetch(`${baseUrl}/api/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: oldPath, secret }),
      }).catch(() => {
        // Silent fail
      })
    }
  } catch {
    // Silently ignore any errors
  }

  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Page> = ({ doc, req }) => {
  if (!req || req?.context?.disableRevalidate) return doc

  try {
    const path = doc?.slug === 'home' ? '/' : `/${doc?.slug}`
    const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'
    const secret = process.env.REVALIDATE_SECRET

    // Fire-and-forget request
    fetch(`${baseUrl}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, secret }),
    }).catch(() => {
      // Silent fail
    })
  } catch {
    // Silently ignore any errors
  }

  return doc
}

