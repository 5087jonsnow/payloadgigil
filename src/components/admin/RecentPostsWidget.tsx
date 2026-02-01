import React from 'react'
import { getPayload } from 'payload'

export const RecentPostsWidget: React.FC = async () => {
  try {
    const payload = await getPayload({ config: (await import('@/payload.config')).default })
    const { docs } = await payload.find({ collection: 'posts', limit: 5, sort: '-publishedAt', where: { _status: { equals: 'published' } }, depth: 1 })

    return (
      <div>
        <h3 className="mb-2">Recent Posts</h3>
        <ul>
          {docs.map((doc: any) => (
            <li key={doc.id}>
              <a href={`/blog/${doc.slug}`}>{doc.title}</a>
            </li>
          ))}
        </ul>
      </div>
    )
  } catch (err) {
    return <div>Unable to load recent posts</div>
  }
}

export default RecentPostsWidget
