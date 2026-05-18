import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { FilledContractEn } from './filled-client'

export const dynamic = 'force-dynamic'

const PLAN_AMOUNTS: Record<string, number> = {
  basic_monthly: 49, basic_yearly: 499, pro_monthly: 100, pro_yearly: 900,
}

export default async function FilledContractEnPage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params
  const admin = createAdminClient()

  const [profileRes, subRes, pageRes, standsRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any).from('profiles')
      .select('id, full_name, email')
      .eq('id', clientId).maybeSingle(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any).from('subscriptions')
      .select('plan, amount, custom_amount, payment_method, next_billing_date')
      .eq('user_id', clientId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    admin.from('client_pages')
      .select('restaurant_name, address, city, phone')
      .eq('user_id', clientId).maybeSingle(),
    admin.from('nfc_stands')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', clientId),
  ])

  if (!profileRes.data) notFound()

  const profile   = profileRes.data  as { id: string; full_name: string | null; email: string }
  const sub       = subRes.data      as { plan: string | null; amount: number | null; custom_amount: number | null; payment_method: string | null; next_billing_date: string | null } | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const page      = pageRes.data     as { restaurant_name: string | null; address: string | null; city: string | null; phone: string | null } | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const standsCount = (standsRes as any).count ?? 0

  const plan   = sub?.plan ?? null
  const amount = sub?.custom_amount ?? sub?.amount ?? (plan ? (PLAN_AMOUNTS[plan] ?? 0) : 0)

  return (
    <FilledContractEn
      data={{
        clientId,
        fullName:        profile.full_name,
        email:           profile.email,
        restaurantName:  page?.restaurant_name ?? null,
        address:         page?.address         ?? null,
        city:            page?.city            ?? null,
        phone:           page?.phone           ?? null,
        plan,
        amount,
        paymentMethod:   sub?.payment_method    ?? null,
        nextBillingDate: sub?.next_billing_date ?? null,
        standsCount,
        today: new Date().toISOString().split('T')[0],
      }}
    />
  )
}
