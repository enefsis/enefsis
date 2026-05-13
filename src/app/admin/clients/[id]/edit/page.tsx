import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { EditForm } from './edit-form'

type Profile = { full_name: string | null; email: string }
type Sub     = { plan: string | null; status: string | null }

export default async function ClientEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const admin   = createAdminClient()

  const [profileRes, subRes] = await Promise.all([
    admin.from('profiles').select('full_name, email').eq('id', id).maybeSingle(),
    admin.from('subscriptions').select('plan, status').eq('user_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ])

  const profile = profileRes.data as Profile | null
  if (!profile) notFound()

  const sub = subRes.data as Sub | null

  return (
    <EditForm
      clientId={id}
      fullName={profile.full_name ?? ''}
      email={profile.email}
      plan={sub?.plan ?? 'basic_monthly'}
      status={sub?.status ?? 'active'}
      backHref={`/admin/clients/${id}`}
    />
  )
}
