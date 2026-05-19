'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteAgent } from '@/actions/admin-agents'

export function DeleteAgentButton({ agentId }: { agentId: string }) {
  const router  = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting,   setDeleting]   = useState(false)

  async function handleDelete() {
    setDeleting(true)
    const result = await deleteAgent(agentId)
    if (result?.error) {
      toast.error(result.error)
      setDeleting(false)
      setConfirming(false)
    } else {
      toast.success('Agent deleted')
      router.push('/admin/agents')
    }
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-sans text-sm font-medium border transition-colors"
        style={{ background: 'rgba(248,113,113,0.08)', borderColor: 'rgba(248,113,113,0.25)', color: '#F87171' }}
      >
        Delete Agent
      </button>
    )
  }

  return (
    <div className="inline-flex items-center gap-2">
      <span className="font-sans text-xs text-white/40">Are you sure?</span>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="px-4 py-2 rounded-xl font-sans text-sm font-semibold transition-colors disabled:opacity-50"
        style={{ background: 'rgba(248,113,113,0.15)', color: '#F87171', border: '1px solid rgba(248,113,113,0.35)' }}
      >
        {deleting ? 'Deleting…' : 'Yes, delete'}
      </button>
      <button
        onClick={() => setConfirming(false)}
        disabled={deleting}
        className="px-4 py-2 rounded-xl font-sans text-sm font-medium transition-colors disabled:opacity-50"
        style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        Cancel
      </button>
    </div>
  )
}
