'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  setSubscriptionStatus,
  cancelStripeSubscription,
  refundLastPayment,
} from '@/actions/admin-subscriptions'

// ── Types ─────────────────────────────────────────────────────────────────────
export type SubRow = {
  id: string
  userId: string | null
  plan: string | null
  status: string | null
  amount: number | null
  nextBillingDate: string | null
  createdAt: string
  profile: { fullName: string | null; email: string } | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtAmount(amount: number | null) {
  if (amount === null) return '—'
  return `€${amount.toFixed(2)}`
}

function fmtPlan(plan: string) {
  return plan.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function PlanBadge({ plan }: { plan: string | null }) {
  const isPro = plan?.toLowerCase().startsWith('pro')
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border font-sans',
      isPro
        ? 'bg-[#2B5CE6]/15 text-[#6B8FF0] border-[#2B5CE6]/25'
        : 'bg-white/[0.05] text-white/50 border-white/[0.08]',
    )}>
      {plan ? fmtPlan(plan) : 'Unknown'}
    </span>
  )
}

const STATUS_STYLES: Record<string, string> = {
  active:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  suspended: 'bg-amber-500/10  text-amber-400   border-amber-500/20',
  cancelled: 'bg-red-500/10    text-red-400     border-red-500/20',
}

// ── Refund modal ───────────────────────────────────────────────────────────────
function RefundModal({
  sub,
  onClose,
  onSuccess,
}: {
  sub: SubRow
  onClose: () => void
  onSuccess: () => void
}) {
  const maxEuros = sub.amount ?? 0
  const [amountStr, setAmountStr] = useState(maxEuros.toFixed(2))
  const [busy, setBusy] = useState(false)
  const [err,  setErr]  = useState<string | null>(null)

  async function submit() {
    if (!sub.userId) return
    const euros = parseFloat(amountStr)
    if (!isFinite(euros) || euros <= 0) { setErr('Enter a valid amount'); return }
    if (euros > maxEuros) { setErr(`Max refundable: ${fmtAmount(maxEuros)}`); return }
    const cents = Math.round(euros * 100)

    setBusy(true)
    setErr(null)
    const res = await refundLastPayment(sub.userId, cents)
    setBusy(false)
    if (res.error) { setErr(res.error); return }
    onSuccess()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.65)' }}
      onClick={() => !busy && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 space-y-5"
        style={{ background: '#161920', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}
        onClick={e => e.stopPropagation()}
      >
        <div>
          <h2 className="font-display font-bold text-white text-lg">Issue Refund</h2>
          <p className="font-sans text-sm text-white/40 mt-0.5">
            {sub.profile?.fullName ?? sub.profile?.email ?? 'Unknown'} · {fmtAmount(sub.amount)}
          </p>
        </div>

        <div>
          <label className="block font-sans text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">
            Refund Amount (€)
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amountStr}
            onChange={e => setAmountStr(e.target.value)}
            disabled={busy}
            className="w-full h-10 px-3.5 rounded-xl font-sans text-sm text-white placeholder-white/25 focus:outline-none focus:ring-1 disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
          />
          {err && <p className="font-sans text-xs text-red-400 mt-1.5">{err}</p>}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="flex-1 h-10 rounded-xl font-sans text-sm font-semibold disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.55)' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="flex-1 h-10 rounded-xl font-sans text-sm font-semibold disabled:opacity-60"
            style={{ background: '#E53E3E', color: '#fff' }}
          >
            {busy ? 'Refunding…' : 'Confirm Refund'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export function SubscriptionsTable({ subs }: { subs: SubRow[] }) {
  const router = useRouter()
  const [refundSub, setRefundSub] = useState<SubRow | null>(null)
  const [busy, setBusy] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  function setRowBusy(id: string, val: boolean) {
    setBusy(prev => ({ ...prev, [id]: val }))
  }
  function setRowError(id: string, msg: string) {
    setErrors(prev => ({ ...prev, [id]: msg }))
  }
  function clearRowError(id: string) {
    setErrors(prev => { const next = { ...prev }; delete next[id]; return next })
  }

  async function handleStatusChange(sub: SubRow, newStatus: string) {
    clearRowError(sub.id)
    setRowBusy(sub.id, true)
    const res = await setSubscriptionStatus(sub.id, newStatus)
    setRowBusy(sub.id, false)
    if (res.error) { setRowError(sub.id, res.error); return }
    router.refresh()
  }

  async function handleCancel(sub: SubRow) {
    if (!sub.userId) return
    if (!confirm(`Cancel ${sub.profile?.fullName ?? sub.profile?.email ?? 'this user'}'s Stripe subscription?`)) return
    clearRowError(sub.id)
    setRowBusy(sub.id, true)
    const res = await cancelStripeSubscription(sub.userId)
    setRowBusy(sub.id, false)
    if (res.error) { setRowError(sub.id, res.error); return }
    router.refresh()
  }

  if (subs.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-sans text-sm text-white/25">No subscriptions found</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['Client', 'Plan', 'Status', 'Amount', 'Next Billing', 'ID', 'Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/35 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subs.map(sub => {
              const isBusy  = busy[sub.id] ?? false
              const rowErr  = errors[sub.id]
              const s       = sub.status?.toLowerCase() ?? ''
              const badgeCls = STATUS_STYLES[s] ?? 'bg-white/[0.05] text-white/40 border-white/[0.08]'

              return (
                <>
                  <tr key={sub.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                    {/* Client */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {sub.profile ? (
                        <div>
                          <p className="font-sans text-white/85 font-medium text-xs">{sub.profile.fullName ?? '—'}</p>
                          <p className="font-sans text-white/35 text-[11px] mt-0.5">{sub.profile.email}</p>
                        </div>
                      ) : (
                        <span className="text-white/25 text-xs">Unknown</span>
                      )}
                    </td>

                    {/* Plan */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <PlanBadge plan={sub.plan} />
                    </td>

                    {/* Status — inline select */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <select
                        value={sub.status ?? ''}
                        disabled={isBusy}
                        onChange={e => handleStatusChange(sub, e.target.value)}
                        className={cn(
                          'px-2 py-0.5 rounded-full text-[11px] font-semibold border font-sans appearance-none cursor-pointer disabled:opacity-60',
                          badgeCls,
                        )}
                        style={{ background: 'transparent' }}
                      >
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="font-sans text-xs font-semibold text-white/80 tabular-nums">
                        {fmtAmount(sub.amount)}
                      </span>
                    </td>

                    {/* Next billing */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="font-sans text-xs text-white/50">{fmtDate(sub.nextBillingDate)}</span>
                    </td>

                    {/* ID */}
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-[11px] text-white/30" title={sub.id}>
                        {sub.id.substring(0, 8)}…
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {sub.amount != null && sub.amount > 0 && (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => setRefundSub(sub)}
                            className="px-2.5 py-1 rounded-md font-sans text-xs font-medium border transition-colors disabled:opacity-50 text-amber-400 border-amber-500/20 hover:bg-amber-500/[0.08]"
                          >
                            Refund
                          </button>
                        )}
                        {sub.status !== 'cancelled' && sub.userId && (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleCancel(sub)}
                            className="px-2.5 py-1 rounded-md font-sans text-xs font-medium border transition-colors disabled:opacity-50 text-red-400 border-red-500/20 hover:bg-red-500/[0.08]"
                          >
                            {isBusy ? '…' : 'Cancel'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {rowErr && (
                    <tr key={`${sub.id}-err`} className="border-b border-white/[0.04]">
                      <td colSpan={7} className="px-5 py-2">
                        <p className="font-sans text-xs text-red-400">{rowErr}</p>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>

      {refundSub && (
        <RefundModal
          sub={refundSub}
          onClose={() => setRefundSub(null)}
          onSuccess={() => { setRefundSub(null); router.refresh() }}
        />
      )}
    </>
  )
}
