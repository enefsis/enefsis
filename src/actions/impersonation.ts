'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function exitImpersonation() {
  const supabase = await createClient()
  await supabase.auth.signOut()

  const cookieStore = await cookies()
  cookieStore.delete('admin_impersonating')

  redirect('/admin/clients')
}
