'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { PageData } from './page-editor'
import type { Json } from '@/types/database'
import type { Profile } from '@/types/database'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: raw } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if ((raw as Pick<Profile, 'role'> | null)?.role !== 'admin') redirect('/dashboard')
}

export async function savePageForClient(
  clientId: string,
  data: PageData,
): Promise<{ slug?: string; error?: string }> {
  await requireAdmin()
  const admin = createAdminClient()

  const payload = {
    restaurant_name:     data.restaurant_name     || null,
    tagline:             data.tagline             || null,
    hero_bg:             data.hero_bg             || null,
    logo_url:            data.logo_url            || null,
    google_review_url:   data.google_review_url   || null,
    instagram_url:       data.instagram_url       || null,
    facebook_url:        data.facebook_url        || null,
    tiktok_url:          data.tiktok_url          || null,
    whatsapp_number:     data.whatsapp_number     || null,
    menu_sections:       data.menu_sections as unknown as Json,
    opening_hours:       data.opening_hours       || null,
    phone:               data.phone               || null,
    address:             data.address             || null,
    wifi_name:           data.wifi_name           || null,
    wifi_password:       data.wifi_password       || null,
    call_waiter_enabled: data.call_waiter_enabled ?? false,
    restaurant_type:     data.restaurant_type     || null,
    city:                data.city                || null,
    rating:              data.rating              || null,
    review_count:        data.review_count        || null,
    todays_specials:     data.todays_specials     || null,
    trip_advisor_url:    data.trip_advisor_url    || null,
    website_url:         data.website_url         || null,
    updated_at:          new Date().toISOString(),
  }

  // google_place_id is not yet in generated DB types — cast via any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payloadWithPlaceId: any = { ...payload, google_place_id: data.google_place_id || null }

  const { data: updatedRows, error } = await admin
    .from('client_pages')
    .update(payloadWithPlaceId)
    .eq('user_id', clientId)
    .select('id, slug')

  if (error) return { error: error.message }

  const slug = updatedRows?.[0]?.slug ?? undefined
  revalidatePath(`/admin/clients/${clientId}/page-editor`)
  revalidatePath(`/admin/clients/${clientId}`)
  if (slug) revalidatePath(`/p/${slug}`)

  return { slug }
}

export async function saveLogoUrlForClient(
  clientId: string,
  url: string,
): Promise<{ error?: string }> {
  await requireAdmin()
  const admin = createAdminClient()

  const { error } = await admin
    .from('client_pages')
    .update({ logo_url: url, updated_at: new Date().toISOString() })
    .eq('user_id', clientId)

  if (error) return { error: error.message }
  return {}
}

export async function uploadLogoForClient(
  clientId: string,
  formData: FormData,
): Promise<{ url: string } | { error: string }> {
  await requireAdmin()

  const file = formData.get('file') as File | null
  if (!file || file.size === 0) return { error: 'No file provided' }

  const ext  = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${clientId}/logo.${ext}`

  const admin = createAdminClient()
  const { error: uploadError } = await admin.storage
    .from('client-assets')
    .upload(path, file, { upsert: true })

  if (uploadError) return { error: uploadError.message }

  const { data: { publicUrl } } = admin.storage.from('client-assets').getPublicUrl(path)
  return { url: publicUrl }
}

export async function uploadItemPhotoForClient(
  clientId: string,
  itemId: string,
  formData: FormData,
): Promise<{ url: string } | { error: string }> {
  await requireAdmin()

  const file = formData.get('file') as File | null
  if (!file || file.size === 0) return { error: 'No file provided' }

  const ext  = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${clientId}/menu/${itemId}.${ext}`

  const admin = createAdminClient()
  const { error: uploadError } = await admin.storage
    .from('client-assets')
    .upload(path, file, { upsert: true })

  if (uploadError) return { error: uploadError.message }

  const { data: { publicUrl } } = admin.storage.from('client-assets').getPublicUrl(path)
  return { url: publicUrl }
}
