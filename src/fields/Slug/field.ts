import { slugField as payloadSlugField } from 'payload'

type SlugFieldArgs = Parameters<typeof payloadSlugField>[0]

const componentPath = '@/fields/Slug#SlugField'

export const slugField = (args: SlugFieldArgs = {}) => {
  const { overrides } = args ?? {}
  const useAsSlug = args?.fieldToUse ?? args?.useAsSlug ?? 'title'
  const checkboxName = args?.checkboxName ?? 'generateSlug'

  return payloadSlugField({
    ...args,
    overrides: (baseField) => {
      const updated = typeof overrides === 'function' ? overrides(baseField) : baseField

      if (updated && 'fields' in updated && Array.isArray(updated.fields)) {
        const slugFieldName = args?.name ?? 'slug'
        const slugTextField = updated.fields.find(
          (field) => field && typeof field === 'object' && 'name' in field && field.name === slugFieldName,
        ) as { admin?: Record<string, unknown> } | undefined

        if (slugTextField) {
          slugTextField.admin = {
            ...(slugTextField.admin || {}),
            components: {
              ...(slugTextField.admin as { components?: Record<string, unknown> })?.components,
              Field: {
                path: componentPath,
                clientProps: {
                  useAsSlug,
                  checkboxName,
                },
              },
            },
          }
        }
      }

      return updated
    },
  })
}
