import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('sales_agents')
    .select('id, name, territory, commission_rate')
    .order('name')

  if (error) {
    console.error('[API/agents] error:', error)
    return NextResponse.json({ agents: [] })
  }

  console.log('[API/agents] returning:', data?.length, 'agents')
  return NextResponse.json({ agents: data || [] })
}
