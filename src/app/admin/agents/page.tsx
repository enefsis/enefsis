export const revalidate = 0
export const dynamic = 'force-dynamic'
export const metadata = { title: 'Admin — Agents' }

import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'

// ── Types ────────────────────────────────────────────────────────────────────
type RawAgent = {
  id: string
  name: string
  email: string
  phone: string | null
  territory: string | null
  commission_rate: number
  status: string
  created_at: string
}
type RawProfile = { id: string; agent_id: string | null }
type RawSub     = { user_id: string | null; plan: string | null; status: string | null; amount: number | null; custom_amount: number | null }

// ── MRR helpers ──────────────────────────────────────────────────────────────
const PLAN_MONTHLY: Record<string, number> = {
  basic_monthly: 49,          basic_yearly: 499 / 12,
  pro_monthly:   100,         pro_yearly:   900 / 12,
  basic:         49,          pro:          100,
}
function calcMrr(plan: string | null, amount: number | null, custom: number | null): number {
  const yearly = plan?.endsWith('_yearly') ?? false
  if (custom != null) return yearly ? Math.round(custom / 12) : custom
  if (plan && PLAN_MONTHLY[plan] !== undefined) return Math.round(PLAN_MONTHLY[plan])
  return yearly ? Math.round((amount ?? 0) / 12) : (amount ?? 0)
}

// ── Inline components ─────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const active = status === 'active'
  return (
    <span
      className="inline-flex items-center gap-1.5 font-sans text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
      style={active
        ? { color: '#34D399', background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.20)' }
        : { color: '#FBBF24', background: 'rgba(251,191,36,0.10)',  border: '1px solid rgba(251,191,36,0.20)' }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? '#34D399' : '#FBBF24' }} />
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

function PlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function AgentsPage() {
  const admin = createAdminClient()

  // Fetch agents + profile-agent links + latest subscriptions in parallel
  const [agentsRes, profilesRes, subsRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any).from('sales_agents')
      .select('id, name, email, phone, territory, commission_rate, status, created_at')
      .order('created_at', { ascending: false }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any).from('profiles')
      .select('id, agent_id')
      .not('agent_id', 'is', null),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any).from('subscriptions')
      .select('user_id, plan, status, amount, custom_amount')
      .order('created_at', { ascending: false }),
  ])

  const agents   = (agentsRes.data   as RawAgent[]   | null) ?? []
  const profiles = (profilesRes.data as RawProfile[] | null) ?? []
  const subs     = (subsRes.data     as RawSub[]     | null) ?? []

  // Latest sub per user (rows already ordered newest-first)
  const subByUser: Record<string, RawSub> = {}
  subs.forEach(s => {
    if (s.user_id && !subByUser[s.user_id]) subByUser[s.user_id] = s
  })

  // Client user IDs grouped by agent_id
  const clientsByAgent: Record<string, string[]> = {}
  profiles.forEach(p => {
    if (!p.agent_id) return
    if (!clientsByAgent[p.agent_id]) clientsByAgent[p.agent_id] = []
    clientsByAgent[p.agent_id].push(p.id)
  })

  // Per-agent stats
  type AgentRow = RawAgent & { clientCount: number; totalMrr: number; commission: number }
  const rows: AgentRow[] = agents.map(agent => {
    const userIds = clientsByAgent[agent.id] ?? []
    let activeCount = 0
    let totalMrr    = 0

    userIds.forEach(uid => {
      const sub = subByUser[uid]
      if (!sub || sub.status !== 'active') return
      activeCount++
      totalMrr += calcMrr(sub.plan, sub.amount, sub.custom_amount)
    })

    const rate       = typeof agent.commission_rate === 'number' ? agent.commission_rate : parseFloat(String(agent.commission_rate))
    const commission = Math.round(totalMrr * rate / 100)

    return { ...agent, clientCount: activeCount, totalMrr, commission }
  })

  const totalCommissions = rows
    .filter(r => r.status === 'active')
    .reduce((sum, r) => sum + r.commission, 0)

  return (
    <div className="p-6 space-y-6 max-w-5xl">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Agents</h1>
          <p className="font-sans text-sm text-white/40 mt-0.5">Sales agents and their commission overview</p>
        </div>
        <Link
          href="/admin/agents/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-sans text-sm font-semibold transition-all active:scale-[0.97]"
          style={{ background: '#2B5CE6', color: '#fff' }}
        >
          <PlusIcon />
          Add Agent
        </Link>
      </div>

      {/* Summary card */}
      <div
        className="rounded-2xl p-5 flex items-center justify-between gap-4"
        style={{ background: 'rgba(43,92,230,0.08)', border: '1px solid rgba(43,92,230,0.18)' }}
      >
        <div>
          <p className="font-sans text-xs text-white/40 uppercase tracking-wider">Total Commissions Owed This Month</p>
          <p className="font-display text-3xl font-bold text-white mt-1">€{totalCommissions.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="font-sans text-xs text-white/30">{rows.filter(r => r.status === 'active').length} active agents</p>
          <p className="font-sans text-xs text-white/30 mt-0.5">{rows.reduce((s, r) => s + r.clientCount, 0)} total active clients</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#141720] border border-white/[0.06] rounded-2xl overflow-hidden">

        {/* Table header */}
        <div className="px-5 py-3.5 border-b border-white/[0.06] hidden sm:grid"
          style={{ gridTemplateColumns: '1fr 1fr 130px 90px 80px 90px 110px 90px' }}
        >
          {['Name', 'Territory', 'Email', 'Rate', 'Clients', 'MRR', 'Commission', 'Status'].map(h => (
            <p key={h} className="font-sans text-[11px] font-semibold text-white/30 uppercase tracking-wider">{h}</p>
          ))}
        </div>

        {rows.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-sans text-sm text-white/25">No agents yet</p>
            <p className="font-sans text-xs text-white/15 mt-1">Add your first agent to start tracking commissions</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {rows.map(agent => (
              <div key={agent.id} className="px-5 py-3.5 hover:bg-white/[0.018] transition-colors">

                {/* Mobile layout */}
                <div className="sm:hidden space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/admin/agents/${agent.id}`}>
                        <span className="font-sans text-sm font-medium text-white hover:text-blue-400 cursor-pointer">{agent.name}</span>
                      </Link>
                      <p className="font-sans text-xs text-white/40 mt-0.5">{agent.email}</p>
                      {agent.territory && (
                        <p className="font-sans text-xs text-white/30 mt-0.5">{agent.territory}</p>
                      )}
                    </div>
                    <StatusBadge status={agent.status} />
                  </div>
                  <div className="flex gap-4 flex-wrap">
                    <span className="font-sans text-xs text-white/40">Rate: <span className="text-white/70">{agent.commission_rate}%</span></span>
                    <span className="font-sans text-xs text-white/40">Clients: <span className="text-white/70">{agent.clientCount}</span></span>
                    <span className="font-sans text-xs text-white/40">MRR: <span className="text-white/70">€{agent.totalMrr}</span></span>
                    <span className="font-sans text-xs text-white/40">Commission: <span className="text-[#34D399] font-semibold">€{agent.commission}</span></span>
                  </div>
                </div>

                {/* Desktop layout */}
                <div className="hidden sm:grid items-center gap-3"
                  style={{ gridTemplateColumns: '1fr 1fr 130px 90px 80px 90px 110px 90px' }}
                >
                  <div className="min-w-0">
                    <Link href={`/admin/agents/${agent.id}`}>
                      <span className="font-sans text-sm font-medium text-white hover:text-blue-400 cursor-pointer truncate block">{agent.name}</span>
                    </Link>
                    {agent.phone && (
                      <p className="font-sans text-xs text-white/30 mt-0.5 truncate">{agent.phone}</p>
                    )}
                  </div>
                  <p className="font-sans text-sm text-white/55 truncate">{agent.territory ?? '—'}</p>
                  <p className="font-sans text-xs text-white/40 truncate">{agent.email}</p>
                  <p className="font-sans text-sm text-white/70">{agent.commission_rate}%</p>
                  <p className="font-sans text-sm text-white/70">{agent.clientCount}</p>
                  <p className="font-sans text-sm text-white/70">€{agent.totalMrr.toLocaleString()}</p>
                  <p className="font-sans text-sm font-semibold" style={{ color: '#34D399' }}>
                    €{agent.commission.toLocaleString()}
                  </p>
                  <StatusBadge status={agent.status} />
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
