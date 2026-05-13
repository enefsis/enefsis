'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

export async function createNfcStand(
  userId: string,
  name: string,
  landingPageUrl: string,
): Promise<{ error?: string }> {
  if (!landingPageUrl.trim()) return { error: 'Landing page URL is required' }

  const admin = createAdminClient()
  const { error } = await admin.from('nfc_stands').insert({
    user_id:          userId,
    name:             name.trim() || null,
    landing_page_url: landingPageUrl.trim(),
  })

  if (error) return { error: error.message }

  revalidatePath('/admin/nfc-stands')
  return {}
}
