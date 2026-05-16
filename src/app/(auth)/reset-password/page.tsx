'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) { setError('Email is required.'); return }
    setError(null)
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'https://app.enefsis.com/update-password',
      })
      if (err) { setError(err.message); return }
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-8 shadow-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-3">
          <img src="/enefsis-logo-transparent.png" alt="Enefsis" style={{ height: '200px', objectFit: 'contain' }} />
        </div>

        {/* Heading */}
        <div className="mb-7 text-center">
          <h1 className="font-display text-2xl font-bold text-white mb-1.5">Reset password</h1>
          <p className="text-sm text-white/50 font-sans">
            Enter your email and we&apos;ll send a reset link
          </p>
        </div>

        {sent ? (
          /* Success state */
          <div className="space-y-5">
            <div className="px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-sans text-center">
              Check your email for a reset link
            </div>
            <Link
              href="/login"
              className="block text-center text-sm font-sans text-white/40 hover:text-white/70 transition-colors"
            >
              ← Back to login
            </Link>
          </div>
        ) : (
          /* Form state */
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-sans">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-white/60 mb-1.5 font-sans uppercase tracking-wider"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg bg-[#0D0F14] border border-white/[0.08] text-white placeholder:text-white/25 text-sm font-sans focus:outline-none focus:border-[#2B5CE6] focus:ring-1 focus:ring-[#2B5CE6] transition-colors disabled:opacity-50"
              />
            </div>

            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg bg-[#2B5CE6] hover:bg-[#2450cc] active:bg-[#1e44b8] text-white font-display font-semibold text-sm tracking-wide transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#2B5CE6] focus:ring-offset-2 focus:ring-offset-[#141720]"
              >
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
              <Link
                href="/login"
                className="block text-center text-sm font-sans text-white/40 hover:text-white/70 transition-colors"
              >
                ← Back to login
              </Link>
            </div>
          </form>
        )}
      </div>

      <p className="mt-5 text-center text-xs text-white/25 font-sans">
        © {new Date().getFullYear()} Enefsis. All rights reserved.
      </p>
    </div>
  )
}
