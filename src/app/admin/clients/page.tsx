export const revalidate = 0
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { ClientsListTable, type ClientListRow } from '@/components/admin/clients-list-table'
import { ExportCsvButton, type CsvClientRow } from '@/components/admin/export-csv-button'

export const metadata = { title: 'Admin — Clients' }

type RawProfile = { id: string; full_name: string | null; email: string; created_at: string }
type RawSub     = { id: string; user_id: string | null; plan: string | null; status: string | null; amount: number | null; custom_amount: number | null }
type RawPage    = { user_id: string; slug: string | null; restaurant_name: string | null }
type RawStand   = { user_id: string | null }

export default async function AdminClientsPage() {
  const admin = createAdminClient()

  const [
    { data: rawProfiles },
    { data: rawSubs },
    { data: rawPages },
    { data: rawStands },
  ] = await Promise.all([
    admin.from('profiles').select('id, full_name, email, created_at').neq('role', 'admin').order('created_at', { ascending: false }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any).from('subscriptions').select('id, user_id, plan, status, amount, custom_amount').order('created_at', { ascending: false }),
    admin.from('client_pages').select('user_id, slug, restaurant_name'),
    admin.from('nfc_stands').select('user_id'),
  ])

  // Latest sub per user (rows already ordered newest-first)
  const subByUser: Record<string, RawSub> = {}
  ;(rawSubs as RawSub[] | null)?.forEach(s => {
    if (s.user_id && !subByUser[s.user_id]) subByUser[s.user_id] = s
  })

  // client_pages per user
  const pageByUser: Record<string, RawPage> = {}
  ;(rawPages as RawPage[] | null)?.forEach(p => {
    pageByUser[p.user_id] = p
  })

  // NFC stand count per user
  const standCountByUser: Record<string, number> = {}
  ;(rawStands as RawStand[] | null)?.forEach(s => {
    if (s.user_id) standCountByUser[s.user_id] = (standCountByUser[s.user_id] ?? 0) + 1
  })

  const appUrl = process.env.NEXT_PUBLIC_TAP_URL ?? 'http://localhost:3000'

  const PLAN_MONTHLY: Record<string, number> = {
    basic_monthly: 49, basic_yearly: 499 / 12,
    pro_monthly: 100,  pro_yearly: 900 / 12,
    basic: 49,         pro: 100,
  }
  const PLAN_YEARLY: Record<string, number> = {
    basic_monthly: 49 * 12, basic_yearly: 499,
    pro_monthly: 100 * 12,  pro_yearly: 900,
    basic: 49 * 12,         pro: 100 * 12,
  }
  function calcMrr(plan: string | null, amount: number | null, custom: number | null): number {
    const yearly = plan?.endsWith('_yearly') ?? false
    if (custom != null) return yearly ? Math.round(custom / 12) : custom
    if (plan && PLAN_MONTHLY[plan] !== undefined) return Math.round(PLAN_MONTHLY[plan])
    return yearly ? Math.round((amount ?? 0) / 12) : (amount ?? 0)
  }
  function calcArr(plan: string | null, amount: number | null, custom: number | null): number {
    const yearly = plan?.endsWith('_yearly') ?? false
    if (custom != null) return yearly ? custom : custom * 12
    if (plan && PLAN_YEARLY[plan] !== undefined) return Math.round(PLAN_YEARLY[plan])
    return yearly ? (amount ?? 0) : (amount ?? 0) * 12
  }
  function fmtPlanLabel(plan: string | null): string {
    if (!plan) return ''
    return plan.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }

  const clients: ClientListRow[] = (rawProfiles as RawProfile[] | null)?.map(p => {
    const sub  = subByUser[p.id] ?? null
    const page = pageByUser[p.id] ?? null
    return {
      id:           p.id,
      name:         p.full_name,
      email:        p.email,
      businessName: page?.restaurant_name ?? null,
      slug:         page?.slug ?? null,
      nfcCount:     standCountByUser[p.id] ?? 0,
      joined:       p.created_at,
      landingUrl:   page?.slug ? `${appUrl}/p/${page.slug}` : null,
      subscription: sub
        ? { id: sub.id, plan: sub.plan, status: sub.status, amount: sub.amount }
        : null,
    }
  }) ?? []

  const csvRows: CsvClientRow[] = (rawProfiles as RawProfile[] | null)?.map(p => {
    const sub  = subByUser[p.id] ?? null
    const page = pageByUser[p.id] ?? null
    const active = sub?.status?.toLowerCase() === 'active'
    return {
      name:       p.full_name ?? '',
      email:      p.email,
      business:   page?.restaurant_name ?? '',
      plan:       fmtPlanLabel(sub?.plan ?? null),
      status:     sub?.status ?? '',
      mrr:        active ? calcMrr(sub?.plan ?? null, sub?.amount ?? null, sub?.custom_amount ?? null) : 0,
      arr:        active ? calcArr(sub?.plan ?? null, sub?.amount ?? null, sub?.custom_amount ?? null) : 0,
      nfcStands:  standCountByUser[p.id] ?? 0,
      joined:     p.created_at.slice(0, 10),
      landingUrl: page?.slug ? `${appUrl}/p/${page.slug}` : '',
    }
  }) ?? []

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Clients</h1>
          <p className="font-sans text-sm text-white/40 mt-0.5">
            {clients.length} {clients.length === 1 ? 'client' : 'clients'} total
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <ExportCsvButton rows={csvRows} />
          <Link
            href="/admin/clients/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2B5CE6] hover:bg-[#2B5CE6]/90 text-white text-sm font-sans font-semibold transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 1.75v10.5M1.75 7h10.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
            </svg>
            Add New Client
          </Link>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-[#141720] border border-white/[0.06] rounded-2xl overflow-hidden">
        <ClientsListTable clients={clients} />
      </div>
    </div>
  )
}
