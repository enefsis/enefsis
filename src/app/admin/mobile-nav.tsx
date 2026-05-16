'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LogOut, LayoutDashboard, BarChart2, Utensils,
  Settings, Users, Wifi, CreditCard, PanelLeft, X, Menu,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { signOut } from '@/actions/auth'
import { cn } from '@/lib/utils'
import type { NavItem } from '@/components/layout/sidebar'

const ICON_MAP: Record<string, LucideIcon> = {
  dashboard:     LayoutDashboard,
  analytics:     BarChart2,
  'menu-views':  Utensils,
  'page-editor': PanelLeft,
  settings:      Settings,
  clients:       Users,
  'nfc-stands':  Wifi,
  subscriptions: CreditCard,
}

export function MobileAdminNav({
  navItems,
  badge,
  user,
}: {
  navItems: NavItem[]
  badge?: string
  user: { name: string | null; email: string | null }
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile top bar — hidden on md+ */}
      <div className="md:hidden flex items-center justify-between px-4 h-14 shrink-0 bg-[#111318] border-b border-white/[0.06] z-30">
        <button
          onClick={() => setOpen(true)}
          className="p-1 text-white/50 hover:text-white transition-colors"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <img
          src="/enefsis-logo-transparent.png"
          alt="Enefsis"
          style={{ height: '36px', objectFit: 'contain' }}
        />
        {/* spacer keeps logo centered */}
        <div className="w-8" />
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-out drawer */}
      <div
        className={cn(
          'fixed top-0 left-0 h-full w-[220px] z-50 flex flex-col bg-[#111318] border-r border-white/[0.06] transition-transform duration-200 ease-in-out md:hidden',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo + close */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between">
          <img
            src="/enefsis-logo-transparent.png"
            alt="Enefsis"
            style={{ height: '48px', objectFit: 'contain' }}
          />
          <button
            onClick={() => setOpen(false)}
            className="p-1 text-white/40 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {badge && (
          <div className="px-5 pb-3">
            <span className="inline-flex items-center text-[10px] font-sans font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-[#2B5CE6]/15 text-[#2B5CE6] border border-[#2B5CE6]/20">
              {badge}
            </span>
          </div>
        )}

        <div className="mx-4 border-t border-white/[0.06]" />

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ label, href, icon }) => {
            const Icon   = ICON_MAP[icon]
            const isRoot = href.split('/').filter(Boolean).length === 1
            const active = isRoot ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
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

        {/* User + sign out */}
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
        </div>
      </div>
    </>
  )
}
