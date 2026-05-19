'use client'

import { useState, useTransition } from 'react'

const PRICE_PER_STAND = 20

export function StandOrderForm({ currentCount }: { currentCount: number }) {
  const [quantity,   setQuantity]   = useState(1)
  const [submitted,  setSubmitted]  = useState(false)
  const [errorMsg,   setErrorMsg]   = useState('')
  const [isPending,  startTransition] = useTransition()

  const total = quantity * PRICE_PER_STAND

  function handleQuantityChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseInt(e.target.value)
    setQuantity(isNaN(v) ? 1 : Math.max(1, Math.min(50, v)))
    setErrorMsg('')
  }

  function handleSubmit() {
    setErrorMsg('')
    startTransition(async () => {
      const res = await fetch('/api/dashboard/order-stands', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ quantity }),
      })
      const data = await res.json() as { ok?: boolean; error?: string }
      if (!res.ok || data.error) {
        setErrorMsg(data.error ?? 'Something went wrong. Please try again.')
      } else {
        setSubmitted(true)
      }
    })
  }

  if (submitted) {
    return (
      <div
        className="rounded-xl px-4 py-4 text-center"
        style={{ background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.15)' }}
      >
        <p className="font-sans text-sm font-semibold text-emerald-400">✓ Order submitted!</p>
        <p className="font-sans text-xs text-white/40 mt-1">
          We&apos;ll contact you shortly to arrange delivery.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Current count */}
      <p className="font-sans text-sm text-white/50">
        You currently have{' '}
        <span className="font-semibold text-white/80">
          {currentCount} {currentCount === 1 ? 'stand' : 'stands'}
        </span>{' '}
        on your account.
      </p>

      {/* Quantity input */}
      <div>
        <p className="text-xs font-medium text-white/40 mb-1.5">How many additional stands?</p>
        <input
          type="number"
          min={1}
          max={50}
          value={quantity}
          onChange={handleQuantityChange}
          className="w-full rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white px-3 py-2.5 focus:outline-none focus:border-[#2B5CE6]/50 transition-colors"
        />
      </div>

      {/* Price preview */}
      <div
        className="rounded-xl px-4 py-3"
        style={{ background: 'rgba(43,92,230,0.07)', border: '1px solid rgba(43,92,230,0.14)' }}
      >
        <p className="font-sans text-sm text-white/55">
          {quantity} {quantity === 1 ? 'stand' : 'stands'} × €{PRICE_PER_STAND}{' '}
          <span className="text-white/30 mx-1">=</span>{' '}
          <span className="font-semibold text-white/85">€{total} setup fee</span>
        </p>
      </div>

      {errorMsg && (
        <p className="font-sans text-xs text-red-400">{errorMsg}</p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full py-2.5 rounded-xl font-sans text-sm font-semibold transition-opacity disabled:opacity-50 hover:opacity-90"
        style={{ background: '#2B5CE6', color: 'white' }}
      >
        {isPending ? 'Submitting…' : 'Request Order'}
      </button>
    </div>
  )
}
