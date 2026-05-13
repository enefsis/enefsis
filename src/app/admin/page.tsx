import { createAdminClient } from '@/lib/supabase/admin'
import { StatCard } from '@/components/dashboard/stat-card'
import { ClientsTable, type ClientRow } from '@/components/admin/clients-table'

export const metadata = { title: 'Admin — Overview' }

function calcChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

type RawProfile = {
  id: string
  full_name: string | null
  email: string
  created_at: string
}

type RawSubscription = {
  id: string
  user_id: string | null
  plan: string | null
  status: string | null
  amount: number | null
  custom_amount: number | null
  created_at: string
}

type RawTapEvent = {
  user_id: string | null
}

type RawMrrRow = {
  plan: string | null
  amount: number | null
  custom_amount: number | null
}

const PLAN_MONTHLY: Record<string, number> = {
  basic_monthly: 49,
  basic_yearly:  499 / 12,
  pro_monthly:   100,
  pro_yearly:    900 / 12,
  basic:         49,
  pro:           100,
}

function rowMonthly(row: RawMrrRow): number {
  if (row.custom_amount != null) return row.custom_amount
  if (row.plan && PLAN_MONTHLY[row.plan] !== undefined) return PLAN_MONTHLY[row.plan]
  return row.amount ?? 0
}

export default async function AdminPage() {
  const supabase = createAdminClient()

  const now    = new Date()
  const d30    = new Date(now.getTime() - 30 * 86_400_000).toISOString()
  const d60    = new Date(now.getTime() - 60 * 86_400_000).toISOString()
  const nowIso = now.toISOString()

  const [
    { count: totalClients },
    { count: newClientsCur },
    { count: newClientsPrev },
    { count: activeSubs },
    { count: newSubsCur },
    { count: newSubsPrev },
    { data: mrrRaw },
    { count: tapsCur },
    { count: tapsPrev },
    { data: rawProfiles },
    { data: rawSubscriptions },
    { data: rawClientTaps },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin').gte('created_at', d30).lte('created_at', nowIso),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin').gte('created_at', d60).lt('created_at', d30),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active').gte('created_at', d30).lte('created_at', nowIso),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active').gte('created_at', d60).lt('created_at', d30),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('subscriptions') as any).select('plan, amount, custom_amount').eq('status', 'active'),
    supabase.from('tap_events').select('*', { count: 'exact', head: true }).gte('created_at', d30).lte('created_at', nowIso),
    supabase.from('tap_events').select('*', { count: 'exact', head: true }).gte('created_at', d60).lt('created_at', d30),
    // Clients table: full profile list
    supabase.from('profiles').select('id, full_name, email, created_at').neq('role', 'admin').order('created_at', { ascending: false }),
    // Clients table: all subscriptions (latest per user resolved in JS)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('subscriptions') as any).select('id, user_id, plan, status, amount, custom_amount, created_at').order('created_at', { ascending: false }),
    // Clients table: per-user tap counts for last 30 days
    supabase.from('tap_events').select('user_id').gte('created_at', d30).lte('created_at', nowIso),
  ])

  // ── Stat card values ──────────────────────────────────────────────────────
  const mrr = Math.round(
    (mrrRaw as RawMrrRow[] | null)
      ?.reduce((sum, row) => sum + rowMonthly(row), 0) ?? 0,
  )

  const stats = [
    { label: 'Total Clients',             value: totalClients ?? 0, change: calcChange(newClientsCur ?? 0, newClientsPrev ?? 0), icon: 'clients'       as const },
    { label: 'Active Subscriptions',      value: activeSubs   ?? 0, change: calcChange(newSubsCur    ?? 0, newSubsPrev    ?? 0), icon: 'subscriptions' as const },
    { label: 'Monthly Recurring Revenue', value: mrr,                   change: 0,                                             icon: 'revenue'       as const, prefix: '€' },
    { label: 'Total Taps — Last 30 Days', value: tapsCur      ?? 0, change: calcChange(tapsCur       ?? 0, tapsPrev       ?? 0), icon: 'tap'           as const },
  ]

  // ── Clients table data ────────────────────────────────────────────────────

  // Latest subscription per user (rows already ordered newest-first)
  const subByUser: Record<string, RawSubscription> = {}
  ;(rawSubscriptions as RawSubscription[] | null)?.forEach(sub => {
    if (sub.user_id && !subByUser[sub.user_id]) {
      subByUser[sub.user_id] = sub
    }
  })

  // Tap count per user for last 30 days
  const tapsByUser: Record<string, number> = {}
  ;(rawClientTaps as RawTapEvent[] | null)?.forEach(row => {
    if (row.user_id) {
      tapsByUser[row.user_id] = (tapsByUser[row.user_id] ?? 0) + 1
    }
  })

  const clients: ClientRow[] = (rawProfiles as RawProfile[] | null)?.map(p => {
    const sub = subByUser[p.id] ?? null
    return {
      id:     p.id,
      name:   p.full_name,
      email:  p.email,
      joined: p.created_at,
      taps30d: tapsByUser[p.id] ?? 0,
      subscription: sub
        ? { id: sub.id, plan: sub.plan, status: sub.status, amount: sub.amount, custom_amount: sub.custom_amount }
        : null,
    }
  }) ?? []

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Overview</h1>
        <p className="font-sans text-sm text-white/40 mt-0.5">Platform-wide summary</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(s => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Clients table */}
      <div className="bg-[#141720] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h2 className="font-display font-semibold text-white text-base">Clients</h2>
            <p className="font-sans text-xs text-white/35 mt-0.5">
              {clients.length} {clients.length === 1 ? 'client' : 'clients'} total
            </p>
          </div>
        </div>
        <ClientsTable clients={clients} />
      </div>
    </div>
  )
}
