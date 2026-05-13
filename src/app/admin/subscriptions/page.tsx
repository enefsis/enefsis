export const revalidate = 0
export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'
import { SubscriptionsTable, type SubRow } from './subscriptions-table'

export const metadata = { title: 'Admin — Subscriptions' }

type RawSub     = { id: string; created_at: string; status: string | null; plan: string | null; next_billing_date: string | null; user_id: string | null; amount: number | null; custom_amount: number | null }
type RawProfile = { id: string; full_name: string | null; email: string }

const PLAN_MONTHLY: Record<string, number> = {
  basic_monthly: 49,
  basic_yearly:  499 / 12,
  pro_monthly:   100,
  pro_yearly:    900 / 12,
  basic:         49,
  pro:           100,
}

function subMonthly(s: RawSub): number {
  if (s.custom_amount != null) return s.custom_amount
  return PLAN_MONTHLY[s.plan ?? ''] ?? s.amount ?? 0
}

function fmtAmount(amount: number | null) {
  if (amount === null) return '—'
  return `€${amount.toFixed(2)}`
}

export default async function AdminSubscriptionsPage() {
  const admin = createAdminClient()

  const [{ data: rawSubs }, { data: rawProfiles }] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin.from('subscriptions') as any).select('id, created_at, status, plan, next_billing_date, user_id, amount, custom_amount').order('created_at', { ascending: false }),
    admin.from('profiles').select('id, full_name, email').neq('role', 'admin'),
  ])

  const profileById: Record<string, RawProfile> = {}
  ;(rawProfiles as RawProfile[] | null)?.forEach(p => { profileById[p.id] = p })

  const subs = (rawSubs as RawSub[] | null) ?? []
  const activeMrr = Math.round(
    subs.filter(s => s.status?.toLowerCase() === 'active')
      .reduce((sum, s) => sum + subMonthly(s), 0),
  )

  const rows: SubRow[] = subs.map(sub => {
    const profile = sub.user_id ? (profileById[sub.user_id] ?? null) : null
    return {
      id:             sub.id,
      userId:         sub.user_id,
      plan:           sub.plan,
      status:         sub.status,
      amount:         sub.amount,
      customAmount:   sub.custom_amount,
      nextBillingDate: sub.next_billing_date,
      createdAt:      sub.created_at,
      profile:        profile ? { fullName: profile.full_name, email: profile.email } : null,
    }
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Subscriptions</h1>
          <p className="font-sans text-sm text-white/40 mt-0.5">
            {subs.length} {subs.length === 1 ? 'subscription' : 'subscriptions'} total
          </p>
        </div>
        <div className="text-right">
          <p className="font-sans text-xs text-white/35 uppercase tracking-wider">Active MRR</p>
          <p className="font-display text-xl font-bold text-white mt-0.5">{fmtAmount(activeMrr)}</p>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-[#141720] border border-white/[0.06] rounded-2xl overflow-hidden">
        <SubscriptionsTable subs={rows} />
      </div>
    </div>
  )
}
