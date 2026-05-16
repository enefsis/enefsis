'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { logActivity } from '@/lib/activity-log'

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

  await logActivity(userId, 'Stand added')
  revalidatePath('/admin/nfc-stands')
  return {}
}
