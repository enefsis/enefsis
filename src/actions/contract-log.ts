'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function logContractGenerated(params: {
  userId: string
  language: string
  plan: string
  amount: number
  stands: number
  installDate: string
}): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const admin = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from('contract_logs').insert({
    user_id:      params.userId,
    language:     params.language,
    plan:         params.plan,
    amount:       params.amount,
    stands:       params.stands,
    install_date: params.installDate,
    generated_by: user.id,
  })

  if (error) return { error: error.message }
  return {}
}
