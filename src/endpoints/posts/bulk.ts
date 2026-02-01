import type { Endpoint } from 'payload'
import { APIError } from 'payload'

export const bulkPostsEndpoint: Endpoint = {
  path: '/posts/bulk',
  method: 'post',
  handler: async (req) => {
    const body = await (req.json?.() || Promise.resolve({} as any))
    const { ids, action } = body

    if (!req.user) {
      throw new APIError('Unauthorized', 401)
    }

    if (!Array.isArray(ids) || !ids.length) {
      throw new APIError('`ids` must be a non-empty array', 400)
    }

    if (!['publish', 'unpublish'].includes(action)) {
      throw new APIError('`action` must be publish or unpublish', 400)
    }

    const updates = ids.map((id: string) => {
      if (action === 'publish') {
        return req.payload.update({
          collection: 'posts',
          id,
          data: { status: 'published', publishedAt: new Date().toISOString() } as any,
          req,
        })
      }

      return req.payload.update({
        collection: 'posts',
        id,
        data: { status: 'draft' } as any,
        req,
      })
    })

    try {
      const results = await Promise.all(updates)
      return Response.json({ count: results.length, docs: results })
    } catch (err: any) {
      throw new APIError(err?.message || 'Bulk update failed', 500)
    }
  },
}

export default bulkPostsEndpoint
