import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { FilledContractEn } from './filled-client'

export const dynamic = 'force-dynamic'

const PLAN_AMOUNTS: Record<string, number> = {
  basic_monthly: 49, basic_yearly: 499, pro_monthly: 100, pro_yearly: 900,
}

function addOneMonth(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const next = new Date(y, m, d)
  return [
    next.getFullYear(),
    String(next.getMonth() + 1).padStart(2, '0'),
    String(next.getDate()).padStart(2, '0'),
  ].join('-')
}

export default async function FilledContractEnPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>
  searchParams: Promise<{ start?: string; billing?: string }>
}) {
  const { clientId } = await params
  const { start, billing } = await searchParams
  const admin = createAdminClient()

  const [profileRes, subRes, pageRes, standsRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any).from('profiles')
      .select('id, full_name, email, created_at')
      .eq('id', clientId).maybeSingle(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any).from('subscriptions')
      .select('plan, amount, custom_amount, payment_method')
      .eq('user_id', clientId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    admin.from('client_pages')
      .select('restaurant_name, address, city, phone')
      .eq('user_id', clientId).maybeSingle(),
    admin.from('nfc_stands')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', clientId),
  ])

  if (!profileRes.data) notFound()

  const profile     = profileRes.data as { id: string; full_name: string | null; email: string; created_at: string }
  const sub         = subRes.data     as { plan: string | null; amount: number | null; custom_amount: number | null; payment_method: string | null } | null
  const page        = pageRes.data    as { restaurant_name: string | null; address: string | null; city: string | null; phone: string | null } | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const standsCount = (standsRes as any).count ?? 0

  const plan   = sub?.plan ?? null
  const amount = sub?.custom_amount ?? sub?.amount ?? (plan ? (PLAN_AMOUNTS[plan] ?? 0) : 0)

  const serviceStartDate = start   ?? profile.created_at.split('T')[0]
  const firstBillingDate = billing ?? addOneMonth(serviceStartDate)

  return (
    <FilledContractEn
      data={{
        clientId,
        fullName:         profile.full_name,
        email:            profile.email,
        restaurantName:   page?.restaurant_name ?? null,
        address:          page?.address         ?? null,
        city:             page?.city            ?? null,
        phone:            page?.phone           ?? null,
        plan,
        amount,
        paymentMethod:    sub?.payment_method ?? null,
        nextBillingDate:  firstBillingDate,
        standsCount,
        today:            new Date().toISOString().split('T')[0],
        serviceStartDate,
      }}
    />
  )
}
