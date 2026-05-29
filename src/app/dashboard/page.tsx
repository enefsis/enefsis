export const revalidate = 0
export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { StatCard } from '@/components/dashboard/stat-card'
import { TapsChart, type ChartDay } from '@/components/dashboard/taps-chart'
import { TopMenuItems, type MenuItem } from '@/components/dashboard/top-menu-items'
import { SocialChart, type SocialEntry } from '@/components/dashboard/social-chart'
import { LanguagePrefs, type LangEntry } from '@/components/dashboard/language-prefs'
import { SubscriptionCard } from '@/components/dashboard/subscription-card'
import { DateRangeFilterUrl } from '@/components/dashboard/date-range-filter-url'
import { ExportReport, type ExportData } from '@/components/dashboard/export-report'
import { getSubscription, getChecklist } from '@/actions/dashboard'
import { checkAndCreateDailySummary } from '@/actions/notifications'
import { GettingStartedCard } from '@/components/dashboard/getting-started-card'

const SOCIAL_PLATFORMS = ['instagram', 'google', 'whatsapp', 'facebook', 'tiktok']

function calcChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

function buildDateRange(days: number): string[] {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    return d.toISOString().split('T')[0]
  })
}

function computeRange(days: number, now: Date): { dStart: string; dPrev: string } {
  if (days === 1) {
    const todayMidnight = new Date(now)
    todayMidnight.setHours(0, 0, 0, 0)
    const yesterdayMidnight = new Date(todayMidnight)
    yesterdayMidnight.setDate(yesterdayMidnight.getDate() - 1)
    return { dStart: todayMidnight.toISOString(), dPrev: yesterdayMidnight.toISOString() }
  }
  return {
    dStart: new Date(now.getTime() - days * 86_400_000).toISOString(),
    dPrev:  new Date(now.getTime() - 2 * days * 86_400_000).toISOString(),
  }
}

const CLOCK_EMOJIS = ['🕛','🕐','🕑','🕒','🕓','🕔','🕕','🕖','🕗','🕘','🕙','🕚']
const DAY_NAMES    = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
function fmtHour(h: number): string {
  if (h === 0)  return '12 AM'
  if (h < 12)   return `${h} AM`
  if (h === 12) return '12 PM'
  return `${h - 12} PM`
}

interface TopTable { tableNumber: number; count: number }

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>
}) {
  const sp   = await searchParams
  const days = parseInt(sp.days ?? '30') || 30

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now               = new Date()
  const { dStart, dPrev } = computeRange(days, now)
  const nowIso            = now.toISOString()

  const supabaseAdmin = createAdminClient()

  const [
    { count: tapsCur },
    { count: tapsPrev },
    { count: viewsCur },
    { count: viewsPrev },
    { data: rawReviewHistoryCur },
    { data: rawReviewHistoryPrev },
    { data: rawTaps },
    { data: rawMenuViews },
    { data: rawSocialClicks },
    { data: rawLanguages },
  ] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabaseAdmin as any).from('tap_events').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', dStart).lte('created_at', nowIso),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabaseAdmin as any).from('tap_events').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', dPrev).lt('created_at', dStart),
    supabaseAdmin.from('menu_item_views').select('*', { count: 'exact', head: true }).eq('client_id', user.id).gte('created_at', dStart).lte('created_at', nowIso),
    supabaseAdmin.from('menu_item_views').select('*', { count: 'exact', head: true }).eq('client_id', user.id).gte('created_at', dPrev).lt('created_at', dStart),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabaseAdmin as any).from('review_count_history').select('review_count').eq('user_id', user.id).gte('created_at', dStart).lte('created_at', nowIso).order('created_at', { ascending: true }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabaseAdmin as any).from('review_count_history').select('review_count').eq('user_id', user.id).gte('created_at', dPrev).lt('created_at', dStart).order('created_at', { ascending: true }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabaseAdmin as any).from('tap_events').select('created_at, visitor_id, table_number').eq('user_id', user.id).gte('created_at', dStart).lte('created_at', nowIso),
    supabaseAdmin.from('menu_item_views').select('item_name').eq('client_id', user.id).gte('created_at', dStart).lte('created_at', nowIso),
    supabaseAdmin.from('button_clicks').select('button_type').eq('client_id', user.id).gte('created_at', dStart).lte('created_at', nowIso),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabaseAdmin as any).from('tap_events').select('language').eq('user_id', user.id).gte('created_at', dStart).lte('created_at', nowIso),
  ])

  const [sub, checklist] = await Promise.all([
    getSubscription(user.id),
    getChecklist(user.id),
  ])

  void checkAndCreateDailySummary().catch(() => {})

  // ── New reviews (est.) from review_count_history snapshots ───────────────────
  const reviewSnapsCur  = (rawReviewHistoryCur  as { review_count: number }[] | null) ?? []
  const reviewSnapsPrev = (rawReviewHistoryPrev as { review_count: number }[] | null) ?? []
  const reviewsCur  = reviewSnapsCur.length  >= 2
    ? Math.max(0, reviewSnapsCur[reviewSnapsCur.length - 1].review_count   - reviewSnapsCur[0].review_count)
    : 0
  const reviewsPrev = reviewSnapsPrev.length >= 2
    ? Math.max(0, reviewSnapsPrev[reviewSnapsPrev.length - 1].review_count - reviewSnapsPrev[0].review_count)
    : 0

  // ── Unique taps + top tables ──────────────────────────────────────────────────
  const rawTapsTyped  = rawTaps as { created_at: string; visitor_id: string | null; table_number: number | null }[] | null
  const uniqueTapsCur = new Set((rawTapsTyped ?? []).map(r => r.visitor_id).filter(Boolean)).size

  const tableCountMap: Record<number, number> = {}
  ;(rawTapsTyped ?? []).forEach(row => {
    if (row.table_number != null) {
      tableCountMap[row.table_number] = (tableCountMap[row.table_number] ?? 0) + 1
    }
  })
  const topTables: TopTable[] = Object.entries(tableCountMap)
    .map(([tn, count]) => ({ tableNumber: parseInt(tn), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  // ── Peak hour + peak day ──────────────────────────────────────────────────────
  const hourMap: Record<number, number> = {}
  const dayMap:  Record<number, number> = {}
  ;(rawTapsTyped ?? []).forEach(row => {
    const dt = new Date(row.created_at)
    const h  = dt.getHours()
    const dw = dt.getDay()
    hourMap[h]  = (hourMap[h]  ?? 0) + 1
    dayMap[dw]  = (dayMap[dw]  ?? 0) + 1
  })
  const peakHour = Object.keys(hourMap).length > 0
    ? parseInt(Object.entries(hourMap).sort(([, a], [, b]) => b - a)[0][0])
    : null
  const peakDay = Object.keys(dayMap).length > 0
    ? parseInt(Object.entries(dayMap).sort(([, a], [, b]) => b - a)[0][0])
    : null

  // ── Daily taps chart ──────────────────────────────────────────────────────────
  const tapsMap: Record<string, number> = {}
  ;(rawTapsTyped ?? []).forEach(row => {
    const day = row.created_at.slice(0, 10)
    tapsMap[day] = (tapsMap[day] ?? 0) + 1
  })
  const chartData: ChartDay[] = buildDateRange(days).map(date => ({
    date: new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    taps: tapsMap[date] ?? 0,
  }))

  // ── Top 5 menu items ──────────────────────────────────────────────────────────
  const itemsMap: Record<string, number> = {}
  ;(rawMenuViews as { item_name: string | null }[] | null)?.forEach(row => {
    const name = row.item_name ?? 'Unknown'
    itemsMap[name] = (itemsMap[name] ?? 0) + 1
  })
  const topItems: MenuItem[] = Object.entries(itemsMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, views]) => ({ name, views }))

  // ── Social button clicks ──────────────────────────────────────────────────────
  const socialMap: Record<string, number> = {}
  ;(rawSocialClicks as { button_type: string | null }[] | null)?.forEach(row => {
    const key = (row.button_type ?? '').toLowerCase()
    if (SOCIAL_PLATFORMS.includes(key)) socialMap[key] = (socialMap[key] ?? 0) + 1
  })
  const socialData: SocialEntry[] = SOCIAL_PLATFORMS
    .map(platform => ({ platform, count: socialMap[platform] ?? 0 }))
    .filter(e => e.count > 0)

  // ── Language preferences ──────────────────────────────────────────────────────
  const langMap: Record<string, number> = {}
  ;(rawLanguages as { language: string | null }[] | null)?.forEach(row => {
    const raw = row.language
    if (!raw) return
    const lang = raw.split(/[-_]/)[0].toLowerCase()
    if (!lang) return
    langMap[lang] = (langMap[lang] ?? 0) + 1
  })
  const langData: LangEntry[] = Object.entries(langMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([language, count]) => ({ language, count }))

  const rangeLabel = days === 1 ? 'Today' : `Last ${days} days`

  const exportData: ExportData = {
    tapsCur:       tapsCur       ?? 0,
    uniqueTapsCur,
    viewsCur:      viewsCur      ?? 0,
    reviewsCur,
    chartData,
    topItems,
    socialData,
    langData,
    topTables,
    peakHour,
    peakDay,
    subscription: sub,
  }

  const stats = [
    { label: 'Total Taps',            value: tapsCur       ?? 0, change: calcChange(tapsCur ?? 0,  tapsPrev ?? 0),  icon: 'tap'  as const },
    { label: 'Unique Taps',           value: uniqueTapsCur,      change: 0,                                         icon: 'tap'  as const },
    { label: 'Menu Views',            value: viewsCur      ?? 0, change: calcChange(viewsCur ?? 0, viewsPrev ?? 0), icon: 'menu' as const },
    { label: 'New Reviews (est.)', subtitle: 'Based on Google data, updated daily', value: reviewsCur, change: calcChange(reviewsCur, reviewsPrev), icon: 'star' as const },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Dashboard</h1>
          <p className="font-sans text-sm text-white/40 mt-0.5">{rangeLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <Suspense>
            <DateRangeFilterUrl />
          </Suspense>
          <ExportReport data={exportData} rangeLabel={rangeLabel} />
        </div>
      </div>

      {/* Onboarding checklist */}
      <GettingStartedCard checklist={checklist} />

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(s => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Daily taps + Top menu items */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-[#141720] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="font-display font-semibold text-white text-base">Daily Taps</h2>
          <p className="font-sans text-xs text-white/35 mt-0.5 mb-5">Tap events per day, {rangeLabel.toLowerCase()}</p>
          <TapsChart data={chartData} />
        </div>
        <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="font-display font-semibold text-white text-base">Top Menu Items</h2>
          <p className="font-sans text-xs text-white/35 mt-0.5 mb-5">Most viewed, {rangeLabel.toLowerCase()}</p>
          <TopMenuItems items={topItems} />
        </div>
      </div>

      {/* Top Tables + Peak Time */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="font-display font-semibold text-white text-base">Top Tables</h2>
          <p className="font-sans text-xs text-white/35 mt-0.5 mb-5">Most active NFC tables, {rangeLabel.toLowerCase()}</p>
          {topTables.length === 0 ? (
            <p className="font-sans text-sm text-white/25">Data available once NFC stands are active</p>
          ) : (
            <div className="space-y-3.5">
              {topTables.map((t, i) => (
                <div key={t.tableNumber} className="flex items-center gap-3">
                  <span className="text-xl leading-none shrink-0">{(['🥇', '🥈', '🥉'])[i]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm font-medium text-white/80">Table {t.tableNumber}</p>
                  </div>
                  <span className="font-display font-semibold text-white tabular-nums text-sm shrink-0">
                    {t.count.toLocaleString()} <span className="font-sans font-normal text-white/35 text-xs">taps</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="font-display font-semibold text-white text-base">Peak Time</h2>
          <p className="font-sans text-xs text-white/35 mt-0.5 mb-5">Your busiest periods, {rangeLabel.toLowerCase()}</p>
          {peakHour === null && peakDay === null ? (
            <p className="font-sans text-sm text-white/25">Check back after more taps are recorded</p>
          ) : (
            <div className="space-y-4">
              {peakHour !== null && (
                <div className="flex items-center gap-3">
                  <span className="text-2xl leading-none">{CLOCK_EMOJIS[peakHour % 12]}</span>
                  <div>
                    <p className="font-sans text-xs text-white/40 uppercase tracking-wider">Busiest Hour</p>
                    <p className="font-display text-base font-semibold text-white">{fmtHour(peakHour)}</p>
                  </div>
                </div>
              )}
              {peakDay !== null && (
                <div className="flex items-center gap-3">
                  <span className="text-2xl leading-none">📅</span>
                  <div>
                    <p className="font-sans text-xs text-white/40 uppercase tracking-wider">Busiest Day</p>
                    <p className="font-display text-base font-semibold text-white">{DAY_NAMES[peakDay]}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Social breakdown + Language prefs + Subscription */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="font-display font-semibold text-white text-base">Social Button Clicks</h2>
          <p className="font-sans text-xs text-white/35 mt-0.5 mb-5">Breakdown by platform, {rangeLabel.toLowerCase()}</p>
          <SocialChart data={socialData} />
        </div>

        <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="font-display font-semibold text-white text-base">Language Preferences</h2>
          <p className="font-sans text-xs text-white/35 mt-0.5 mb-5">Top 5 visitor languages, {rangeLabel.toLowerCase()}</p>
          <LanguagePrefs data={langData} />
        </div>

        <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="font-display font-semibold text-white text-base">Subscription</h2>
          <p className="font-sans text-xs text-white/35 mt-0.5 mb-5">Current plan &amp; billing status</p>
          <SubscriptionCard data={sub} />
        </div>

      </div>
    </div>
  )
}
