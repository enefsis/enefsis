'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { addPayment } from '@/actions/admin-clients'

export type PaymentRow = {
  id:             string
  amount:         number
  payment_method: string | null
  notes:          string | null
  paid_at:        string
}

type MethodKey = 'stripe' | 'cash' | 'bank_transfer'

const METHOD_LABELS: Record<MethodKey, string> = {
  stripe:        'Stripe',
  cash:          'Cash',
  bank_transfer: 'Bank Transfer',
}

const METHOD_OPTIONS: { key: MethodKey; label: string }[] = [
  { key: 'cash',          label: 'Cash' },
  { key: 'bank_transfer', label: 'Bank Transfer' },
  { key: 'stripe',        label: 'Stripe' },
]

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 1.75v10.5M1.75 7h10.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

export function PaymentHistory({ userId, payments }: { userId: string; payments: PaymentRow[] }) {
  const router = useRouter()

  const [open,    setOpen]    = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [formErr, setFormErr] = useState<string | null>(null)

  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<MethodKey>('cash')
  const [date,   setDate]   = useState(todayIso)
  const [notes,  setNotes]  = useState('')

  function openModal() {
    setAmount(''); setMethod('cash'); setDate(todayIso()); setNotes(''); setFormErr(null)
    setOpen(true)
  }

  async function handleAdd() {
    const amt = parseInt(amount, 10)
    if (!amount || isNaN(amt) || amt <= 0) { setFormErr('Enter a valid amount.'); return }
    if (!date) { setFormErr('Date is required.'); return }
    setFormErr(null)
    setSaving(true)
    try {
      const res = await addPayment(userId, amt, method, notes, new Date(date).toISOString())
      if (res.error) { setFormErr(res.error); return }
      toast.success('Payment logged')
      setOpen(false)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="bg-[#141720] border border-white/[0.06] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h2 className="font-display font-semibold text-white text-sm">Payment History</h2>
            <p className="font-sans text-[11px] text-white/30 mt-0.5">Manually logged payments</p>
          </div>
          <button
            type="button"
            onClick={openModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-sans text-xs font-semibold transition-colors hover:brightness-110"
            style={{ background: 'rgba(43,92,230,0.15)', color: '#6B90F5', border: '1px solid rgba(43,92,230,0.28)' }}
          >
            <PlusIcon />
            Add Payment
          </button>
        </div>

        {/* List */}
        {payments.length === 0 ? (
          <div className="py-10 text-center">
            <p className="font-sans text-sm text-white/25">No payments logged yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {payments.map(p => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3.5">
                {/* Date */}
                <span className="font-sans text-xs text-white/40 shrink-0 w-28">{fmt(p.paid_at)}</span>

                {/* Amount */}
                <span className="font-display font-bold text-white text-sm shrink-0 w-16">
                  €{p.amount.toLocaleString()}
                </span>

                {/* Method badge */}
                <span
                  className="font-sans text-[11px] font-semibold px-2 py-0.5 rounded-md shrink-0"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }}
                >
                  {METHOD_LABELS[(p.payment_method as MethodKey) ?? 'stripe'] ?? p.payment_method}
                </span>

                {/* Notes */}
                {p.notes && (
                  <span className="font-sans text-xs text-white/35 truncate flex-1">{p.notes}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.65)' }}
          onClick={() => !saving && setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 space-y-5"
            style={{ background: '#161920', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}
            onClick={e => e.stopPropagation()}
          >
            <div>
              <h2 className="font-display font-bold text-white text-lg">Add Payment</h2>
              <p className="font-sans text-sm text-white/40 mt-0.5">Log a manual payment</p>
            </div>

            <div className="space-y-4">
              {/* Amount */}
              <div>
                <label className="block font-sans text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">
                  Amount (€) <span className="text-red-400 normal-case tracking-normal">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  disabled={saving}
                  placeholder="e.g. 49"
                  autoFocus
                  className="w-full h-10 px-3.5 rounded-xl font-sans text-sm text-white placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-[#2B5CE6] disabled:opacity-50"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                />
              </div>

              {/* Payment method */}
              <div>
                <p className="font-sans text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2">
                  Payment Method
                </p>
                <div className="flex gap-2">
                  {METHOD_OPTIONS.map(opt => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setMethod(opt.key)}
                      disabled={saving}
                      className="flex-1 py-2 rounded-xl font-sans text-xs font-semibold border transition-all disabled:opacity-50"
                      style={method === opt.key
                        ? { background: 'rgba(43,92,230,0.15)', borderColor: 'rgba(43,92,230,0.55)', color: '#6B90F5' }
                        : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block font-sans text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  disabled={saving}
                  className="w-full h-10 px-3.5 rounded-xl font-sans text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#2B5CE6] disabled:opacity-50"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', colorScheme: 'dark' }}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block font-sans text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  disabled={saving}
                  rows={2}
                  placeholder='e.g. "Monthly payment via Revolut"'
                  className="w-full px-3.5 py-2.5 rounded-xl font-sans text-sm text-white placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-[#2B5CE6] disabled:opacity-50 resize-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                />
              </div>

              {formErr && (
                <p className="font-sans text-xs text-red-400">{formErr}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => !saving && setOpen(false)}
                disabled={saving}
                className="flex-1 h-10 rounded-xl font-sans text-sm font-semibold transition-colors disabled:opacity-50"
                style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.55)' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={saving}
                className="flex-1 h-10 rounded-xl font-sans text-sm font-semibold transition-colors disabled:opacity-60"
                style={{ background: '#2B5CE6', color: '#fff' }}
              >
                {saving ? 'Saving…' : 'Log Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
