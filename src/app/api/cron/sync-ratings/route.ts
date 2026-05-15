import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

interface PlacesDetailsResponse {
  status: string
  result?: {
    rating?: number
    user_ratings_total?: number
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'GOOGLE_PLACES_API_KEY not configured' }, { status: 500 })
  }

  const admin = createAdminClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: pages, error } = await (admin.from('client_pages') as any)
    .select('user_id, google_place_id')
    .not('google_place_id', 'is', null)

  if (error) {
    return NextResponse.json({ error: (error as { message: string }).message }, { status: 500 })
  }

  const results = { updated: 0, failed: 0, errors: [] as string[] }

  for (const page of (pages ?? []) as { user_id: string; google_place_id: string }[]) {
    try {
      const url =
        `https://maps.googleapis.com/maps/api/place/details/json` +
        `?place_id=${encodeURIComponent(page.google_place_id)}` +
        `&fields=rating,user_ratings_total` +
        `&key=${apiKey}`

      const res  = await fetch(url)
      const json = await res.json() as PlacesDetailsResponse

      if (json.status !== 'OK' || !json.result) {
        results.failed++
        results.errors.push(`${page.google_place_id}: ${json.status}`)
        continue
      }

      const { rating, user_ratings_total } = json.result

      await admin
        .from('client_pages')
        .update({
          rating:       rating              != null ? String(rating)              : null,
          review_count: user_ratings_total  != null ? String(user_ratings_total)  : null,
        })
        .eq('user_id', page.user_id)

      results.updated++
    } catch (err) {
      results.failed++
      results.errors.push(
        `${page.google_place_id}: ${err instanceof Error ? err.message : 'unknown error'}`,
      )
    }
  }

  return NextResponse.json({ ok: true, ...results })
}
