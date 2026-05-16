'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createAdminClient } from '@/lib/supabase/admin'

export default function UpdatePasswordPage() {
  const router = useRouter()

  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.auth.updateUser({ password })
      if (err) { setError(err.message); return }

      // Redirect — middleware will send admins to /admin automatically
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full px-4 py-3 rounded-lg bg-[#0D0F14] border border-white/[0.08] text-white placeholder:text-white/25 text-sm font-sans focus:outline-none focus:border-[#2B5CE6] focus:ring-1 focus:ring-[#2B5CE6] transition-colors disabled:opacity-50'

  return (
    <div className="w-full max-w-md">
      <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-8 shadow-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-3">
          <img src="/enefsis-logo-transparent.png" alt="Enefsis" style={{ height: '200px', objectFit: 'contain' }} />
        </div>

        {/* Heading */}
        <div className="mb-7 text-center">
          <h1 className="font-display text-2xl font-bold text-white mb-1.5">Set new password</h1>
          <p className="text-sm text-white/50 font-sans">
            Choose a strong password for your account
          </p>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-sans">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-white/60 mb-1.5 font-sans uppercase tracking-wider"
            >
              New Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              disabled={loading}
              className={inputCls}
            />
          </div>

          <div>
            <label
              htmlFor="confirm"
              className="block text-xs font-medium text-white/60 mb-1.5 font-sans uppercase tracking-wider"
            >
              Confirm Password
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className={inputCls}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-[#2B5CE6] hover:bg-[#2450cc] active:bg-[#1e44b8] text-white font-display font-semibold text-sm tracking-wide transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#2B5CE6] focus:ring-offset-2 focus:ring-offset-[#141720]"
            >
              {loading ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      <p className="mt-5 text-center text-xs text-white/25 font-sans">
        © {new Date().getFullYear()} Enefsis. All rights reserved.
      </p>
    </div>
  )
}
