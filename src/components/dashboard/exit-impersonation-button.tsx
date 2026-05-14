'use client'

import { createBrowserClient } from '@supabase/ssr'
import { exitImpersonation } from '@/actions/impersonation'

export function ExitImpersonationButton() {
  async function handleExit() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    await supabase.auth.signOut()
    await exitImpersonation()
  }

  return (
    <button
      type="button"
      onClick={handleExit}
      className="underline underline-offset-2 hover:opacity-80 transition-opacity font-bold"
    >
      Exit
    </button>
  )
}
