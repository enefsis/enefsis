import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

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

  const { stand_id, item_id, item_name, client_id, table_number } = body as Record<string, unknown>

  if (!stand_id || typeof stand_id !== 'string') {
    return NextResponse.json(
      { error: 'stand_id is required' },
      { status: 400, headers: CORS_HEADERS }
    )
  }

  const supabase = createAdminClient()

  const { error } = await supabase.from('menu_item_views').insert({
    stand_id,
    item_id:      typeof item_id      === 'string' ? item_id      : null,
    item_name:    typeof item_name    === 'string' ? item_name    : null,
    client_id:    typeof client_id    === 'string' ? client_id    : null,
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
