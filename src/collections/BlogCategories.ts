import { slugField } from '@/fields/Slug/field'
import type { CollectionConfig } from 'payload'

export const BlogCategories: CollectionConfig = {
  slug: 'blog-categories',
  access: {
    read: () => true,
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
