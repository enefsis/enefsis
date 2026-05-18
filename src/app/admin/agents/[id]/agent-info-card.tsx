'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateAgent } from '@/actions/admin-agents'

export type AgentData = {
  id:              string
  full_name:       string
  email:           string
  phone:           string | null
  territory:       string | null
  commission_rate: number | string
  status:          string
  notes:           string | null
  created_at:      string
}

const inputCls = 'w-full h-10 px-3.5 rounded-xl font-sans text-sm text-white outline-none transition-colors'
const inputStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-white/[0.04] last:border-0">
      <span className="font-sans text-xs text-white/40 shrink-0 w-32">{label}</span>
      <span className="font-sans text-sm text-white/75 text-right">{value ?? '—'}</span>
    </div>
  )
}

export function AgentInfoCard({ agent }: { agent: AgentData }) {
  const router = useRouter()

  const [editing, setEditing] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const rate = parseFloat(String(agent.commission_rate))

  // Edit form state — initialised from props
  const [fullName,       setFullName]       = useState(agent.full_name)
  const [email,          setEmail]          = useState(agent.email)
  const [phone,          setPhone]          = useState(agent.phone ?? '')
  const [territory,      setTerritory]      = useState(agent.territory ?? '')
  const [commissionRate, setCommissionRate] = useState(String(rate))
  const [status,         setStatus]         = useState(agent.status)
  const [notes,          setNotes]          = useState(agent.notes ?? '')

  function cancelEdit() {
    setEditing(false)
    setError(null)
    setFullName(agent.full_name)
    setEmail(agent.email)
    setPhone(agent.phone ?? '')
    setTerritory(agent.territory ?? '')
    setCommissionRate(String(rate))
    setStatus(agent.status)
    setNotes(agent.notes ?? '')
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const fd = new FormData()
    fd.set('agent_id',        agent.id)
    fd.set('full_name',       fullName)
    fd.set('email',           email)
    fd.set('phone',           phone)
    fd.set('territory',       territory)
    fd.set('commission_rate', commissionRate)
    fd.set('status',          status)
    fd.set('notes',           notes)

    const result = await updateAgent(fd)

    if (result.error) {
      setError(result.error)
      setSaving(false)
      return
    }

    toast.success('Agent updated')
    router.refresh()
    setEditing(false)
    setSaving(false)
  }

  const isActive = agent.status === 'active'

  // ── View mode ────────────────────────────────────────────────────────────────
  if (!editing) {
    return (
      <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-white">Agent Info</h2>
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-sans text-sm font-medium transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.09)' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Edit
          </button>
        </div>
        <div>
          <Row label="Full Name"        value={agent.full_name} />
          <Row label="Email"            value={agent.email} />
          <Row label="Phone"            value={agent.phone} />
          <Row label="Territory"        value={agent.territory} />
          <Row label="Commission Rate"  value={`${rate}%`} />
          <Row label="Joined"           value={fmt(agent.created_at)} />
          <Row label="Status"           value={
            <span
              className="inline-flex items-center gap-1.5 font-sans text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
              style={isActive
                ? { color: '#34D399', background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.20)' }
                : { color: '#FBBF24', background: 'rgba(251,191,36,0.10)',  border: '1px solid rgba(251,191,36,0.20)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: isActive ? '#34D399' : '#FBBF24' }} />
              {isActive ? 'Active' : 'Inactive'}
            </span>
          } />
          {agent.notes && (
            <Row label="Notes" value={<span className="text-white/50 text-xs">{agent.notes}</span>} />
          )}
        </div>
      </div>
    )
  }

  // ── Edit mode ────────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5">
      <h2 className="font-display font-semibold text-white mb-4">Edit Agent</h2>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-sans text-xs text-white/40 mb-1.5">Full Name *</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
              required disabled={saving} className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="block font-sans text-xs text-white/40 mb-1.5">Email *</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              required disabled={saving} className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="block font-sans text-xs text-white/40 mb-1.5">Phone</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              disabled={saving} className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="block font-sans text-xs text-white/40 mb-1.5">Territory</label>
            <input type="text" value={territory} onChange={e => setTerritory(e.target.value)}
              disabled={saving} className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="block font-sans text-xs text-white/40 mb-1.5">Commission Rate (%)</label>
            <div className="relative">
              <input type="number" value={commissionRate} onChange={e => setCommissionRate(e.target.value)}
                min="0" max="100" step="0.5" required disabled={saving}
                className={inputCls + ' pr-8'} style={inputStyle} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-sans text-sm text-white/30">%</span>
            </div>
          </div>
        </div>

        {/* Status toggle */}
        <div>
          <p className="font-sans text-xs text-white/40 mb-2">Status</p>
          <div className="flex gap-2">
            {(['active', 'inactive'] as const).map(s => (
              <button key={s} type="button" onClick={() => setStatus(s)} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-sans text-sm font-medium border transition-all disabled:opacity-50"
                style={status === s
                  ? s === 'active'
                    ? { background: 'rgba(52,211,153,0.10)', borderColor: 'rgba(52,211,153,0.30)', color: '#34D399' }
                    : { background: 'rgba(251,191,36,0.10)',  borderColor: 'rgba(251,191,36,0.30)',  color: '#FBBF24' }
                  : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block font-sans text-xs text-white/40 mb-1.5">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            rows={2} disabled={saving}
            className="w-full px-3.5 py-2.5 rounded-xl font-sans text-sm text-white outline-none resize-none"
            style={inputStyle} />
        </div>

        {error && (
          <p className="font-sans text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={saving}
            className="px-5 py-2.5 rounded-xl font-sans text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
            style={{ background: '#2B5CE6', color: '#fff' }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button type="button" onClick={cancelEdit} disabled={saving}
            className="px-5 py-2.5 rounded-xl font-sans text-sm font-medium transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
