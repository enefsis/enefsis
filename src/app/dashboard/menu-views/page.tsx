import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { MenuViewsChart, type ViewsDay } from '@/components/dashboard/menu-views-chart'
import type { MenuSectionData } from '@/actions/page-editor'

export const metadata = { title: 'Menu Views' }

type ViewRow = { created_at: string; item_id: string | null; item_name: string | null }

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

export default async function MenuViewsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const d30 = new Date(Date.now() - 30 * 86_400_000).toISOString()

  const [{ data: rawViews }, { data: rawPage }] = await Promise.all([
    supabase
      .from('menu_item_views')
      .select('created_at, item_id, item_name')
      .gte('created_at', d30),
    createAdminClient()
      .from('client_pages')
      .select('menu_sections')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const views = (rawViews as ViewRow[] | null) ?? []

  // Build item_id → section_name map from the stored menu JSON
  const sections = (
    (rawPage as { menu_sections: unknown } | null)?.menu_sections ?? []
  ) as MenuSectionData[]
  const itemToSection: Record<string, string> = {}
  sections.forEach(sec => sec.items.forEach(item => { itemToSection[item.id] = sec.name }))

  // ── Stat cards ─────────────────────────────────────────────────────────────
  const total = views.length
  const todayStr  = new Date().toISOString().slice(0, 10)

  const itemMap: Record<string, number> = {}
  views.forEach(v => {
    const name = v.item_name ?? 'Unknown'
    itemMap[name] = (itemMap[name] ?? 0) + 1
  })
  const topItems      = Object.entries(itemMap).sort(([, a], [, b]) => b - a).slice(0, 10)
  const maxItemViews  = topItems[0]?.[1] ?? 1
  const uniqueItems   = Object.keys(itemMap).length

  // ── Daily views chart ──────────────────────────────────────────────────────
  const viewsByDay: Record<string, number> = {}
  views.forEach(v => {
    const day = v.created_at.slice(0, 10)
    viewsByDay[day] = (viewsByDay[day] ?? 0) + 1
  })
  const chartData: ViewsDay[] = buildDateRange(30).map(date => ({
    date:  fmtDay(date),
    views: viewsByDay[date] ?? 0,
  }))
  const todayViews = viewsByDay[todayStr] ?? 0

  // ── Views by section ───────────────────────────────────────────────────────
  const sectionMap: Record<string, number> = {}
  views.forEach(v => {
    const sec = v.item_id ? (itemToSection[v.item_id] ?? 'Uncategorised') : 'Uncategorised'
    sectionMap[sec] = (sectionMap[sec] ?? 0) + 1
  })
  const topSections    = Object.entries(sectionMap).sort(([, a], [, b]) => b - a)
  const maxSectionViews = topSections[0]?.[1] ?? 1

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Menu Views</h1>
        <p className="font-sans text-sm text-white/40 mt-0.5">Last 30 days</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Views',    value: total.toLocaleString()        },
          { label: 'Unique Items',   value: uniqueItems.toLocaleString()  },
          { label: 'Top Item Views', value: maxItemViews.toLocaleString() },
          { label: "Today's Views",  value: todayViews.toLocaleString()   },
        ].map(s => (
          <div key={s.label} className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5">
            <p className="font-sans text-xs text-white/40 uppercase tracking-wider">{s.label}</p>
            <p className="font-display text-2xl font-bold text-white mt-1.5">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Views over time */}
      <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5">
        <h2 className="font-display font-semibold text-white text-base">Views Over Time</h2>
        <p className="font-sans text-xs text-white/35 mt-0.5 mb-5">Daily menu item views, last 30 days</p>
        <MenuViewsChart data={chartData} />
      </div>

      {/* Top items + By section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="font-display font-semibold text-white text-base">Top Items</h2>
          <p className="font-sans text-xs text-white/35 mt-0.5 mb-5">Most viewed menu items</p>
          {topItems.length === 0 ? (
            <p className="font-sans text-sm text-white/25">No menu view data yet</p>
          ) : (
            <div className="space-y-3.5">
              {topItems.map(([name, count], i) => {
                const pct = Math.round((count / maxItemViews) * 100)
                return (
                  <div key={name}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-sans text-xs text-white/25 w-5 shrink-0 tabular-nums">#{i + 1}</span>
                      <span className="font-sans text-sm text-white/75 flex-1 truncate">{name}</span>
                      <span className="font-display font-semibold text-white text-sm shrink-0 tabular-nums">
                        {count.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden ml-7">
                      <div className="h-full bg-[#38BEFF] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="font-display font-semibold text-white text-base">Views by Section</h2>
          <p className="font-sans text-xs text-white/35 mt-0.5 mb-5">Performance by menu section</p>
          {topSections.length === 0 ? (
            <p className="font-sans text-sm text-white/25">No section data yet</p>
          ) : (
            <div className="space-y-4">
              {topSections.map(([name, count]) => {
                const pct = Math.round((count / maxSectionViews) * 100)
                return (
                  <div key={name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-sans text-sm text-white/70 truncate pr-3">{name}</span>
                      <span className="font-display font-semibold text-white text-sm shrink-0 tabular-nums">
                        {count.toLocaleString()}
                      </span>
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

      </div>
    </div>
  )
}
