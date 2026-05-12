'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendWelcomeEmail } from '@/lib/email'
import type { Profile } from '@/types/database'

export type CreateClientResult =
  | { success: true;  slug: string; tempPassword: string; userId: string }
  | { success: false; error: string }

export async function createClientAccount(
  formData: FormData,
): Promise<CreateClientResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  const { data: rawProfile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()
  const profile = rawProfile as Pick<Profile, 'role'> | null
  if (profile?.role !== 'admin') redirect('/dashboard')

  // ── Parse inputs ──
  const fullName  = (formData.get('full_name')     as string | null)?.trim() ?? ''
  const email     = (formData.get('email')          as string | null)?.trim() ?? ''
  const bizName   = (formData.get('business_name')  as string | null)?.trim() ?? ''
  const plan      = (formData.get('plan')           as string | null)?.trim() ?? 'basic'
  const billing   = (formData.get('billing')        as string | null)?.trim() ?? 'monthly'
  const slug      = (formData.get('slug')           as string | null)?.trim() ?? ''
  const nfcCount  = Math.min(20, Math.max(1, parseInt(
    (formData.get('nfc_count') as string | null) ?? '1', 10,
  )))

  if (!fullName || !email || !slug) {
    return { success: false, error: 'Full name, email, and slug are required.' }
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { success: false, error: 'Slug must only contain lowercase letters, numbers, and hyphens.' }
  }

  // ── Slug uniqueness ──
  const { data: slugTaken } = await admin
    .from('client_pages')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()
  if (slugTaken) return { success: false, error: 'This slug is already in use.' }

  // ── Email uniqueness (check auth.users via admin API) ──
  const { data: existingUsers } = await admin.auth.admin.listUsers()
  const emailTaken = existingUsers?.users.some(
    u => u.email?.toLowerCase() === email.toLowerCase(),
  )
  if (emailTaken) {
    return { success: false, error: 'A user with this email already exists.' }
  }

  // ── Generate temp password ──
  const tempPassword =
    'Enf-' +
    Math.random().toString(36).slice(2, 8) +
    '-' +
    Math.random().toString(36).slice(2, 5) +
    '!'

  // ── 1. Create auth user ──
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password:      tempPassword,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })
  if (authError || !authData.user) {
    return { success: false, error: authError?.message ?? 'Failed to create auth user.' }
  }
  const userId = authData.user.id

  // Helper: rollback auth user on any subsequent failure
  async function rollback() {
    await admin.auth.admin.deleteUser(userId)
  }

  // ── 2. Upsert profile ──
  const { error: profileError } = await admin.from('profiles').upsert({
    id:        userId,
    email,
    full_name: fullName,
    role:      'user',
  }, { onConflict: 'id' })
  if (profileError) {
    await rollback()
    return { success: false, error: profileError.message }
  }

  // ── 3. Create client_pages ──
  const { error: pageError } = await admin.from('client_pages').insert({
    user_id:         userId,
    slug,
    restaurant_name: bizName || fullName,
    menu_sections:   [],
  })
  if (pageError) {
    await rollback()
    return { success: false, error: pageError.message }
  }

  // ── 4. Create subscription ──
  const AMOUNTS: Record<string, Record<string, number>> = {
    basic: { monthly: 49,  yearly: 499 },
    pro:   { monthly: 100, yearly: 900 },
  }
  const amount = AMOUNTS[plan]?.[billing] ?? (plan === 'pro' ? 100 : 49)
  const nextBilling = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]
  const { error: subError } = await admin.from('subscriptions').insert({
    user_id:           userId,
    plan,
    status:            'active',
    amount,
    next_billing_date: nextBilling,
  })
  if (subError) {
    await rollback()
    return { success: false, error: subError.message }
  }

  // ── 5. Create NFC stands ──
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const stands = Array.from({ length: nfcCount }, (_, i) => {
    const standId = crypto.randomUUID()
    return {
      id:               standId,
      user_id:          userId,
      name:             `${bizName || fullName} – Stand ${i + 1}`,
      landing_page_url: `${appUrl}/p/${slug}?sid=${standId}`,
    }
  })
  const { error: standError } = await admin.from('nfc_stands').insert(stands)
  if (standError) {
    await rollback()
    return { success: false, error: standError.message }
  }

  revalidatePath('/admin/clients')

  await sendWelcomeEmail({
    name:         fullName,
    email,
    loginUrl:     'https://enefsis.vercel.app/login',
    tempPassword,
  })

  return { success: true, slug, tempPassword, userId }
}
