import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendMonthlyStatsEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date()
  const since = new Date(now)
  since.setDate(since.getDate() - 30)
  const sinceIso = since.toISOString()
  const month = now.toLocaleString('en-US', { month: 'long', year: 'numeric' })

  // 1. Fetch all active subscriptions
  const { data: subscriptions, error: subError } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('status', 'active')

  if (subError) {
    console.error('[monthly-stats] subscriptions error:', subError)
    return Response.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
  }

  const results: { userId: string; status: string; error?: string }[] = []

  for (const { user_id: clientId } of subscriptions ?? []) {
    if (!clientId) continue
    try {
      // 2a. Total taps
      const { count: totalTaps } = await supabase
        .from('tap_events')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', clientId)
        .gte('created_at', sinceIso)

      // 2b. Unique taps (distinct visitor_id)
      const { data: uniqueRows } = await supabase
        .from('tap_events')
        .select('visitor_id')
        .eq('user_id', clientId)
        .gte('created_at', sinceIso)

      const uniqueTaps = new Set((uniqueRows ?? []).map((r) => r.visitor_id)).size

      // 2c. Top 3 menu items
      const { data: itemRows } = await supabase
        .from('menu_item_views')
        .select('item_name')
        .eq('user_id', clientId)
        .gte('created_at', sinceIso)

      const itemCounts: Record<string, number> = {}
      for (const { item_name } of itemRows ?? []) {
        itemCounts[item_name] = (itemCounts[item_name] ?? 0) + 1
      }
      const topItems = Object.entries(itemCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name]) => name)

      // 2d. Total button clicks
      const { count: totalClicks } = await supabase
        .from('button_clicks')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId)
        .gte('created_at', sinceIso)

      // 2e. Most clicked button
      const { data: clickRows } = await supabase
        .from('button_clicks')
        .select('button_type')
        .eq('client_id', clientId)
        .gte('created_at', sinceIso)

      const buttonCounts: Record<string, number> = {}
      for (const { button_type } of clickRows ?? []) {
        buttonCounts[button_type] = (buttonCounts[button_type] ?? 0) + 1
      }
      const topButton = Object.entries(buttonCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

      // 3. Get client email and name
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', clientId)
        .single()

      if (!profile?.email) {
        results.push({ userId: clientId, status: 'skipped', error: 'no email' })
        continue
      }

      // 4. Send email
      await sendMonthlyStatsEmail(profile.email, profile.full_name ?? profile.email, {
        totalTaps:   totalTaps ?? 0,
        uniqueTaps,
        topItems,
        totalClicks: totalClicks ?? 0,
        topButton,
        month,
      })

      results.push({ userId: clientId, status: 'sent' })
    } catch (err) {
      console.error(`[monthly-stats] error for ${clientId}:`, err)
      results.push({ userId: clientId, status: 'error', error: String(err) })
    }
  }

  return Response.json({ success: true, message: 'Monthly stats sent', results })
}
