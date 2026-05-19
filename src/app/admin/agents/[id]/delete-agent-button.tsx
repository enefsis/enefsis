'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteAgent } from '@/actions/admin-agents'

export function DeleteAgentButton({ agentId, agentName }: { agentId: string; agentName: string }) {
  const router             = useRouter()
  const [open,    setOpen]    = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    const result = await deleteAgent(agentId)
    if (result?.error) {
      toast.error(result.error)
      setDeleting(false)
      setOpen(false)
    } else {
      toast.success('Agent deleted')
      router.push('/admin/agents')
    }
  }

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="w-full px-5 py-2.5 rounded-xl font-sans text-sm font-medium border transition-colors"
        style={{ background: 'rgba(248,113,113,0.07)', borderColor: 'rgba(248,113,113,0.22)', color: '#F87171' }}
      >
        Delete Agent
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => { if (!deleting) setOpen(false) }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 space-y-4"
            style={{ background: '#141720', border: '1px solid rgba(255,255,255,0.08)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="#F87171" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Text */}
            <div>
              <h2 className="font-display font-semibold text-white text-base">
                Delete {agentName}?
              </h2>
              <p className="font-sans text-sm text-white/45 mt-1.5 leading-relaxed">
                This will permanently delete this agent. Assigned clients will be unassigned.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl font-sans text-sm font-semibold transition-colors disabled:opacity-50"
                style={{ background: 'rgba(248,113,113,0.15)', color: '#F87171', border: '1px solid rgba(248,113,113,0.35)' }}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
              <button
                onClick={() => setOpen(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl font-sans text-sm font-medium transition-colors disabled:opacity-50"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
