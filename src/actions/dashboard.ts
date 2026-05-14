'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import type { SubscriptionData } from '@/components/dashboard/subscription-card'

export async function getSubscription(userId: string): Promise<SubscriptionData | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('subscriptions')
    .select('plan, status, next_billing_date, amount, payment_method, custom_amount')
    .eq('user_id', userId)
    .maybeSingle()
  return (data as SubscriptionData | null) ?? null
}
