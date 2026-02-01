import React from 'react'
import { getPayload } from 'payload'
import type { Metadata, ResolvingMetadata } from 'next'
import config from '@/payload.config'
import { RichText } from '@/components/RichText'
import { Media } from '@/components/Media'
import Link from 'next/link'

type Props = { params: { slug: string } }

/**
 * Generate metadata for SEO and social sharing.
 * Fetches post data and returns title, description, og:image, and twitter card.
 */
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { slug } = params
  const payload = await getPayload({ config })

  try {
    const { docs } = await payload.find({
      collection: 'posts',
      where: {
        and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
      },
      depth: 1,
      limit: 1,
    })

    const post = docs[0] as any

    if (!post) {
      return {
        title: 'Post Not Found',
        description: 'The blog post you are looking for does not exist.',
      }
    }

    const metaTitle = post.seo?.metaTitle || post.title
    const metaDescription = post.seo?.metaDescription || post.excerpt || 'Read the full article'
    const metaImage = post.seo?.metaImage?.url || post.featuredImage?.url

    return {
      title: metaTitle,
      description: metaDescription,
      openGraph: {
        title: metaTitle,
        description: metaDescription,
        type: 'article',
        publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
        authors: post.author?.email ? [post.author.email] : undefined,
        images: metaImage ? [{ url: metaImage }] : undefined,
        url: `/blog/${slug}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: metaTitle,
        description: metaDescription,
        images: metaImage ? [metaImage] : undefined,
      },
    }
  } catch (err) {
    return {
      title: 'Error',
      description: 'Unable to load post metadata',
    }
  }
}

/**
 * Render a single blog post with full content, comments, and related posts.
 * Uses Lexical blocks for flexible content layouts.
 */
export default async function PostPage({ params }: Props) {
  const { slug } = params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'posts',
    where: {
      and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
    },
    depth: 2,
    limit: 1,
  })

  const post = docs[0] as any

  if (!post) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
        <p className="text-muted mb-4">The blog post you are looking for does not exist.</p>
        <Link href="/blog" className="text-blue-500 hover:underline">
          ← Back to Blog
        </Link>
      </div>
    )
  }

  // Fetch approved comments for this post
  let comments: any[] = []
  try {
    const { docs: commentDocs } = await payload.find({
      collection: 'comments',
      where: {
        and: [
          { post: { equals: post.id } },
          { status: { equals: 'approved' } },
        ],
      },
      depth: 1,
      sort: '-createdAt',
    })
    comments = commentDocs as any[]
  } catch (err) {
    // Comments collection may not exist or error occurred
  }

  return (
    <article className="container py-12">
      {/* Post Header */}
      <header className="mb-8 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

        <div className="flex flex-wrap gap-4 text-sm text-muted mb-6">
          {post.publishedAt && (
            <time dateTime={new Date(post.publishedAt).toISOString()}>
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          )}

          {post.author && (
            <span>
              By <strong>{post.author.name || post.author.email}</strong>
            </span>
          )}

          {post.categories?.length > 0 && (
            <div>
              <span className="font-semibold">In</span>{' '}
              {post.categories.map((cat: any) => (
                <Link
                  key={cat.id}
                  href={`/blog?category=${cat.slug}`}
                  className="text-blue-500 hover:underline"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag: any) => (
              <Link
                key={tag.id}
                href={`/search?tag=${tag.slug}`}
                className="inline-block bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="mb-6 rounded-lg overflow-hidden">
            <Media resource={post.featuredImage as any} />
          </div>
        )}

        {/* Excerpt */}
        {post.excerpt && <p className="text-lg text-muted italic mb-6">{post.excerpt}</p>}
      </header>

      {/* Content Blocks */}
      <div className="max-w-3xl mx-auto mb-12">
        {post.layout?.map((block: any, idx: number) => {
          switch (block.blockType) {
            case 'richText':
              return (
                <div key={idx} className="mb-6">
                  <RichText data={block.content} enableGutter={false} />
                </div>
              )

            case 'image':
              return (
                <figure key={idx} className="my-8">
                  {block.image && <Media resource={block.image as any} />}
                  {block.caption && (
                    <figcaption className="text-sm text-muted text-center mt-2">
                      {block.caption}
                    </figcaption>
                  )}
                </figure>
              )

            case 'codeBlock':
              return (
                <pre
                  key={idx}
                  className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-6 text-sm"
                >
                  <code className={`language-${block.language}`}>{block.code}</code>
                </pre>
              )

            case 'cta':
              return (
                <div key={idx} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 rounded-lg p-6 my-8">
                  <h3 className="text-lg font-semibold mb-2">{block.heading}</h3>
                  {block.description && (
                    <p className="text-muted mb-4">{block.description}</p>
                  )}
                  <a
                    href={block.buttonLink}
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    {block.buttonText}
                  </a>
                </div>
              )

            default:
              return null
          }
        })}
      </div>

      {/* Related Posts */}
      {post.relatedPosts?.length > 0 && (
        <aside className="max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {post.relatedPosts.slice(0, 3).map((related: any) => (
              <Link
                key={related.id}
                href={`/blog/${related.slug}`}
                className="group block border rounded-lg overflow-hidden hover:shadow-lg transition"
              >
                {related.featuredImage && (
                  <div className="aspect-video overflow-hidden bg-gray-200">
                    <img
                      src={related.featuredImage.url}
                      alt={related.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold group-hover:text-blue-600">{related.title}</h3>
                  {related.excerpt && (
                    <p className="text-sm text-muted line-clamp-2 mt-2">{related.excerpt}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </aside>
      )}

      {/* Comments Section */}
      <section className="max-w-3xl mx-auto border-t pt-12">
        <h2 className="text-2xl font-bold mb-6">Comments ({comments.length})</h2>

        {/* Comment Form - Would be a client component in production */}
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <p className="text-sm text-muted">
            Comments are moderated and will be approved before appearing. Login to leave a comment.
          </p>
        </div>

        {/* Comments List */}
        {comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment: any) => (
              <div key={comment.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <strong>{comment.author?.name || comment.author?.email || 'Anonymous'}</strong>
                  <time className="text-sm text-muted">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </time>
                </div>
                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted text-center py-8">No comments yet. Be the first to comment!</p>
        )}
      </section>
    </article>
  )
}

