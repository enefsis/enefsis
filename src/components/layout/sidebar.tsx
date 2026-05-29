'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LogOut,
  LayoutDashboard,
  BarChart2,
  Utensils,
  Settings,
  Users,
  Wifi,
  CreditCard,
  PanelLeft,
  Briefcase,
  Zap,
  Package,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { signOut } from '@/actions/auth'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<string, LucideIcon> = {
  dashboard:     LayoutDashboard,
  analytics:     BarChart2,
  'menu-views':  Utensils,
  'page-editor': PanelLeft,
  settings:      Settings,
  clients:       Users,
  'nfc-stands':  Wifi,
  subscriptions: CreditCard,
  agents:          Briefcase,
  'quick-update':  Zap,
  'stand-orders':  Package,
}

export interface NavItem {
  label: string
  href: string
  icon: keyof typeof ICON_MAP
}

interface SidebarProps {
  navItems: NavItem[]
  badge?: string
  user: { name: string | null; email: string | null }
}

export function Sidebar({ navItems, badge, user }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-[220px] shrink-0 flex flex-col h-screen bg-[#111318] border-r border-white/[0.06]">

      {/* Logo + optional badge */}
      <div className="px-5 pt-6 pb-5">
        <img src="/enefsis-logo-transparent.png" alt="Enefsis" style={{ height: '120px', objectFit: 'contain' }} />
        {badge && (
          <div className="mt-2.5">
            <span className="inline-flex items-center text-[10px] font-sans font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-[#2B5CE6]/15 text-[#2B5CE6] border border-[#2B5CE6]/20">
              {badge}
            </span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-white/[0.06]" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ label, href, icon }) => {
          const Icon   = ICON_MAP[icon]
          const isRoot = href.split('/').filter(Boolean).length === 1
          const active = isRoot ? pathname === href : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150',
                active
                  ? 'bg-[#2B5CE6]/15 text-white'
                  : 'text-white/45 hover:text-white/75 hover:bg-white/[0.04]',
              )}
            >
              {Icon && (
                <Icon
                  size={17}
                  strokeWidth={active ? 2 : 1.5}
                  className={active ? 'text-[#2B5CE6]' : ''}
                />
              )}
              <span className="font-sans font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User + Sign out */}
      <div className="px-3 pb-5">
        <div className="mx-1 border-t border-white/[0.06] mb-3" />

        <div className="px-3 py-2 mb-1">
          {user.name && (
            <p className="text-sm font-sans font-medium text-white/75 truncate leading-tight">
              {user.name}
            </p>
          )}
          <p className="text-xs font-sans text-white/30 truncate leading-tight mt-0.5">
            {user.email}
          </p>
        </div>

        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans font-medium text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-colors duration-150"
          >
            <LogOut size={17} strokeWidth={1.5} />
            Sign out
          </button>
        </form>

        <div className="flex items-center gap-2.5 px-3 pt-3">
          <Link
            href="/privacy-policy"
            className="font-sans text-[10px] text-white/20 hover:text-white/40 transition-colors"
          >
            Privacy
          </Link>
          <span className="text-white/10 text-[10px]">·</span>
          <Link
            href="/terms-of-service"
            className="font-sans text-[10px] text-white/20 hover:text-white/40 transition-colors"
          >
            Terms
          </Link>
        </div>
      </div>
    </aside>
  )
}
