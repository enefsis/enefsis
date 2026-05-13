import { CheckCircle, XCircle, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SubscriptionData {
  plan: string | null
  status: string | null
  next_billing_date: string | null
  amount: number | null
  payment_method: string | null
  custom_amount: number | null
}

const PLAN_AMOUNTS: Record<string, string> = {
  basic_monthly: '€49/mo',
  basic_yearly:  '€499/yr',
  pro_monthly:   '€100/mo',
  pro_yearly:    '€900/yr',
  basic:         '€49/mo',
  pro:           '€100/mo',
}

const PAYMENT_LABELS: Record<string, string> = {
  stripe:        'Stripe',
  cash:          'Cash',
  bank_transfer: 'Bank Transfer',
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

  const isActive       = data.status?.toLowerCase() === 'active'
  const isSuspended    = data.status?.toLowerCase() === 'suspended'
  const isManual       = data.payment_method === 'cash' || data.payment_method === 'bank_transfer'
  const planLabel      = data.plan
    ? data.plan.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : '—'
  const amountLabel    = data.custom_amount != null
    ? `€${data.custom_amount}`
    : data.plan && PLAN_AMOUNTS[data.plan]
      ? PLAN_AMOUNTS[data.plan]
      : data.amount != null
        ? `€${data.amount}`
        : '—'
  const paymentLabel   = data.payment_method ? (PAYMENT_LABELS[data.payment_method] ?? data.payment_method) : '—'
  const iban           = process.env.NEXT_PUBLIC_PAYMENT_IBAN ?? ''

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

      {/* Amount */}
      <div className="flex items-center justify-between">
        <span className="font-sans text-sm text-white/50">Amount</span>
        <span className="font-sans text-sm font-semibold text-white/80">{amountLabel}</span>
      </div>

      {/* Payment method */}
      <div className="flex items-center justify-between">
        <span className="font-sans text-sm text-white/50">Payment</span>
        <span className="font-sans text-sm text-white/80">{paymentLabel}</span>
      </div>

      {/* Next billing */}
      <div className="flex items-start justify-between gap-3">
        <span className="font-sans text-sm text-white/50 shrink-0">Next billing</span>
        <span className="font-sans text-sm text-white/80 text-right">
          {isManual ? 'Manual billing' : formatBillingDate(data.next_billing_date)}
        </span>
      </div>

      {/* Manual payment instructions */}
      {isManual && (
        <div className="mt-1 px-3 py-3 rounded-lg bg-blue-500/[0.07] border border-blue-500/20 space-y-1">
          <p className="font-sans text-xs font-semibold text-blue-400 uppercase tracking-wider">Payment Instructions</p>
          {iban && (
            <p className="font-sans text-xs text-white/60">
              IBAN: <span className="font-mono text-white/80">{iban}</span>
            </p>
          )}
          <p className="font-sans text-xs text-white/60">
            Contact:{' '}
            <a href="mailto:gniokos@gmail.com" className="text-blue-400 hover:text-blue-300 transition-colors">
              gniokos@gmail.com
            </a>
          </p>
        </div>
      )}

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
