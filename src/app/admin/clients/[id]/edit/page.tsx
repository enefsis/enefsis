import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { EditForm } from './edit-form'

type Profile  = { full_name: string | null; email: string; created_at: string; admin_notes: string | null; agent_id: string | null }
type Sub      = { plan: string | null; status: string | null; payment_method: string | null; custom_amount: number | null; payment_notes: string | null }
type AgentRow = { id: string; full_name: string; territory: string | null }

export default async function ClientEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id }  = await params
  const admin   = createAdminClient()

  const [profileRes, subRes, agentsRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin.from('profiles') as any)
      .select('full_name, email, created_at, admin_notes, agent_id')
      .eq('id', id).maybeSingle(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin.from('subscriptions') as any)
      .select('plan, status, payment_method, custom_amount, payment_notes')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any).from('agents')
      .select('id, full_name, territory')
      .eq('status', 'active')
      .order('full_name', { ascending: true }),
  ])

  const profile = profileRes.data as Profile | null
  if (!profile) notFound()

  const sub    = subRes.data    as Sub        | null
  const agents = (agentsRes.data as AgentRow[] | null) ?? []

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
      adminNotes={profile.admin_notes ?? ''}
      agentId={profile.agent_id ?? null}
      agents={agents}
      backHref={`/admin/clients/${id}`}
    />
  )
}
