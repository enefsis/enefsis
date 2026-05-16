'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  created_at: string
}

// ── Read ──────────────────────────────────────────────────────────────────────

export async function getNotifications(): Promise<{
  notifications: Notification[]
  unreadCount: number
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { notifications: [], unreadCount: 0 }

    const admin = createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (admin as any)
      .from('notifications')
      .select('id, title, message, read, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    const notifications = (data ?? []) as Notification[]
    return {
      notifications,
      unreadCount: notifications.filter(n => !n.read).length,
    }
  } catch {
    return { notifications: [], unreadCount: 0 }
  }
}

// ── Write ─────────────────────────────────────────────────────────────────────

export async function markAllAsRead(): Promise<void> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const admin = createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)
  } catch {
    // silently ignore — table may not exist yet
  }
}

// ── Daily summary (called from dashboard page on load) ────────────────────────

export async function checkAndCreateDailySummary(): Promise<void> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const admin = createAdminClient()

    const now       = new Date()
    const yesterday = new Date(now.getTime() - 86_400_000)
    const yDate     = yesterday.toISOString().slice(0, 10)
    const yStart    = yDate + 'T00:00:00.000Z'
    const yEnd      = yDate + 'T23:59:59.999Z'
    const yLabel    = yesterday.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    const title     = `Daily Summary — ${yLabel}`

    // Idempotency: skip if notification already exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (admin as any)
      .from('notifications')
      .select('id')
      .eq('user_id', user.id)
      .eq('title', title)
      .maybeSingle()

    if (existing) return

    // Fetch yesterday's stats
    const [{ count: tapCount }, { count: viewCount }] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (admin as any)
        .from('tap_events')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', yStart)
        .lte('created_at', yEnd),
      admin
        .from('menu_item_views')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', user.id)
        .gte('created_at', yStart)
        .lte('created_at', yEnd),
    ])

    const taps  = tapCount  ?? 0
    const views = viewCount ?? 0
    if (taps === 0 && views === 0) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('notifications').insert({
      user_id: user.id,
      title,
      message: `Yesterday you received ${taps.toLocaleString()} tap${taps !== 1 ? 's' : ''} and ${views.toLocaleString()} menu view${views !== 1 ? 's' : ''}.`,
    })
  } catch {
    // silently ignore
  }
}
