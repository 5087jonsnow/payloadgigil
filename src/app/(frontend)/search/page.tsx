import React from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import type { Metadata } from 'next'

type Props = {
  searchParams?: { q?: string; tag?: string; page?: string }
}

export const metadata: Metadata = {
  title: 'Blog Search',
  description: 'Search all blog posts by keyword or tag',
}

const PAGE_SIZE = 20

/**
 * Search results page supporting:
 * - Keyword search across post title and excerpt
 * - Tag-based filtering
 * - Pagination
 */
export default async function SearchPage({ searchParams }: Props) {
  const query = searchParams?.q || ''
  const tagFilter = searchParams?.tag || ''
  const page = Math.max(1, Number(searchParams?.page || 1))
  const payload = await getPayload({ config })

  let docs: any[] = []
  let totalDocs = 0

  if (query || tagFilter) {
    try {
      const where: any = {
        and: [{ _status: { equals: 'published' } }],
      }

      // Add keyword search
      if (query) {
        where.or = [
          { title: { contains: query } },
          { excerpt: { contains: query } },
        ]
      }

      // Add tag filter
      if (tagFilter) {
        where.and.push({
          tags: { equals: tagFilter },
        })
      }

      const result = await payload.find({
        collection: 'posts',
        where: where.or ? { and: where.and, or: where.or } : where,
        sort: '-publishedAt',
        limit: PAGE_SIZE,
        page,
        depth: 1,
      })

      docs = result.docs as any[]
      totalDocs = result.totalDocs
    } catch (err) {
      // Error performing search
      console.error('Search error:', err)
    }
  }

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">Search Blog</h1>

      {/* Search Info */}
      <div className="mb-8">
        {query && (
          <p className="text-lg text-muted">
            Results for: <strong>"{query}"</strong>
            {tagFilter && ` tagged with "${tagFilter}"`}
          </p>
        )}
        {!query && tagFilter && (
          <p className="text-lg text-muted">
            Posts tagged: <strong>"{tagFilter}"</strong>
          </p>
        )}
        {!query && !tagFilter && (
          <p className="text-lg text-muted">Enter a search term to get started</p>
        )}
      </div>

      {/* Results */}
      {docs.length > 0 ? (
        <>
          <p className="text-sm text-muted mb-6">
            Found {totalDocs} result{totalDocs !== 1 ? 's' : ''}
          </p>

          <div className="space-y-6 mb-12">
            {docs.map((post) => (
              <article
                key={post.id}
                className="border-b pb-6 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-900/50 -mx-4 px-4 py-6 rounded transition"
              >
                <div className="flex gap-4">
                  {/* Featured Image */}
                  {post.featuredImage && (
                    <Link
                      href={`/blog/${post.slug}`}
                      className="flex-shrink-0 w-32 h-24 bg-gray-200 rounded overflow-hidden"
                    >
                      <img
                        src={post.featuredImage.url}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition"
                      />
                    </Link>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold mb-2 line-clamp-2">
                      <Link href={`/blog/${post.slug}`} className="hover:text-blue-600">
                        {post.title}
                      </Link>
                    </h2>

                    {post.excerpt && (
                      <p className="text-muted mb-3 line-clamp-2">{post.excerpt}</p>
                    )}

                    <div className="flex flex-wrap gap-3 text-sm text-muted">
                      {post.publishedAt && (
                        <span>
                          {new Date(post.publishedAt).toLocaleDateString()}
                        </span>
                      )}

                      {post.author && (
                        <span>By {post.author.name || post.author.email}</span>
                      )}

                      {post.categories?.length > 0 && (
                        <span>
                          {post.categories.map((c: any) => c.name).join(', ')}
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    {post.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {post.tags.map((tag: any) => (
                          <Link
                            key={tag.id}
                            href={`/search?tag=${tag.slug}`}
                            className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded hover:bg-gray-300"
                          >
                            #{tag.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          {totalDocs > PAGE_SIZE && (
            <div className="flex justify-center gap-4 mt-8">
              {page > 1 && (
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&tag=${tagFilter}&page=${page - 1}`}
                  className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-900"
                >
                  ← Previous
                </Link>
              )}

              <span className="px-4 py-2 text-muted">
                Page {page} of {Math.ceil(totalDocs / PAGE_SIZE)}
              </span>

              {totalDocs > page * PAGE_SIZE && (
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&tag=${tagFilter}&page=${page + 1}`}
                  className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-900"
                >
                  Next →
                </Link>
              )}
            </div>
          )}
        </>
      ) : query || tagFilter ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted mb-4">No posts found matching your search.</p>
          <Link href="/blog" className="text-blue-500 hover:underline">
            ← Back to Blog
          </Link>
        </div>
      ) : null}
    </div>
  )
}
