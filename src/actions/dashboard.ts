'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import type { SubscriptionData } from '@/components/dashboard/subscription-card'
import type { ChecklistData } from '@/components/dashboard/getting-started-card'

export async function getSubscription(userId: string): Promise<SubscriptionData | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('subscriptions')
    .select('plan, status, next_billing_date, amount, payment_method, custom_amount')
    .eq('user_id', userId)
    .maybeSingle()
  return (data as SubscriptionData | null) ?? null
}

export async function getChecklist(userId: string): Promise<ChecklistData> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('client_pages')
    .select('logo_url, google_review_url, menu_sections, instagram_url, facebook_url, tiktok_url, whatsapp_number, opening_hours')
    .eq('user_id', userId)
    .maybeSingle()

  const page = data as {
    logo_url:          string | null
    google_review_url: string | null
    menu_sections:     unknown
    instagram_url:     string | null
    facebook_url:      string | null
    tiktok_url:        string | null
    whatsapp_number:   string | null
    opening_hours:     string | null
  } | null

  const sections = Array.isArray(page?.menu_sections)
    ? (page!.menu_sections as { items?: unknown[] }[])
    : []

  return {
    hasLogo:         !!page?.logo_url         && page.logo_url         !== '',
    hasGoogleReview: !!page?.google_review_url && page.google_review_url !== '',
    hasMenu:         sections.length > 0 && sections.some(s => (s.items?.length ?? 0) > 0),
    hasSocials:      !!(
      (page?.instagram_url   && page.instagram_url   !== '') ||
      (page?.facebook_url    && page.facebook_url    !== '') ||
      (page?.tiktok_url      && page.tiktok_url      !== '') ||
      (page?.whatsapp_number && page.whatsapp_number !== '')
    ),
    hasOpeningHours: !!page?.opening_hours && page.opening_hours !== '',
  }
}
