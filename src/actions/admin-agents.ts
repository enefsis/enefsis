'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const admin = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (admin as any).from('profiles').select('role').eq('id', user.id).maybeSingle()
  return data?.role === 'admin' ? admin : null
}

export async function createAgent(formData: FormData): Promise<{ error?: string }> {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Unauthorized' }

  const fullName       = (formData.get('full_name')       as string ?? '').trim()
  const email          = (formData.get('email')           as string ?? '').trim().toLowerCase()
  const phone          = (formData.get('phone')           as string ?? '').trim()
  const territory      = (formData.get('territory')       as string ?? '').trim()
  const commissionRate = parseFloat(formData.get('commission_rate') as string ?? '20')
  const notes          = (formData.get('notes')           as string ?? '').trim()

  if (!fullName) return { error: 'Full name is required' }
  if (!email)    return { error: 'Email is required' }
  if (isNaN(commissionRate) || commissionRate < 0 || commissionRate > 100) {
    return { error: 'Commission rate must be between 0 and 100' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from('sales_agents').insert({
    name:            fullName,
    email,
    phone:           phone    || null,
    territory:       territory || null,
    commission_rate: commissionRate,
    notes:           notes    || null,
    status:          'active',
  })

  if (error) return { error: error.message }

  revalidatePath('/admin/agents')
  return {}
}

export async function updateAgent(formData: FormData): Promise<{ error?: string }> {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Unauthorized' }

  const agentId        = (formData.get('agent_id')        as string ?? '').trim()
  const fullName       = (formData.get('full_name')       as string ?? '').trim()
  const email          = (formData.get('email')           as string ?? '').trim().toLowerCase()
  const phone          = (formData.get('phone')           as string ?? '').trim()
  const territory      = (formData.get('territory')       as string ?? '').trim()
  const commissionRate = parseFloat(formData.get('commission_rate') as string ?? '20')
  const status         = (formData.get('status')          as string ?? 'active').trim()
  const notes          = (formData.get('notes')           as string ?? '').trim()

  if (!agentId)  return { error: 'Agent ID is required' }
  if (!fullName) return { error: 'Full name is required' }
  if (!email)    return { error: 'Email is required' }
  if (isNaN(commissionRate) || commissionRate < 0 || commissionRate > 100) {
    return { error: 'Commission rate must be between 0 and 100' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from('sales_agents').update({
    name:            fullName,
    email,
    phone:           phone     || null,
    territory:       territory || null,
    commission_rate: commissionRate,
    status,
    notes:           notes     || null,
  }).eq('id', agentId)

  if (error) return { error: error.message }

  revalidatePath(`/admin/agents/${agentId}`)
  revalidatePath('/admin/agents')
  return {}
}

export async function markCommissionPaid(
  commissionId: string,
  agentId: string,
): Promise<{ error?: string }> {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Unauthorized' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from('agent_commissions')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', commissionId)

  if (error) return { error: error.message }

  revalidatePath(`/admin/agents/${agentId}`)
  revalidatePath('/admin/agents')
  return {}
}

export async function updateAgentStatus(
  agentId: string,
  status: 'active' | 'inactive',
): Promise<{ error?: string }> {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Unauthorized' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from('sales_agents').update({ status }).eq('id', agentId)
  if (error) return { error: error.message }

  revalidatePath('/admin/agents')
  return {}
}
