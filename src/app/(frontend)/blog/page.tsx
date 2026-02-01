import React from 'react'
import { getPayload } from 'payload'
import Link from 'next/link'
import config from '@/payload.config'
import type { Metadata } from 'next'

type Props = { searchParams?: { page?: string; category?: string } }

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Read the latest blog posts, tutorials, and insights',
  openGraph: {
    title: 'Blog',
    description: 'Read the latest blog posts, tutorials, and insights',
    type: 'website',
    url: '/blog',
  },
}

const PAGE_SIZE = 10

/**
 * Blog listing page with:
 * - Pagination support
 * - Category filtering
 * - Post cards with featured images, excerpts, and metadata
 */
export default async function BlogPage({ searchParams }: Props) {
  const page = Math.max(1, Number(searchParams?.page || 1))
  const categoryFilter = searchParams?.category || ''
  const payload = await getPayload({ config })

  const where: any = { _status: { equals: 'published' } }

  // Add category filter if provided
  if (categoryFilter) {
    where.categories = { equals: categoryFilter }
  }

  const { docs, totalDocs } = await payload.find({
    collection: 'posts',
    where,
    sort: '-publishedAt',
    limit: PAGE_SIZE,
    page,
    depth: 1,
  })

  const totalPages = Math.ceil(totalDocs / PAGE_SIZE)

  return (
    <div className="container py-12">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Blog</h1>
        <p className="text-lg text-muted">
          Articles, tutorials, and insights about web development and e-commerce.
        </p>
      </header>

      {/* Results Info */}
      {categoryFilter && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 rounded-lg">
          <p className="text-sm">
            Filtering by category: <strong>{categoryFilter}</strong>
            <Link href="/blog" className="ml-4 text-blue-600 hover:underline">
              Clear filter
            </Link>
          </p>
        </div>
      )}

      {/* Posts Grid */}
      {docs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {(docs as any[]).map((post) => (
              <article key={post.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
                {/* Featured Image */}
                {post.featuredImage && (
                  <Link
                    href={`/blog/${post.slug}`}
                    className="block aspect-video bg-gray-200 overflow-hidden"
                  >
                    <img
                      src={post.featuredImage.url}
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition"
                    />
                  </Link>
                )}

                {/* Content */}
                <div className="p-6">
                  {/* Title */}
                  <h2 className="text-xl font-semibold mb-3">
                    <Link href={`/blog/${post.slug}`} className="hover:text-blue-600">
                      {post.title}
                    </Link>
                  </h2>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-muted mb-4 line-clamp-2">{post.excerpt}</p>
                  )}

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-3 text-sm text-muted mb-4">
                    {post.publishedAt && (
                      <span>
                        {new Date(post.publishedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}

                    {post.author && (
                      <span>By {post.author.name || post.author.email}</span>
                    )}
                  </div>

                  {/* Categories */}
                  {post.categories?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.categories.map((cat: any) => (
                        <Link
                          key={cat.id}
                          href={`/blog?category=${cat.slug}`}
                          className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded hover:bg-gray-300"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.slice(0, 3).map((tag: any) => (
                        <Link
                          key={tag.id}
                          href={`/search?tag=${tag.slug}`}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          #{tag.name}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Read More Link */}
                  <div className="mt-4 pt-4 border-t">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-blue-600 hover:underline font-semibold text-sm"
                    >
                      Read Full Article →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              className="flex justify-center items-center gap-4"
              aria-label="Blog pagination"
            >
              {page > 1 && (
                <Link
                  href={`/blog?${categoryFilter ? `category=${categoryFilter}&` : ''}page=${page - 1}`}
                  className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-900 transition"
                >
                  ← Previous
                </Link>
              )}

              <span className="text-muted">
                Page {page} of {totalPages}
              </span>

              {page < totalPages && (
                <Link
                  href={`/blog?${categoryFilter ? `category=${categoryFilter}&` : ''}page=${page + 1}`}
                  className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-900 transition"
                >
                  Next →
                </Link>
              )}
            </nav>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted mb-4">No blog posts found.</p>
          <Link href="/" className="text-blue-500 hover:underline">
            ← Back to Home
          </Link>
        </div>
      )}
    </div>
  )
}

