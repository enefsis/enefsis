'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Json } from '@/types/database'

function buildSlug(restaurantName: string, email: string): string {
  const source = restaurantName.trim() || email.split('@')[0]
  return source
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export type MenuItemData = {
  id: string
  name: string
  price: string
  description: string
  photo_url: string | null
  available?: boolean
  allergens?: string
  is_popular?: boolean
}

export type MenuSectionData = {
  id: string
  name: string
  emoji?: string
  items: MenuItemData[]
}

export type PageData = {
  restaurant_name: string
  tagline: string
  hero_bg: string
  logo_url: string | null
  google_review_url: string
  instagram_url: string
  facebook_url: string
  tiktok_url: string
  whatsapp_number: string
  menu_sections: MenuSectionData[]
  opening_hours: string
  phone: string
  address: string
  wifi_name: string
  wifi_password: string
  call_waiter_enabled: boolean
  restaurant_type: string
  city: string
  rating: string
  review_count: string
  todays_specials: string
  trip_advisor_url: string
  website_url: string
  google_place_id?: string
}

export async function savePage(data: PageData): Promise<{ slug?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  // Build payload — never touch the slug (set at account creation)
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

  console.log('[savePage] user_id:', user.id)
  console.log('[savePage] payload URLs:', {
    google_review_url: payload.google_review_url,
    instagram_url:     payload.instagram_url,
    facebook_url:      payload.facebook_url,
    tiktok_url:        payload.tiktok_url,
    whatsapp_number:   payload.whatsapp_number,
  })

  // Single-step UPDATE keyed on user_id — returns the updated row(s)
  const { data: updatedRows, error: updateError } = await admin
    .from('client_pages')
    .update(payloadWithPlaceId)
    .eq('user_id', user.id)
    .select('id, slug')

  console.log('[savePage] update result:', {
    rowsAffected: updatedRows?.length ?? 0,
    error: updateError?.message ?? null,
    updatedRows,
  })

  if (updateError) {
    return { error: updateError.message }
  }

  // No existing row for this user — insert with a generated slug
  if (!updatedRows || updatedRows.length === 0) {
    console.log('[savePage] no row found for user_id', user.id, '— inserting')
    const newSlug = buildSlug(data.restaurant_name, user.email ?? '')
    const { error: insertError } = await admin
      .from('client_pages')
      .insert({ ...payloadWithPlaceId, user_id: user.id, slug: newSlug || null })

    if (insertError) {
      console.log('[savePage] insert error:', insertError.message)
      return { error: insertError.message }
    }

    revalidatePath('/dashboard/page-editor')
    if (newSlug) revalidatePath(`/p/${newSlug}`)
    return { slug: newSlug || undefined }
  }

  // Row updated — check if it has a slug; if not, generate and save one now
  let slug = updatedRows[0].slug

  if (!slug) {
    const newSlug = buildSlug(data.restaurant_name, user.email ?? '')
    if (newSlug) {
      const { error: slugError } = await admin
        .from('client_pages')
        .update({ slug: newSlug })
        .eq('user_id', user.id)
      if (slugError) {
        console.log('[savePage] slug update error:', slugError.message)
      } else {
        slug = newSlug
      }
    }
  }

  revalidatePath('/dashboard/page-editor')
  if (slug) {
    revalidatePath(`/p/${slug}`)
    console.log('[savePage] revalidated /p/' + slug)
  }

  return { slug: slug ?? undefined }
}

export async function saveMenuSections(
  sections: MenuSectionData[],
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('client_pages')
    .update({ menu_sections: sections as unknown as Json, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  return {}
}

export async function updateMenuItemPhotoUrl(
  itemId: string,
  photoUrl: string,
  slug: string,
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const admin = createAdminClient()

  // Fetch the specific page row by both user_id and slug
  const { data: row, error: fetchError } = await admin
    .from('client_pages')
    .select('menu_sections')
    .eq('user_id', user.id)
    .eq('slug', slug)
    .maybeSingle()

  if (fetchError) return { error: fetchError.message }
  if (!row) return { error: `Page not found for slug "${slug}"` }

  const sections = (row.menu_sections ?? []) as MenuSectionData[]
  const updated = sections.map(s => ({
    ...s,
    items: s.items.map((i: MenuItemData) =>
      i.id === itemId ? { ...i, photo_url: photoUrl } : i,
    ),
  }))

  const { error: updateError } = await admin
    .from('client_pages')
    .update({ menu_sections: updated as unknown as Json, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('slug', slug)

  if (updateError) return { error: updateError.message }

  console.log('[ItemPhoto] saved photo_url for item', itemId, 'on slug', slug, ':', photoUrl)
  return {}
}

export async function saveLogoUrl(url: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('client_pages')
    .update({ logo_url: url, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  console.log('[LogoUpload] saved logo_url:', url)
  return {}
}

export async function uploadImage(
  formData: FormData,
): Promise<{ url: string } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const file = formData.get('file') as File | null
  if (!file || file.size === 0) return { error: 'No file provided' }

  const ext  = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${user.id}/${Date.now()}.${ext}`

  const admin = createAdminClient()
  const { error: uploadError } = await admin.storage
    .from('page-assets')
    .upload(path, file, { upsert: true })

  if (uploadError) return { error: uploadError.message }

  const { data: { publicUrl } } = admin.storage.from('page-assets').getPublicUrl(path)
  return { url: publicUrl }
}

export async function uploadMenuItemPhoto(
  formData: FormData,
  itemId: string,
): Promise<{ url: string } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const file = formData.get('file') as File | null
  if (!file || file.size === 0) return { error: 'No file provided' }

  const ext  = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${user.id}/menu/${itemId}.${ext}`

  const admin = createAdminClient()
  const { error: uploadError } = await admin.storage
    .from('page-assets')
    .upload(path, file, { upsert: true })

  if (uploadError) return { error: uploadError.message }

  const { data: { publicUrl } } = admin.storage.from('page-assets').getPublicUrl(path)
  return { url: publicUrl }
}

export async function uploadLogo(
  formData: FormData,
): Promise<{ url: string } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const file = formData.get('file') as File | null
  if (!file || file.size === 0) return { error: 'No file provided' }

  const ext  = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${user.id}/logo.${ext}`

  const admin = createAdminClient()
  const { error: uploadError } = await admin.storage
    .from('client-assets')
    .upload(path, file, { upsert: true })

  if (uploadError) return { error: uploadError.message }

  const { data: { publicUrl } } = admin.storage.from('client-assets').getPublicUrl(path)
  return { url: publicUrl }
}
