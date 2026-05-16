import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const ALLOWED_BUTTON_TYPES = new Set([
  'instagram',
  'facebook',
  'tiktok',
  'whatsapp',
  'google_review',
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

  const { event_type, stand_id, button_type, client_id, table_number, language, device_type } =
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

    return NextResponse.json({ ok: true }, { status: 200, headers: CORS_HEADERS })
  }

  // ── Button click (existing behaviour) ────────────────────────────────────
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
