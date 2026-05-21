import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { PageEditorClient } from '@/app/dashboard/page-editor/editor-client'
import {
  savePageForClient,
  saveLogoUrlForClient,
  uploadLogoForClient,
  uploadItemPhotoForClient,
} from '@/actions/admin-page-editor'
import type { PageData, MenuSectionData, StructuredHours } from '@/actions/page-editor'

export default async function AdminPageEditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const admin = createAdminClient()

  const [{ data: rows }, { data: subRaw }] = await Promise.all([
    admin.from('client_pages').select('*').eq('user_id', id).order('created_at', { ascending: false }),
    admin.from('subscriptions').select('plan').eq('user_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ])

  const raw = rows?.[0] ?? null
  if (!raw) notFound()

  const isPro = !!(subRaw as { plan: string | null } | null)?.plan?.includes('pro')

  const initial: PageData = {
    restaurant_name:     raw.restaurant_name     ?? '',
    tagline:             raw.tagline             ?? '',
    hero_bg:             raw.hero_bg             ?? '#111318',
    logo_url:            raw.logo_url            ?? null,
    google_review_url:   raw.google_review_url   ?? '',
    instagram_url:       raw.instagram_url       ?? '',
    facebook_url:        raw.facebook_url        ?? '',
    tiktok_url:          raw.tiktok_url          ?? '',
    whatsapp_number:     raw.whatsapp_number     ?? '',
    menu_sections:       (raw.menu_sections ?? []) as unknown as MenuSectionData[],
    opening_hours:       raw.opening_hours       ?? '',
    phone:               raw.phone               ?? '',
    address:             raw.address             ?? '',
    wifi_name:           raw.wifi_name           ?? '',
    wifi_password:       raw.wifi_password       ?? '',
    call_waiter_enabled: raw.call_waiter_enabled ?? false,
    waiter_whatsapp:     raw.waiter_whatsapp     ?? '',
    waiter_message:      raw.waiter_message      ?? '',
    restaurant_type:     raw.restaurant_type     ?? '',
    city:                raw.city                ?? '',
    rating:              raw.rating              ?? '',
    review_count:        raw.review_count        ?? '',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google_place_id:     (raw as any).google_place_id ?? '',
    todays_specials:     raw.todays_specials     ?? '',
    trip_advisor_url:    raw.trip_advisor_url    ?? '',
    website_url:         raw.website_url         ?? '',
    reservation_url:          raw.reservation_url          ?? '',
    loyalty_enabled:           raw.loyalty_enabled          ?? false,
    loyalty_stamps_required:   raw.loyalty_stamps_required  ?? 10,
    loyalty_reward:            raw.loyalty_reward           ?? '',
    loyalty_title:             raw.loyalty_title            ?? '',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    opening_hours_structured:  ((raw as any).opening_hours_structured ?? null) as StructuredHours | null,
  }

  // Bind the client's user_id into each action so saves/uploads target the right row/folder
  const savePageBound        = savePageForClient.bind(null, id)
  const saveLogoUrlBound     = saveLogoUrlForClient.bind(null, id)
  const uploadLogoBound      = uploadLogoForClient.bind(null, id)
  const uploadItemPhotoBound = uploadItemPhotoForClient.bind(null, id)

  return (
    <PageEditorClient
      initial={initial}
      slug={raw.slug ?? null}
      backHref={`/admin/clients/${id}`}
      savePageFn={savePageBound}
      saveLogoUrlFn={saveLogoUrlBound}
      uploadLogoFn={uploadLogoBound}
      uploadItemPhotoFn={uploadItemPhotoBound}
      isPro={isPro}
      clientId={id}
    />
  )
}
