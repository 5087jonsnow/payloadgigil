"use client"
import React from 'react'

type Props = {
  document?: { id?: string; slug?: string }
}

export const PreviewButton: React.FC<Props> = ({ document }) => {
  if (!document?.id) return null

  const previewUrl = `/blog/${document.slug ?? document.id}?preview=true`

  return (
    <a className="btn" href={previewUrl} target="_blank" rel="noreferrer">
      Preview
    </a>
  )
}

export default PreviewButton
