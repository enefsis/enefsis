'use client'

import { useState, useTransition } from 'react'
import { deleteClient } from '@/actions/admin-clients'

export function DeleteClientButton({ clientId }: { clientId: string }) {
  const [confirming,  setConfirming]  = useState(false)
  const [error,       setError]       = useState('')
  const [isPending,   startTransition] = useTransition()

  function handleDelete() {
    setError('')
    startTransition(async () => {
      const res = await deleteClient(clientId)
      if (res?.error) setError(res.error)
    })
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-sans text-xs text-white/45">Permanently delete this client?</span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="px-3 py-1.5 rounded-xl font-sans text-xs font-semibold transition-colors disabled:opacity-50"
          style={{ background: 'rgba(239,68,68,0.15)', color: '#F87171', border: '1px solid rgba(239,68,68,0.25)' }}
        >
          {isPending ? 'Deleting…' : 'Yes, delete'}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="px-3 py-1.5 rounded-xl font-sans text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          Cancel
        </button>
        {error && (
          <span className="font-sans text-xs text-red-400">{error}</span>
        )}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-sans text-sm font-medium transition-colors"
      style={{ background: 'rgba(239,68,68,0.08)', color: '#F87171', border: '1px solid rgba(239,68,68,0.18)' }}
    >
      Delete
    </button>
  )
}
