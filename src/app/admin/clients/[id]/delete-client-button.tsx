'use client'

import { useState, useTransition } from 'react'
import { deleteClient } from '@/actions/admin-clients'

export function DeleteClientButton({ clientId }: { clientId: string }) {
  const [open,      setOpen]           = useState(false)
  const [error,     setError]          = useState('')
  const [isPending, startTransition]   = useTransition()

  function handleDelete() {
    setError('')
    startTransition(async () => {
      const res = await deleteClient(clientId)
      if (res?.error) setError(res.error)
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-sans text-sm font-semibold transition-colors"
        style={{ background: 'rgba(239,68,68,0.08)', color: '#F87171', border: '1px solid rgba(239,68,68,0.18)' }}
      >
        Delete Client
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.72)' }}
          onClick={e => { if (e.target === e.currentTarget && !isPending) setOpen(false) }}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 space-y-5"
            style={{ background: '#141720', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="space-y-2">
              <h2 className="font-display text-lg font-bold text-white">Delete client?</h2>
              <p className="font-sans text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Are you sure you want to delete this client? This will permanently delete their
                account, landing page, all NFC stands, and all analytics data. This cannot be undone.
              </p>
            </div>

            {error && (
              <p className="font-sans text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="px-4 py-2 rounded-xl font-sans text-sm transition-colors disabled:opacity-40"
                style={{ color: 'rgba(255,255,255,0.45)' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="px-4 py-2 rounded-xl font-sans text-sm font-semibold transition-colors disabled:opacity-50"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#F87171', border: '1px solid rgba(239,68,68,0.28)' }}
              >
                {isPending ? 'Deleting…' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
