import { createAdminClient } from '@/lib/supabase/admin'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Admin — Subscriptions' }

type RawSub     = { id: string; created_at: string; status: string | null; plan: string | null; next_billing_date: string | null; user_id: string | null; amount: number | null }
type RawProfile = { id: string; full_name: string | null; email: string }

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtAmount(amount: number | null) {
  if (amount === null) return '—'
  return `€${(amount / 100).toFixed(2)}`
}

function StatusBadge({ status }: { status: string | null }) {
  const s = status?.toLowerCase()
  const styles =
    s === 'active'    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
    s === 'suspended' ? 'bg-amber-500/10  text-amber-400  border-amber-500/20'    :
    s === 'cancelled' ? 'bg-red-500/10    text-red-400    border-red-500/20'       :
                        'bg-white/[0.05]  text-white/40   border-white/[0.08]'
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border font-sans', styles)}>
      {status ?? 'Unknown'}
    </span>
  )
}

function PlanBadge({ plan }: { plan: string | null }) {
  const p = plan?.toLowerCase()
  const isPro = p?.includes('pro')
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border font-sans',
      isPro
        ? 'bg-[#2B5CE6]/15 text-[#6B8FF0] border-[#2B5CE6]/25'
        : 'bg-white/[0.05] text-white/50 border-white/[0.08]',
    )}>
      {plan ?? 'Unknown'}
    </span>
  )
}

function BillingPeriod({ plan }: { plan: string | null }) {
  const p = plan?.toLowerCase() ?? ''
  if (p.includes('year')) return <span className="font-sans text-xs text-white/60">Yearly</span>
  if (p.includes('month')) return <span className="font-sans text-xs text-white/60">Monthly</span>
  return <span className="font-sans text-xs text-white/25">—</span>
}

export default async function AdminSubscriptionsPage() {
  const admin = createAdminClient()

  const [{ data: rawSubs }, { data: rawProfiles }] = await Promise.all([
    admin.from('subscriptions').select('id, created_at, status, plan, next_billing_date, user_id, amount').order('created_at', { ascending: false }),
    admin.from('profiles').select('id, full_name, email').neq('role', 'admin'),
  ])

  const profileById: Record<string, RawProfile> = {}
  ;(rawProfiles as RawProfile[] | null)?.forEach(p => { profileById[p.id] = p })

  const subs = (rawSubs as RawSub[] | null) ?? []
  const activeMrr = subs
    .filter(s => s.status?.toLowerCase() === 'active')
    .reduce((sum, s) => sum + (s.amount ?? 0), 0)

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
        {subs.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-sans text-sm text-white/25">No subscriptions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Client', 'Plan', 'Billing Period', 'Status', 'Amount', 'Next Billing', 'Subscription ID'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/35 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subs.map(sub => {
                  const profile = sub.user_id ? (profileById[sub.user_id] ?? null) : null
                  return (
                    <tr key={sub.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                      {/* Client */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {profile ? (
                          <div>
                            <p className="font-sans text-white/85 font-medium text-xs">{profile.full_name ?? '—'}</p>
                            <p className="font-sans text-white/35 text-[11px] mt-0.5">{profile.email}</p>
                          </div>
                        ) : (
                          <span className="text-white/25 text-xs">Unknown</span>
                        )}
                      </td>

                      {/* Plan */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <PlanBadge plan={sub.plan} />
                      </td>

                      {/* Billing period */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <BillingPeriod plan={sub.plan} />
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <StatusBadge status={sub.status} />
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-sans text-xs font-semibold text-white/80 tabular-nums">
                          {fmtAmount(sub.amount)}
                        </span>
                      </td>

                      {/* Next billing */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-sans text-xs text-white/50">{fmtDate(sub.next_billing_date)}</span>
                      </td>

                      {/* Subscription ID */}
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-[11px] text-white/30" title={sub.id}>
                          {sub.id.substring(0, 8)}…
                        </span>
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
