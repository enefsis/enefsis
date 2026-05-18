'use client'

import { useState } from 'react'

function addOneMonth(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  // m is 1-indexed from YYYY-MM-DD; new Date(y, m, d) uses 0-indexed months,
  // so passing m (not m-1) is equivalent to adding 1 month.
  const next = new Date(y, m, d)
  return [
    next.getFullYear(),
    String(next.getMonth() + 1).padStart(2, '0'),
    String(next.getDate()).padStart(2, '0'),
  ].join('-')
}

function FileIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function GenerateContractModal({
  clientId,
  joinedDate,
}: {
  clientId: string
  joinedDate: string
}) {
  const defaultStart = joinedDate.split('T')[0]

  const [open, setOpen]           = useState(false)
  const [lang, setLang]           = useState<'en' | 'de'>('en')
  const [startDate, setStartDate] = useState(defaultStart)
  const [billingDate, setBillingDate] = useState(() => addOneMonth(defaultStart))

  function openModal(language: 'en' | 'de') {
    setLang(language)
    setOpen(true)
  }

  function handleStartChange(val: string) {
    setStartDate(val)
    if (val) setBillingDate(addOneMonth(val))
  }

  function handleGenerate() {
    window.open(
      `/contracts/${lang}/${clientId}?start=${startDate}&billing=${billingDate}`,
      '_blank',
      'noopener,noreferrer',
    )
    setOpen(false)
  }

  return (
    <>
      <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5">
        <h2 className="font-display font-semibold text-white text-sm mb-4">Generate Contract</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => openModal('en')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-sans text-sm font-medium transition-colors"
            style={{ background: 'rgba(43,92,230,0.12)', color: '#6B90F5', border: '1px solid rgba(43,92,230,0.22)' }}
          >
            <FileIcon />
            English Contract
          </button>
          <button
            onClick={() => openModal('de')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-sans text-sm font-medium transition-colors"
            style={{ background: 'rgba(251,191,36,0.08)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.18)' }}
          >
            <FileIcon />
            German Contract
          </button>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 space-y-5"
            style={{ background: '#141720', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-white">Configure Dates</h3>
              <span
                className="font-sans text-[11px] font-semibold px-2.5 py-0.5 rounded-md"
                style={lang === 'de'
                  ? { background: 'rgba(251,191,36,0.10)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.20)' }
                  : { background: 'rgba(43,92,230,0.12)',  color: '#6B90F5', border: '1px solid rgba(43,92,230,0.22)' }}
              >
                {lang.toUpperCase()}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-sans text-xs text-white/40 mb-1.5">Service Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => handleStartChange(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 font-sans text-sm text-white outline-none"
                  style={{ background: '#0D0F14', border: '1px solid rgba(255,255,255,0.10)', colorScheme: 'dark' }}
                />
              </div>
              <div>
                <label className="block font-sans text-xs text-white/40 mb-1.5">
                  First Billing Date
                  <span className="ml-1.5 text-white/20">(auto-calculated)</span>
                </label>
                <input
                  type="date"
                  value={billingDate}
                  onChange={e => setBillingDate(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 font-sans text-sm text-white outline-none"
                  style={{ background: '#0D0F14', border: '1px solid rgba(255,255,255,0.10)', colorScheme: 'dark' }}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2.5 rounded-xl font-sans text-sm font-medium transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                className="flex-1 py-2.5 rounded-xl font-sans text-sm font-semibold transition-all active:scale-[0.98]"
                style={lang === 'de'
                  ? { background: 'rgba(251,191,36,0.15)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.25)' }
                  : { background: '#2B5CE6', color: '#fff' }}
              >
                Generate {lang.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
