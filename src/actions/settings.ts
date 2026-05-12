'use server'

import { createClient } from '@/lib/supabase/server'

export async function changePassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
): Promise<{ error?: string; success?: boolean }> {
  if (!currentPassword) return { error: 'Current password is required' }
  if (!newPassword || newPassword.length < 6) return { error: 'New password must be at least 6 characters' }
  if (newPassword !== confirmPassword) return { error: 'Passwords do not match' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { error: 'Not authenticated' }

  // Verify current password by re-authenticating
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })
  if (signInError) return { error: 'Current password is incorrect' }

  // Update to new password
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { error: error.message }

  return { success: true }
}
