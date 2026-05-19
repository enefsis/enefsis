export const revalidate = 0
export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'
import { StandOrdersTable, type StandOrderRow } from './stand-orders-client'

export const metadata = { title: 'Admin — Stand Orders' }

type RawOrder = {
  id:         string
  created_at: string
  user_id:    string | null
  quantity:   number
  amount:     number
  status:     string
}

type RawProfile = {
  id:        string
  full_name: string | null
  email:     string
}

export default async function AdminStandOrdersPage() {
  const admin = createAdminClient()

  const [{ data: rawOrders }, { data: rawProfiles }] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any)
      .from('stand_orders')
      .select('id, created_at, user_id, quantity, amount, status')
      .order('created_at', { ascending: false }),
    admin
      .from('profiles')
      .select('id, full_name, email')
      .neq('role', 'admin'),
  ])

  const profileById: Record<string, RawProfile> = {}
  ;(rawProfiles as RawProfile[] | null)?.forEach(p => { profileById[p.id] = p })

  const orders = ((rawOrders as RawOrder[] | null) ?? []).map(o => {
    const profile = o.user_id ? (profileById[o.user_id] ?? null) : null
    return {
      id:          o.id,
      createdAt:   o.created_at,
      userId:      o.user_id,
      quantity:    o.quantity,
      amount:      o.amount,
      status:      o.status,
      clientName:  profile?.full_name  ?? null,
      clientEmail: profile?.email      ?? null,
    } satisfies StandOrderRow
  })

  const pending   = orders.filter(o => o.status === 'pending').length
  const fulfilled = orders.filter(o => o.status === 'fulfilled').length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Stand Orders</h1>
          <p className="font-sans text-sm text-white/40 mt-0.5">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} total
          </p>
        </div>

        {/* Summary chips */}
        <div className="flex items-center gap-2">
          {pending > 0 && (
            <span
              className="font-sans text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{
                color:      '#F5A623',
                background: 'rgba(245,166,35,0.10)',
                border:     '1px solid rgba(245,166,35,0.22)',
              }}
            >
              {pending} pending
            </span>
          )}
          {fulfilled > 0 && (
            <span
              className="font-sans text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{
                color:      '#4ade80',
                background: 'rgba(74,222,128,0.10)',
                border:     '1px solid rgba(74,222,128,0.22)',
              }}
            >
              {fulfilled} fulfilled
            </span>
          )}
        </div>
      </div>

      {/* Table card */}
      <div className="bg-[#141720] border border-white/[0.06] rounded-2xl overflow-hidden">
        <StandOrdersTable orders={orders} />
      </div>
    </div>
  )
}
