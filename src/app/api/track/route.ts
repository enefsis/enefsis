import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

type AdminClient = ReturnType<typeof createAdminClient>

const MILESTONES = [1, 10, 50, 100, 500, 1000]

async function fireNotificationChecks(admin: AdminClient, userId: string) {
  try {
    const now        = new Date()
    const todayStart = now.toISOString().slice(0, 10) + 'T00:00:00.000Z'
    const ago90      = new Date(now.getTime() - 90 * 86_400_000).toISOString()

    const [
      { count: total },
      { count: todayCount },
      { data: prevTaps },
    ] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (admin as any).from('tap_events').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (admin as any).from('tap_events').select('*', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', todayStart),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (admin as any).from('tap_events').select('created_at').eq('user_id', userId).gte('created_at', ago90).lt('created_at', todayStart),
    ])

    const totalTaps = total     ?? 0
    const today     = todayCount ?? 0

    // ── Milestone notifications ──────────────────────────────────────────────
    if (MILESTONES.includes(totalTaps)) {
      const title = totalTaps === 1
        ? 'First tap! 🎉'
        : `You reached ${totalTaps.toLocaleString()} taps! 🎉`
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: exists } = await (admin as any)
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('title', title)
        .maybeSingle()
      if (!exists) {
        const message = totalTaps === 1
          ? 'Your NFC stand just received its very first tap. The journey begins!'
          : `Congratulations! Your NFC page has now received ${totalTaps.toLocaleString()} total taps.`
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (admin as any).from('notifications').insert({ user_id: userId, title, message })
      }
    }

    // ── Daily record notification ────────────────────────────────────────────
    if (today >= 5) {
      const dayMap: Record<string, number> = {}
      ;(prevTaps as { created_at: string }[] | null ?? []).forEach(row => {
        const day = row.created_at.slice(0, 10)
        dayMap[day] = (dayMap[day] ?? 0) + 1
      })
      const maxPrev = Object.values(dayMap).reduce((a, b) => Math.max(a, b), 0)

      if (maxPrev > 0 && today > maxPrev) {
        const title = `New daily record! ${today} taps today`
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: exists } = await (admin as any)
          .from('notifications')
          .select('id')
          .eq('user_id', userId)
          .eq('title', title)
          .maybeSingle()
        if (!exists) {
          const dayLabel = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (admin as any).from('notifications').insert({
            user_id: userId,
            title,
            message: `${dayLabel} is your best day yet with ${today} taps — beating your previous record of ${maxPrev}.`,
          })
        }
      }
    }
  } catch {
    // Never crash the track route over a notification failure
  }
}

const ALLOWED_BUTTON_TYPES = new Set([
  'instagram',
  'facebook',
  'tiktok',
  'whatsapp',
  'google_review',
  'tripadvisor',
  'website',
  'call_waiter',
  'menu',
])

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400, headers: CORS_HEADERS }
    )
  }

  const { event_type, stand_id, button_type, client_id, table_number, language, device_type, visitor_id } =
    body as Record<string, unknown>

  const supabase = createAdminClient()

  // ── Page view ─────────────────────────────────────────────────────────────
  if (event_type === 'page_view') {
    if (!client_id || typeof client_id !== 'string') {
      return NextResponse.json(
        { error: 'client_id is required for page_view' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('tap_events').insert({
      user_id:      client_id,
      visitor_id:   typeof visitor_id  === 'string' ? visitor_id  : null,
      language:     typeof language    === 'string' ? language    : null,
      device_type:  typeof device_type === 'string' ? device_type : null,
      table_number: typeof table_number === 'number' ? table_number : null,
    })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to log page view' },
        { status: 500, headers: CORS_HEADERS }
      )
    }

    // Fire milestone + record checks without blocking the response
    void fireNotificationChecks(supabase, client_id as string).catch(() => {})

    return NextResponse.json({ ok: true }, { status: 200, headers: CORS_HEADERS })
  }

  // ── Button click (new: event_type-based, no stand_id required) ──────────
  if (event_type === 'button_click') {
    if (!client_id || typeof client_id !== 'string') {
      return NextResponse.json(
        { error: 'client_id is required for button_click' },
        { status: 400, headers: CORS_HEADERS }
      )
    }
    if (!button_type || typeof button_type !== 'string' || !ALLOWED_BUTTON_TYPES.has(button_type)) {
      return NextResponse.json(
        { error: `button_type must be one of: ${Array.from(ALLOWED_BUTTON_TYPES).join(', ')}` },
        { status: 400, headers: CORS_HEADERS }
      )
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('button_clicks').insert({
      client_id,
      button_type,
      table_number: typeof table_number === 'number' ? table_number : null,
    })
    if (error) {
      return NextResponse.json(
        { error: 'Failed to log button click' },
        { status: 500, headers: CORS_HEADERS }
      )
    }
    return NextResponse.json({ ok: true }, { status: 200, headers: CORS_HEADERS })
  }

  // ── Button click (legacy: stand_id-based) ────────────────────────────────
  if (!stand_id || typeof stand_id !== 'string') {
    return NextResponse.json(
      { error: 'stand_id is required' },
      { status: 400, headers: CORS_HEADERS }
    )
  }

  if (!button_type || typeof button_type !== 'string' || !ALLOWED_BUTTON_TYPES.has(button_type)) {
    return NextResponse.json(
      { error: `button_type must be one of: ${Array.from(ALLOWED_BUTTON_TYPES).join(', ')}` },
      { status: 400, headers: CORS_HEADERS }
    )
  }

  let resolvedClientId = typeof client_id === 'string' ? client_id : null
  if (!resolvedClientId) {
    const { data: standRow } = await supabase
      .from('nfc_stands')
      .select('user_id')
      .eq('id', stand_id)
      .maybeSingle()
    resolvedClientId = (standRow as { user_id: string | null } | null)?.user_id ?? null
  }

  const { error } = await supabase.from('button_clicks').insert({
    stand_id,
    button_type,
    client_id:    resolvedClientId,
    // @ts-expect-error table_number column pending DB migration
    table_number: typeof table_number === 'number' ? table_number : null,
  })

  if (error) {
    return NextResponse.json(
      { error: 'Failed to log event' },
      { status: 500, headers: CORS_HEADERS }
    )
  }

  return NextResponse.json({ ok: true }, { status: 200, headers: CORS_HEADERS })
}
