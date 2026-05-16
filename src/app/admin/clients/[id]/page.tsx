import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { CopyButton } from '@/components/admin/copy-button'
import { QrButton } from '@/components/admin/qr-button'
import { ImpersonateButton } from './impersonate-button'
import { DeleteClientButton } from './delete-client-button'
import { NotesEditor } from './notes-editor'
import { PaymentHistory, type PaymentRow } from './payment-history'
import { ActivityLog, type ActivityEntry } from './activity-log'

// ── Types ─────────────────────────────────────────────────────────────────────
type Profile  = { id: string; full_name: string | null; email: string; created_at: string; admin_notes: string | null }
type Sub      = { id: string; plan: string | null; status: string | null; amount: number | null; next_billing_date: string | null; payment_method: string | null; custom_amount: number | null }
type Page     = { slug: string | null; restaurant_name: string | null }
type Stand    = { id: string; name: string | null; landing_page_url: string; created_at: string }
type Payment  = { id: string; amount: number; payment_method: string | null; notes: string | null; paid_at: string }
type Activity = { id: string; action: string; created_at: string }

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function initial(name: string | null, email: string) {
  return (name ?? email).charAt(0).toUpperCase()
}

const AVATAR_COLORS = ['#2B5CE6', '#E1306C', '#25D366', '#F4B400', '#A78BFA', '#38BEFF', '#00AF87']
function avatarColor(id: string) {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

// ── Inline badges ─────────────────────────────────────────────────────────────
function fmtPlan(plan: string) {
  return plan.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

const PLAN_AMOUNTS: Record<string, string> = {
  basic_monthly: '€49/mo',
  basic_yearly:  '€499/yr',
  pro_monthly:   '€100/mo',
  pro_yearly:    '€900/yr',
  basic:         '€49/mo',
  pro:           '€100/mo',
}

function fmtPaymentMethod(pm: string | null) {
  const map: Record<string, string> = { stripe: 'Stripe', cash: 'Cash', bank_transfer: 'Bank Transfer' }
  return pm ? (map[pm] ?? pm) : '—'
}

function renewalBadge(dateStr: string | null): { text: string; color: string } | null {
  if (!dateStr) return null
  const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000)
  const text  = days < 0 ? 'Overdue' : `Renews in ${days}d`
  const color = days > 14 ? '#34D399' : days >= 7 ? '#FBBF24' : '#F87171'
  return { text, color }
}

function PlanBadge({ plan }: { plan: string | null }) {
  if (!plan) return <span className="font-sans text-xs text-white/25">—</span>
  const isPro = plan.toLowerCase().startsWith('pro')
  return (
    <span
      className="inline-flex text-[11px] font-sans font-semibold px-2.5 py-0.5 rounded-full border"
      style={isPro
        ? { background: 'rgba(43,92,230,0.14)', color: '#6B90F5', border: '1px solid rgba(43,92,230,0.25)' }
        : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      {fmtPlan(plan)}
    </span>
  )
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="font-sans text-xs text-white/25">—</span>
  const s = status.toLowerCase()
  const style =
    s === 'active'    ? { color: '#34D399', background: 'rgba(52,211,153,0.1)',  border: '1px solid rgba(52,211,153,0.2)' } :
    s === 'suspended' ? { color: '#FBBF24', background: 'rgba(251,191,36,0.1)',  border: '1px solid rgba(251,191,36,0.2)' } :
                        { color: '#F87171', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-sans font-semibold px-2.5 py-0.5 rounded-full" style={style}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: style.color }} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5 flex-1">
      <p className="font-sans text-xs text-white/40 uppercase tracking-wider">{label}</p>
      <p className="font-display text-2xl font-bold text-white mt-1.5">{value.toLocaleString()}</p>
    </div>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LayoutIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 9h18M9 21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const admin   = createAdminClient()

  // ── Fetch all data in one parallel batch ─────────────────────────────────
  const [profileRes, subRes, pageRes, standsRes, paymentsRes, activityRes, tapRes, clickRes, viewRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any).from('profiles').select('id, full_name, email, created_at, admin_notes').eq('id', id).maybeSingle(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any).from('subscriptions').select('id, plan, status, amount, next_billing_date, payment_method, custom_amount').eq('user_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    admin.from('client_pages').select('slug, restaurant_name').eq('user_id', id).maybeSingle(),
    admin.from('nfc_stands').select('id, name, landing_page_url, created_at').eq('user_id', id).order('created_at', { ascending: true }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any).from('payments').select('id, amount, payment_method, notes, paid_at').eq('user_id', id).order('paid_at', { ascending: false }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any).from('activity_log').select('id, action, created_at').eq('user_id', id).order('created_at', { ascending: false }).limit(10),
    // Stats — service role bypasses RLS on all three tables
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any).from('tap_events').select('*', { count: 'exact', head: true }).eq('user_id', id),
    admin.from('button_clicks').select('*', { count: 'exact', head: true }).eq('client_id', id),
    admin.from('menu_item_views').select('*', { count: 'exact', head: true }).eq('client_id', id),
  ])

  const profile = profileRes.data as Profile | null
  if (!profile) notFound()

  const sub        = subRes.data   as Sub    | null
  const page       = pageRes.data  as Page   | null
  const stands     = (standsRes.data   as Stand[]    | null) ?? []
  const payments   = (paymentsRes.data as Payment[]  | null) ?? []
  const activities = (activityRes.data as Activity[] | null) ?? []

  const tapCount   = (tapRes   as { count: number | null }).count ?? 0
  const clickCount = (clickRes as { count: number | null }).count ?? 0
  const viewCount  = (viewRes  as { count: number | null }).count ?? 0

  const appUrl     = process.env.NEXT_PUBLIC_TAP_URL ?? 'http://localhost:3000'
  const landingUrl = page?.slug ? `${appUrl}/p/${page.slug}` : null
  const color      = avatarColor(id)

  return (
    <div className="p-6 space-y-6 max-w-4xl">

      {/* Back nav */}
      <Link
        href="/admin/clients"
        className="inline-flex items-center gap-2 font-sans text-sm text-white/40 hover:text-white/70 transition-colors"
      >
        <ArrowLeftIcon />
        Clients
      </Link>

      {/* Header card */}
      <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 font-display font-bold text-xl text-white"
              style={{ background: color }}
            >
              {initial(profile.full_name, profile.email)}
            </div>
            {/* Name + email + badges */}
            <div>
              <h1 className="font-display text-xl font-bold text-white">
                {profile.full_name ?? profile.email}
              </h1>
              <p className="font-sans text-sm text-gray-400 mt-0.5">{profile.email}</p>
              <div className="flex items-center gap-2 mt-2.5">
                <PlanBadge plan={sub?.plan ?? null} />
                <StatusBadge status={sub?.status ?? null} />
              </div>
            </div>
          </div>
          {/* Action buttons — wrap on mobile */}
          <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
            {landingUrl && (
              <a
                href={landingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-sans text-sm font-medium transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.09)' }}
              >
                <ExternalLinkIcon />
                View Page
              </a>
            )}
            <Link
              href={`/admin/clients/${id}/page-editor`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-sans text-sm font-medium transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.09)' }}
            >
              <LayoutIcon />
              Edit Page
            </Link>
            <ImpersonateButton clientId={id} />
            <Link
              href={`/admin/clients/${id}/edit`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-sans text-sm font-semibold transition-colors"
              style={{ background: '#2B5CE6', color: '#fff' }}
            >
              <PencilIcon />
              Edit
            </Link>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Taps"      value={tapCount}   />
        <StatCard label="Button Clicks"   value={clickCount} />
        <StatCard label="Menu Item Views" value={viewCount}  />
      </div>

      {/* Account + Business */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* Account info */}
        <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5 space-y-4">
          <h2 className="font-display font-semibold text-white text-sm">Account</h2>
          {[
            { label: 'Email',        value: profile.email,                    badge: null },
            { label: 'Joined',       value: fmt(profile.created_at),          badge: null },
            { label: 'Plan',         value: sub?.plan ? fmtPlan(sub.plan) : '—', badge: null },
            {
              label: 'Amount',
              badge: null,
              value: sub?.custom_amount != null
                ? `€${sub.custom_amount} (custom)`
                : sub?.plan && PLAN_AMOUNTS[sub.plan]
                  ? PLAN_AMOUNTS[sub.plan]
                  : sub?.amount != null
                    ? `€${sub.amount}`
                    : '—',
            },
            { label: 'Payment',      value: fmtPaymentMethod(sub?.payment_method ?? null), badge: null },
            { label: 'Next Billing', value: sub?.next_billing_date ? fmt(sub.next_billing_date) : '—', badge: renewalBadge(sub?.next_billing_date ?? null) },
            { label: 'Sub ID',       value: sub?.id ? sub.id.substring(0, 8) + '…' : '—', mono: true, badge: null },
          ].map(row => (
            <div key={row.label} className="flex items-start justify-between gap-4 py-2.5 border-b border-white/[0.04] last:border-0">
              <span className="font-sans text-xs text-white/40 shrink-0">{row.label}</span>
              <div className="flex items-center gap-2 justify-end flex-wrap">
                <span className={`font-sans text-sm text-white/75 text-right ${row.mono ? 'font-mono text-xs text-white/40' : ''}`}>
                  {row.value}
                </span>
                {row.badge && (
                  <span
                    className="font-sans text-[11px] font-semibold px-2 py-0.5 rounded-md shrink-0"
                    style={{ color: row.badge.color, background: `${row.badge.color}18`, border: `1px solid ${row.badge.color}40` }}
                  >
                    {row.badge.text}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Business info */}
        <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5 space-y-4">
          <h2 className="font-display font-semibold text-white text-sm">Business</h2>
          <div className="space-y-0">
            {[
              { label: 'Restaurant', value: page?.restaurant_name ?? '—' },
              { label: 'Slug',       value: page?.slug ? `/p/${page.slug}` : '—', mono: true },
            ].map(row => (
              <div key={row.label} className="flex items-start justify-between gap-4 py-2.5 border-b border-white/[0.04]">
                <span className="font-sans text-xs text-white/40 shrink-0">{row.label}</span>
                <span className={`font-sans text-sm text-white/75 text-right ${row.mono ? 'font-mono text-xs text-white/55' : ''}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* Landing URL row */}
          <div className="py-2.5 border-b border-white/[0.04]">
            <span className="font-sans text-xs text-white/40 block mb-2">Landing Page</span>
            {landingUrl ? (
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-white/50 truncate flex-1">{landingUrl}</span>
                <CopyButton text={landingUrl} />
                <a
                  href={landingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 font-sans text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors shrink-0"
                  style={{ color: '#6B90F5', background: 'rgba(43,92,230,0.10)' }}
                >
                  <ExternalLinkIcon />
                  Open
                </a>
              </div>
            ) : (
              <span className="font-sans text-sm text-white/25">No page published yet</span>
            )}
          </div>

          {/* NFC Stands count */}
          <div className="flex items-start justify-between gap-4 py-2.5">
            <span className="font-sans text-xs text-white/40 shrink-0">NFC Stands</span>
            <span className="font-sans text-sm text-white/75">{stands.length}</span>
          </div>
        </div>

      </div>

      {/* NFC Stands list */}
      <div className="bg-[#141720] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <h2 className="font-display font-semibold text-white text-sm">NFC Stands</h2>
          <span
            className="font-sans text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(43,92,230,0.13)', color: '#6B90F5' }}
          >
            {stands.length}
          </span>
        </div>

        {stands.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-sans text-sm text-white/25">No NFC stands yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <div className="divide-y divide-white/[0.04] min-w-[560px]">
            {stands.map((stand, idx) => {
              const standUrl = page?.slug
                ? `${appUrl}/p/${page.slug}?table=${idx + 1}`
                : stand.landing_page_url
              return (
              <div key={stand.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.018] transition-colors">
                {/* Stand name */}
                <div className="w-40 shrink-0">
                  {stand.name ? (
                    <p className="font-sans text-sm text-white/80 truncate">{stand.name}</p>
                  ) : (
                    <p className="font-sans text-sm text-white/28 italic">Stand {idx + 1}</p>
                  )}
                </div>
                {/* URL */}
                <div className="flex-1 flex items-center gap-1.5 min-w-0">
                  <span className="font-mono text-[11px] text-gray-400 truncate">
                    {standUrl}
                  </span>
                  <CopyButton text={standUrl} />
                </div>
                {/* Date */}
                <span className="font-sans text-xs text-gray-400 shrink-0 w-24 text-right">
                  {fmt(stand.created_at)}
                </span>
                {/* QR */}
                <QrButton url={standUrl} />
                {/* Open */}
                <a
                  href={standUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-sans text-xs font-medium shrink-0 transition-colors"
                  style={{ color: '#6B90F5', background: 'rgba(43,92,230,0.10)' }}
                >
                  <ExternalLinkIcon />
                  Open
                </a>
              </div>
            )})}

          </div>
          </div>
        )}
      </div>

      {/* Payment History */}
      <PaymentHistory userId={id} payments={payments as PaymentRow[]} />

      {/* Activity log */}
      <ActivityLog entries={activities as ActivityEntry[]} />

      {/* Private Notes */}
      <NotesEditor clientId={id} initialNotes={profile.admin_notes ?? ''} />

      {/* Danger zone */}
      <div
        className="rounded-2xl p-5 flex items-center justify-between gap-4"
        style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.14)' }}
      >
        <div>
          <p className="font-display text-sm font-semibold text-red-400">Delete client</p>
          <p className="font-sans text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Permanently removes this account, landing page, NFC stands, and all analytics data.
          </p>
        </div>
        <DeleteClientButton clientId={id} />
      </div>

    </div>
  )
}
