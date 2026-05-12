import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import { AnalyticsChart, type AnalyticsDay } from '@/components/dashboard/analytics-chart'

export const metadata = { title: 'Analytics' }

type TapRow = { created_at: string; device_type: string | null; language: string | null }

function buildDateRange(days: number): string[] {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    return d.toISOString().split('T')[0]
  })
}

function fmtDay(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function calcChange(cur: number, prev: number) {
  if (prev === 0) return cur > 0 ? 100 : 0
  return Math.round(((cur - prev) / prev) * 100)
}

// ── Inline heatmap (server-rendered, no JS needed) ─────────────────────────────
function Heatmap({ data }: { data: number[][] }) {
  const maxVal = Math.max(...data.flat(), 1)
  const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return (
    <div className="overflow-x-auto">
      <div className="flex ml-10 mb-1.5 gap-0.5" style={{ minWidth: 400 }}>
        {Array.from({ length: 24 }, (_, h) => (
          <div key={h} className="flex-1 text-center" style={{ minWidth: 14 }}>
            <span className="text-[9px] text-white/20">{h % 6 === 0 ? `${h}h` : ''}</span>
          </div>
        ))}
      </div>
      {DAYS.map((day, di) => (
        <div key={day} className="flex items-center gap-0.5 mb-0.5" style={{ minWidth: 440 }}>
          <span className="text-[10px] text-white/30 w-9 shrink-0">{day}</span>
          {Array.from({ length: 24 }, (_, h) => {
            const val = data[di]?.[h] ?? 0
            const intensity = val / maxVal
            return (
              <div
                key={h}
                className="flex-1 rounded-sm"
                title={`${day} ${h}:00 — ${val} taps`}
                style={{
                  minWidth: 14,
                  height: 15,
                  background: val === 0
                    ? 'rgba(255,255,255,0.04)'
                    : `rgba(43,92,230,${(0.15 + intensity * 0.85).toFixed(2)})`,
                }}
              />
            )
          })}
        </div>
      ))}
      <div className="flex items-center gap-2 mt-3 ml-10">
        <span className="text-[10px] text-white/25">Less</span>
        {[0.04, 0.3, 0.55, 0.75, 1].map((op, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-sm"
            style={{ background: op < 0.1 ? 'rgba(255,255,255,0.04)' : `rgba(43,92,230,${op})` }}
          />
        ))}
        <span className="text-[10px] text-white/25">More</span>
      </div>
    </div>
  )
}

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const d90 = new Date(Date.now() - 90 * 86_400_000).toISOString()

  const { data: rawTaps } = await supabase
    .from('tap_events')
    .select('created_at, device_type, language')
    .gte('created_at', d90)

  const taps = (rawTaps as TapRow[] | null) ?? []

  // ── Daily chart data ───────────────────────────────────────────────────────
  const tapsMap: Record<string, number> = {}
  taps.forEach(t => {
    const day = t.created_at.slice(0, 10)
    tapsMap[day] = (tapsMap[day] ?? 0) + 1
  })
  const chartData: AnalyticsDay[] = buildDateRange(90).map(date => ({
    date: fmtDay(date),
    taps: tapsMap[date] ?? 0,
  }))

  // ── Stat cards ─────────────────────────────────────────────────────────────
  const total      = taps.length
  const activeDays = Object.values(tapsMap).filter(v => v > 0).length
  const avgPerDay  = Math.round(total / 90)
  const peakCount  = Math.max(...Object.values(tapsMap), 0)

  // ── Heatmap [dayOfWeek 0=Sun..6][hour 0..23] ───────────────────────────────
  const heatmap: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0))
  taps.forEach(t => {
    const d = new Date(t.created_at)
    heatmap[d.getDay()][d.getHours()]++
  })

  // ── Weekly comparison (8 rolling 7-day buckets) ────────────────────────────
  const weeks = Array.from({ length: 8 }, (_, wi) => {
    const endMs   = Date.now() - wi * 7 * 86_400_000
    const startMs = Date.now() - (wi + 1) * 7 * 86_400_000
    const count   = taps.filter(t => {
      const ts = new Date(t.created_at).getTime()
      return ts >= startMs && ts < endMs
    }).length
    const label = wi === 0 ? 'This week' : wi === 1 ? 'Last week' : `${wi} weeks ago`
    return { label, count }
  })
  const weeksWithChange = weeks.map((w, i) => ({
    ...w,
    change: i < weeks.length - 1 ? calcChange(w.count, weeks[i + 1].count) : null,
  }))

  // ── Device breakdown ───────────────────────────────────────────────────────
  const deviceMap: Record<string, number> = { iPhone: 0, Android: 0, Other: 0 }
  taps.forEach(t => {
    const dt = (t.device_type ?? '').toLowerCase()
    if (dt.includes('iphone') || dt.includes('ipad') || dt.includes('ios')) {
      deviceMap['iPhone']++
    } else if (dt.includes('android')) {
      deviceMap['Android']++
    } else {
      deviceMap['Other']++
    }
  })
  const deviceTotal = Math.max(Object.values(deviceMap).reduce((s, v) => s + v, 0), 1)
  const DEVICE_COLORS: Record<string, string> = { iPhone: '#2B5CE6', Android: '#38BEFF', Other: '#8A90A0' }

  // ── Top languages ──────────────────────────────────────────────────────────
  const langMap: Record<string, number> = {}
  taps.forEach(t => {
    const lang = t.language ? t.language.slice(0, 5).toUpperCase() : 'N/A'
    langMap[lang] = (langMap[lang] ?? 0) + 1
  })
  const topLangs  = Object.entries(langMap).sort(([, a], [, b]) => b - a).slice(0, 8)
  const langTotal = Math.max(topLangs.reduce((s, [, v]) => s + v, 0), 1)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Analytics</h1>
        <p className="font-sans text-sm text-white/40 mt-0.5">Last 90 days</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Taps',    value: total.toLocaleString()     },
          { label: 'Avg / Day',     value: avgPerDay.toLocaleString() },
          { label: 'Active Days',   value: activeDays.toLocaleString() },
          { label: 'Peak Day',      value: peakCount.toLocaleString()  },
        ].map(s => (
          <div key={s.label} className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5">
            <p className="font-sans text-xs text-white/40 uppercase tracking-wider">{s.label}</p>
            <p className="font-display text-2xl font-bold text-white mt-1.5">{s.value}</p>
          </div>
        ))}
      </div>

      {/* 90-day chart */}
      <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5">
        <h2 className="font-display font-semibold text-white text-base">Daily Taps</h2>
        <p className="font-sans text-xs text-white/35 mt-0.5 mb-5">Tap events per day, last 90 days</p>
        <AnalyticsChart data={chartData} />
      </div>

      {/* Weekly comparison + Peak hours heatmap */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="font-display font-semibold text-white text-base">Weekly Comparison</h2>
          <p className="font-sans text-xs text-white/35 mt-0.5 mb-5">Rolling 7-day windows</p>
          <div className="space-y-1">
            {weeksWithChange.map(w => (
              <div key={w.label} className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
                <span className="font-sans text-sm text-white/65">{w.label}</span>
                <div className="flex items-center gap-2.5">
                  <span className="font-display font-semibold text-white tabular-nums">{w.count.toLocaleString()}</span>
                  {w.change !== null && (
                    <span className={cn(
                      'font-sans text-xs font-semibold px-1.5 py-0.5 rounded-full',
                      w.change > 0  ? 'text-emerald-400 bg-emerald-500/10' :
                      w.change < 0  ? 'text-red-400 bg-red-500/10'         :
                                      'text-white/30 bg-white/[0.04]',
                    )}>
                      {w.change > 0 ? '+' : ''}{w.change}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="font-display font-semibold text-white text-base">Peak Hours</h2>
          <p className="font-sans text-xs text-white/35 mt-0.5 mb-5">Tap intensity by hour and weekday</p>
          <Heatmap data={heatmap} />
        </div>

      </div>

      {/* Device breakdown + Top languages */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="font-display font-semibold text-white text-base">Device Breakdown</h2>
          <p className="font-sans text-xs text-white/35 mt-0.5 mb-5">Visitors by device type</p>
          <div className="space-y-5">
            {Object.entries(deviceMap).map(([device, count]) => {
              const pct = Math.round((count / deviceTotal) * 100)
              return (
                <div key={device}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-sans text-sm text-white/70">{device}</span>
                    <div className="flex items-center gap-2.5">
                      <span className="font-sans text-xs text-white/35 tabular-nums">{count.toLocaleString()}</span>
                      <span className="font-display font-semibold text-white text-sm tabular-nums">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: DEVICE_COLORS[device] ?? '#8A90A0' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="font-display font-semibold text-white text-base">Top Languages</h2>
          <p className="font-sans text-xs text-white/35 mt-0.5 mb-5">Visitor language preferences</p>
          {topLangs.length === 0 ? (
            <p className="font-sans text-sm text-white/25">No language data yet</p>
          ) : (
            <div className="space-y-3.5">
              {topLangs.map(([lang, count]) => {
                const pct = Math.round((count / langTotal) * 100)
                return (
                  <div key={lang} className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-white/55 w-14 shrink-0">{lang}</span>
                    <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <div className="h-full bg-[#2B5CE6] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="font-sans text-xs text-white/35 w-9 text-right shrink-0 tabular-nums">{pct}%</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
