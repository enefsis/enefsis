export const revalidate = 0
export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cn } from '@/lib/utils'
import { AnalyticsChart, type AnalyticsDay } from '@/components/dashboard/analytics-chart'

export const metadata = { title: 'Analytics' }

// ── Types ─────────────────────────────────────────────────────────────────────
type TapFull   = { created_at: string; device_type: string | null; language: string | null; table_number?: number | null }
type ClickFull = { created_at: string; button_type: string | null; table_number?: number | null }
type ViewFull  = { created_at: string; item_id: string | null; item_name: string | null }

// ── Button metadata ────────────────────────────────────────────────────────────
const BUTTON_META: Record<string, { label: string; color: string }> = {
  google_review: { label: 'Google Review', color: '#F4B400' },
  instagram:     { label: 'Instagram',     color: '#E1306C' },
  whatsapp:      { label: 'WhatsApp',      color: '#25D366' },
  facebook:      { label: 'Facebook',      color: '#1877F2' },
  tiktok:        { label: 'TikTok',        color: '#E8E8E8' },
  menu:          { label: 'Menu',          color: '#38BEFF' },
  call_waiter:   { label: 'Call Waiter',   color: '#A78BFA' },
  tripadvisor:   { label: 'TripAdvisor',   color: '#00AF87' },
  website:       { label: 'Website',       color: '#94A3B8' },
}

// ── Language metadata ─────────────────────────────────────────────────────────
const LANG_META: Record<string, { name: string; flag: string }> = {
  EN: { name: 'English',    flag: '🇬🇧' }, EL: { name: 'Greek',      flag: '🇬🇷' },
  DE: { name: 'German',     flag: '🇩🇪' }, FR: { name: 'French',     flag: '🇫🇷' },
  IT: { name: 'Italian',    flag: '🇮🇹' }, ES: { name: 'Spanish',    flag: '🇪🇸' },
  PT: { name: 'Portuguese', flag: '🇵🇹' }, RU: { name: 'Russian',    flag: '🇷🇺' },
  UK: { name: 'Ukrainian',  flag: '🇺🇦' }, PL: { name: 'Polish',     flag: '🇵🇱' },
  NL: { name: 'Dutch',      flag: '🇳🇱' }, SV: { name: 'Swedish',    flag: '🇸🇪' },
  NO: { name: 'Norwegian',  flag: '🇳🇴' }, DA: { name: 'Danish',     flag: '🇩🇰' },
  FI: { name: 'Finnish',    flag: '🇫🇮' }, CS: { name: 'Czech',      flag: '🇨🇿' },
  SK: { name: 'Slovak',     flag: '🇸🇰' }, HU: { name: 'Hungarian',  flag: '🇭🇺' },
  RO: { name: 'Romanian',   flag: '🇷🇴' }, BG: { name: 'Bulgarian',  flag: '🇧🇬' },
  HR: { name: 'Croatian',   flag: '🇭🇷' }, SL: { name: 'Slovenian',  flag: '🇸🇮' },
  TR: { name: 'Turkish',    flag: '🇹🇷' }, AR: { name: 'Arabic',     flag: '🇸🇦' },
  HE: { name: 'Hebrew',     flag: '🇮🇱' }, HI: { name: 'Hindi',      flag: '🇮🇳' },
  ZH: { name: 'Chinese',    flag: '🇨🇳' }, JA: { name: 'Japanese',   flag: '🇯🇵' },
  KO: { name: 'Korean',     flag: '🇰🇷' }, TH: { name: 'Thai',       flag: '🇹🇭' },
  VI: { name: 'Vietnamese', flag: '🇻🇳' }, ID: { name: 'Indonesian', flag: '🇮🇩' },
  MS: { name: 'Malay',      flag: '🇲🇾' },
}

// ── Helpers ───────────────────────────────────────────────────────────────────
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

// ── Heatmap (server-rendered) ─────────────────────────────────────────────────
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
            const val       = data[di]?.[h] ?? 0
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const d90          = new Date(Date.now() - 90 * 86_400_000).toISOString()
  const supabaseAdmin = createAdminClient()

  // ── Parallel data fetch — service role bypasses RLS ───────────────────────
  const [tapsRes, clicksRes, viewsRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabaseAdmin as any).from('tap_events')
      .select('created_at, device_type, language, table_number')
      .eq('user_id', user.id)
      .gte('created_at', d90),
    supabaseAdmin.from('button_clicks')
      .select('created_at, button_type, table_number')
      .eq('client_id', user.id)
      .gte('created_at', d90),
    supabaseAdmin.from('menu_item_views')
      .select('created_at, item_id, item_name')
      .eq('client_id', user.id)
      .gte('created_at', d90),
  ])

  const taps      = (tapsRes.data   as TapFull[]   | null) ?? []
  const clicks    = (clicksRes.data as ClickFull[] | null) ?? []
  const menuViews = (viewsRes.data  as ViewFull[]  | null) ?? []

  // ── Pro plan check — wire to subscription system when available ────────────
  const isPro = false

  // ── Daily chart ───────────────────────────────────────────────────────────
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
  const totalTaps  = taps.length
  const activeDays = Object.values(tapsMap).filter(v => v > 0).length
  const avgPerDay  = Math.round(totalTaps / 90)
  const peakCount  = Math.max(...Object.values(tapsMap), 0)

  // ── Heatmap [dayOfWeek][hour] ──────────────────────────────────────────────
  const heatmap: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0))
  taps.forEach(t => {
    const d = new Date(t.created_at)
    heatmap[d.getDay()][d.getHours()]++
  })

  // ── Weekly comparison ─────────────────────────────────────────────────────
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
  const deviceMap: Record<string, number> = { Mobile: 0, Desktop: 0, Tablet: 0 }
  taps.forEach(t => {
    const dt = (t.device_type ?? 'desktop').toLowerCase()
    if (dt === 'tablet')       deviceMap['Tablet']++
    else if (dt === 'mobile')  deviceMap['Mobile']++
    else                       deviceMap['Desktop']++
  })
  const deviceTotal = Math.max(Object.values(deviceMap).reduce((s, v) => s + v, 0), 1)
  const DEVICE_COLORS: Record<string, string> = { Mobile: '#2B5CE6', Desktop: '#38BEFF', Tablet: '#8A90A0' }

  // ── Button clicks breakdown ────────────────────────────────────────────────
  const clickMap: Record<string, number> = {}
  clicks.forEach(c => {
    const bt = c.button_type ?? 'unknown'
    clickMap[bt] = (clickMap[bt] ?? 0) + 1
  })
  const clickEntries = Object.entries(clickMap).sort(([, a], [, b]) => b - a)
  const clickTotal   = Math.max(clicks.length, 1)

  // ── Top menu items ─────────────────────────────────────────────────────────
  const itemMap: Record<string, { name: string; count: number }> = {}
  menuViews.forEach(v => {
    if (!v.item_id) return
    if (!itemMap[v.item_id]) itemMap[v.item_id] = { name: v.item_name ?? v.item_id, count: 0 }
    itemMap[v.item_id].count++
  })
  const topItems    = Object.values(itemMap).sort((a, b) => b.count - a.count).slice(0, 5)
  const maxItemCount = Math.max(topItems[0]?.count ?? 1, 1)

  // ── Language preferences ───────────────────────────────────────────────────
  const langMap: Record<string, number> = {}
  taps.forEach(t => {
    const lang = t.language ? t.language.split(/[-_]/)[0].toUpperCase() : 'N/A'
    langMap[lang] = (langMap[lang] ?? 0) + 1
  })
  const topLangs = Object.entries(langMap).sort(([, a], [, b]) => b - a).slice(0, 8)
  const langTotal = Math.max(topLangs.reduce((s, [, v]) => s + v, 0), 1)

  // ── Per-table breakdown ────────────────────────────────────────────────────
  const tableMap: Record<number, { taps: number; buttonCounts: Record<string, number> }> = {}
  taps.forEach(t => {
    const tn = t.table_number
    if (tn == null) return
    if (!tableMap[tn]) tableMap[tn] = { taps: 0, buttonCounts: {} }
    tableMap[tn].taps++
  })
  clicks.forEach(c => {
    const tn = c.table_number
    const bt = c.button_type
    if (tn == null || !bt) return
    if (!tableMap[tn]) tableMap[tn] = { taps: 0, buttonCounts: {} }
    tableMap[tn].buttonCounts[bt] = (tableMap[tn].buttonCounts[bt] ?? 0) + 1
  })
  const tableRows = Object.entries(tableMap)
    .map(([tn, data]) => ({
      tableNumber: parseInt(tn, 10),
      taps:        data.taps,
      topButton:   Object.entries(data.buttonCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null,
    }))
    .sort((a, b) => b.taps - a.taps)

  // Demo rows shown behind the lock when isPro=false
  const lockedDemoRows = [
    { tableNumber: 1, taps: 47, topButton: 'google_review' },
    { tableNumber: 2, taps: 31, topButton: 'instagram'     },
    { tableNumber: 3, taps: 28, topButton: 'menu'          },
    { tableNumber: 4, taps: 19, topButton: 'whatsapp'      },
    { tableNumber: 5, taps: 12, topButton: 'facebook'      },
  ]
  const tableDisplayRows = isPro ? tableRows : lockedDemoRows

  // ── Render ─────────────────────────────────────────────────────────────────
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
          { label: 'Total Taps',  value: totalTaps.toLocaleString()  },
          { label: 'Avg / Day',   value: avgPerDay.toLocaleString()  },
          { label: 'Active Days', value: activeDays.toLocaleString() },
          { label: 'Peak Day',    value: peakCount.toLocaleString()  },
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

      {/* Button clicks + Top menu items */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* Button clicks breakdown */}
        <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="font-display font-semibold text-white text-base">Button Clicks</h2>
          <p className="font-sans text-xs text-white/35 mt-0.5 mb-5">
            {clicks.length.toLocaleString()} total interactions
          </p>
          {clickEntries.length === 0 ? (
            <p className="font-sans text-sm text-white/25">No button data yet</p>
          ) : (
            <div className="space-y-3.5">
              {clickEntries.map(([bt, count]) => {
                const meta = BUTTON_META[bt]
                const pct  = Math.round((count / clickTotal) * 100)
                const color = meta?.color ?? '#8A90A0'
                const label = meta?.label ?? bt
                return (
                  <div key={bt}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: color }}
                        />
                        <span className="font-sans text-sm text-white/75">{label}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-sans text-xs text-white/35 tabular-nums">{count.toLocaleString()}</span>
                        <span className="font-display font-semibold text-white text-sm tabular-nums w-9 text-right">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Most viewed menu items */}
        <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="font-display font-semibold text-white text-base">Most Viewed Items</h2>
          <p className="font-sans text-xs text-white/35 mt-0.5 mb-5">
            {menuViews.length.toLocaleString()} total item views
          </p>
          {topItems.length === 0 ? (
            <p className="font-sans text-sm text-white/25">No menu view data yet</p>
          ) : (
            <div className="space-y-4">
              {topItems.map((item, i) => {
                const pct = Math.round((item.count / maxItemCount) * 100)
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className="font-sans text-sm text-white/75 truncate max-w-[65%]"
                        title={item.name}
                      >
                        {item.name}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-sans text-xs text-white/35 tabular-nums">
                          {item.count.toLocaleString()} views
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #2B5CE6, #38BEFF)' }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>

      {/* Language preferences + Device breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* Language preferences */}
        <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="font-display font-semibold text-white text-base">Language Preferences</h2>
          <p className="font-sans text-xs text-white/35 mt-0.5 mb-5">Guest browser languages</p>
          {topLangs.length === 0 ? (
            <p className="font-sans text-sm text-white/25">No language data yet</p>
          ) : (
            <div className="space-y-3.5">
              {topLangs.map(([code, count]) => {
                const pct  = Math.round((count / langTotal) * 100)
                const meta = LANG_META[code]
                return (
                  <div key={code}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        {meta && (
                          <span style={{ fontSize: 16, lineHeight: 1 }}>{meta.flag}</span>
                        )}
                        <span className="font-sans text-sm text-white/75">
                          {meta?.name ?? code}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-sans text-xs text-white/35 tabular-nums">{count.toLocaleString()}</span>
                        <span className="font-display font-semibold text-white text-sm tabular-nums w-9 text-right">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <div className="h-full bg-[#2B5CE6] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Device breakdown */}
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
                      <span className="font-display font-semibold text-white text-sm tabular-nums w-9 text-right">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: DEVICE_COLORS[device] ?? '#8A90A0' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

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
                      w.change > 0 ? 'text-emerald-400 bg-emerald-500/10' :
                      w.change < 0 ? 'text-red-400 bg-red-500/10'         :
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

      {/* Per-table breakdown (Pro) */}
      <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5 relative overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display font-semibold text-white text-base">Per-Table Activity</h2>
          {!isPro && (
            <span
              className="flex items-center gap-1.5 font-sans text-[11px] font-semibold px-2.5 py-1 rounded-full"
              style={{
                background: 'rgba(167,139,250,0.12)',
                color:      '#A78BFA',
                border:     '1px solid rgba(167,139,250,0.25)',
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="#A78BFA" strokeWidth="2.5" />
                <path d="M7 11V7a5 5 0 0110 0v4" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              Pro Feature
            </span>
          )}
        </div>
        <p className="font-sans text-xs text-white/35 mt-0.5 mb-5">
          Taps and top interactions sorted by most active table
        </p>

        {/* Table — blurred when locked */}
        <div className={cn('relative', !isPro && 'blur-[3px] pointer-events-none select-none')}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[380px]">
              <thead>
                <tr>
                  <th className="font-sans text-[11px] font-semibold text-white/30 text-left pb-3 pr-8 uppercase tracking-wider">Table</th>
                  <th className="font-sans text-[11px] font-semibold text-white/30 text-right pb-3 pr-8 uppercase tracking-wider">Taps</th>
                  <th className="font-sans text-[11px] font-semibold text-white/30 text-left pb-3 uppercase tracking-wider">Top Action</th>
                </tr>
              </thead>
              <tbody>
                {tableDisplayRows.map(row => {
                  const btnMeta = row.topButton ? BUTTON_META[row.topButton] : null
                  return (
                    <tr key={row.tableNumber} className="border-t border-white/[0.04]">
                      <td className="py-3.5 pr-8">
                        <span className="font-display font-bold text-white text-sm">Table {row.tableNumber}</span>
                      </td>
                      <td className="py-3.5 pr-8 text-right">
                        <span className="font-sans text-sm text-white/65 tabular-nums">{row.taps}</span>
                      </td>
                      <td className="py-3.5">
                        {btnMeta ? (
                          <span className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ background: btnMeta.color }}
                            />
                            <span className="font-sans text-sm text-white/65">{btnMeta.label}</span>
                          </span>
                        ) : (
                          <span className="font-sans text-sm text-white/20">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lock overlay */}
        {!isPro && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-2xl"
            style={{ background: 'rgba(14,17,26,0.72)' }}
          >
            <div
              className="flex flex-col items-center gap-3 mx-4 p-7 rounded-2xl text-center"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border:     '1px solid rgba(255,255,255,0.08)',
                maxWidth:   280,
              }}
            >
              <div
                className="w-11 h-11 flex items-center justify-center rounded-xl"
                style={{ background: 'rgba(167,139,250,0.15)' }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="#A78BFA" strokeWidth="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="font-display font-bold text-white text-base">Pro Feature</p>
                <p className="font-sans text-sm text-white/45 mt-1">
                  See which tables are most active and what your guests click
                </p>
              </div>
              <button
                className="font-sans text-sm font-semibold px-6 py-2.5 rounded-xl mt-1 w-full"
                style={{ background: 'linear-gradient(135deg, #A78BFA, #818CF8)', color: '#fff' }}
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  )
}
