import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Sidebar } from '@/components/layout/sidebar'
import type { Profile } from '@/types/database'

const navItems = [
  { label: 'Overview',      href: '/admin',                icon: 'dashboard'      as const },
  { label: 'Clients',       href: '/admin/clients',        icon: 'clients'        as const },
  { label: 'NFC Stands',    href: '/admin/nfc-stands',     icon: 'nfc-stands'     as const },
  { label: 'Subscriptions', href: '/admin/subscriptions',  icon: 'subscriptions'  as const },
  { label: 'Settings',      href: '/admin/settings',       icon: 'settings'       as const },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const adminClient = createAdminClient()
  const { data: profileRaw } = await adminClient
    .from('profiles')
    .select('full_name, email, role')
    .eq('id', user.id)
    .maybeSingle()

  const profile = profileRaw as Pick<Profile, 'full_name' | 'email' | 'role'> | null

  if (profile?.role?.toLowerCase() !== 'admin') redirect('/dashboard')

  return (
    <div className="flex h-screen bg-[#0D0F14] overflow-hidden">
      <Sidebar
        navItems={navItems}
        badge="Admin"
        user={{
          name:  profile?.full_name ?? null,
          email: profile?.email ?? user.email ?? null,
        }}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
