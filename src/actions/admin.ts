'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
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

  const profile = raw as Pick<Profile, 'role'> | null
  if (profile?.role !== 'admin') redirect('/dashboard')

  return admin
}

export async function toggleSubscriptionStatus(formData: FormData) {
  const admin = await requireAdmin()

  const subscriptionId = formData.get('subscriptionId') as string | null
  const newStatus      = formData.get('newStatus')      as string | null

  if (!subscriptionId || !newStatus || !['active', 'suspended'].includes(newStatus)) return

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin.from('subscriptions') as any)
    .update({ status: newStatus })
    .eq('id', subscriptionId)

  revalidatePath('/admin')
  revalidatePath('/admin/clients')
  redirect('/admin/clients')
}
