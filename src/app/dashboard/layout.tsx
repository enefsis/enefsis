import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { NotificationsBell } from '@/components/dashboard/notifications-bell'
import { Toaster } from 'sonner'
import type { Profile } from '@/types/database'

const ADMIN_EMAIL = 'gniokos@gmail.com'

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

  const cookieStore    = await cookies()
  const isImpersonating =
    cookieStore.get('admin_impersonating')?.value === 'true' &&
    (user.email ?? '').toLowerCase() !== ADMIN_EMAIL.toLowerCase()

  const clientName = profile?.full_name || profile?.email || user.email || 'Client'

  return (
    <div className="flex flex-col h-screen bg-[#0D0F14]">

      {isImpersonating && (
        <div
          className="flex items-center justify-center gap-3 px-4 py-2.5 shrink-0 font-sans text-sm font-semibold"
          style={{ background: '#F97316', color: '#fff' }}
        >
          <span>⚠️ ADMIN MODE — Viewing as {clientName}</span>
          <span className="opacity-50">—</span>
          <a
            href="/api/admin/exit-impersonation"
            className="underline underline-offset-2 hover:opacity-80 transition-opacity font-bold"
          >
            Exit
          </a>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          navItems={navItems}
          user={{
            name:  profile?.full_name ?? null,
            email: profile?.email ?? user.email ?? null,
          }}
        />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="h-[52px] shrink-0 border-b border-white/[0.05] bg-[#0D0F14] flex items-center justify-end px-5">
            <NotificationsBell />
          </header>
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  )
}
