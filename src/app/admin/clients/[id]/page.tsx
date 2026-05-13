import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { CopyButton } from '@/components/admin/copy-button'

// ── Types ─────────────────────────────────────────────────────────────────────
type Profile  = { id: string; full_name: string | null; email: string; created_at: string }
type Sub      = { id: string; plan: string | null; status: string | null; amount: number | null; next_billing_date: string | null }
type Page     = { slug: string | null; restaurant_name: string | null }
type Stand    = { id: string; name: string | null; landing_page_url: string; created_at: string }

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
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
      {plan.charAt(0).toUpperCase() + plan.slice(1)}
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const admin   = createAdminClient()

  // ── Fetch all data ────────────────────────────────────────────────────────
  const [profileRes, subRes, pageRes, standsRes] = await Promise.all([
    admin.from('profiles').select('id, full_name, email, created_at').eq('id', id).maybeSingle(),
    admin.from('subscriptions').select('id, plan, status, amount, next_billing_date').eq('user_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    admin.from('client_pages').select('slug, restaurant_name').eq('user_id', id).maybeSingle(),
    admin.from('nfc_stands').select('id, name, landing_page_url, created_at').eq('user_id', id).order('created_at', { ascending: true }),
  ])

  const profile = profileRes.data as Profile | null
  if (!profile) notFound()

  const sub    = subRes.data   as Sub    | null
  const page   = pageRes.data  as Page   | null
  const stands = (standsRes.data as Stand[] | null) ?? []

  const standIds   = stands.map(s => s.id)
  const appUrl     = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const landingUrl = page?.slug ? `${appUrl}/p/${page.slug}` : null

  // ── Stats ────────────────────────────────────────────────────────────────
  const [tapRes, clickRes, viewRes] = await Promise.all([
    standIds.length
      ? admin.from('tap_events').select('*', { count: 'exact', head: true }).in('stand_id', standIds)
      : Promise.resolve({ count: 0 }),
    admin.from('button_clicks').select('*', { count: 'exact', head: true }).eq('client_id', id),
    admin.from('menu_item_views').select('*', { count: 'exact', head: true }).eq('client_id', id),
  ])

  const tapCount   = tapRes.count   ?? 0
  const clickCount = clickRes.count ?? 0
  const viewCount  = viewRes.count  ?? 0
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
        <div className="flex items-start justify-between gap-6">
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
          {/* Action buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
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
      <div className="flex gap-4">
        <StatCard label="Total Taps"     value={tapCount}   />
        <StatCard label="Button Clicks"  value={clickCount} />
        <StatCard label="Menu Item Views" value={viewCount}  />
      </div>

      {/* Account + Business */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* Account info */}
        <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5 space-y-4">
          <h2 className="font-display font-semibold text-white text-sm">Account</h2>
          {[
            { label: 'Email',        value: profile.email },
            { label: 'Joined',       value: fmt(profile.created_at) },
            { label: 'Plan',         value: sub?.plan ? fmtPlan(sub.plan) : '—' },
            { label: 'Next Billing', value: sub?.next_billing_date ? fmt(sub.next_billing_date) : '—' },
            { label: 'Sub ID',       value: sub?.id ? sub.id.substring(0, 8) + '…' : '—', mono: true },
          ].map(row => (
            <div key={row.label} className="flex items-start justify-between gap-4 py-2.5 border-b border-white/[0.04] last:border-0">
              <span className="font-sans text-xs text-white/40 shrink-0">{row.label}</span>
              <span className={`font-sans text-sm text-white/75 text-right ${row.mono ? 'font-mono text-xs text-white/40' : ''}`}>
                {row.value}
              </span>
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
          <div className="divide-y divide-white/[0.04]">
            {stands.map((stand, idx) => (
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
                    {stand.landing_page_url}
                  </span>
                  <CopyButton text={stand.landing_page_url} />
                </div>
                {/* Date */}
                <span className="font-sans text-xs text-gray-400 shrink-0 w-24 text-right">
                  {fmt(stand.created_at)}
                </span>
                {/* Open */}
                <a
                  href={stand.landing_page_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-sans text-xs font-medium shrink-0 transition-colors"
                  style={{ color: '#6B90F5', background: 'rgba(43,92,230,0.10)' }}
                >
                  <ExternalLinkIcon />
                  Open
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
