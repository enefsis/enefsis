import { createClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/dashboard/stat-card'
import { TapsChart, type ChartDay } from '@/components/dashboard/taps-chart'
import { TopMenuItems, type MenuItem } from '@/components/dashboard/top-menu-items'
import { SocialChart, type SocialEntry } from '@/components/dashboard/social-chart'
import { LanguagePrefs, type LangEntry } from '@/components/dashboard/language-prefs'
import { SubscriptionCard } from '@/components/dashboard/subscription-card'

export const metadata = { title: 'Dashboard' }

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

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const now    = new Date()
  const d30    = new Date(now.getTime() - 30 * 86_400_000).toISOString()
  const d60    = new Date(now.getTime() - 60 * 86_400_000).toISOString()
  const nowIso = now.toISOString()

  console.log('[Dashboard] session user.id:', user?.id)

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
    supabase.from('tap_events').select('*', { count: 'exact', head: true }).eq('user_id', user!.id).gte('created_at', d30).lte('created_at', nowIso),
    supabase.from('tap_events').select('*', { count: 'exact', head: true }).eq('user_id', user!.id).gte('created_at', d60).lt('created_at', d30),
    supabase.from('menu_item_views').select('*', { count: 'exact', head: true }).eq('client_id', user!.id).gte('created_at', d30).lte('created_at', nowIso),
    supabase.from('menu_item_views').select('*', { count: 'exact', head: true }).eq('client_id', user!.id).gte('created_at', d60).lt('created_at', d30),
    supabase.from('button_clicks').select('*', { count: 'exact', head: true }).eq('client_id', user!.id).gte('created_at', d30).lte('created_at', nowIso),
    supabase.from('button_clicks').select('*', { count: 'exact', head: true }).eq('client_id', user!.id).gte('created_at', d60).lt('created_at', d30),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('user_id', user!.id).gte('created_at', d30).lte('created_at', nowIso),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('user_id', user!.id).gte('created_at', d60).lt('created_at', d30),
    supabase.from('tap_events').select('created_at').eq('user_id', user!.id).gte('created_at', d30).lte('created_at', nowIso),
    supabase.from('menu_item_views').select('item_name').eq('client_id', user!.id).gte('created_at', d30).lte('created_at', nowIso),
    supabase.from('button_clicks').select('button_type').eq('client_id', user!.id).gte('created_at', d30).lte('created_at', nowIso),
    supabase.from('tap_events').select('language').eq('user_id', user!.id).gte('created_at', d30).lte('created_at', nowIso),
  ])

  // Subscription fetched separately so we can log the error if it fails
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawSubscription, error: subError } = user
    ? await (supabase.from('subscriptions') as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null, error: null }

  console.log('[Dashboard] subscription data:', rawSubscription, 'error:', subError)

  // ── Daily taps chart ──────────────────────────────────────────────────────
  const tapsMap: Record<string, number> = {}
  ;(rawTaps as { created_at: string }[] | null)?.forEach(row => {
    const day = row.created_at.slice(0, 10)
    tapsMap[day] = (tapsMap[day] ?? 0) + 1
  })
  const chartData: ChartDay[] = buildDateRange(30).map(date => ({
    date: new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    taps: tapsMap[date] ?? 0,
  }))

  // ── Top 5 menu items ──────────────────────────────────────────────────────
  const itemsMap: Record<string, number> = {}
  ;(rawMenuViews as { item_name: string | null }[] | null)?.forEach(row => {
    const name = row.item_name ?? 'Unknown'
    itemsMap[name] = (itemsMap[name] ?? 0) + 1
  })
  const topItems: MenuItem[] = Object.entries(itemsMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, views]) => ({ name, views }))

  // ── Social button clicks breakdown ───────────────────────────────────────
  const socialMap: Record<string, number> = {}
  ;(rawSocialClicks as { button_type: string | null }[] | null)?.forEach(row => {
    const key = (row.button_type ?? '').toLowerCase()
    if (SOCIAL_PLATFORMS.includes(key)) {
      socialMap[key] = (socialMap[key] ?? 0) + 1
    }
  })
  const socialData: SocialEntry[] = SOCIAL_PLATFORMS
    .map(platform => ({ platform, count: socialMap[platform] ?? 0 }))
    .filter(e => e.count > 0)

  // ── Language preferences ──────────────────────────────────────────────────
  const langMap: Record<string, number> = {}
  ;(rawLanguages as { language: string | null }[] | null)?.forEach(row => {
    const lang = row.language ?? 'unknown'
    langMap[lang] = (langMap[lang] ?? 0) + 1
  })
  const langData: LangEntry[] = Object.entries(langMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([language, count]) => ({ language, count }))

  // ── Subscription ─────────────────────────────────────────────────────────
  const subscription = (rawSubscription as {
    plan: string | null
    status: string | null
    next_billing_date: string | null
    amount: number | null
    payment_method: string | null
    custom_amount: number | null
  } | null)

  // ── Stat cards ────────────────────────────────────────────────────────────
  const stats = [
    { label: 'Total Taps',            value: tapsCur      ?? 0, change: calcChange(tapsCur      ?? 0, tapsPrev      ?? 0), icon: 'tap'   as const },
    { label: 'Menu Views',            value: viewsCur     ?? 0, change: calcChange(viewsCur     ?? 0, viewsPrev     ?? 0), icon: 'menu'  as const },
    { label: 'Google Reviews Gained', value: reviewsCur   ?? 0, change: calcChange(reviewsCur   ?? 0, reviewsPrev   ?? 0), icon: 'star'  as const },
    { label: 'New Followers',         value: followersCur ?? 0, change: calcChange(followersCur ?? 0, followersPrev ?? 0), icon: 'users' as const },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Dashboard</h1>
        <p className="font-sans text-sm text-white/40 mt-0.5">Last 30 days</p>
      </div>

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
          <p className="font-sans text-xs text-white/35 mt-0.5 mb-5">Tap events per day, last 30 days</p>
          <TapsChart data={chartData} />
        </div>
        <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="font-display font-semibold text-white text-base">Top Menu Items</h2>
          <p className="font-sans text-xs text-white/35 mt-0.5 mb-5">Most viewed, last 30 days</p>
          <TopMenuItems items={topItems} />
        </div>
      </div>

      {/* Social breakdown + Language prefs + Subscription */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Social button clicks doughnut */}
        <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="font-display font-semibold text-white text-base">Social Button Clicks</h2>
          <p className="font-sans text-xs text-white/35 mt-0.5 mb-5">Breakdown by platform, last 30 days</p>
          <SocialChart data={socialData} />
        </div>

        {/* Language preferences */}
        <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="font-display font-semibold text-white text-base">Language Preferences</h2>
          <p className="font-sans text-xs text-white/35 mt-0.5 mb-5">Top 5 visitor languages, last 30 days</p>
          <LanguagePrefs data={langData} />
        </div>

        {/* Subscription status */}
        <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="font-display font-semibold text-white text-base">Subscription</h2>
          <p className="font-sans text-xs text-white/35 mt-0.5 mb-5">Current plan &amp; billing status</p>
          <SubscriptionCard data={subscription} />
        </div>

      </div>
    </div>
  )
}
