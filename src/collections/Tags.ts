import { slugField } from '@/fields/Slug/field'
import type { CollectionConfig } from 'payload'

/**
 * Tags collection for cross-sectional topics across posts and products.
 * Public read access, admin only write.
 */
export const Tags: CollectionConfig = {
  slug: 'tags',
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.roles?.includes('admin') ?? false,
    update: ({ req: { user } }) => user?.roles?.includes('admin') ?? false,
    delete: ({ req: { user } }) => user?.roles?.includes('admin') ?? false,
  },
  admin: {
    useAsTitle: 'name',
    group: 'Content',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    slugField({
      position: undefined,
    }),
    {
      name: 'description',
      type: 'textarea',
    },
  ],
}

export default Tags
