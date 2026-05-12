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

  const { stand_id, button_type, client_id } = body as Record<string, unknown>

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

  const supabase = createAdminClient()

  const { error } = await supabase.from('button_clicks').insert({
    stand_id,
    button_type,
    client_id: typeof client_id === 'string' ? client_id : null,
  })

  if (error) {
    return NextResponse.json(
      { error: 'Failed to log event' },
      { status: 500, headers: CORS_HEADERS }
    )
  }

  return NextResponse.json({ ok: true }, { status: 200, headers: CORS_HEADERS })
}
