import { CheckCircle, XCircle, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SubscriptionData {
  plan: string | null
  status: string | null
  next_billing_date: string | null
}

function formatBillingDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function SubscriptionCard({ data }: { data: SubscriptionData | null }) {
  if (!data) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-8 text-center">
        <CreditCard size={28} className="text-white/15 mb-3" strokeWidth={1.5} />
        <p className="font-sans text-sm text-white/25">No subscription found</p>
      </div>
    )
  }

  const isActive    = data.status?.toLowerCase() === 'active'
  const isSuspended = data.status?.toLowerCase() === 'suspended'
  const planLabel   = data.plan
    ? data.plan.charAt(0).toUpperCase() + data.plan.slice(1).toLowerCase()
    : '—'

  return (
    <div className="space-y-5">
      {/* Plan badge */}
      <div className="flex items-center justify-between">
        <span className="font-sans text-xs text-white/40 uppercase tracking-wider">Current Plan</span>
        <span className="font-display text-sm font-bold px-3 py-1 rounded-full bg-[#2B5CE6]/15 border border-[#2B5CE6]/25 text-[#2B5CE6]">
          {planLabel}
        </span>
      </div>

      <div className="border-t border-white/[0.06]" />

      {/* Status */}
      <div className="flex items-center justify-between">
        <span className="font-sans text-sm text-white/50">Status</span>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-sm font-sans font-medium',
            isActive    && 'text-emerald-400',
            isSuspended && 'text-red-400',
            !isActive && !isSuspended && 'text-white/40',
          )}
        >
          {isActive    && <CheckCircle size={14} strokeWidth={2} />}
          {isSuspended && <XCircle     size={14} strokeWidth={2} />}
          {data.status
            ? data.status.charAt(0).toUpperCase() + data.status.slice(1).toLowerCase()
            : '—'}
        </span>
      </div>

      {/* Next billing */}
      <div className="flex items-start justify-between gap-3">
        <span className="font-sans text-sm text-white/50 shrink-0">Next billing</span>
        <span className="font-sans text-sm text-white/80 text-right">
          {formatBillingDate(data.next_billing_date)}
        </span>
      </div>

      {/* Suspended warning */}
      {isSuspended && (
        <div className="mt-1 px-3 py-2.5 rounded-lg bg-red-500/[0.08] border border-red-500/20">
          <p className="font-sans text-xs text-red-400">
            Your subscription is suspended. Please update your billing details.
          </p>
        </div>
      )}
    </div>
  )
}
