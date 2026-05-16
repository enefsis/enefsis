'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { updateClientInfo } from '@/actions/admin-clients'

// ── Types ─────────────────────────────────────────────────────────────────────
export type EditFormProps = {
  clientId:      string
  fullName:      string
  email:         string
  joinedDate:    string
  plan:          string
  status:        string
  paymentMethod: string
  customAmount:  number | null
  paymentNotes:  string
  backHref:      string
}

type PlanKey          = 'basic_monthly' | 'basic_yearly' | 'pro_monthly' | 'pro_yearly'
type StatusKey        = 'active' | 'suspended' | 'cancelled'
type PaymentMethodKey = 'stripe' | 'cash' | 'bank_transfer'

const PAYMENT_OPTIONS: { key: PaymentMethodKey; label: string }[] = [
  { key: 'stripe',        label: 'Stripe' },
  { key: 'cash',          label: 'Cash' },
  { key: 'bank_transfer', label: 'Bank Transfer' },
]

const PLAN_OPTIONS: { key: PlanKey; label: string; price: string; description: string; badge?: string }[] = [
  { key: 'basic_monthly', label: 'Basic Monthly', price: '€49/mo',  description: 'NFC Hub + Digital Menu' },
  { key: 'basic_yearly',  label: 'Basic Yearly',  price: '€499/yr', description: 'NFC Hub + Digital Menu',            badge: 'Save 15%' },
  { key: 'pro_monthly',   label: 'Pro Monthly',   price: '€100/mo', description: 'Custom branding + Priority support' },
  { key: 'pro_yearly',    label: 'Pro Yearly',    price: '€900/yr', description: 'Custom branding + Priority support', badge: 'Save 25%' },
]

const VALID_PLANS = PLAN_OPTIONS.map(o => o.key)
function normalizePlan(p: string): PlanKey {
  if ((VALID_PLANS as string[]).includes(p)) return p as PlanKey
  if (p === 'pro') return 'pro_monthly'
  return 'basic_monthly'
}

const STATUS_OPTIONS: { key: StatusKey; label: string; color: string }[] = [
  { key: 'active',    label: 'Active',    color: '#34D399' },
  { key: 'suspended', label: 'Suspended', color: '#FBBF24' },
  { key: 'cancelled', label: 'Cancelled', color: '#F87171' },
]

// ── Icon ──────────────────────────────────────────────────────────────────────
function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Form ──────────────────────────────────────────────────────────────────────
export function EditForm({
  clientId, fullName: initName, email: initEmail, joinedDate: initJoinedDate,
  plan: initPlan, status: initStatus,
  paymentMethod: initPaymentMethod, customAmount: initCustomAmount, paymentNotes: initPaymentNotes,
  backHref,
}: EditFormProps) {
  const router = useRouter()

  const [name,          setName]          = useState(initName)
  const [email,         setEmail]         = useState(initEmail)
  const [joinedDate,    setJoinedDate]    = useState(() => {
    // Convert YYYY-MM-DD → DD-MM-YYYY for display
    if (!initJoinedDate) return ''
    const [y, m, d] = initJoinedDate.split('-')
    return `${d}-${m}-${y}`
  })
  const [plan,          setPlan]          = useState<PlanKey>(normalizePlan(initPlan))
  const [status,        setStatus]        = useState<StatusKey>(initStatus as StatusKey || 'active')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodKey>(initPaymentMethod as PaymentMethodKey || 'stripe')
  const [customAmount,  setCustomAmount]  = useState(initCustomAmount !== null ? String(initCustomAmount) : '')
  const [paymentNotes,  setPaymentNotes]  = useState(initPaymentNotes)
  const [saving,        setSaving]        = useState(false)
  const [error,         setError]         = useState<string | null>(null)

  const isManualPayment = paymentMethod !== 'stripe'

  const inputCls = [
    'w-full h-10 px-3.5 rounded-xl font-sans text-sm text-white placeholder-white/25',
    'focus:outline-none focus:ring-1 disabled:opacity-50 transition-colors',
  ].join(' ')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const fd = new FormData()
    fd.set('clientId',       clientId)
    fd.set('full_name',      name.trim())
    fd.set('email',          email.trim())
    fd.set('joined_date',    joinedDate)
    fd.set('plan',           plan)
    fd.set('status',         status)
    fd.set('payment_method', paymentMethod)
    fd.set('custom_amount',  customAmount.trim())
    fd.set('payment_notes',  paymentNotes.trim())

    try {
      const res = await updateClientInfo(fd)
      if (res.error) {
        setError(res.error)
        return
      }
      toast.success('Client updated successfully')
      router.push(backHref)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-xl">

      {/* Back link */}
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 font-sans text-sm text-white/40 hover:text-white/70 transition-colors mb-8"
      >
        <ArrowLeftIcon />
        Back to client
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-white">Edit Client</h1>
        <p className="font-sans text-sm text-white/40 mt-0.5">Update account details and subscription</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Account section */}
        <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5 space-y-4">
          <p className="font-sans text-[11px] font-semibold text-white/35 uppercase tracking-wider pb-1 border-b border-white/[0.05]">
            Account
          </p>

          <div>
            <label className="block font-sans text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              disabled={saving}
              placeholder="Full name"
              className={inputCls}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
            />
          </div>

          <div>
            <label className="block font-sans text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={saving}
              placeholder="email@example.com"
              className={inputCls}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
            />
            <p className="font-sans text-[11px] text-white/25 mt-1.5">
              Changing the email also updates the login credentials.
            </p>
          </div>

          <div>
            <label className="block font-sans text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">
              Joined Date
            </label>
            <input
              type="text"
              value={joinedDate}
              onChange={e => setJoinedDate(e.target.value)}
              placeholder="DD-MM-YYYY"
              required
              disabled={saving}
              className={inputCls}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
            />
          </div>
        </div>

        {/* Subscription section */}
        <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5 space-y-5">
          <p className="font-sans text-[11px] font-semibold text-white/35 uppercase tracking-wider pb-1 border-b border-white/[0.05]">
            Subscription
          </p>

          {/* Plan selector — 2×2 grid */}
          <div>
            <p className="font-sans text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-3">Plan</p>
            <div className="grid grid-cols-2 gap-3">
              {PLAN_OPTIONS.map(opt => {
                const selected = plan === opt.key
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setPlan(opt.key)}
                    disabled={saving}
                    className="text-left px-4 py-3.5 rounded-xl border transition-all disabled:opacity-50"
                    style={selected
                      ? { border: '1px solid rgba(43,92,230,0.7)', background: 'rgba(43,92,230,0.12)' }
                      : { border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.025)' }}
                  >
                    {/* Label row */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-sans font-semibold text-sm text-white leading-tight">{opt.label}</span>
                        {opt.badge && (
                          <span
                            className="font-sans text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-tight"
                            style={{ background: 'rgba(52,211,153,0.15)', color: '#34D399' }}
                          >
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      <div
                        className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5"
                        style={{ borderColor: selected ? '#2B5CE6' : 'rgba(255,255,255,0.2)' }}
                      >
                        {selected && <div className="w-2 h-2 rounded-full" style={{ background: '#2B5CE6' }} />}
                      </div>
                    </div>
                    {/* Price */}
                    <p className="font-sans text-sm font-bold text-white/80 mb-1">{opt.price}</p>
                    {/* Description */}
                    <p className="font-sans text-[11px] text-white/35">{opt.description}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Status select */}
          <div>
            <p className="font-sans text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-3">Status</p>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setStatus(opt.key)}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-sans text-sm font-medium border transition-all disabled:opacity-50"
                  style={status === opt.key
                    ? { background: `${opt.color}18`, borderColor: `${opt.color}50`, color: opt.color }
                    : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: status === opt.key ? opt.color : 'rgba(255,255,255,0.2)' }}
                  />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Payment section */}
        <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5 space-y-5">
          <p className="font-sans text-[11px] font-semibold text-white/35 uppercase tracking-wider pb-1 border-b border-white/[0.05]">
            Payment
          </p>

          {/* Payment method toggle */}
          <div>
            <p className="font-sans text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-3">Payment Method</p>
            <div className="flex gap-2">
              {PAYMENT_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setPaymentMethod(opt.key)}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-sans text-sm font-medium border transition-all disabled:opacity-50"
                  style={paymentMethod === opt.key
                    ? { background: 'rgba(43,92,230,0.12)', borderColor: 'rgba(43,92,230,0.55)', color: '#6B90F5' }
                    : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom amount — only for manual payments */}
          {isManualPayment && (
            <div>
              <label className="block font-sans text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">
                Custom Amount (€)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={customAmount}
                onChange={e => setCustomAmount(e.target.value)}
                disabled={saving}
                placeholder="Leave empty to use plan default"
                className={inputCls}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block font-sans text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">
              Notes
            </label>
            <textarea
              value={paymentNotes}
              onChange={e => setPaymentNotes(e.target.value)}
              disabled={saving}
              placeholder='e.g. "Discount as first client"'
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl font-sans text-sm text-white placeholder-white/25 focus:outline-none focus:ring-1 disabled:opacity-50 transition-colors resize-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="font-sans text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl font-sans text-sm font-semibold text-white transition-colors disabled:opacity-60"
            style={{ background: '#2B5CE6' }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <Link
            href={backHref}
            className="font-sans text-sm text-white/35 hover:text-white/60 transition-colors"
          >
            Cancel
          </Link>
        </div>

      </form>
    </div>
  )
}
