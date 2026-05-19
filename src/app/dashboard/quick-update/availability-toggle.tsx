'use client'

import { useState, useTransition } from 'react'
import { toggleItemAvailability } from '@/actions/quick-update'
import { toast } from 'sonner'

interface Props {
  sectionId: string
  itemId:    string
  itemName:  string
  initial:   boolean
}

export function AvailabilityToggle({ sectionId, itemId, itemName, initial }: Props) {
  const [available, setAvailable] = useState(initial)
  const [pending, startTransition] = useTransition()

  function handleToggle() {
    const next = !available
    setAvailable(next) // optimistic
    startTransition(async () => {
      const result = await toggleItemAvailability(sectionId, itemId, next)
      if (result.error) {
        setAvailable(!next) // revert
        toast.error(`Failed to update ${itemName}`)
      }
    })
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={available}
      aria-label={`Toggle availability for ${itemName}`}
      onClick={handleToggle}
      disabled={pending}
      className="relative shrink-0 transition-opacity disabled:opacity-60"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {/* Track */}
      <span
        className="block rounded-full transition-colors duration-200"
        style={{
          width: 52,
          height: 30,
          background: available ? '#22c55e' : 'rgba(255,255,255,0.12)',
          border: available ? '1px solid rgba(34,197,94,0.5)' : '1px solid rgba(255,255,255,0.12)',
        }}
      />
      {/* Thumb */}
      <span
        className="absolute top-[3px] block rounded-full bg-white shadow transition-transform duration-200"
        style={{
          width: 24,
          height: 24,
          left: 3,
          transform: available ? 'translateX(22px)' : 'translateX(0)',
        }}
      />
    </button>
  )
}
