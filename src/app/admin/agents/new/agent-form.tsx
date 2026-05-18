'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { createAgent } from '@/actions/admin-agents'

const inputCls =
  'w-full h-10 px-3.5 rounded-xl font-sans text-sm text-white outline-none transition-colors'
const inputStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.09)',
}

function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function AgentForm() {
  const router  = useRouter()
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState<string | null>(null)

  const [fullName,        setFullName]        = useState('')
  const [email,           setEmail]           = useState('')
  const [phone,           setPhone]           = useState('')
  const [territory,       setTerritory]       = useState('')
  const [commissionRate,  setCommissionRate]  = useState('20')
  const [notes,           setNotes]           = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const fd = new FormData()
    fd.set('full_name',       fullName)
    fd.set('email',           email)
    fd.set('phone',           phone)
    fd.set('territory',       territory)
    fd.set('commission_rate', commissionRate)
    fd.set('notes',           notes)

    const result = await createAgent(fd)

    if (result.error) {
      setError(result.error)
      setSaving(false)
      return
    }

    toast.success('Agent created successfully')
    router.push('/admin/agents')
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6 max-w-2xl">

      <Link
        href="/admin/agents"
        className="inline-flex items-center gap-2 font-sans text-sm text-white/40 hover:text-white/70 transition-colors"
      >
        <ArrowLeftIcon />
        Agents
      </Link>

      <div>
        <h1 className="font-display text-2xl font-bold text-white">Add Agent</h1>
        <p className="font-sans text-sm text-white/40 mt-1">Create a new sales agent and set their commission rate.</p>
      </div>

      {/* Contact */}
      <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5 space-y-4">
        <p className="font-sans text-[11px] font-semibold text-white/35 uppercase tracking-wider pb-1 border-b border-white/[0.05]">
          Contact Information
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-sans text-xs text-white/40 mb-1.5">Full Name *</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Christoph Huber"
              required
              className={inputCls}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block font-sans text-xs text-white/40 mb-1.5">Email *</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="christoph@example.com"
              required
              className={inputCls}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block font-sans text-xs text-white/40 mb-1.5">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+43 664 123 4567"
              className={inputCls}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block font-sans text-xs text-white/40 mb-1.5">Territory</label>
            <input
              type="text"
              value={territory}
              onChange={e => setTerritory(e.target.value)}
              placeholder="Wien 1–9"
              className={inputCls}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Commission */}
      <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5 space-y-4">
        <p className="font-sans text-[11px] font-semibold text-white/35 uppercase tracking-wider pb-1 border-b border-white/[0.05]">
          Commission
        </p>

        <div className="max-w-[200px]">
          <label className="block font-sans text-xs text-white/40 mb-1.5">
            Commission Rate (%)
          </label>
          <div className="relative">
            <input
              type="number"
              value={commissionRate}
              onChange={e => setCommissionRate(e.target.value)}
              min="0"
              max="100"
              step="0.5"
              required
              className={inputCls + ' pr-8'}
              style={inputStyle}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-sans text-sm text-white/30">%</span>
          </div>
          <p className="font-sans text-xs text-white/25 mt-1.5">
            Agent receives {commissionRate || '0'}% of MRR from their clients each month.
          </p>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5 space-y-4">
        <p className="font-sans text-[11px] font-semibold text-white/35 uppercase tracking-wider pb-1 border-b border-white/[0.05]">
          Notes
        </p>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          placeholder="Internal notes about this agent…"
          className="w-full px-3.5 py-2.5 rounded-xl font-sans text-sm text-white outline-none resize-none transition-colors"
          style={inputStyle}
        />
      </div>

      {error && (
        <p className="font-sans text-sm text-red-400 px-1">{error}</p>
      )}

      <div className="flex gap-3">
        <Link
          href="/admin/agents"
          className="px-5 py-2.5 rounded-xl font-sans text-sm font-medium transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-xl font-sans text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
          style={{ background: '#2B5CE6', color: '#fff' }}
        >
          {saving ? 'Creating…' : 'Create Agent'}
        </button>
      </div>

    </form>
  )
}
