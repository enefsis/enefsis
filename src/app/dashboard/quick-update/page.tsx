export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AvailabilityToggle } from './availability-toggle'
import { TodaysSpecialsEditor } from './todays-specials-editor'
import type { MenuSectionData } from '@/actions/page-editor'

export const metadata = { title: 'Quick Update' }

export default async function QuickUpdatePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: pageRaw } = await admin
    .from('client_pages')
    .select('menu_sections, restaurant_name, todays_specials')
    .eq('user_id', user.id)
    .maybeSingle()

  const sections = ((pageRaw?.menu_sections ?? []) as MenuSectionData[])
    .filter(s => s.items?.length > 0)

  const restaurantName = pageRaw?.restaurant_name ?? ''
  const todaysSpecials = pageRaw?.todays_specials ?? ''

  const totalItems     = sections.reduce((n, s) => n + s.items.length, 0)
  const availableItems = sections.reduce((n, s) => n + s.items.filter(i => i.available !== false).length, 0)

  return (
    <div className="min-h-full bg-[#0D0F14] px-4 py-6 max-w-lg mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">Quick Update</h1>
        {restaurantName && (
          <p className="font-sans text-sm text-white/40 mt-0.5">{restaurantName}</p>
        )}
        {totalItems > 0 && (
          <p className="font-sans text-xs text-white/25 mt-2">
            {availableItems} of {totalItems} items available
          </p>
        )}
      </div>

      {sections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="font-sans text-sm text-white/30">No menu items yet</p>
          <p className="font-sans text-xs text-white/20 mt-1">Add items in the Page Editor first</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map(section => (
            <div
              key={section.id}
              className="rounded-2xl overflow-hidden"
              style={{ background: '#141720', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {/* Section header */}
              <div className="px-4 py-3 border-b border-white/[0.05]">
                <p className="font-sans text-xs font-semibold text-white/40 uppercase tracking-wider">
                  {section.emoji ? `${section.emoji} ` : ''}{section.name}
                </p>
              </div>

              {/* Items */}
              <div className="divide-y divide-white/[0.04]">
                {section.items.map(item => {
                  const isAvailable = item.available !== false
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 px-4 py-4"
                    >
                      {/* Item info */}
                      <div className="min-w-0 flex-1">
                        <p
                          className="font-sans text-base font-medium leading-snug truncate"
                          style={{ color: isAvailable ? '#fff' : 'rgba(255,255,255,0.35)' }}
                        >
                          {item.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.price && (
                            <span className="font-sans text-sm text-white/40">
                              €{item.price}
                            </span>
                          )}
                          <span
                            className="font-sans text-[11px] font-semibold px-2 py-0.5 rounded-full"
                            style={isAvailable
                              ? { color: '#34D399', background: 'rgba(34,197,94,0.10)' }
                              : { color: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.06)' }}
                          >
                            {isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </div>

                      {/* Toggle */}
                      <AvailabilityToggle
                        sectionId={section.id}
                        itemId={item.id}
                        itemName={item.name}
                        initial={isAvailable}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Today's Specials */}
      <div className="mt-6">
        <TodaysSpecialsEditor initial={todaysSpecials} />
      </div>

    </div>
  )
}
