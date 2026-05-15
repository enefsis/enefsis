import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { PageEditorClient } from './editor-client'
import type { PageData, MenuSectionData } from '@/actions/page-editor'

export default async function PageEditorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  // Fetch by user_id; order so the most-recent (with slug) row wins if duplicates exist
  const { data: rows } = await admin
    .from('client_pages')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const raw = rows?.[0] ?? null

  console.log('[PageEditor] user_id:', user.id, '| rows found:', rows?.length ?? 0, '| loaded row:', JSON.stringify({
    id:                raw?.id,
    slug:              raw?.slug,
    restaurant_name:   raw?.restaurant_name,
    google_review_url: raw?.google_review_url,
    instagram_url:     raw?.instagram_url,
    facebook_url:      raw?.facebook_url,
    tiktok_url:        raw?.tiktok_url,
    whatsapp_number:   raw?.whatsapp_number,
    menu_sections_len: Array.isArray(raw?.menu_sections) ? (raw.menu_sections as unknown[]).length : 0,
  }, null, 2))

  const initial: PageData | null = raw
    ? {
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
        restaurant_type:     raw.restaurant_type     ?? '',
        city:                raw.city                ?? '',
        rating:              raw.rating              ?? '',
        review_count:        raw.review_count        ?? '',
        todays_specials:     raw.todays_specials     ?? '',
        trip_advisor_url:    raw.trip_advisor_url    ?? '',
        website_url:         raw.website_url         ?? '',
      }
    : null

  return <PageEditorClient initial={initial} slug={raw?.slug ?? null} />
}
