import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Profile } from '@/types/database'

export async function POST(req: NextRequest) {
  // Must be a logged-in admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profileRaw } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if ((profileRaw as Pick<Profile, 'role'> | null)?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Parse body
  const body = await req.json() as {
    clientId?:           string
    itemName?:           string
    category?:           string
    existingDescription?: string
  }
  const { clientId, itemName, category } = body

  if (!itemName?.trim()) {
    return NextResponse.json({ error: 'itemName is required' }, { status: 400 })
  }

  // Check client's subscription plan — Pro only
  if (clientId) {
    const { data: subRaw } = await admin
      .from('subscriptions')
      .select('plan')
      .eq('user_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const plan = (subRaw as { plan: string | null } | null)?.plan ?? ''
    if (!plan.includes('pro')) {
      return NextResponse.json({ error: 'Pro plan required' }, { status: 403 })
    }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'AI not configured — set ANTHROPIC_API_KEY' }, { status: 503 })
  }

  const prompt = `Write a short appetizing menu description (max 20 words) for a restaurant dish called ${itemName} in the ${category ?? 'menu'} category. Return only the description, nothing else.`

  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key':         apiKey,
      'anthropic-version': '2023-06-01',
      'content-type':      'application/json',
    },
    body: JSON.stringify({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 100,
      messages:   [{ role: 'user', content: prompt }],
    }),
  })

  if (!anthropicRes.ok) {
    const errText = await anthropicRes.text()
    console.error('[ai-description] Anthropic error:', errText)
    return NextResponse.json({ error: 'AI generation failed' }, { status: 502 })
  }

  const aiData = await anthropicRes.json() as { content?: { type: string; text: string }[] }
  const description = aiData.content?.find(b => b.type === 'text')?.text?.trim() ?? ''

  return NextResponse.json({ description })
}
