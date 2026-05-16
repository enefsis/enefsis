export const revalidate = 0
export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'
import { StatCard } from '@/components/dashboard/stat-card'
import { ClientsTable, type ClientRow } from '@/components/admin/clients-table'
import { RevenueChart, type RevenueMonth } from '@/components/admin/revenue-chart'

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
  user_id:    string | null
  visitor_id: string | null
}

type RawMrrRow = {
  user_id: string | null
  plan: string | null
  amount: number | null
  custom_amount: number | null
  created_at: string
}

const PLAN_MONTHLY: Record<string, number> = {
  basic_monthly: 49,
  basic_yearly:  499 / 12,
  pro_monthly:   100,
  pro_yearly:    900 / 12,
  basic:         49,
  pro:           100,
}

const PLAN_YEARLY: Record<string, number> = {
  basic_monthly: 49 * 12,
  basic_yearly:  499,
  pro_monthly:   100 * 12,
  pro_yearly:    900,
  basic:         49 * 12,
  pro:           100 * 12,
}

function rowMonthly(row: RawMrrRow): number {
  const isYearly = row.plan?.endsWith('_yearly') ?? false
  if (row.custom_amount != null) return isYearly ? row.custom_amount / 12 : row.custom_amount
  if (row.plan && PLAN_MONTHLY[row.plan] !== undefined) return PLAN_MONTHLY[row.plan]
  return isYearly ? (row.amount ?? 0) / 12 : (row.amount ?? 0)
}

function rowAnnual(row: RawMrrRow): number {
  const isYearly = row.plan?.endsWith('_yearly') ?? false
  if (row.custom_amount != null) return isYearly ? row.custom_amount : row.custom_amount * 12
  if (row.plan && PLAN_YEARLY[row.plan] !== undefined) return PLAN_YEARLY[row.plan]
  return isYearly ? (row.amount ?? 0) : (row.amount ?? 0) * 12
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
    { data: earliestProfileRaw },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin').gte('created_at', d30).lte('created_at', nowIso),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin').gte('created_at', d60).lt('created_at', d30),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active').gte('created_at', d30).lte('created_at', nowIso),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active').gte('created_at', d60).lt('created_at', d30),
    // MRR rows — include user_id + created_at for historical chart
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('subscriptions') as any).select('user_id, plan, amount, custom_amount, created_at').eq('status', 'active'),
    supabase.from('tap_events').select('*', { count: 'exact', head: true }).gte('created_at', d30).lte('created_at', nowIso),
    supabase.from('tap_events').select('*', { count: 'exact', head: true }).gte('created_at', d60).lt('created_at', d30),
    // Clients table: full profile list
    supabase.from('profiles').select('id, full_name, email, created_at').neq('role', 'admin').order('created_at', { ascending: false }),
    // Clients table: all subscriptions (latest per user resolved in JS)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('subscriptions') as any).select('id, user_id, plan, status, amount, custom_amount, created_at').order('created_at', { ascending: false }),
    // Clients table: per-user tap counts + visitor_ids for last 30 days
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from('tap_events').select('user_id, visitor_id').gte('created_at', d30).lte('created_at', nowIso),
    // Earliest client join date — chart start
    supabase.from('profiles').select('created_at').neq('role', 'admin').order('created_at', { ascending: true }).limit(1).maybeSingle(),
  ])

  // ── Revenue chart — monthly MRR from earliest client to today ───────────────
  const mrrRows = mrrRaw as RawMrrRow[] | null

  // ── Stat card values ──────────────────────────────────────────────────────
  const mrr = Math.round(mrrRows?.reduce((sum, row) => sum + rowMonthly(row), 0) ?? 0)
  const arr = Math.round(mrrRows?.reduce((sum, row) => sum + rowAnnual(row),  0) ?? 0)

  // Profile date lookup — used to pick the earlier of subscription vs join date
  const profileDateById: Record<string, string> = {}
  ;(rawProfiles as RawProfile[] | null)?.forEach(p => { profileDateById[p.id] = p.created_at })

  const earliestIso = (earliestProfileRaw as { created_at: string } | null)?.created_at ?? nowIso
  const chartStart  = new Date(new Date(earliestIso).getFullYear(), new Date(earliestIso).getMonth(), 1)
  const chartNow    = new Date(now.getFullYear(), now.getMonth(), 1)

  const revenueData: RevenueMonth[] = []
  const cursor = new Date(chartStart)
  while (cursor <= chartNow) {
    const monthEndIso = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59, 999).toISOString()
    const monthMrr = Math.round(
      (mrrRows ?? [])
        .filter(r => {
          const profileDate   = r.user_id ? (profileDateById[r.user_id] ?? r.created_at) : r.created_at
          const effectiveStart = profileDate < r.created_at ? profileDate : r.created_at
          return effectiveStart <= monthEndIso
        })
        .reduce((sum, row) => sum + rowMonthly(row), 0)
    )
    const label = cursor.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }).replace(' ', " '")
    const isCurrent = cursor.getFullYear() === now.getFullYear() && cursor.getMonth() === now.getMonth()
    revenueData.push({ month: label, mrr: monthMrr, isCurrent })
    cursor.setMonth(cursor.getMonth() + 1)
  }

  const stats = [
    { label: 'Total Clients',             value: totalClients ?? 0, change: calcChange(newClientsCur ?? 0, newClientsPrev ?? 0), icon: 'clients'       as const },
    { label: 'Active Subscriptions',      value: activeSubs   ?? 0, change: calcChange(newSubsCur    ?? 0, newSubsPrev    ?? 0), icon: 'subscriptions' as const },
    { label: 'Monthly Recurring Revenue', value: mrr,               change: 0,                                                  icon: 'revenue'       as const, prefix: '€' },
    { label: 'Annual Recurring Revenue',  value: arr,               change: 0,                                                  icon: 'arr'           as const, prefix: '€' },
    { label: 'Total Taps — Last 30 Days', value: tapsCur ?? 0,      change: calcChange(tapsCur ?? 0, tapsPrev ?? 0),            icon: 'tap'           as const },
  ]

  // ── Clients table data ────────────────────────────────────────────────────

  // Latest subscription per user (rows already ordered newest-first)
  const subByUser: Record<string, RawSubscription> = {}
  ;(rawSubscriptions as RawSubscription[] | null)?.forEach(sub => {
    if (sub.user_id && !subByUser[sub.user_id]) {
      subByUser[sub.user_id] = sub
    }
  })

  // Tap count + unique visitor count per user for last 30 days
  const tapsByUser:        Record<string, number>      = {}
  const uniqueTapsByUser:  Record<string, Set<string>> = {}
  ;(rawClientTaps as RawTapEvent[] | null)?.forEach(row => {
    if (row.user_id) {
      tapsByUser[row.user_id] = (tapsByUser[row.user_id] ?? 0) + 1
      if (row.visitor_id) {
        if (!uniqueTapsByUser[row.user_id]) uniqueTapsByUser[row.user_id] = new Set()
        uniqueTapsByUser[row.user_id].add(row.visitor_id)
      }
    }
  })

  const clients: ClientRow[] = (rawProfiles as RawProfile[] | null)?.map(p => {
    const sub = subByUser[p.id] ?? null
    return {
      id:     p.id,
      name:   p.full_name,
      email:  p.email,
      joined: p.created_at,
      taps30d:       tapsByUser[p.id]             ?? 0,
      uniqueTaps30d: uniqueTapsByUser[p.id]?.size ?? 0,
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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

      {/* Revenue chart */}
      <RevenueChart data={revenueData} currentMrr={mrr} />
    </div>
  )
}
