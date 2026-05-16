import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { CopyButton } from '@/components/admin/copy-button'
import { PasswordForm } from './password-form'

export const metadata = { title: 'Settings' }

type StandRow = { id: string; name: string | null; landing_page_url: string }

export default async function DashboardSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  const [{ data: profileRaw }, { data: standsRaw }] = await Promise.all([
    admin
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .maybeSingle(),
    admin
      .from('nfc_stands')
      .select('id, name, landing_page_url')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true }),
  ])

  const profile = profileRaw as { full_name: string | null; email: string } | null
  const stands  = (standsRaw as StandRow[] | null) ?? []

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Settings</h1>
        <p className="font-sans text-sm text-white/40 mt-0.5">Manage your account</p>
      </div>

      {/* Profile — read only */}
      <div className="bg-[#141720] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h2 className="font-display font-semibold text-white text-sm">Profile</h2>
          <p className="font-sans text-xs text-white/35 mt-0.5">Contact support to update your name or email</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <p className="text-xs font-medium text-white/40 mb-1.5">Full Name</p>
            <div className="font-sans text-sm text-white/70 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5">
              {profile?.full_name ?? '—'}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-white/40 mb-1.5">Email Address</p>
            <div className="font-sans text-sm text-white/70 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5">
              {profile?.email ?? user.email ?? '—'}
            </div>
          </div>
          <p className="font-sans text-xs text-white/25">
            To update your details, email{' '}
            <a href="mailto:support@enefsis.com" className="text-[#2B5CE6] hover:underline">
              support@enefsis.com
            </a>
            .
          </p>
        </div>
      </div>

      {/* NFC Stands */}
      <div className="bg-[#141720] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h2 className="font-display font-semibold text-white text-sm">NFC Stands</h2>
          <p className="font-sans text-xs text-white/35 mt-0.5">
            {stands.length} {stands.length === 1 ? 'stand' : 'stands'} on your account
          </p>
        </div>
        <div className="px-6 py-5">
          {stands.length === 0 ? (
            <p className="font-sans text-sm text-white/25">
              No NFC stands assigned yet — contact your account manager.
            </p>
          ) : (
            <div className="space-y-3">
              {stands.map(stand => (
                <div
                  key={stand.id}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm font-medium text-white/80 truncate">
                      {stand.name ?? 'Unnamed Stand'}
                    </p>
                    <p className="font-mono text-[11px] text-white/30 mt-0.5 truncate">
                      {stand.landing_page_url}
                    </p>
                  </div>
                  <CopyButton text={stand.landing_page_url} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-[#141720] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h2 className="font-display font-semibold text-white text-sm">Change Password</h2>
          <p className="font-sans text-xs text-white/35 mt-0.5">Minimum 6 characters</p>
        </div>
        <div className="px-6 py-5">
          <PasswordForm />
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-[#141720] border border-red-500/[0.14] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-red-500/[0.10]">
          <h2 className="font-display font-semibold text-sm" style={{ color: 'rgba(248,113,113,0.7)' }}>
            Danger Zone
          </h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="font-sans text-sm font-medium text-white/70">Cancel Subscription</p>
              <p className="font-sans text-xs text-white/35 mt-0.5">
                Your access remains active until the end of the billing period.
              </p>
            </div>
            <button
              disabled
              className="shrink-0 px-4 py-2 rounded-xl text-xs font-semibold font-sans cursor-not-allowed"
              style={{
                background: 'rgba(239,68,68,0.07)',
                color: 'rgba(248,113,113,0.40)',
                border: '1px solid rgba(239,68,68,0.13)',
              }}
            >
              Cancel Plan
            </button>
          </div>
          <p className="font-sans text-xs text-white/20">
            To cancel, email{' '}
            <a href="mailto:support@enefsis.com" className="text-white/35 hover:underline">
              support@enefsis.com
            </a>
            . Self-service cancellation coming soon.
          </p>
        </div>
      </div>
    </div>
  )
}
