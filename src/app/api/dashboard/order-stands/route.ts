import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendStandOrderEmail } from '@/lib/email'

const PRICE_PER_STAND = 20

export async function POST(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { quantity } = body as Record<string, unknown>
  const qty = typeof quantity === 'number' ? Math.floor(quantity) : NaN

  if (isNaN(qty) || qty < 1 || qty > 50) {
    return NextResponse.json({ error: 'Quantity must be between 1 and 50.' }, { status: 400 })
  }

  const amount = qty * PRICE_PER_STAND

  // ── Fetch profile (name + email for notification) ─────────────────────────
  const admin = createAdminClient()
  const { data: profileRaw } = await admin
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .maybeSingle()

  const profile     = profileRaw as { full_name: string | null; email: string } | null
  const clientName  = profile?.full_name ?? user.email ?? 'Unknown'
  const clientEmail = profile?.email     ?? user.email ?? ''

  // ── Insert stand order ────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: insertError } = await (admin as any).from('stand_orders').insert({
    user_id:  user.id,
    quantity: qty,
    amount,
    status:   'pending',
  })

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // ── Send notification email (best-effort) ─────────────────────────────────
  const date = new Date().toLocaleDateString('en-GB', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  })

  await sendStandOrderEmail({ clientName, clientEmail, quantity: qty, amount, date })

  return NextResponse.json({ ok: true })
}
