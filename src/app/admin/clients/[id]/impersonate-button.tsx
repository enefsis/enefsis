'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { impersonateClient } from '@/actions/admin-clients'

function UserIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ImpersonateButton({ clientId }: { clientId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    const result = await impersonateClient(clientId)
    if (result.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }
    window.location.href = result.url!
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-sans text-sm font-medium transition-colors disabled:opacity-60"
      style={{ background: 'rgba(251,191,36,0.10)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.25)' }}
    >
      <UserIcon />
      {loading ? 'Loading…' : 'Impersonate'}
    </button>
  )
}
