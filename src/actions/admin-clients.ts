'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendWelcomeEmail } from '@/lib/email'
import { stripe } from '@/lib/stripe/client'
import type Stripe from 'stripe'
import type { Profile } from '@/types/database'

const EDIT_PRICE_IDS: Record<string, string> = {
  basic_monthly: process.env.STRIPE_BASIC_MONTHLY_PRICE_ID ?? '',
  basic_yearly:  process.env.STRIPE_BASIC_YEARLY_PRICE_ID  ?? '',
  pro_monthly:   process.env.STRIPE_PRO_MONTHLY_PRICE_ID   ?? '',
  pro_yearly:    process.env.STRIPE_PRO_YEARLY_PRICE_ID    ?? '',
}

const PLAN_AMOUNTS: Record<string, number> = {
  basic_monthly: 49,
  basic_yearly:  499,
  pro_monthly:   100,
  pro_yearly:    900,
  basic:         49,
  pro:           100,
}

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
  const nfcCount  = Math.min(100, Math.max(1, parseInt(
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

// ── Update existing client ────────────────────────────────────────────────────

export async function updateClientInfo(
  formData: FormData,
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  const { data: callerRaw } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()
  const caller = callerRaw as Pick<Profile, 'role'> | null
  if (caller?.role !== 'admin') redirect('/dashboard')

  const clientId      = (formData.get('clientId')       as string | null)?.trim() ?? ''
  const fullName      = (formData.get('full_name')      as string | null)?.trim() ?? ''
  const email         = (formData.get('email')          as string | null)?.trim().toLowerCase() ?? ''
  const plan          = (formData.get('plan')           as string | null)?.trim() ?? ''
  const status        = (formData.get('status')         as string | null)?.trim() ?? ''
  const paymentMethod = (formData.get('payment_method') as string | null)?.trim() ?? 'stripe'
  const customAmountStr = (formData.get('custom_amount') as string | null)?.trim() ?? ''
  const paymentNotes  = (formData.get('payment_notes')  as string | null)?.trim() ?? ''

  const customAmount = customAmountStr !== '' ? parseInt(customAmountStr, 10) : null

  if (!clientId)                                      return { error: 'Client ID missing.' }
  if (!fullName)                                      return { error: 'Name is required.' }
  if (!email || !email.includes('@'))                 return { error: 'Valid email is required.' }
  if (!['basic_monthly', 'basic_yearly', 'pro_monthly', 'pro_yearly', 'basic', 'pro'].includes(plan)) return { error: 'Invalid plan.' }
  if (!['active', 'suspended', 'cancelled'].includes(status)) return { error: 'Invalid status.' }
  if (!['stripe', 'cash', 'bank_transfer'].includes(paymentMethod)) return { error: 'Invalid payment method.' }
  if (customAmountStr !== '' && (isNaN(customAmount!) || customAmount! < 0)) return { error: 'Custom amount must be a positive number.' }

  // Fetch current email + subscription state to detect changes
  const [{ data: currentRaw }, { data: currentSubRaw }] = await Promise.all([
    admin.from('profiles').select('email').eq('id', clientId).maybeSingle(),
    admin.from('subscriptions').select('plan, status').eq('user_id', clientId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ])
  const currentEmail  = (currentRaw    as { email: string }              | null)?.email?.toLowerCase() ?? ''
  const currentPlan   = (currentSubRaw as { plan: string; status: string } | null)?.plan               ?? ''
  const currentStatus = (currentSubRaw as { plan: string; status: string } | null)?.status             ?? ''

  // Update profiles row
  const { error: profileErr } = await admin
    .from('profiles')
    .update({ full_name: fullName, email })
    .eq('id', clientId)
  if (profileErr) return { error: profileErr.message }

  // Update auth email only if it changed
  if (email !== currentEmail) {
    const { error: authErr } = await admin.auth.admin.updateUserById(clientId, { email })
    if (authErr) return { error: `Auth email update: ${authErr.message}` }
  }

  // Update subscription plan + status + payment fields
  // Only sync amount from plan default when no custom_amount is set
  const planAmount = customAmount === null ? (PLAN_AMOUNTS[plan] ?? null) : null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: subErr } = await (admin.from('subscriptions') as any)
    .update({
      plan,
      status,
      payment_method: paymentMethod,
      custom_amount:  customAmount,
      payment_notes:  paymentNotes || null,
      ...(planAmount !== null ? { amount: planAmount } : {}),
    })
    .eq('user_id', clientId)
  if (subErr) return { error: (subErr as { message: string }).message }

  revalidatePath(`/admin/clients/${clientId}`)
  revalidatePath('/admin/clients')
  revalidatePath('/admin')

  // ── Stripe sync ───────────────────────────────────────────────────────────
  const planChanged   = plan   !== currentPlan
  const statusChanged = status !== currentStatus

  if (planChanged || statusChanged) {
    try {
      const lookupEmail = currentEmail || email
      const customers   = await stripe.customers.list({ email: lookupEmail, limit: 1 })
      const customer    = customers.data[0] ?? null

      if (customer) {
        const subs     = await stripe.subscriptions.list({ customer: customer.id, status: 'active', limit: 1 })
        const stripeSub = subs.data[0] ?? null

        if (stripeSub) {
          if (status === 'cancelled') {
            await stripe.subscriptions.cancel(stripeSub.id)
          } else {
            if (planChanged) {
              const newPriceId = EDIT_PRICE_IDS[plan]
              if (newPriceId) {
                const item = stripeSub.items.data[0]
                await stripe.subscriptions.update(stripeSub.id, {
                  items: [{ id: item.id, price: newPriceId }],
                  proration_behavior: 'create_prorations',
                })
              }
            }
            if (statusChanged) {
              if (status === 'suspended') {
                await stripe.subscriptions.update(stripeSub.id, {
                  pause_collection: { behavior: 'void' },
                })
              } else if (status === 'active') {
                await stripe.subscriptions.update(stripeSub.id, {
                  pause_collection: '' as unknown as Stripe.SubscriptionUpdateParams.PauseCollection,
                })
              }
            }
          }
        }
      }
    } catch (stripeErr) {
      const msg = stripeErr instanceof Error ? stripeErr.message : 'Stripe sync failed'
      return { error: `Saved to DB but Stripe sync failed: ${msg}` }
    }
  }

  return {}
}

// ── Impersonate client ────────────────────────────────────────────────────────

export async function impersonateClient(
  userId: string,
): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()

  const { data: callerRaw } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()
  const caller = callerRaw as Pick<Profile, 'role'> | null
  if (caller?.role !== 'admin') return { error: 'Not authorized' }

  const { data: profileRaw } = await admin
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .maybeSingle()
  const clientProfile = profileRaw as { email: string } | null
  if (!clientProfile) return { error: 'Client not found' }

  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: clientProfile.email,
  })
  if (error || !data?.properties?.hashed_token) {
    return { error: error?.message ?? 'Failed to generate magic link' }
  }

  // Send the hashed_token to our own API route which calls verifyOtp
  // and sets the session cookies server-side — bypassing the fragment-based
  // flow that Next.js SSR never sees.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const url = `${appUrl}/api/admin/impersonate?token=${encodeURIComponent(data.properties.hashed_token)}&t=${Date.now()}`
  return { url }
}
