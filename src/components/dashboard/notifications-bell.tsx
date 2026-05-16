'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { Bell } from 'lucide-react'
import { getNotifications, markAllAsRead, type Notification } from '@/actions/notifications'

function fmtRelTime(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  <  1) return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days  ===1) return 'yesterday'
  return `${days}d ago`
}

export function NotificationsBell() {
  const [open,          setOpen]          = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount,   setUnreadCount]   = useState(0)
  const [isPending,     startTransition]  = useTransition()
  const ref = useRef<HTMLDivElement>(null)

  // Initial load
  useEffect(() => {
    getNotifications().then(({ notifications, unreadCount }) => {
      setNotifications(notifications)
      setUnreadCount(unreadCount)
    })
  }, [])

  // Click-outside to close
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  function handleOpen() {
    const next = !open
    setOpen(next)
    // Refresh data whenever opening the dropdown
    if (next) {
      getNotifications().then(({ notifications, unreadCount }) => {
        setNotifications(notifications)
        setUnreadCount(unreadCount)
      })
    }
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    })
  }

  const hasUnread = unreadCount > 0

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/50 hover:text-white/80 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={16} strokeWidth={1.8} />
        {hasUnread && (
          <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold font-sans leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[#141720] border border-white/[0.08] rounded-2xl shadow-2xl z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <span className="font-display text-sm font-semibold text-white">Notifications</span>
            {hasUnread && (
              <button
                onClick={handleMarkAllRead}
                disabled={isPending}
                className="font-sans text-xs text-[#38BEFF] hover:text-white transition-colors disabled:opacity-40"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <Bell size={28} strokeWidth={1.2} className="text-white/15 mb-3" />
                <p className="font-sans text-sm text-white/30">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n, idx) => (
                <div
                  key={n.id}
                  className={`px-4 py-3.5 ${idx !== notifications.length - 1 ? 'border-b border-white/[0.04]' : ''} ${!n.read ? 'bg-white/[0.025]' : ''}`}
                >
                  <div className="flex items-start gap-2.5">
                    {/* Unread dot */}
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${!n.read ? 'bg-[#38BEFF]' : 'bg-transparent'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`font-sans text-sm font-medium leading-snug ${!n.read ? 'text-white/90' : 'text-white/55'}`}>
                        {n.title}
                      </p>
                      <p className="font-sans text-xs text-white/45 mt-0.5 leading-snug">
                        {n.message}
                      </p>
                      <p className="font-sans text-[11px] text-white/25 mt-1.5">
                        {fmtRelTime(n.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
