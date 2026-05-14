'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function exitImpersonation() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_impersonating')
  redirect('/admin/clients')
}
