'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { StatCard } from '@/components/dashboard/stat-card'
import { TapsChart, type ChartDay } from '@/components/dashboard/taps-chart'
import { TopMenuItems, type MenuItem } from '@/components/dashboard/top-menu-items'
import { SocialChart, type SocialEntry } from '@/components/dashboard/social-chart'
import { LanguagePrefs, type LangEntry } from '@/components/dashboard/language-prefs'
import { SubscriptionCard, type SubscriptionData } from '@/components/dashboard/subscription-card'
import { DateRangeFilter } from '@/components/dashboard/date-range-filter'
import { ExportReport, type ExportData } from '@/components/dashboard/export-report'
import { getSubscription } from '@/actions/dashboard'
import { checkAndCreateDailySummary } from '@/actions/notifications'

const LS_KEY          = 'enefsis_date_range'
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

const CLOCK_EMOJIS = ['🕛','🕐','🕑','🕒','🕓','🕔','🕕','🕖','🕗','🕘','🕙','🕚']
const DAY_NAMES    = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
function fmtHour(h: number): string {
  if (h === 0)  return '12 AM'
  if (h < 12)   return `${h} AM`
  if (h === 12) return '12 PM'
  return `${h - 12} PM`
}

interface TopTable { tableNumber: number; count: number }

interface DashboardData {
  tapsCur: number
  tapsPrev: number
  uniqueTapsCur: number
  viewsCur: number
  viewsPrev: number
  reviewsCur: number
  reviewsPrev: number
  followersCur: number
  followersPrev: number
  chartData: ChartDay[]
  topItems: MenuItem[]
  socialData: SocialEntry[]
  langData: LangEntry[]
  topTables: TopTable[]
  peakHour: number | null
  peakDay:  number | null
  subscription: SubscriptionData | null
}

export default function DashboardPage() {
  const [days, setDays]       = useState<number | null>(null)
  const [data, setData]       = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialise from localStorage (client-only)
  useEffect(() => {
    const stored = parseInt(localStorage.getItem(LS_KEY) ?? '30') || 30
    setDays(stored)
  }, [])

  // Re-load data whenever days changes
  useEffect(() => {
    if (days === null) return
    setLoading(true)

    const d = days // stable capture for async closure
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const now    = new Date()
      const dStart = new Date(now.getTime() - d * 86_400_000).toISOString()
      const dPrev  = new Date(now.getTime() - 2 * d * 86_400_000).toISOString()
      const nowIso = now.toISOString()

      const [
        { count: tapsCur },
        { count: tapsPrev },
        { count: viewsCur },
        { count: viewsPrev },
        { count: reviewsCur },
        { count: reviewsPrev },
        { count: followersCur },
        { count: followersPrev },
        { data: rawTaps },
        { data: rawMenuViews },
        { data: rawSocialClicks },
        { data: rawLanguages },
      ] = await Promise.all([
        supabase.from('tap_events').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', dStart).lte('created_at', nowIso),
        supabase.from('tap_events').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', dPrev).lt('created_at', dStart),
        supabase.from('menu_item_views').select('*', { count: 'exact', head: true }).eq('client_id', user.id).gte('created_at', dStart).lte('created_at', nowIso),
        supabase.from('menu_item_views').select('*', { count: 'exact', head: true }).eq('client_id', user.id).gte('created_at', dPrev).lt('created_at', dStart),
        supabase.from('button_clicks').select('*', { count: 'exact', head: true }).eq('client_id', user.id).gte('created_at', dStart).lte('created_at', nowIso),
        supabase.from('button_clicks').select('*', { count: 'exact', head: true }).eq('client_id', user.id).gte('created_at', dPrev).lt('created_at', dStart),
        supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', dStart).lte('created_at', nowIso),
        supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', dPrev).lt('created_at', dStart),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any).from('tap_events').select('created_at, visitor_id, table_number').eq('user_id', user.id).gte('created_at', dStart).lte('created_at', nowIso),
        supabase.from('menu_item_views').select('item_name').eq('client_id', user.id).gte('created_at', dStart).lte('created_at', nowIso),
        supabase.from('button_clicks').select('button_type').eq('client_id', user.id).gte('created_at', dStart).lte('created_at', nowIso),
        supabase.from('tap_events').select('language').eq('user_id', user.id).gte('created_at', dStart).lte('created_at', nowIso),
      ])

      const sub = await getSubscription(user.id)

      // Fire daily summary check without blocking data load
      void checkAndCreateDailySummary().catch(() => {})

      // ── Unique taps + top tables ─────────────────────────────────────────────
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

      // ── Peak hour + peak day ─────────────────────────────────────────────────
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

      // ── Daily taps chart ─────────────────────────────────────────────────────
      const tapsMap: Record<string, number> = {}
      ;(rawTapsTyped ?? []).forEach(row => {
        const day = row.created_at.slice(0, 10)
        tapsMap[day] = (tapsMap[day] ?? 0) + 1
      })
      const chartData: ChartDay[] = buildDateRange(d).map(date => ({
        date: new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        taps: tapsMap[date] ?? 0,
      }))

      // ── Top 5 menu items ─────────────────────────────────────────────────────
      const itemsMap: Record<string, number> = {}
      ;(rawMenuViews as { item_name: string | null }[] | null)?.forEach(row => {
        const name = row.item_name ?? 'Unknown'
        itemsMap[name] = (itemsMap[name] ?? 0) + 1
      })
      const topItems: MenuItem[] = Object.entries(itemsMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, views]) => ({ name, views }))

      // ── Social button clicks ─────────────────────────────────────────────────
      const socialMap: Record<string, number> = {}
      ;(rawSocialClicks as { button_type: string | null }[] | null)?.forEach(row => {
        const key = (row.button_type ?? '').toLowerCase()
        if (SOCIAL_PLATFORMS.includes(key)) socialMap[key] = (socialMap[key] ?? 0) + 1
      })
      const socialData: SocialEntry[] = SOCIAL_PLATFORMS
        .map(platform => ({ platform, count: socialMap[platform] ?? 0 }))
        .filter(e => e.count > 0)

      // ── Language preferences ─────────────────────────────────────────────────
      const langMap: Record<string, number> = {}
      ;(rawLanguages as { language: string | null }[] | null)?.forEach(row => {
        const lang = row.language ?? 'unknown'
        langMap[lang] = (langMap[lang] ?? 0) + 1
      })
      const langData: LangEntry[] = Object.entries(langMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([language, count]) => ({ language, count }))

      setData({
        tapsCur:       tapsCur       ?? 0,
        tapsPrev:      tapsPrev      ?? 0,
        uniqueTapsCur,
        viewsCur:      viewsCur      ?? 0,
        viewsPrev:     viewsPrev     ?? 0,
        reviewsCur:    reviewsCur    ?? 0,
        reviewsPrev:   reviewsPrev   ?? 0,
        followersCur:  followersCur  ?? 0,
        followersPrev: followersPrev ?? 0,
        chartData,
        topItems,
        socialData,
        langData,
        topTables,
        peakHour,
        peakDay,
        subscription: sub,
      })
      setLoading(false)
    }

    void load()
  }, [days])

  function onDaysChange(d: number) {
    localStorage.setItem(LS_KEY, String(d))
    setDays(d)
  }

  if (loading || !data || days === null) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <p className="font-sans text-sm text-white/30">Loading…</p>
      </div>
    )
  }

  const rangeLabel = days === 1 ? 'Today' : `Last ${days} days`

  const stats = [
    { label: 'Total Taps',            value: data.tapsCur,       change: calcChange(data.tapsCur,      data.tapsPrev),      icon: 'tap'   as const },
    { label: 'Unique Taps',           value: data.uniqueTapsCur, change: 0,                                                icon: 'tap'   as const },
    { label: 'Menu Views',            value: data.viewsCur,      change: calcChange(data.viewsCur,     data.viewsPrev),     icon: 'menu'  as const },
    { label: 'Google Reviews Gained', value: data.reviewsCur,    change: calcChange(data.reviewsCur,   data.reviewsPrev),   icon: 'star'  as const },
    { label: 'New Followers',         value: data.followersCur,  change: calcChange(data.followersCur, data.followersPrev), icon: 'users' as const },
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
          <DateRangeFilter days={days} onChange={onDaysChange} />
          <ExportReport data={data as ExportData} rangeLabel={rangeLabel} />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        {stats.map(s => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Daily taps + Top menu items */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-[#141720] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="font-display font-semibold text-white text-base">Daily Taps</h2>
          <p className="font-sans text-xs text-white/35 mt-0.5 mb-5">Tap events per day, {rangeLabel.toLowerCase()}</p>
          <TapsChart data={data.chartData} />
        </div>
        <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="font-display font-semibold text-white text-base">Top Menu Items</h2>
          <p className="font-sans text-xs text-white/35 mt-0.5 mb-5">Most viewed, {rangeLabel.toLowerCase()}</p>
          <TopMenuItems items={data.topItems} />
        </div>
      </div>

      {/* Top Tables + Peak Time */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="font-display font-semibold text-white text-base">Top Tables</h2>
          <p className="font-sans text-xs text-white/35 mt-0.5 mb-5">Most active NFC tables, {rangeLabel.toLowerCase()}</p>
          {data.topTables.length === 0 ? (
            <p className="font-sans text-sm text-white/25">Data available once NFC stands are active</p>
          ) : (
            <div className="space-y-3.5">
              {data.topTables.map((t, i) => (
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
          {data.peakHour === null && data.peakDay === null ? (
            <p className="font-sans text-sm text-white/25">Check back after more taps are recorded</p>
          ) : (
            <div className="space-y-4">
              {data.peakHour !== null && (
                <div className="flex items-center gap-3">
                  <span className="text-2xl leading-none">{CLOCK_EMOJIS[data.peakHour % 12]}</span>
                  <div>
                    <p className="font-sans text-xs text-white/40 uppercase tracking-wider">Busiest Hour</p>
                    <p className="font-display text-base font-semibold text-white">{fmtHour(data.peakHour)}</p>
                  </div>
                </div>
              )}
              {data.peakDay !== null && (
                <div className="flex items-center gap-3">
                  <span className="text-2xl leading-none">📅</span>
                  <div>
                    <p className="font-sans text-xs text-white/40 uppercase tracking-wider">Busiest Day</p>
                    <p className="font-display text-base font-semibold text-white">{DAY_NAMES[data.peakDay]}</p>
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
          <SocialChart data={data.socialData} />
        </div>

        <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="font-display font-semibold text-white text-base">Language Preferences</h2>
          <p className="font-sans text-xs text-white/35 mt-0.5 mb-5">Top 5 visitor languages, {rangeLabel.toLowerCase()}</p>
          <LanguagePrefs data={data.langData} />
        </div>

        <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="font-display font-semibold text-white text-base">Subscription</h2>
          <p className="font-sans text-xs text-white/35 mt-0.5 mb-5">Current plan &amp; billing status</p>
          <SubscriptionCard data={data.subscription} />
        </div>

      </div>
    </div>
  )
}
