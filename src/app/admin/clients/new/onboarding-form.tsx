'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Loader2, CheckCircle2, Copy, Check,
  ExternalLink, User, Mail, Building2, Link2, Wifi, Send,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClientAccount } from '@/actions/admin-clients'
import type { CreateClientResult } from '@/actions/admin-clients'

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputCls = [
  'w-full rounded-xl bg-white/[0.05] border border-white/[0.08]',
  'text-sm text-white placeholder-white/25 px-3.5 py-2.5',
  'focus:outline-none focus:border-[#2B5CE6]/60 transition-colors',
].join(' ')

const labelCls = 'block text-xs font-medium text-white/50 mb-1.5'

function Field({
  label, icon: Icon, children,
}: {
  label: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div>
      <label className={labelCls}>
        <span className="inline-flex items-center gap-1.5">
          <Icon size={11} className="text-white/35" />
          {label}
        </span>
      </label>
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-white/35">{children}</p>
      <div className="flex-1 h-px bg-white/[0.06]" />
    </div>
  )
}

// ─── Plan data ────────────────────────────────────────────────────────────────

const PLANS = {
  basic: {
    label: 'Basic',
    monthly: { price: '49',  period: '/mo', badge: null },
    yearly:  { price: '499', period: '/yr', badge: 'Save €89' },
    features: [
      'NFC Smart Hub page',
      'Full digital menu integration',
      'Multi-language support',
      'Reviews integration',
      'Social media buttons',
      'Fast setup',
      'Ongoing support',
    ],
  },
  pro: {
    label: 'Pro',
    monthly: { price: '100', period: '/mo', badge: null },
    yearly:  { price: '900', period: '/yr', badge: 'Get 3 Months FREE' },
    features: [
      'Everything in Basic',
      'Custom branding (logo & colors)',
      'Advanced customization',
      'Booking & external links integration',
      'Priority Support',
    ],
  },
} as const

type PlanKey    = keyof typeof PLANS
type BillingKey = 'monthly' | 'yearly'

// ─── Plan card ────────────────────────────────────────────────────────────────

function PlanCard({
  planKey, billing, selected, onSelect,
}: {
  planKey: PlanKey
  billing: BillingKey
  selected: boolean
  onSelect: () => void
}) {
  const plan    = PLANS[planKey]
  const pricing = plan[billing]

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex-1 text-left px-4 py-4 rounded-xl border transition-all',
        selected
          ? 'border-[#2B5CE6] bg-[#2B5CE6]/10'
          : 'border-white/[0.08] bg-white/[0.025] hover:border-white/20',
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-2">
        <span className="font-semibold text-sm text-white">{plan.label}</span>
        <div className={cn(
          'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 mt-0.5',
          selected ? 'border-[#2B5CE6]' : 'border-white/20',
        )}>
          {selected && <div className="w-2 h-2 rounded-full bg-[#2B5CE6]" />}
        </div>
      </div>

      {/* Price */}
      <p className="text-xl font-bold text-white mb-1">
        €{pricing.price}
        <span className="text-sm font-normal text-white/40">{pricing.period}</span>
      </p>

      {/* Savings badge */}
      <div className="mb-3 h-5">
        {pricing.badge && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
            {pricing.badge}
          </span>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-1.5">
        {plan.features.map(f => (
          <li key={f} className="flex items-start gap-1.5 text-xs text-white/50">
            <Check size={11} className="text-[#2B5CE6] shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>
    </button>
  )
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-colors"
    >
      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
    </button>
  )
}

// ─── NFC counter ──────────────────────────────────────────────────────────────

function NfcCounter({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="w-8 h-8 rounded-lg border border-white/[0.08] text-white/50 hover:text-white hover:border-white/20 flex items-center justify-center text-lg leading-none transition-colors"
      >
        −
      </button>
      <span className="w-8 text-center font-semibold text-white tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(20, value + 1))}
        className="w-8 h-8 rounded-lg border border-white/[0.08] text-white/50 hover:text-white hover:border-white/20 flex items-center justify-center text-lg leading-none transition-colors"
      >
        +
      </button>
      <span className="text-xs text-white/35">stands</span>
    </div>
  )
}

// ─── Send payment link button ─────────────────────────────────────────────────

function SendPaymentLinkBtn({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }
  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all',
        copied
          ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
          : 'bg-[#2B5CE6] text-white hover:bg-[#2B5CE6]/80 active:scale-[0.98]',
      )}
    >
      {copied
        ? <><Check size={15} /> Copied to clipboard!</>
        : <><Send size={15} /> Send Payment Link</>}
    </button>
  )
}

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen({
  slug,
  tempPassword,
  checkoutUrl,
  checkoutLoading,
  checkoutError,
}: {
  slug: string
  tempPassword: string
  checkoutUrl: string | null
  checkoutLoading: boolean
  checkoutError: string
}) {
  const appUrl  = typeof window !== 'undefined' ? window.location.origin : ''
  const pageUrl = `${appUrl}/p/${slug}`

  return (
    <div className="flex flex-col items-center text-center py-12 px-6 max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mb-6">
        <CheckCircle2 size={32} className="text-emerald-400" />
      </div>

      <h2 className="text-xl font-semibold text-white mb-2">Client created!</h2>
      <p className="text-sm text-white/45 mb-8">
        The account is active. Share the credentials and payment link with your client.
      </p>

      {/* Landing page URL */}
      <div className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 mb-3 text-left">
        <p className="text-xs font-medium text-white/40 mb-2">Landing Page URL</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-sm text-[#2B5CE6] font-mono break-all">{pageUrl}</code>
          <CopyBtn value={pageUrl} />
          <a
            href={pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-colors"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Credentials */}
      <div className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 mb-3 text-left space-y-3">
        <p className="text-xs font-medium text-white/40">Login Credentials</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/50">Temporary Password</span>
          <div className="flex items-center gap-1">
            <code className="text-sm font-mono text-white/80">{tempPassword}</code>
            <CopyBtn value={tempPassword} />
          </div>
        </div>
        <p className="text-[11px] text-white/30 leading-relaxed">
          The client should change this password on first login.
        </p>
      </div>

      {/* Payment link */}
      <div className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 mb-8 text-left space-y-3">
        <p className="text-xs font-medium text-white/40">Stripe Payment Link</p>

        {checkoutLoading && (
          <div className="flex items-center gap-2 py-1">
            <Loader2 size={13} className="animate-spin text-white/30" />
            <span className="text-xs text-white/35">Generating payment link…</span>
          </div>
        )}

        {checkoutError && !checkoutLoading && (
          <p className="text-xs text-red-400">{checkoutError}</p>
        )}

        {checkoutUrl && !checkoutLoading && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs text-white/55 font-mono break-all leading-relaxed">
                {checkoutUrl}
              </code>
              <CopyBtn value={checkoutUrl} />
            </div>
            <SendPaymentLinkBtn url={checkoutUrl} />
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Link
          href="/admin/clients/new"
          className="px-4 py-2 rounded-xl border border-white/[0.1] text-sm text-white/60 hover:text-white/80 hover:border-white/20 transition-colors"
        >
          Add another
        </Link>
        <Link
          href="/admin/clients"
          className="px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white/70 text-sm font-medium hover:text-white hover:border-white/20 transition-colors"
        >
          View all clients
        </Link>
      </div>
    </div>
  )
}

// ─── Main form ────────────────────────────────────────────────────────────────

export function OnboardingForm() {
  const [plan,           setPlan]          = useState<PlanKey>('basic')
  const [billing,        setBilling]       = useState<BillingKey>('monthly')
  const [nfcCount,       setNfcCount]      = useState(1)
  const [slug,           setSlug]          = useState('')
  const [slugEdited,     setSlugEdited]    = useState(false)
  const [error,          setError]         = useState('')
  const [result,         setResult]        = useState<Extract<CreateClientResult, { success: true }> | null>(null)
  const [checkoutUrl,    setCheckoutUrl]   = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError,  setCheckoutError] = useState('')
  const [isPending,      startTransition]  = useTransition()

  function toSlug(value: string) {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  function handleBizNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!slugEdited) setSlug(toSlug(e.target.value))
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlugEdited(true)
    setSlug(toSlug(e.target.value))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    fd.set('plan',      plan)
    fd.set('billing',   billing)
    fd.set('nfc_count', String(nfcCount))
    fd.set('slug',      slug)

    startTransition(async () => {
      const res = await createClientAccount(fd)
      if (!res.success) {
        setError(res.error)
        return
      }

      setResult(res)
      setCheckoutLoading(true)
      setCheckoutError('')

      try {
        const checkoutRes = await fetch('/api/stripe/create-checkout', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            client_email:   fd.get('email') as string,
            plan,
            billing_period: billing,
          }),
        })
        const data = await checkoutRes.json() as { url?: string; error?: string }
        if (data.url) {
          setCheckoutUrl(data.url)
        } else {
          setCheckoutError(data.error ?? 'Failed to generate payment link.')
        }
      } catch {
        setCheckoutError('Failed to generate payment link.')
      } finally {
        setCheckoutLoading(false)
      }
    })
  }

  if (result) {
    return (
      <div className="p-6 md:p-10">
        <SuccessScreen
          slug={result.slug}
          tempPassword={result.tempPassword}
          checkoutUrl={checkoutUrl}
          checkoutLoading={checkoutLoading}
          checkoutError={checkoutError}
        />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10 max-w-2xl">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/admin/clients"
          className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-white">New Client</h1>
          <p className="text-xs text-white/35 mt-0.5">Create a client account and set up their landing page</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Account */}
        <div>
          <SectionTitle>Account</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Full Name" icon={User}>
              <input
                type="text"
                name="full_name"
                required
                placeholder="Maria Papadopoulou"
                className={inputCls}
              />
            </Field>
            <Field label="Email Address" icon={Mail}>
              <input
                type="email"
                name="email"
                required
                placeholder="maria@restaurant.com"
                className={inputCls}
              />
            </Field>
          </div>
        </div>

        {/* Business */}
        <div>
          <SectionTitle>Business</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Business Name" icon={Building2}>
              <input
                type="text"
                name="business_name"
                placeholder="Taverna Sokrates"
                className={inputCls}
                onChange={handleBizNameChange}
              />
            </Field>
            <Field label="Landing Page Slug" icon={Link2}>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-white/25 pointer-events-none select-none">
                  /p/
                </span>
                <input
                  type="text"
                  name="slug"
                  required
                  value={slug}
                  onChange={handleSlugChange}
                  placeholder="taverna-sokrates"
                  className={cn(inputCls, 'pl-8 font-mono text-xs')}
                />
              </div>
              <p className="text-[11px] text-white/30 mt-1.5">
                Lowercase letters, numbers, and hyphens only
              </p>
            </Field>
          </div>
        </div>

        {/* Plan */}
        <div>
          {/* Section header with billing toggle */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/35">
                Subscription Plan
              </p>
              <div className="flex-1 h-px bg-white/[0.06] w-8" />
            </div>
            <div className="flex rounded-lg border border-white/[0.08] overflow-hidden text-xs">
              {(['monthly', 'yearly'] as BillingKey[]).map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBilling(b)}
                  className={cn(
                    'px-3.5 py-1.5 font-medium capitalize transition-colors',
                    billing === b
                      ? 'bg-[#2B5CE6] text-white'
                      : 'text-white/45 hover:text-white/70',
                  )}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <PlanCard
              planKey="basic"
              billing={billing}
              selected={plan === 'basic'}
              onSelect={() => setPlan('basic')}
            />
            <PlanCard
              planKey="pro"
              billing={billing}
              selected={plan === 'pro'}
              onSelect={() => setPlan('pro')}
            />
          </div>
        </div>

        {/* NFC stands */}
        <div>
          <SectionTitle>NFC Configuration</SectionTitle>
          <div className="flex items-center justify-between p-4 rounded-xl border border-white/[0.08] bg-white/[0.025]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#2B5CE6]/15 border border-[#2B5CE6]/20 flex items-center justify-center">
                <Wifi size={16} className="text-[#2B5CE6]" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">NFC Stands</p>
                <p className="text-xs text-white/35">Each stand gets a unique tracking URL</p>
              </div>
            </div>
            <NfcCounter value={nfcCount} onChange={setNfcCount} />
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending || !slug}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2B5CE6] text-white text-sm font-medium hover:bg-[#2B5CE6]/80 disabled:opacity-50 transition-colors"
          >
            {isPending ? <Loader2 size={15} className="animate-spin" /> : <User size={15} />}
            {isPending ? 'Creating…' : 'Create Client'}
          </button>
          <Link
            href="/admin/clients"
            className="text-sm text-white/35 hover:text-white/60 transition-colors"
          >
            Cancel
          </Link>
        </div>

      </form>
    </div>
  )
}
