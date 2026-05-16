import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { EditForm } from './edit-form'

type Profile = { full_name: string | null; email: string; created_at: string }
type Sub     = {
  plan:            string | null
  status:          string | null
  payment_method:  string | null
  custom_amount:   number | null
  payment_notes:   string | null
}

export default async function ClientEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const admin   = createAdminClient()

  const [profileRes, subRes] = await Promise.all([
    admin.from('profiles').select('full_name, email, created_at').eq('id', id).maybeSingle(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin.from('subscriptions') as any)
      .select('plan, status, payment_method, custom_amount, payment_notes')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const profile = profileRes.data as Profile | null
  if (!profile) notFound()

  const sub = subRes.data as Sub | null

  return (
    <EditForm
      clientId={id}
      fullName={profile.full_name ?? ''}
      email={profile.email}
      joinedDate={profile.created_at.slice(0, 10)}
      plan={sub?.plan ?? 'basic_monthly'}
      status={sub?.status ?? 'active'}
      paymentMethod={sub?.payment_method ?? 'stripe'}
      customAmount={sub?.custom_amount ?? null}
      paymentNotes={sub?.payment_notes ?? ''}
      backHref={`/admin/clients/${id}`}
    />
  )
}
