'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { changePassword } from '@/actions/settings'

const inputCls = 'w-full rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder-white/25 px-3 py-2.5 focus:outline-none focus:border-[#2B5CE6]/50 transition-colors disabled:opacity-50'
const labelCls = 'block text-xs font-medium text-white/40 mb-1.5'

export function PasswordForm() {
  const [current, setCurrent] = useState('')
  const [next,    setNext]    = useState('')
  const [confirm, setConfirm] = useState('')
  const [error,   setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Client-side validation
    if (next.length < 6) {
      setError('New password must be at least 6 characters.')
      return
    }
    if (next !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const res = await changePassword(current, next, confirm)
      if (res.error) {
        setError(res.error)
        return
      }
      toast.success('Password updated successfully')
      setCurrent('')
      setNext('')
      setConfirm('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelCls}>Current Password</label>
        <input
          type="password"
          value={current}
          onChange={e => setCurrent(e.target.value)}
          placeholder="••••••••"
          required
          disabled={loading}
          autoComplete="current-password"
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>New Password</label>
        <input
          type="password"
          value={next}
          onChange={e => setNext(e.target.value)}
          placeholder="Min. 6 characters"
          required
          minLength={6}
          disabled={loading}
          autoComplete="new-password"
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>Confirm New Password</label>
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder="••••••••"
          required
          disabled={loading}
          autoComplete="new-password"
          className={inputCls}
        />
      </div>

      {error && (
        <p className="text-xs font-medium text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2B5CE6] text-white text-sm font-medium hover:bg-[#2B5CE6]/80 disabled:opacity-50 transition-colors"
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        Update Password
      </button>
    </form>
  )
}
