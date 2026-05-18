'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { markCommissionPaid } from '@/actions/admin-agents'

export function MarkPaidButton({
  commissionId,
  agentId,
}: {
  commissionId: string
  agentId: string
}) {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    const result = await markCommissionPaid(commissionId, agentId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Commission marked as paid')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="font-sans text-xs font-semibold px-3 py-1.5 rounded-lg transition-all active:scale-[0.97] disabled:opacity-50"
      style={{ background: 'rgba(52,211,153,0.12)', color: '#34D399', border: '1px solid rgba(52,211,153,0.22)' }}
    >
      {loading ? 'Saving…' : 'Mark as Paid'}
    </button>
  )
}
