import Link from 'next/link'
import { cn } from '@/lib/utils'
import { toggleSubscriptionStatus } from '@/actions/admin'

export interface ClientRow {
  id: string
  name: string | null
  email: string
  joined: string
  taps30d: number
  subscription: {
    id: string
    plan: string | null
    status: string | null
    amount: number | null
    custom_amount: number | null
  } | null
}

function initials(name: string | null, email: string): string {
  return (name ?? email).charAt(0).toUpperCase()
}

function fmtPlan(plan: string) {
  return plan.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function PlanBadge({ plan }: { plan: string | null }) {
  if (!plan) return <span className="font-sans text-xs text-white/25">—</span>
  const isPro = plan.toLowerCase().startsWith('pro')
  return (
    <span
      className={cn(
        'inline-flex text-[11px] font-sans font-semibold px-2 py-0.5 rounded-md border',
        isPro
          ? 'bg-[#2B5CE6]/15 text-[#2B5CE6] border-[#2B5CE6]/20'
          : 'bg-white/[0.05] text-white/55 border-white/[0.08]',
      )}
    >
      {fmtPlan(plan)}
    </span>
  )
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="font-sans text-xs text-white/25">—</span>
  const isActive = status.toLowerCase() === 'active'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-sans font-medium',
        isActive ? 'text-emerald-400' : 'text-red-400',
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full shrink-0',
          isActive ? 'bg-emerald-400' : 'bg-red-400',
        )}
      />
      {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
    </span>
  )
}

const HEADERS = ['Client', 'Plan', 'Status', 'Taps (30d)', 'MRR', 'Joined', 'Actions']

export function ClientsTable({ clients }: { clients: ClientRow[] }) {
  if (clients.length === 0) {
    return (
      <div className="py-16 flex items-center justify-center">
        <p className="font-sans text-sm text-white/25">No clients yet</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {HEADERS.map(h => (
              <th
                key={h}
                className="px-4 py-3 text-left text-[11px] font-sans font-medium text-white/30 uppercase tracking-wider whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {clients.map(client => {
            const sub      = client.subscription
            const isActive = sub?.status?.toLowerCase() === 'active'

            return (
              <tr
                key={client.id}
                className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
              >
                {/* Client */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#2B5CE6]/20 flex items-center justify-center shrink-0">
                      <span className="font-display text-xs font-bold text-[#2B5CE6]">
                        {initials(client.name, client.email)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      {client.name && (
                        <p className="font-sans text-sm font-medium text-white/85 truncate leading-tight">
                          {client.name}
                        </p>
                      )}
                      <p className="font-sans text-xs text-white/40 truncate">
                        {client.email}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Plan */}
                <td className="px-4 py-3.5">
                  <PlanBadge plan={sub?.plan ?? null} />
                </td>

                {/* Status */}
                <td className="px-4 py-3.5">
                  <StatusBadge status={sub?.status ?? null} />
                </td>

                {/* Taps 30d */}
                <td className="px-4 py-3.5">
                  <span className="font-sans text-white/65 tabular-nums">
                    {client.taps30d.toLocaleString()}
                  </span>
                </td>

                {/* MRR */}
                <td className="px-4 py-3.5">
                  <span className="font-sans text-white/65 tabular-nums">
                    {(() => {
                      const v = sub?.custom_amount ?? sub?.amount
                      if (v == null) return '—'
                      const isYearly = sub?.plan?.endsWith('_yearly') ?? false
                      const monthly  = isYearly ? v / 12 : v
                      return `€${Number.isInteger(monthly) ? monthly : monthly.toFixed(2)}`
                    })()}
                  </span>
                </td>

                {/* Joined */}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span className="font-sans text-xs text-white/35">
                    {new Date(client.joined).toLocaleDateString('en-US', {
                      year:  'numeric',
                      month: 'short',
                      day:   'numeric',
                    })}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/clients/${client.id}`}
                      className="px-2.5 py-1 rounded-md text-xs font-sans font-medium text-white/45 border border-white/[0.08] hover:text-white/75 hover:border-white/[0.16] transition-colors"
                    >
                      View
                    </Link>

                    {sub && (
                      <form action={toggleSubscriptionStatus}>
                        <input type="hidden" name="subscriptionId" value={sub.id} />
                        <input type="hidden" name="newStatus" value={isActive ? 'suspended' : 'active'} />
                        <button
                          type="submit"
                          className={cn(
                            'px-2.5 py-1 rounded-md text-xs font-sans font-medium border transition-colors',
                            isActive
                              ? 'text-red-400 border-red-500/20 hover:bg-red-500/[0.08]'
                              : 'text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/[0.08]',
                          )}
                        >
                          {isActive ? 'Suspend' : 'Activate'}
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
