'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe/client'
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

async function getStripeCustomerByEmail(email: string) {
  const result = await stripe.customers.list({ email, limit: 1 })
  return result.data[0] ?? null
}

export async function setSubscriptionStatus(
  subscriptionId: string,
  status: string,
): Promise<{ error?: string }> {
  const admin = await requireAdmin()

  if (!['active', 'suspended', 'cancelled'].includes(status)) {
    return { error: 'Invalid status.' }
  }

  const { error } = await admin
    .from('subscriptions')
    .update({ status })
    .eq('id', subscriptionId)

  if (error) return { error: error.message }

  revalidatePath('/admin/subscriptions')
  revalidatePath('/admin')
  return {}
}

export async function cancelStripeSubscription(
  userId: string,
): Promise<{ error?: string }> {
  const admin = await requireAdmin()

  const { data: profileRaw } = await admin
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .maybeSingle()

  const email = (profileRaw as { email: string } | null)?.email
  if (!email) return { error: 'User not found.' }

  const customer = await getStripeCustomerByEmail(email)
  if (!customer) return { error: 'No Stripe customer found for this user.' }

  const subs = await stripe.subscriptions.list({ customer: customer.id, status: 'active', limit: 1 })
  const stripeSub = subs.data[0]
  if (!stripeSub) return { error: 'No active Stripe subscription found.' }

  await stripe.subscriptions.cancel(stripeSub.id)

  await admin.from('subscriptions').update({ status: 'cancelled' }).eq('user_id', userId)

  revalidatePath('/admin/subscriptions')
  revalidatePath('/admin')
  return {}
}

export async function refundLastPayment(
  userId: string,
  amountCents: number,
): Promise<{ error?: string }> {
  const admin = await requireAdmin()

  const { data: profileRaw } = await admin
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .maybeSingle()

  const email = (profileRaw as { email: string } | null)?.email
  if (!email) return { error: 'User not found.' }

  const customer = await getStripeCustomerByEmail(email)
  if (!customer) return { error: 'No Stripe customer found for this user.' }

  const charges = await stripe.charges.list({ customer: customer.id, limit: 1 })
  const charge = charges.data[0]
  if (!charge) return { error: 'No charges found for this customer.' }
  if (charge.refunded) return { error: 'Latest charge is already fully refunded.' }

  await stripe.refunds.create({
    charge: charge.id,
    ...(amountCents > 0 && { amount: amountCents }),
  })

  return {}
}
