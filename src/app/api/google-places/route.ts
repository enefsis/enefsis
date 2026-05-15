import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface PlacesDetailsResponse {
  status: string
  result?: {
    rating?: number
    user_ratings_total?: number
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const placeId = searchParams.get('placeId')?.trim()

  if (!placeId) {
    return NextResponse.json({ error: 'placeId is required' }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Google Places API not configured on this server' }, { status: 500 })
  }

  const url =
    `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${encodeURIComponent(placeId)}` +
    `&fields=rating,user_ratings_total` +
    `&key=${apiKey}`

  const res  = await fetch(url)
  const json = await res.json() as PlacesDetailsResponse

  if (json.status !== 'OK') {
    const msg =
      json.status === 'NOT_FOUND'       ? 'Place ID not found — double-check it on Google Maps' :
      json.status === 'INVALID_REQUEST' ? 'Invalid Place ID format' :
      `Google API returned: ${json.status}`
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  return NextResponse.json({
    rating:       json.result?.rating             ?? null,
    review_count: json.result?.user_ratings_total ?? null,
  })
}
