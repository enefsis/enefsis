export const revalidate = 0
export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'
import { NfcStandsClient, type ClientGroup } from './nfc-stands-client'

export const metadata = { title: 'Admin — NFC Stands' }

type RawStand   = { id: string; created_at: string; name: string | null; landing_page_url: string; user_id: string | null }
type RawProfile = { id: string; full_name: string | null; email: string }
type RawPage    = { user_id: string; slug: string | null }

export default async function AdminNfcStandsPage() {
  const admin = createAdminClient()

  const [{ data: rawStands }, { data: rawProfiles }, { data: rawPages }] = await Promise.all([
    admin.from('nfc_stands').select('id, created_at, name, landing_page_url, user_id').order('created_at', { ascending: true }),
    admin.from('profiles').select('id, full_name, email').neq('role', 'admin').order('created_at', { ascending: false }),
    admin.from('client_pages').select('user_id, slug'),
  ])

  const stands   = (rawStands   as RawStand[]   | null) ?? []
  const profiles = (rawProfiles as RawProfile[] | null) ?? []
  const pages    = (rawPages    as RawPage[]    | null) ?? []

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  // Default landing URL per user (from their published slug)
  const defaultUrlByUser: Record<string, string> = {}
  pages.forEach(p => {
    if (p.slug) defaultUrlByUser[p.user_id] = `${appUrl}/p/${p.slug}`
  })

  // Group stands by user_id
  const standsByUser: Record<string, RawStand[]> = {}
  stands.forEach(s => {
    if (!s.user_id) return
    if (!standsByUser[s.user_id]) standsByUser[s.user_id] = []
    standsByUser[s.user_id].push(s)
  })

  // Build one group per profile (including clients with 0 stands)
  const groups: ClientGroup[] = profiles.map(p => ({
    userId:            p.id,
    name:              p.full_name,
    email:             p.email,
    defaultLandingUrl: defaultUrlByUser[p.id] ?? null,
    stands:            (standsByUser[p.id] ?? []).map(s => ({
      id:             s.id,
      name:           s.name,
      landingPageUrl: s.landing_page_url,
      createdAt:      s.created_at,
    })),
  }))

  // Sort: clients with most stands first
  groups.sort((a, b) => b.stands.length - a.stands.length)

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">NFC Stands</h1>
        <p className="font-sans text-sm text-white/40 mt-0.5">Manage NFC stands grouped by client</p>
      </div>

      <NfcStandsClient groups={groups} totalStands={stands.length} />
    </div>
  )
}
