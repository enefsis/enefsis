import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

function parseDeviceType(ua: string): string {
  const u = ua.toLowerCase()
  if (/tablet|ipad/.test(u)) return 'tablet'
  if (/mobile|android|iphone|ipod|blackberry|windows phone/.test(u)) return 'mobile'
  return 'desktop'
}

function parseLanguage(acceptLanguage: string | null): string | null {
  if (!acceptLanguage) return null
  const primary = acceptLanguage.split(',')[0]?.split(';')[0]?.trim()
  return primary ?? null
}

function parseIp(req: NextRequest): string | null {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    null
  )
}

async function handleTap(req: NextRequest): Promise<NextResponse> {
  const standId = req.nextUrl.searchParams.get('stand_id')

  if (!standId) {
    return NextResponse.json({ error: 'stand_id is required' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: stand } = await supabase
    .from('nfc_stands')
    .select('landing_page_url, user_id')
    .eq('id', standId)
    .maybeSingle()

  if (!stand) {
    return NextResponse.json({ error: 'Stand not found' }, { status: 404 })
  }

  const ua = req.headers.get('user-agent') ?? ''
  const language = parseLanguage(req.headers.get('accept-language'))
  const deviceType = parseDeviceType(ua)
  const ipAddress = parseIp(req)

  const tableParam = req.nextUrl.searchParams.get('table')
  const tableNumber = tableParam !== null ? parseInt(tableParam, 10) : null

  await supabase.from('tap_events').insert({
    stand_id: standId,
    user_id: (stand as { landing_page_url: string; user_id: string | null }).user_id ?? null,
    language,
    device_type: deviceType,
    ip_address: ipAddress,
    // @ts-expect-error table_number column pending DB migration
    table_number: Number.isFinite(tableNumber) ? tableNumber : null,
  })

  return NextResponse.redirect(stand.landing_page_url, { status: 302 })
}

export const GET = handleTap
export const POST = handleTap
