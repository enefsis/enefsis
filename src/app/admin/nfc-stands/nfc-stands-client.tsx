'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CopyButton } from '@/components/admin/copy-button'
import { QrButton } from '@/components/admin/qr-button'
import { createNfcStand } from '@/actions/admin-nfc'

// ── Types ─────────────────────────────────────────────────────────────────────
export type Stand = {
  id: string
  name: string | null
  landingPageUrl: string
  createdAt: string
}

export type ClientGroup = {
  userId: string
  name: string | null
  email: string
  defaultLandingUrl: string | null
  stands: Stand[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function initial(name: string | null, email: string): string {
  return (name ?? email).charAt(0).toUpperCase()
}

const AVATAR_COLORS = ['#2B5CE6', '#E1306C', '#25D366', '#F4B400', '#A78BFA', '#38BEFF', '#00AF87']
function avatarColor(id: string): string {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 1.75v10.5M1.75 7h10.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.18s ease' }}
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
type ModalState = { userId: string; clientLabel: string; defaultUrl: string }

export function NfcStandsClient({
  groups,
  totalStands,
}: {
  groups: ClientGroup[]
  totalStands: number
}) {
  const router = useRouter()

  const [query,    setQuery]    = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [modal,    setModal]    = useState<ModalState | null>(null)
  const [formName, setFormName] = useState('')
  const [formUrl,  setFormUrl]  = useState('')
  const [saving,   setSaving]   = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filtered = query
    ? groups.filter(g => {
        const q = query.toLowerCase()
        return (g.name ?? '').toLowerCase().includes(q) || g.email.toLowerCase().includes(q)
      })
    : groups

  // ── Handlers ─────────────────────────────────────────────────────────────
  function toggleExpand(userId: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }

  function openModal(g: ClientGroup) {
    setFormName('')
    setFormUrl(g.defaultLandingUrl ?? '')
    setFormError(null)
    setModal({
      userId:      g.userId,
      clientLabel: g.name ?? g.email,
      defaultUrl:  g.defaultLandingUrl ?? '',
    })
  }

  async function handleAdd() {
    if (!modal) return
    if (!formUrl.trim()) { setFormError('Landing page URL is required'); return }
    setFormError(null)
    setSaving(true)
    try {
      const res = await createNfcStand(modal.userId, formName, formUrl)
      if (res.error) { setFormError(res.error); return }
      setModal(null)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Search bar + total */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
            <SearchIcon />
          </span>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by client name or email…"
            className="w-full h-10 pl-9 pr-4 rounded-xl font-sans text-sm text-white placeholder-white/25 focus:outline-none focus:ring-1"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border:     '1px solid rgba(255,255,255,0.08)',
            }}
          />
        </div>
        <p className="font-sans text-sm text-white/40 shrink-0">
          <span className="font-display font-bold text-white text-base">{totalStands}</span>
          {' '}stands across{' '}
          <span className="font-display font-bold text-white text-base">{groups.length}</span>
          {' '}clients
        </p>
      </div>

      {/* Client groups */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-sans text-sm text-white/25">No clients match your search</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(group => {
            const isOpen = expanded.has(group.userId)
            const color  = avatarColor(group.userId)

            return (
              <div
                key={group.userId}
                className="bg-[#141720] border border-white/[0.06] rounded-2xl overflow-hidden"
              >
                {/* Client header — clickable to expand */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleExpand(group.userId)}
                  onKeyDown={e => e.key === 'Enter' && toggleExpand(group.userId)}
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-white/[0.025] transition-colors"
                >
                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-display font-bold text-sm text-white select-none"
                    style={{ background: color }}
                  >
                    {initial(group.name, group.email)}
                  </div>

                  {/* Name + email */}
                  <div className="flex-1 min-w-0">
                    <p className="font-sans font-semibold text-white text-sm leading-snug truncate">
                      {group.name ?? group.email}
                    </p>
                    {group.name && (
                      <p className="font-sans text-[12px] text-gray-400 mt-0.5 truncate">
                        {group.email}
                      </p>
                    )}
                  </div>

                  {/* Stand count */}
                  <span
                    className="font-sans text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                    style={{ background: 'rgba(43,92,230,0.13)', color: '#6B90F5' }}
                  >
                    {group.stands.length} {group.stands.length === 1 ? 'stand' : 'stands'}
                  </span>

                  {/* Add Stand button — stops propagation so it doesn't toggle expand */}
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); openModal(group) }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-sans text-xs font-semibold shrink-0 transition-colors hover:brightness-110"
                    style={{
                      background: 'rgba(43,92,230,0.15)',
                      color:      '#6B90F5',
                      border:     '1px solid rgba(43,92,230,0.28)',
                    }}
                  >
                    <PlusIcon />
                    Add Stand
                  </button>

                  {/* Chevron */}
                  <span className="text-white/30 shrink-0 ml-1">
                    <ChevronIcon open={isOpen} />
                  </span>
                </div>

                {/* Expanded stand list */}
                {isOpen && (
                  <div className="border-t border-white/[0.05]">
                    {group.stands.length === 0 ? (
                      <div className="px-5 py-8 text-center">
                        <p className="font-sans text-sm text-white/25">No stands yet</p>
                        <button
                          type="button"
                          onClick={() => openModal(group)}
                          className="mt-3 font-sans text-sm font-semibold"
                          style={{ color: '#6B90F5' }}
                        >
                          + Add the first stand
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/[0.04]">
                        {group.stands.map((stand, idx) => (
                          <div key={stand.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.018] transition-colors">

                            {/* Stand name */}
                            <div className="w-40 shrink-0">
                              {stand.name ? (
                                <p className="font-sans text-sm text-white/80 truncate">{stand.name}</p>
                              ) : (
                                <p className="font-sans text-sm text-white/28 italic">Stand {idx + 1}</p>
                              )}
                            </div>

                            {/* URL + copy */}
                            <div className="flex-1 flex items-center gap-1.5 min-w-0">
                              <span className="font-mono text-[11px] text-gray-400 truncate">
                                {stand.landingPageUrl}
                              </span>
                              <CopyButton text={stand.landingPageUrl} />
                            </div>

                            {/* Created date */}
                            <span className="font-sans text-xs text-gray-400 shrink-0 w-24 text-right">
                              {fmt(stand.createdAt)}
                            </span>

                            {/* QR */}
                            <QrButton url={stand.landingPageUrl} />

                            {/* Open link */}
                            <a
                              href={stand.landingPageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-sans text-xs font-medium shrink-0 transition-colors hover:brightness-110"
                              style={{ color: '#6B90F5', background: 'rgba(43,92,230,0.10)' }}
                            >
                              <ExternalLinkIcon />
                              Open
                            </a>

                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Add Stand modal ──────────────────────────────────────────────────── */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.65)' }}
          onClick={() => !saving && setModal(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 space-y-5"
            style={{ background: '#161920', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div>
              <h2 className="font-display font-bold text-white text-lg">Add NFC Stand</h2>
              <p className="font-sans text-sm text-white/40 mt-0.5">for {modal.clientLabel}</p>
            </div>

            {/* Form fields */}
            <div className="space-y-4">
              <div>
                <label className="block font-sans text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">
                  Stand Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Table 1, Main Entrance, Bar Area…"
                  disabled={saving}
                  autoFocus
                  className="w-full h-10 px-3.5 rounded-xl font-sans text-sm text-white placeholder-white/25 focus:outline-none focus:ring-1 disabled:opacity-50"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border:     '1px solid rgba(255,255,255,0.10)',
                  }}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                />
              </div>

              <div>
                <label className="block font-sans text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">
                  Landing Page URL <span className="text-red-400 normal-case tracking-normal">*</span>
                </label>
                <input
                  type="url"
                  value={formUrl}
                  onChange={e => setFormUrl(e.target.value)}
                  placeholder="https://enefsis.com/p/your-restaurant"
                  disabled={saving}
                  className="w-full h-10 px-3.5 rounded-xl font-sans text-sm text-white placeholder-white/25 focus:outline-none focus:ring-1 disabled:opacity-50"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border:     '1px solid rgba(255,255,255,0.10)',
                  }}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                />
              </div>

              {formError && (
                <p className="font-sans text-xs text-red-400">{formError}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => !saving && setModal(null)}
                disabled={saving}
                className="flex-1 h-10 rounded-xl font-sans text-sm font-semibold transition-colors disabled:opacity-50"
                style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.55)' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={saving}
                className="flex-1 h-10 rounded-xl font-sans text-sm font-semibold transition-colors disabled:opacity-60"
                style={{ background: '#2B5CE6', color: '#fff' }}
              >
                {saving ? 'Adding…' : 'Add Stand'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
