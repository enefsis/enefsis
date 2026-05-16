'use client'

const RANGES = [
  { label: 'Today',        days: 1  },
  { label: 'Last 7 days',  days: 7  },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
]

export function DateRangeFilter({
  days,
  onChange,
}: {
  days: number
  onChange: (d: number) => void
}) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
      {RANGES.map(r => {
        const active = r.days === days
        return (
          <button
            key={r.days}
            type="button"
            onClick={() => onChange(r.days)}
            className="px-3 py-1.5 rounded-lg font-sans text-xs font-medium transition-all whitespace-nowrap"
            style={
              active
                ? { background: '#2B5CE6', color: '#fff', boxShadow: '0 1px 8px rgba(43,92,230,0.35)' }
                : { color: 'rgba(255,255,255,0.38)' }
            }
          >
            {r.label}
          </button>
        )
      })}
    </div>
  )
}
