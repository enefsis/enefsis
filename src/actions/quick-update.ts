'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Json } from '@/types/database'
import type { MenuSectionData } from './page-editor'

export async function toggleItemAvailability(
  sectionId: string,
  itemId:    string,
  available: boolean,
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  // Fetch current menu_sections
  const { data: pageRaw, error: fetchErr } = await admin
    .from('client_pages')
    .select('menu_sections')
    .eq('user_id', user.id)
    .maybeSingle()

  if (fetchErr) return { error: fetchErr.message }
  if (!pageRaw) return { error: 'Page not found' }

  const sections = (pageRaw.menu_sections ?? []) as MenuSectionData[]

  // Patch the target item's available flag
  const updated = sections.map(section => {
    if (section.id !== sectionId) return section
    return {
      ...section,
      items: section.items.map(item =>
        item.id === itemId ? { ...item, available } : item
      ),
    }
  })

  const { error: saveErr } = await admin
    .from('client_pages')
    .update({ menu_sections: updated as unknown as Json })
    .eq('user_id', user.id)

  if (saveErr) return { error: saveErr.message }

  revalidatePath('/dashboard/quick-update')
  return {}
}

export async function saveSpecials(specials: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  const { error } = await admin
    .from('client_pages')
    .update({ todays_specials: specials.trim() || null })
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/quick-update')
  return {}
}
