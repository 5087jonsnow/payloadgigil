'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Search bar component for navigating to search results.
 * Client component with form submission to /search?q={query}
 */
export const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search blog posts..."
        className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
        aria-label="Search blog posts"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        aria-label="Submit search"
      >
        Search
      </button>
    </form>
  )
}

export default SearchBar
