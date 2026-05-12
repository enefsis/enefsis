'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import type { Profile } from '@/types/database'

export type LoginState = { error: string | null }

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const supabase = await createClient()

  const email = (formData.get('email') as string | null)?.trim() ?? ''
  const password = (formData.get('password') as string | null) ?? ''

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const { error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    return { error: 'Invalid email or password.' }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Authentication failed. Please try again.' }
  }

  const adminClient = createAdminClient()
  const { data: profileRaw } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const profile = profileRaw as Pick<Profile, 'role'> | null

  redirect(profile?.role?.toLowerCase() === 'admin' ? '/admin' : '/dashboard')
}
