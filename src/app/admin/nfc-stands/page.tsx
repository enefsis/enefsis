import { createAdminClient } from '@/lib/supabase/admin'
import { CopyButton } from '@/components/admin/copy-button'

export const metadata = { title: 'Admin — NFC Stands' }

type RawStand   = { id: string; created_at: string; name: string | null; landing_page_url: string; user_id: string | null }
type RawProfile = { id: string; full_name: string | null; email: string }

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function AdminNfcStandsPage() {
  const admin = createAdminClient()

  const [{ data: rawStands }, { data: rawProfiles }] = await Promise.all([
    admin.from('nfc_stands').select('id, created_at, name, landing_page_url, user_id').order('created_at', { ascending: false }),
    admin.from('profiles').select('id, full_name, email').neq('role', 'admin'),
  ])

  const profileById: Record<string, RawProfile> = {}
  ;(rawProfiles as RawProfile[] | null)?.forEach(p => { profileById[p.id] = p })

  const stands = (rawStands as RawStand[] | null) ?? []

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-white">NFC Stands</h1>
        <p className="font-sans text-sm text-white/40 mt-0.5">
          {stands.length} {stands.length === 1 ? 'stand' : 'stands'} total
        </p>
      </div>

      {/* Table card */}
      <div className="bg-[#141720] border border-white/[0.06] rounded-2xl overflow-hidden">
        {stands.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-sans text-sm text-white/25">No NFC stands found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Stand ID', 'Client', 'Stand Name / Location', 'Landing Page URL', 'Created'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/35 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stands.map(stand => {
                  const profile = stand.user_id ? (profileById[stand.user_id] ?? null) : null
                  return (
                    <tr key={stand.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                      {/* Stand ID */}
                      <td className="px-5 py-3.5 font-mono text-xs text-white/40 whitespace-nowrap">
                        {stand.id.substring(0, 8)}…
                      </td>

                      {/* Client */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {profile ? (
                          <div>
                            <p className="font-sans text-white/85 font-medium text-xs">
                              {profile.full_name ?? '—'}
                            </p>
                            <p className="font-sans text-white/35 text-[11px] mt-0.5">{profile.email}</p>
                          </div>
                        ) : (
                          <span className="text-white/25 text-xs">Unknown</span>
                        )}
                      </td>

                      {/* Stand name */}
                      <td className="px-5 py-3.5">
                        <span className="font-sans text-white/70 text-xs">
                          {stand.name ?? <span className="text-white/25">—</span>}
                        </span>
                      </td>

                      {/* Landing page URL */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <a
                            href={stand.landing_page_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[11px] text-[#2B5CE6] hover:underline truncate max-w-[220px]"
                          >
                            {stand.landing_page_url}
                          </a>
                          <CopyButton text={stand.landing_page_url} />
                        </div>
                      </td>

                      {/* Created */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-sans text-xs text-white/40">{fmt(stand.created_at)}</span>
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
