'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { changePassword } from '@/actions/settings'

const inputCls = 'w-full rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder-white/25 px-3 py-2.5 focus:outline-none focus:border-[#2B5CE6]/50 transition-colors'
const labelCls = 'block text-xs font-medium text-white/40 mb-1.5'

export function PasswordForm() {
  const [current,  setCurrent]  = useState('')
  const [next,     setNext]     = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [msg,      setMsg]      = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    startTransition(async () => {
      const res = await changePassword(current, next, confirm)
      if (res.error) {
        setMsg({ type: 'error', text: res.error })
      } else {
        setMsg({ type: 'success', text: 'Password updated successfully' })
        setCurrent('')
        setNext('')
        setConfirm('')
      }
    })
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
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>New Password</label>
        <input
          type="password"
          value={next}
          onChange={e => setNext(e.target.value)}
          placeholder="••••••••"
          required
          minLength={6}
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
          className={inputCls}
        />
      </div>

      {msg && (
        <p className={cn('text-xs font-medium', msg.type === 'error' ? 'text-red-400' : 'text-emerald-400')}>
          {msg.text}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2B5CE6] text-white text-sm font-medium hover:bg-[#2B5CE6]/80 disabled:opacity-50 transition-colors"
      >
        {isPending && <Loader2 size={14} className="animate-spin" />}
        Update Password
      </button>
    </form>
  )
}
