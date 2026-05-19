'use client'

import { useState, useTransition } from 'react'
import { saveSpecials } from '@/actions/quick-update'
import { toast } from 'sonner'

interface Props {
  initial: string
}

export function TodaysSpecialsEditor({ initial }: Props) {
  const [value, setValue]     = useState(initial)
  const [pending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      const result = await saveSpecials(value)
      if (result.error) {
        toast.error(`Failed to save: ${result.error}`)
      } else {
        toast.success("Today's specials updated")
      }
    })
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: '#141720', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="px-4 py-3 border-b border-white/[0.05]">
        <p className="font-sans text-xs font-semibold text-white/40 uppercase tracking-wider">
          ✨ Today&apos;s Specials
        </p>
      </div>

      <div className="px-4 py-4 space-y-3">
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="e.g. Grilled Octopus, Lamb Chops"
          className="w-full bg-[#0D0F14] border border-white/10 rounded-lg px-3 py-2.5 text-white font-sans text-sm placeholder:text-white/25 focus:outline-none focus:border-white/20"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={pending}
          className="w-full py-2.5 rounded-lg font-sans text-sm font-semibold transition-opacity disabled:opacity-50"
          style={{ background: '#2B5CE6', color: '#fff' }}
        >
          {pending ? 'Saving…' : 'Save Specials'}
        </button>
      </div>
    </div>
  )
}
