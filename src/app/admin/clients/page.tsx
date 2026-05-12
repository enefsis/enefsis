import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { ClientsListTable, type ClientListRow } from '@/components/admin/clients-list-table'

export const metadata = { title: 'Admin — Clients' }

type RawProfile = { id: string; full_name: string | null; email: string; created_at: string }
type RawSub     = { id: string; user_id: string | null; plan: string | null; status: string | null; amount: number | null }
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
    admin.from('subscriptions').select('id, user_id, plan, status, amount').order('created_at', { ascending: false }),
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

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

      {/* Table card */}
      <div className="bg-[#141720] border border-white/[0.06] rounded-2xl overflow-hidden">
        <ClientsListTable clients={clients} />
      </div>
    </div>
  )
}
