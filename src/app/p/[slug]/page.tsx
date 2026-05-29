import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { LandingClient } from './landing-client'
import { Logo } from '@/components/ui/logo'
import type { MenuSectionData } from '@/actions/page-editor'

export const revalidate = 300

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
  const [{ slug }, { sid }] = await Promise.all([params, searchParams])
  const admin = createAdminClient()

  // Fetch page and stand in parallel (stand only when sid is present)
  const [{ data: page }, standResult] = await Promise.all([
    admin
      .from('client_pages')
      .select('*')
      .eq('slug', slug)
      .maybeSingle(),
    sid
      ? admin.from('nfc_stands').select('name').eq('id', sid).maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  if (!page) notFound()

  // Subscription check requires user_id from page — runs after
  const { data: sub } = await admin
    .from('subscriptions')
    .select('status, plan')
    .eq('user_id', page.user_id)
    .maybeSingle()

  if (sub?.status === 'suspended') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#0D0F14] px-6">
        <Logo size="md" />
        <div className="text-center space-y-2">
          <p className="font-display text-lg font-semibold text-white">
            This page is temporarily unavailable
          </p>
          <p className="font-sans text-sm text-white/40">
            Please contact the restaurant directly
          </p>
        </div>
      </div>
    )
  }

  // Derive table number from stand name ("… – Stand 3" → 3)
  let tableNumber: number | null = null
  const standName = (standResult.data as { name: string | null } | null)?.name
  const match = standName?.match(/Stand\s+(\d+)/i)
  if (match) tableNumber = parseInt(match[1], 10)

  const isPro = !!(sub as { plan?: string | null } | null)?.plan?.includes('pro')

  return (
    <>
      {page.logo_url && (
        <link rel="preload" href={page.logo_url} as="image" />
      )}
      <LandingClient
      standId={sid ?? null}
      clientId={page.user_id}
      tableNumber={tableNumber}
      restaurantName={page.restaurant_name ?? ''}
      tagline={page.tagline ?? null}
      logoUrl={page.logo_url ?? null}
      googleReviewUrl={page.google_review_url ?? null}
      instagramUrl={page.instagram_url ?? null}
      facebookUrl={page.facebook_url ?? null}
      tiktokUrl={page.tiktok_url ?? null}
      whatsappNumber={page.whatsapp_number ?? null}
      menuSections={(page.menu_sections ?? []) as unknown as MenuSectionData[]}
      openingHours={page.opening_hours ?? null}
      phone={page.phone ?? null}
      address={page.address ?? null}
      wifiName={page.wifi_name ?? null}
      wifiPassword={page.wifi_password ?? null}
      callWaiterEnabled={page.call_waiter_enabled ?? false}
      waiterWhatsapp={page.waiter_whatsapp ?? null}
      waiterMessage={page.waiter_message ?? null}
      restaurantType={page.restaurant_type ?? null}
      city={page.city ?? null}
      rating={page.rating ?? null}
      reviewCount={page.review_count ?? null}
      todaysSpecials={page.todays_specials ?? null}
      tripAdvisorUrl={page.trip_advisor_url ?? null}
      websiteUrl={page.website_url ?? null}
      reservationUrl={page.reservation_url ?? null}
      isPro={isPro}
      loyaltyEnabled={page.loyalty_enabled ?? false}
      loyaltyStampsRequired={page.loyalty_stamps_required ?? 10}
      loyaltyReward={page.loyalty_reward ?? null}
      loyaltyTitle={page.loyalty_title ?? null}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      openingHoursStructured={((page as any).opening_hours_structured ?? null) as import('@/actions/page-editor').StructuredHours | null}
    />
    </>
  )
}
