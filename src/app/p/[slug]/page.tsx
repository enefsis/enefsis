import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { LandingClient } from './landing-client'
import type { MenuSectionData } from '@/actions/page-editor'

export const revalidate = 0
export const dynamic = 'force-dynamic'

interface Props {
  params:       Promise<{ slug: string }>
  searchParams: Promise<{ sid?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const admin = createAdminClient()

  const { data: page } = await admin
    .from('client_pages')
    .select('restaurant_name, tagline')
    .eq('slug', slug)
    .maybeSingle()

  return {
    title:       page?.restaurant_name ?? 'Welcome',
    description: page?.tagline         ?? undefined,
  }
}

export default async function LandingPage({ params, searchParams }: Props) {
  const { slug }     = await params
  const { sid }      = await searchParams
  const admin        = createAdminClient()

  const { data: rows, error: pageError } = await admin
    .from('client_pages')
    .select('*')
    .eq('slug', slug)
    .order('updated_at', { ascending: false })
    .limit(1)

  const page = rows?.[0] ?? null

  console.log('[LandingPage] query error:', pageError)
  console.log('[LandingPage] raw page data:', JSON.stringify(page))

  if (!page) notFound()

  console.log('[LandingPage] slug:', slug, '| data:', JSON.stringify({
    slug:              page.slug,
    restaurant_name:   page.restaurant_name,
    google_review_url: page.google_review_url,
    instagram_url:     page.instagram_url,
    facebook_url:      page.facebook_url,
    tiktok_url:        page.tiktok_url,
    whatsapp_number:   page.whatsapp_number,
    menu_sections_len: Array.isArray(page.menu_sections) ? (page.menu_sections as unknown[]).length : 0,
  }, null, 2))

  // Derive table number from the stand name ("… – Stand 3" → 3)
  let tableNumber: number | null = null
  if (sid) {
    const { data: stand } = await admin
      .from('nfc_stands')
      .select('name')
      .eq('id', sid)
      .maybeSingle()
    const match = (stand as { name: string | null } | null)?.name?.match(/Stand\s+(\d+)/i)
    if (match) tableNumber = parseInt(match[1], 10)
  }

  const props = {
    standId:            sid ?? null,
    clientId:           page.user_id,
    tableNumber,
    restaurantName:     page.restaurant_name   ?? '',
    tagline:            page.tagline           ?? null,
    logoUrl:            page.logo_url          ?? null,
    googleReviewUrl:    page.google_review_url ?? null,
    instagramUrl:       page.instagram_url     ?? null,
    facebookUrl:        page.facebook_url      ?? null,
    tiktokUrl:          page.tiktok_url        ?? null,
    whatsappNumber:     page.whatsapp_number   ?? null,
    menuSections:       (page.menu_sections ?? []) as unknown as MenuSectionData[],
    openingHours:       page.opening_hours       ?? null,
    phone:              page.phone               ?? null,
    address:            page.address             ?? null,
    wifiName:           page.wifi_name           ?? null,
    wifiPassword:       page.wifi_password       ?? null,
    callWaiterEnabled:  page.call_waiter_enabled ?? false,
    restaurantType:     page.restaurant_type     ?? null,
    city:               page.city                ?? null,
    yearEstablished:    page.year_established    ?? null,
    rating:             page.rating              ?? null,
    reviewCount:        page.review_count        ?? null,
    todaysSpecials:     page.todays_specials     ?? null,
    tripAdvisorUrl:     page.trip_advisor_url    ?? null,
    websiteUrl:         page.website_url         ?? null,
  }

  console.log('[LandingPage] passing to LandingClient:', JSON.stringify({
    googleReviewUrl:   props.googleReviewUrl,
    instagramUrl:      props.instagramUrl,
    facebookUrl:       props.facebookUrl,
    tiktokUrl:         props.tiktokUrl,
    whatsappNumber:    props.whatsappNumber,
    menuSectionsLen:   props.menuSections.length,
    callWaiterEnabled: props.callWaiterEnabled,
  }, null, 2))

  return <LandingClient {...props} />
}
