'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { login, type LoginState } from './actions'

const initialState: LoginState = { error: null }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 px-4 rounded-lg bg-[#2B5CE6] hover:bg-[#2450cc] active:bg-[#1e44b8] text-white font-display font-semibold text-sm tracking-wide transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#2B5CE6] focus:ring-offset-2 focus:ring-offset-[#141720]"
    >
      {pending ? 'Signing in…' : 'Sign in'}
    </button>
  )
}

export default function LoginPage() {
  const [state, formAction] = useFormState(login, initialState)

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-8 shadow-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-3">
          <img src="/enefsis-logo-transparent.png" alt="Enefsis" style={{ height: '160px', objectFit: 'contain' }} />
        </div>

        {/* Heading */}
        <div className="mb-7 text-center">
          <h1 className="font-display text-2xl font-bold text-white mb-1.5">
            Welcome back
          </h1>
          <p className="text-sm text-white/50 font-sans">
            Sign in to your Enefsis account
          </p>
        </div>

        {/* Error message */}
        {state.error && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-sans">
            {state.error}
          </div>
        )}

        {/* Form */}
        <form action={formAction} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-white/60 mb-1.5 font-sans uppercase tracking-wider"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-lg bg-[#0D0F14] border border-white/[0.08] text-white placeholder:text-white/25 text-sm font-sans focus:outline-none focus:border-[#2B5CE6] focus:ring-1 focus:ring-[#2B5CE6] transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-white/60 mb-1.5 font-sans uppercase tracking-wider"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg bg-[#0D0F14] border border-white/[0.08] text-white placeholder:text-white/25 text-sm font-sans focus:outline-none focus:border-[#2B5CE6] focus:ring-1 focus:ring-[#2B5CE6] transition-colors"
            />
          </div>

          <div className="pt-2">
            <SubmitButton />
          </div>
        </form>
      </div>

      {/* Footer */}
      <p className="mt-5 text-center text-xs text-white/25 font-sans">
        © {new Date().getFullYear()} Enefsis. All rights reserved.
      </p>
    </div>
  )
}
