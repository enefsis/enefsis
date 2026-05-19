'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function submitStandOrder(
  quantity: number,
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
    return { error: 'Quantity must be between 1 and 50.' }
  }

  const admin = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from('stand_orders').insert({
    user_id:  user.id,
    quantity,
    amount:   quantity * 20,
    status:   'pending',
  })

  if (error) return { error: error.message }
  return {}
}
