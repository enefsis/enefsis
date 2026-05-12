import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import type { Profile } from '@/types/database'

const navItems = [
  { label: 'Dashboard',   href: '/dashboard',               icon: 'dashboard'    as const },
  { label: 'Analytics',   href: '/dashboard/analytics',     icon: 'analytics'    as const },
  { label: 'Menu Views',  href: '/dashboard/menu-views',    icon: 'menu-views'   as const },
  { label: 'Page Editor', href: '/dashboard/page-editor',   icon: 'page-editor'  as const },
  { label: 'Settings',    href: '/dashboard/settings',      icon: 'settings'     as const },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profileRaw } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  const profile = profileRaw as Pick<Profile, 'full_name' | 'email'> | null

  return (
    <div className="flex h-screen bg-[#0D0F14] overflow-hidden">
      <Sidebar
        navItems={navItems}
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
