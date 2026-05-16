import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileAdminNav } from './mobile-nav'
import { Toaster } from 'sonner'
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
  const headersList = await headers()
  const host = headersList.get('host')
  if (host === 'tap.enefsis.com') redirect('https://app.enefsis.com/admin')

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

  const userProp = {
    name:  profile?.full_name ?? null,
    email: profile?.email ?? user.email ?? null,
  }

  return (
    <div className="flex h-screen bg-[#0D0F14] overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar navItems={navItems} badge="Admin" user={userProp} />
      </div>

      {/* Content column (mobile top bar + main) */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <MobileAdminNav navItems={navItems} badge="Admin" user={userProp} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  )
}
