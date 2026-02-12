'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import type { TextFieldClientComponent } from 'payload'
import { FieldError, TextInput, useDocumentInfo, useField, useFormFields } from '@payloadcms/ui'
import { toKebabCase } from '@/utilities/toKebabCase'

type ClientProps = {
  useAsSlug?: string
  checkboxName?: string
}

const getSiblingPath = (path: string, siblingName: string) => {
  if (!path) return siblingName
  const segments = path.split('.')
  segments[segments.length - 1] = siblingName
  return segments.join('.')
}

export const SlugField: TextFieldClientComponent = (props) => {
  const { path, label, required, readOnly, field } = props
  const fieldPath = path || field.name
  const clientProps = (field?.admin?.components?.Field?.clientProps || {}) as ClientProps
  const useAsSlug = clientProps.useAsSlug ?? 'title'
  const checkboxName = clientProps.checkboxName ?? 'generateSlug'

  const { value, setValue, showError, errorMessage } = useField<string>({ path: fieldPath })
  const checkboxPath = getSiblingPath(fieldPath, checkboxName)
  const { value: generateSlug, setValue: setGenerateSlug } = useField<boolean>({
    path: checkboxPath,
  })

  const { data } = useDocumentInfo()
  const sourceValueFromForm = useFormFields(
    ([fields]) => fields?.[useAsSlug]?.value as string | undefined,
  )
  const sourceValue = sourceValueFromForm ?? (data as Record<string, unknown> | undefined)?.[useAsSlug]
  const slugFromSource = useMemo(() => {
    if (typeof sourceValue !== 'string') return ''
    return toKebabCase(sourceValue)
  }, [sourceValue])

  const lastAutoValueRef = useRef<string>('')
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true
      lastAutoValueRef.current = typeof value === 'string' ? value : ''
      return
    }

    if (!generateSlug || !slugFromSource) return

    const currentValue = typeof value === 'string' ? value : ''
    if (!currentValue || currentValue === lastAutoValueRef.current) {
      lastAutoValueRef.current = slugFromSource
      setValue(slugFromSource)
    }
  }, [generateSlug, slugFromSource, setValue, value])

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const next = event.target.value
    setValue(next)

    if (generateSlug && next !== lastAutoValueRef.current) {
      setGenerateSlug(false)
    }
  }

  return (
    <TextInput
      path={fieldPath}
      value={(value as string) ?? ''}
      onChange={handleChange}
      label={label}
      required={required}
      readOnly={readOnly}
      showError={showError}
      Error={<FieldError message={errorMessage} path={fieldPath} showError={showError} />}
    />
  )
}
