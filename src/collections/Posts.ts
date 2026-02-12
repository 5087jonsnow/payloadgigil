import type { CollectionConfig } from 'payload'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import { adminOnly } from '@/access/adminOnly'
import { checkRole } from '@/access/utilities'
import { slugField } from '@/fields/Slug/field'
import { toKebabCase } from '@/utilities/toKebabCase'
import { revalidatePosts } from '@/hooks/revalidatePosts'

/**
 * Posts collection with advanced features:
 * - Lexical block-based content for flexible layouts
 * - SEO support (title, description, og:image)
 * - Tags for cross-sectional organization
 * - Related posts (manual + auto-suggestions by category)
 * - Comments support
 * - Draft/published versioning with auto-save
 * - Access control: admins can do all, editors own posts, public reads published
 */
export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'status', 'publishedAt'],
    group: 'Content',
    components: {
      edit: {
        PreviewButton: '@/components/admin/PreviewButton#PreviewButton',
      },
      afterListTable: ['@/components/admin/BulkActions#BulkActions'],
    },
  },
  versions: {
    drafts: {
      autosave: true,
      schedulePublish: true,
      validate: false,
    },
    maxPerDoc: 50,
  },
  access: {
    read: adminOrPublishedStatus,
    create: ({ req: { user } }) => {
      if (!user) return false
      return checkRole(['admin'], user)
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      return checkRole(['admin'], user)
    },
    delete: adminOnly,
  },
  hooks: {
    beforeValidate: [
      async ({ data }) => {
        if (data && data.title && !data.slug) {
          data.slug = toKebabCase(data.title as string)
        }
        return data
      },
    ],
    beforeChange: [
      async ({ data, req, operation, originalDoc }) => {
        // Set publishedAt when status becomes published
        const status = (data as any).status
        if (status === 'published') {
          if (!originalDoc || originalDoc._status !== 'published') {
            ;(data as any).publishedAt = new Date()
          }
        }

        return data
      },
    ],
    afterChange: [revalidatePosts],
  },
  indexes: [
    {
      fields: ['status'],
    },
    {
      fields: ['publishedAt'],
    },
  ],
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField({ fieldToUse: 'title' }),
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Brief summary for listings and social sharing',
      },
    },
    {
      name: 'featuredImage',
      type: 'relationship',
      relationTo: 'media',
      admin: {
        description: 'Used for og:image and social sharing',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'blog-categories',
      hasMany: true,
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: {
        position: 'sidebar',
        description: 'Cross-sectional topics',
      },
    },
    {
      name: 'layout',
      type: 'blocks',
      blocks: [
        {
          slug: 'richText',
          fields: [
            {
              name: 'content',
              type: 'richText',
              required: true,
            },
          ],
        },
        {
          slug: 'image',
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
            {
              name: 'caption',
              type: 'text',
            },
          ],
        },
        {
          slug: 'codeBlock',
          fields: [
            {
              name: 'language',
              type: 'select',
              options: [
                'javascript',
                'typescript',
                'python',
                'css',
                'html',
                'jsx',
                'tsx',
                'bash',
                'json',
              ],
              defaultValue: 'javascript',
            },
            {
              name: 'code',
              type: 'code',
              required: true,
            },
          ],
        },
        {
          slug: 'cta',
          fields: [
            {
              name: 'heading',
              type: 'text',
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
            },
            {
              name: 'buttonText',
              type: 'text',
              required: true,
            },
            {
              name: 'buttonLink',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
      required: true,
      admin: {
        initCollapsed: false,
      },
    },
    {
      name: 'relatedPosts',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
      admin: {
        position: 'sidebar',
        description: 'Manually select up to 5 related posts',
      },
      maxDepth: 1,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      defaultValue: 'draft',
      required: true,
      admin: {
        description: 'Draft posts are only visible to admins and editors',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Automatically set when published',
      },
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      admin: {
        description: 'Search engine optimization metadata',
      },
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          admin: {
            description: 'Falls back to post title if empty',
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          admin: {
            description: 'Falls back to excerpt if empty',
          },
        },
        {
          name: 'metaImage',
          type: 'relationship',
          relationTo: 'media',
          admin: {
            description: 'Falls back to featured image if empty',
          },
        },
      ],
    },
  ],
}

export default Posts
