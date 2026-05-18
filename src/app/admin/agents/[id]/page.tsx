export const revalidate = 0
export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { AgentInfoCard, type AgentData } from './agent-info-card'
import { MarkPaidButton } from './mark-paid-button'

// ── Types ─────────────────────────────────────────────────────────────────────
type RawProfile    = { id: string; full_name: string | null; email: string }
type RawSub        = { user_id: string | null; plan: string | null; status: string | null; amount: number | null; custom_amount: number | null }
type RawPage       = { user_id: string; restaurant_name: string | null }
type RawCommission = { id: string; agent_id: string; month: string; amount: string | number; status: string; paid_at: string | null; notes: string | null }

// ── Helpers ───────────────────────────────────────────────────────────────────
const PLAN_MONTHLY: Record<string, number> = {
  basic_monthly: 49,        basic_yearly: 499 / 12,
  pro_monthly:   100,       pro_yearly:   900 / 12,
  basic:         49,        pro:          100,
}
function calcMrr(plan: string | null, amount: number | null, custom: number | null): number {
  const yearly = plan?.endsWith('_yearly') ?? false
  if (custom != null) return yearly ? Math.round(custom / 12) : custom
  if (plan && PLAN_MONTHLY[plan] !== undefined) return Math.round(PLAN_MONTHLY[plan])
  return yearly ? Math.round((amount ?? 0) / 12) : (amount ?? 0)
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function fmtMonth(dateStr: string) {
  const [y, m] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function fmtPlan(plan: string | null) {
  if (!plan) return '—'
  return plan.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function StatCard({ label, value, prefix, accent }: { label: string; value: string | number; prefix?: string; accent?: string }) {
  return (
    <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5">
      <p className="font-sans text-xs text-white/40 uppercase tracking-wider">{label}</p>
      <p className="font-display text-2xl font-bold mt-1.5" style={{ color: accent ?? '#fff' }}>
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  )
}

function PlanBadge({ plan }: { plan: string | null }) {
  if (!plan) return <span className="font-sans text-xs text-white/25">—</span>
  const isPro = plan.toLowerCase().startsWith('pro')
  return (
    <span
      className="inline-flex font-sans text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
      style={isPro
        ? { background: 'rgba(43,92,230,0.14)', color: '#6B90F5', border: '1px solid rgba(43,92,230,0.25)' }
        : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.10)' }}
    >
      {fmtPlan(plan)}
    </span>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const admin  = createAdminClient()

  // ── Stage 1: agent + all linked profiles + subscriptions + commissions ──────
  const [agentRes, profilesRes, subsRes, commissionsRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any).from('agents')
      .select('id, full_name, email, phone, territory, commission_rate, status, notes, created_at')
      .eq('id', id).maybeSingle(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any).from('profiles')
      .select('id, full_name, email')
      .eq('agent_id', id),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any).from('subscriptions')
      .select('user_id, plan, status, amount, custom_amount')
      .order('created_at', { ascending: false }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any).from('agent_commissions')
      .select('id, agent_id, month, amount, status, paid_at, notes')
      .eq('agent_id', id)
      .order('month', { ascending: false }),
  ])

  if (!agentRes.data) notFound()

  const agent       = agentRes.data      as AgentData
  const profiles    = (profilesRes.data  as RawProfile[]    | null) ?? []
  const subs        = (subsRes.data      as RawSub[]        | null) ?? []
  const commissions = (commissionsRes.data as RawCommission[] | null) ?? []

  // ── Stage 2: client pages for restaurant names ───────────────────────────────
  const profileIds = profiles.map(p => p.id)
  const { data: pagesRaw } = profileIds.length > 0
    ? await admin.from('client_pages').select('user_id, restaurant_name').in('user_id', profileIds as string[])
    : { data: [] as RawPage[] }
  const pages = (pagesRaw as RawPage[] | null) ?? []

  // ── Build lookups ─────────────────────────────────────────────────────────────
  const subByUser: Record<string, RawSub>  = {}
  subs.forEach(s => { if (s.user_id && !subByUser[s.user_id]) subByUser[s.user_id] = s })

  const pageByUser: Record<string, RawPage> = {}
  pages.forEach(p => { pageByUser[p.user_id] = p })

  // ── Per-client rows ───────────────────────────────────────────────────────────
  const rate = parseFloat(String(agent.commission_rate))

  const clientRows = profiles.map(p => {
    const sub      = subByUser[p.id] ?? null
    const page     = pageByUser[p.id] ?? null
    const mrr      = sub ? calcMrr(sub.plan, sub.amount, sub.custom_amount) : 0
    const isActive = sub?.status === 'active'
    const commission = Math.round(mrr * rate / 100)
    return {
      id:             p.id,
      fullName:       p.full_name,
      email:          p.email,
      restaurantName: page?.restaurant_name ?? null,
      plan:           sub?.plan ?? null,
      subStatus:      sub?.status ?? null,
      mrr,
      isActive,
      commission,
    }
  })

  // ── Stats ─────────────────────────────────────────────────────────────────────
  const activeClients  = clientRows.filter(c => c.isActive)
  const totalMrr       = activeClients.reduce((s, c) => s + c.mrr, 0)
  const commissionOwed = Math.round(totalMrr * rate / 100)
  const totalPaid      = commissions
    .filter(c => c.status === 'paid')
    .reduce((s, c) => s + parseFloat(String(c.amount)), 0)

  return (
    <div className="p-6 space-y-6 max-w-4xl">

      {/* Back nav */}
      <Link
        href="/admin/agents"
        className="inline-flex items-center gap-2 font-sans text-sm text-white/40 hover:text-white/70 transition-colors"
      >
        <ArrowLeftIcon />
        Agents
      </Link>

      {/* Agent header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-white">{agent.full_name}</h1>
        <p className="font-sans text-sm text-white/40 mt-0.5">{agent.email}</p>
      </div>

      {/* Info card (inline-editable) */}
      <AgentInfoCard agent={agent} />

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Active Clients"          value={activeClients.length} />
        <StatCard label="Total MRR"               value={totalMrr}       prefix="€" />
        <StatCard label="Commission This Month"   value={commissionOwed} prefix="€" accent="#34D399" />
        <StatCard label="Total Paid Ever"         value={Math.round(totalPaid)} prefix="€" />
      </div>

      {/* Clients table */}
      <div className="bg-[#141720] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <h2 className="font-display font-semibold text-white text-sm">Clients</h2>
          <span
            className="font-sans text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(43,92,230,0.13)', color: '#6B90F5' }}
          >
            {clientRows.length}
          </span>
        </div>

        {clientRows.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-sans text-sm text-white/25">No clients assigned to this agent yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  {['Client', 'Business', 'Plan', 'MRR', 'Commission'].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-sans text-[11px] font-semibold text-white/30 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {clientRows.map(c => (
                  <tr key={c.id} className="hover:bg-white/[0.018] transition-colors">
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/clients/${c.id}`} className="group">
                        <p className="font-sans text-sm text-white/80 group-hover:text-white transition-colors truncate max-w-[160px]">
                          {c.fullName ?? c.email}
                        </p>
                        <p className="font-sans text-xs text-white/30 mt-0.5 truncate max-w-[160px]">{c.email}</p>
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-sans text-sm text-white/55 truncate max-w-[140px] block">
                        {c.restaurantName ?? '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <PlanBadge plan={c.plan} />
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-sans text-sm text-white/70">€{c.mrr}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-sans text-sm font-semibold" style={{ color: '#34D399' }}>
                        €{c.commission}
                      </span>
                      <span className="font-sans text-xs text-white/25 ml-1">({rate}%)</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Commission History */}
      <div className="bg-[#141720] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h2 className="font-display font-semibold text-white text-sm">Commission History</h2>
          <p className="font-sans text-xs text-white/30 mt-0.5">
            Recorded monthly commission payouts
          </p>
        </div>

        {commissions.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-sans text-sm text-white/25">No commission records yet</p>
            <p className="font-sans text-xs text-white/15 mt-1">Records are created when commissions are settled each month</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  {['Month', 'Amount', 'Status', 'Paid Date', ''].map((h, i) => (
                    <th key={i} className="px-5 py-3 text-left font-sans text-[11px] font-semibold text-white/30 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {commissions.map(c => {
                  const isPaid = c.status === 'paid'
                  return (
                    <tr key={c.id} className="hover:bg-white/[0.018] transition-colors">
                      <td className="px-5 py-3.5 font-sans text-sm text-white/75">
                        {fmtMonth(c.month)}
                      </td>
                      <td className="px-5 py-3.5 font-sans text-sm font-semibold text-white/80">
                        €{parseFloat(String(c.amount)).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="inline-flex items-center gap-1.5 font-sans text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                          style={isPaid
                            ? { color: '#34D399', background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.20)' }
                            : { color: '#FBBF24', background: 'rgba(251,191,36,0.10)',  border: '1px solid rgba(251,191,36,0.20)' }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: isPaid ? '#34D399' : '#FBBF24' }} />
                          {isPaid ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-sans text-sm text-white/45">
                        {c.paid_at ? fmt(c.paid_at) : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {!isPaid && (
                          <MarkPaidButton commissionId={c.id} agentId={id} />
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
