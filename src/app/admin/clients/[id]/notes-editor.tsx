'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { saveAdminNotes } from '@/actions/admin-clients'

export function NotesEditor({ clientId, initialNotes }: { clientId: string; initialNotes: string }) {
  const [notes,  setNotes]  = useState(initialNotes)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const res = await saveAdminNotes(clientId, notes)
      if (res.error) { toast.error(res.error); return }
      toast.success('Notes saved')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-semibold text-white text-sm">Private Notes</h2>
          <p className="font-sans text-[11px] text-white/30 mt-0.5">Only visible to admin</p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-1.5 rounded-lg font-sans text-xs font-semibold transition-colors disabled:opacity-50"
          style={{ background: '#2B5CE6', color: '#fff' }}
        >
          {saving ? 'Saving…' : 'Save Notes'}
        </button>
      </div>

      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        disabled={saving}
        rows={4}
        placeholder="Add any internal notes about this client…"
        className="w-full px-3.5 py-2.5 rounded-xl font-sans text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#2B5CE6] disabled:opacity-50 transition-colors resize-none"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
      />
    </div>
  )
}
