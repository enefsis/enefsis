export type ActivityEntry = {
  id:         string
  action:     string
  created_at: string
}

// ── Icon helpers ──────────────────────────────────────────────────────────────
function iconFor(action: string): { svg: React.ReactNode; bg: string; color: string } {
  const a = action.toLowerCase()
  if (a.includes('account created'))   return { svg: <UserPlusIcon />,    bg: 'rgba(52,211,153,0.12)',  color: '#34D399' }
  if (a.includes('plan changed'))      return { svg: <CreditCardIcon />,  bg: 'rgba(43,92,230,0.14)',   color: '#6B90F5' }
  if (a.includes('status changed'))    return { svg: <ShieldIcon />,      bg: 'rgba(251,191,36,0.12)',  color: '#FBBF24' }
  if (a.includes('page edited'))       return { svg: <LayoutIcon />,      bg: 'rgba(56,190,255,0.12)', color: '#38BEFF' }
  if (a.includes('stand added'))       return { svg: <WifiIcon />,        bg: 'rgba(167,139,250,0.12)', color: '#A78BFA' }
  if (a.includes('payment recorded'))  return { svg: <CoinsIcon />,       bg: 'rgba(52,211,153,0.12)',  color: '#34D399' }
  return                                      { svg: <DotIcon />,          bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// ── SVG icons (16×16) ─────────────────────────────────────────────────────────
function UserPlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
      <line x1="19" y1="8" x2="19" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="22" y1="11" x2="16" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
function CreditCardIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="1" y="4" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
      <line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" strokeWidth="2"/>
    </svg>
  )
}
function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function LayoutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M3 9h18M9 21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
function WifiIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="12" y1="20" x2="12.01" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
function CoinsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2"/>
      <path d="M18.09 10.37A6 6 0 1110.34 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M7 6h1v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
function DotIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" fill="currentColor"/>
    </svg>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────
export function ActivityLog({ entries }: { entries: ActivityEntry[] }) {
  return (
    <div className="bg-[#141720] border border-white/[0.06] rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <h2 className="font-display font-semibold text-white text-sm">Activity</h2>
        <p className="font-sans text-[11px] text-white/30 mt-0.5">Last {entries.length} events</p>
      </div>

      {entries.length === 0 ? (
        <div className="py-10 text-center">
          <p className="font-sans text-sm text-white/25">No activity yet</p>
        </div>
      ) : (
        <div className="px-5 py-4 space-y-0">
          {entries.map((entry, idx) => {
            const { svg, bg, color } = iconFor(entry.action)
            const isLast = idx === entries.length - 1
            return (
              <div key={entry.id} className="flex items-start gap-3">
                {/* Icon + vertical line */}
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: bg, color }}
                  >
                    {svg}
                  </div>
                  {!isLast && (
                    <div className="w-px flex-1 mt-1 mb-1" style={{ background: 'rgba(255,255,255,0.06)', minHeight: '20px' }} />
                  )}
                </div>

                {/* Text */}
                <div className={`flex-1 min-w-0 ${isLast ? '' : 'pb-4'}`}>
                  <p className="font-sans text-sm text-white/80 leading-snug">{entry.action}</p>
                  <p className="font-sans text-[11px] text-white/30 mt-0.5">{fmt(entry.created_at)}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
