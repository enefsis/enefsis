import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface LoyaltyCard {
  id: string
  stamps: number
  last_stamp_at: string | null
  completed: boolean
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { visitorId, clientId } = body as Record<string, unknown>

  if (!visitorId || typeof visitorId !== 'string') {
    return NextResponse.json({ error: 'visitorId is required' }, { status: 400 })
  }
  if (!clientId || typeof clientId !== 'string') {
    return NextResponse.json({ error: 'clientId is required' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Fetch loyalty config from client_pages
  const { data: page, error: pageError } = await admin
    .from('client_pages')
    .select('loyalty_enabled, loyalty_stamps_required, loyalty_reward')
    .eq('user_id', clientId)
    .maybeSingle()

  if (pageError) {
    return NextResponse.json({ error: 'Failed to fetch loyalty config' }, { status: 500 })
  }

  if (!page?.loyalty_enabled) {
    return NextResponse.json({ error: 'Loyalty program not enabled' }, { status: 403 })
  }

  const stampsRequired = page.loyalty_stamps_required ?? 10
  const reward         = page.loyalty_reward          ?? null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loyaltyTable = (admin as any).from('loyalty_cards')

  // Find existing card for this visitor + client
  const { data: existing, error: fetchError } = await loyaltyTable
    .select('id, stamps, last_stamp_at, completed')
    .eq('visitor_id', visitorId)
    .eq('client_id', clientId)
    .maybeSingle() as { data: LoyaltyCard | null; error: { message: string } | null }

  if (fetchError) {
    return NextResponse.json({ error: 'Failed to fetch loyalty card' }, { status: 500 })
  }

  const now        = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

  if (!existing) {
    // First stamp — create card
    const { data: newCard, error: insertError } = await loyaltyTable
      .insert({
        visitor_id:    visitorId,
        client_id:     clientId,
        stamps:        1,
        last_stamp_at: now.toISOString(),
        completed:     1 >= stampsRequired,
      })
      .select('stamps, completed')
      .single() as { data: Pick<LoyaltyCard, 'stamps' | 'completed'> | null; error: { message: string } | null }

    if (insertError || !newCard) {
      return NextResponse.json({ error: 'Failed to create loyalty card' }, { status: 500 })
    }

    return NextResponse.json({
      stamps:         newCard.stamps,
      stampsRequired,
      reward,
      completed:      newCard.completed,
    })
  }

  // Enforce 1-hour cooldown between stamps
  const lastStampAt = existing.last_stamp_at ? new Date(existing.last_stamp_at) : null
  if (lastStampAt && lastStampAt >= oneHourAgo) {
    return NextResponse.json({
      stamps:         existing.stamps,
      stampsRequired,
      reward,
      completed:      existing.completed,
      cooldown:       true,
    })
  }

  const newStamps  = (existing.stamps ?? 0) + 1
  const isCompleted = newStamps >= stampsRequired

  const { error: updateError } = await loyaltyTable
    .update({
      stamps:        newStamps,
      last_stamp_at: now.toISOString(),
      completed:     isCompleted,
    })
    .eq('id', existing.id)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update loyalty card' }, { status: 500 })
  }

  return NextResponse.json({
    stamps:         newStamps,
    stampsRequired,
    reward,
    completed:      isCompleted,
  })
}
