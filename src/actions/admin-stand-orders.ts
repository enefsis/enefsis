'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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

export async function markStandOrderFulfilled(
  orderId: string,
): Promise<{ error?: string }> {
  await requireAdmin()

  const admin = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('stand_orders')
    .update({ status: 'fulfilled' })
    .eq('id', orderId)

  if (error) return { error: error.message }

  revalidatePath('/admin/stand-orders')
  revalidatePath('/admin')
  return {}
}
