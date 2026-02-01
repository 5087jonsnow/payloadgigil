'use client'
import React, { useState } from 'react'

export const BulkActions: React.FC = () => {
  const [ids, setIds] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const run = async (action: 'publish' | 'unpublish') => {
    setLoading(true)
    setMessage(null)
    try {
      const payload = { ids: ids.split(',').map((i) => i.trim()).filter(Boolean), action }
      const res = await fetch('/api/posts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json?.message || 'Error')
      setMessage(`Updated ${json.count} posts`)
    } catch (err: any) {
      setMessage(err?.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <div className="mb-2">Bulk actions (enter comma-separated post ids)</div>
      <textarea value={ids} onChange={(e) => setIds(e.target.value)} rows={3} className="w-full" />
      <div className="flex gap-2 mt-2">
        <button className="btn" onClick={() => run('publish')} disabled={loading}>
          Publish
        </button>
        <button className="btn" onClick={() => run('unpublish')} disabled={loading}>
          Unpublish
        </button>
      </div>
      {message && <div className="mt-2">{message}</div>}
    </div>
  )
}

export default BulkActions
