import type { CollectionConfig } from 'payload'
import { checkRole } from '@/access/utilities'

/**
 * Comments collection for blog post engagement.
 * Authenticated users can create comments on posts.
 * Comments can be moderated by admins.
 * Auto-associates comment author to authenticated user.
 */
export const Comments: CollectionConfig = {
  slug: 'comments',
  access: {
    create: ({ req: { user } }) => !!user,
    read: () => true,
    update: ({ req: { user } }) => {
      if (!user) return false
      if (checkRole(['admin'], user)) return true
      // Editors and users can only update their own comments
      return {
        author: { equals: user.id },
      }
    },
    delete: ({ req: { user } }) => checkRole(['admin'], user),
  },
  admin: {
    useAsTitle: 'content',
    group: 'Content',
    defaultColumns: ['content', 'author', 'post', 'status', 'createdAt'],
  },
  fields: [
    {
      name: 'content',
      type: 'textarea',
      required: true,
      maxLength: 1000,
      admin: {
        description: 'Maximum 1000 characters',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        readOnly: true,
        description: 'Automatically set to current user',
      },
    },
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      required: true,
      index: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Spam', value: 'spam' },
      ],
      defaultValue: 'approved',
      access: {
        update: ({ req: { user } }) => checkRole(['admin'], user),
      },
      admin: {
        description: 'Only admins can change comment status',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // Auto-set author to current user on create
        if (operation === 'create' && req.user) {
          ;(data as any).author = req.user.id
        }
        return data
      },
    ],
  },
  timestamps: true,
}

export default Comments
