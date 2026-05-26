'use client'

import { useState, useRef, useTransition, useCallback } from 'react'
import {
  ChevronDown, ChevronRight, Plus, Minus, Trash2, Upload, Save, Loader2, ExternalLink,
  ArrowUp, ArrowDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { savePage, saveLogoUrl, uploadLogo } from '@/actions/page-editor'
import type { PageData, MenuSectionData, MenuItemData, StructuredHours, DayHours, DaySchedule } from '@/actions/page-editor'
import { createClient } from '@/lib/supabase/client'
import { LandingClient } from '@/app/p/[slug]/landing-client'

// ─── Local types ──────────────────────────────────────────────────────────────

type LocalItem = MenuItemData & { photoPreview: string | null }

type LocalSection = {
  id: string
  name: string
  items: LocalItem[]
  expanded: boolean
}

type HeroBgMode = 'color' | 'gradient'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeItem(): LocalItem {
  return { id: crypto.randomUUID(), name: '', price: '', description: '', photo_url: null, available: true, photoPreview: null }
}

function makeSection(): LocalSection {
  return { id: crypto.randomUUID(), name: 'New Section', items: [makeItem()], expanded: true }
}

function parseHeroBg(heroBg: string | null) {
  const d = { mode: 'color' as HeroBgMode, color: '#111318', gradFrom: '#1e3a5f', gradTo: '#2B5CE6', angle: '135' }
  if (!heroBg) return d
  if (heroBg.startsWith('linear-gradient')) {
    const m = heroBg.match(/linear-gradient\((\d+)deg,\s*([^,]+),\s*([^)]+)\)/)
    if (m) return { mode: 'gradient' as HeroBgMode, color: d.color, gradFrom: m[2].trim(), gradTo: m[3].trim(), angle: m[1] }
    return { ...d, mode: 'gradient' as HeroBgMode }
  }
  return { ...d, color: heroBg }
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputCls = 'w-full rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder-white/25 px-3 py-2 focus:outline-none focus:border-[#2B5CE6]/50 transition-colors'
const labelCls = 'block text-xs font-medium text-white/50 mb-1.5'

// ─── Structured hours editor ──────────────────────────────────────────────────

const WEEK_DAYS = [
  { key: 'monday',    label: 'Monday'    },
  { key: 'tuesday',   label: 'Tuesday'   },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday',  label: 'Thursday'  },
  { key: 'friday',    label: 'Friday'    },
  { key: 'saturday',  label: 'Saturday'  },
  { key: 'sunday',    label: 'Sunday'    },
]

const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2)
  const m = i % 2 === 0 ? '00' : '30'
  return `${String(h).padStart(2, '0')}:${m}`
})

function makeDefaultStructuredHours(): StructuredHours {
  return {
    monday:    [{ open: '09:00', close: '22:00' }],
    tuesday:   [{ open: '09:00', close: '22:00' }],
    wednesday: [{ open: '09:00', close: '22:00' }],
    thursday:  [{ open: '09:00', close: '22:00' }],
    friday:    [{ open: '09:00', close: '22:00' }],
    saturday:  [{ open: '09:00', close: '22:00' }],
    sunday:    'closed',
  }
}

const selectCls = 'flex-1 rounded bg-[#0D0F14] border border-white/10 text-xs text-white px-2 py-1.5 focus:outline-none focus:border-[#2B5CE6]/50 transition-colors'
const selectStyle: React.CSSProperties = { background: '#0D0F14', color: 'white' }
const optionStyle: React.CSSProperties = { background: '#1a1d24', color: 'white' }

function StructuredHoursEditor({
  value,
  onChange,
}: {
  value: StructuredHours
  onChange: (v: StructuredHours) => void
}) {
  function updateDay(key: string, schedule: DaySchedule) {
    onChange({ ...value, [key]: schedule })
  }

  return (
    <div className="space-y-2">
      {WEEK_DAYS.map(({ key, label }) => {
        const schedule = value[key as keyof StructuredHours]
        const isClosed = schedule === 'closed'
        const shifts   = isClosed ? [] : (schedule as DayHours[])

        return (
          <div key={key} className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2.5">
            {/* Day row header */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-white/70 w-24">{label}</span>
              <button
                type="button"
                onClick={() =>
                  updateDay(key, isClosed ? [{ open: '09:00', close: '22:00' }] : 'closed')
                }
                className={cn(
                  'text-[10px] font-semibold px-2.5 py-0.5 rounded-full border transition-colors',
                  isClosed
                    ? 'text-red-400 bg-red-400/10 border-red-400/25'
                    : 'text-emerald-400 bg-emerald-400/10 border-emerald-400/25',
                )}
              >
                {isClosed ? 'Closed' : 'Open'}
              </button>
            </div>

            {/* Shifts */}
            {!isClosed && (
              <div className="space-y-1.5">
                {shifts.map((shift, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <select
                      value={shift.open}
                      onChange={e => {
                        const next = [...shifts]
                        next[idx] = { ...next[idx], open: e.target.value }
                        updateDay(key, next)
                      }}
                      className={selectCls}
                      style={selectStyle}
                    >
                      {TIME_SLOTS.map(t => <option key={t} value={t} style={optionStyle}>{t}</option>)}
                    </select>
                    <span className="text-white/30 text-xs shrink-0">–</span>
                    <select
                      value={shift.close}
                      onChange={e => {
                        const next = [...shifts]
                        next[idx] = { ...next[idx], close: e.target.value }
                        updateDay(key, next)
                      }}
                      className={selectCls}
                      style={selectStyle}
                    >
                      {TIME_SLOTS.map(t => <option key={t} value={t} style={optionStyle}>{t}</option>)}
                    </select>
                    {shifts.length > 1 && (
                      <button
                        type="button"
                        title="Remove shift"
                        onClick={() => updateDay(key, shifts.filter((_, i) => i !== idx))}
                        className="shrink-0 text-white/25 hover:text-red-400 transition-colors"
                      >
                        <Minus size={13} />
                      </button>
                    )}
                  </div>
                ))}
                {shifts.length < 2 && (
                  <button
                    type="button"
                    onClick={() => updateDay(key, [...shifts, { open: '17:00', close: '22:00' }])}
                    className="flex items-center gap-1 text-[10px] text-white/35 hover:text-white/60 transition-colors mt-1"
                  >
                    <Plus size={11} /> Add shift
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Small UI components ──────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className={labelCls}>{label}</p>
      {children}
    </div>
  )
}

function SectionPanel({
  title, children, defaultOpen = true,
}: {
  title: string; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-white/[0.06]">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-white/40">{title}</span>
        {open
          ? <ChevronDown size={13} className="text-white/30" />
          : <ChevronRight size={13} className="text-white/30" />}
      </button>
      {open && <div className="px-5 pb-5 space-y-3">{children}</div>}
    </div>
  )
}

// ─── Main editor ──────────────────────────────────────────────────────────────

export function PageEditorClient({
  initial,
  slug: initialSlug,
  backHref,
  savePageFn,
  saveLogoUrlFn,
  uploadLogoFn,
  uploadItemPhotoFn,
  isPro,
  clientId,
}: {
  initial: PageData | null
  slug: string | null
  backHref?: string
  savePageFn?: (data: PageData) => Promise<{ slug?: string; error?: string }>
  saveLogoUrlFn?: (url: string) => Promise<{ error?: string }>
  uploadLogoFn?: (fd: FormData) => Promise<{ url: string } | { error: string }>
  uploadItemPhotoFn?: (itemId: string, fd: FormData) => Promise<{ url: string } | { error: string }>
  isPro?: boolean
  clientId?: string
}) {
  const supabase = createClient()
  const hero0 = parseHeroBg(initial?.hero_bg ?? null)

  const initSections: LocalSection[] = ((initial?.menu_sections ?? []) as MenuSectionData[]).map(s => ({
    ...s,
    expanded: false,
    items: s.items.map(i => ({ ...i, available: i.available !== false, photoPreview: null })),
  }))

  const [restaurantName,   setRestaurantName]   = useState(initial?.restaurant_name   ?? '')
  const [tagline,          setTagline]           = useState(initial?.tagline           ?? '')
  const [heroBgMode,       setHeroBgMode]        = useState<HeroBgMode>(hero0.mode)
  const [heroColor,        setHeroColor]         = useState(hero0.color)
  const [gradFrom,         setGradFrom]          = useState(hero0.gradFrom)
  const [gradTo,           setGradTo]            = useState(hero0.gradTo)
  const [gradAngle,        setGradAngle]         = useState(hero0.angle)
  const [logoUrl,          setLogoUrl]           = useState<string | null>(initial?.logo_url ?? null)
  const [logoPreview,      setLogoPreview]       = useState<string | null>(initial?.logo_url ?? null)
  const [googleReviewUrl,  setGoogleReviewUrl]   = useState(initial?.google_review_url ?? '')
  const [instagramUrl,     setInstagramUrl]      = useState(initial?.instagram_url     ?? '')
  const [facebookUrl,      setFacebookUrl]       = useState(initial?.facebook_url      ?? '')
  const [tiktokUrl,        setTiktokUrl]         = useState(initial?.tiktok_url        ?? '')
  const [whatsappNumber,   setWhatsappNumber]    = useState(initial?.whatsapp_number   ?? '')
  const [sections,          setSections]          = useState<LocalSection[]>(initSections)
  const [openingHours,      setOpeningHours]      = useState(initial?.opening_hours      ?? '')
  const [openingHoursStructured, setOpeningHoursStructured] = useState<StructuredHours>(
    initial?.opening_hours_structured ?? makeDefaultStructuredHours()
  )
  const [phone,             setPhone]             = useState(initial?.phone              ?? '')
  const [address,           setAddress]           = useState(initial?.address            ?? '')
  const [wifiName,          setWifiName]          = useState(initial?.wifi_name          ?? '')
  const [wifiPassword,      setWifiPassword]      = useState(initial?.wifi_password      ?? '')
  const [callWaiter,        setCallWaiter]        = useState(initial?.call_waiter_enabled ?? false)
  const [waiterWhatsapp,    setWaiterWhatsapp]    = useState(initial?.waiter_whatsapp    ?? '')
  const [waiterMessage,     setWaiterMessage]     = useState(initial?.waiter_message     ?? '')
  const [restaurantType,    setRestaurantType]    = useState(initial?.restaurant_type    ?? '')
  const [city,              setCity]              = useState(initial?.city               ?? '')
  const [rating,            setRating]            = useState(initial?.rating             ?? '')
  const [reviewCount,       setReviewCount]       = useState(initial?.review_count       ?? '')
  const [googlePlaceId,     setGooglePlaceId]     = useState(initial?.google_place_id   ?? '')
  const [placeIdMsg,        setPlaceIdMsg]        = useState('')
  const [isFetching,        setIsFetching]        = useState(false)
  const [todaysSpecials,    setTodaysSpecials]    = useState(initial?.todays_specials    ?? '')
  const [tripAdvisorUrl,    setTripAdvisorUrl]    = useState(initial?.trip_advisor_url   ?? '')
  const [websiteUrl,        setWebsiteUrl]        = useState(initial?.website_url        ?? '')
  const [reservationUrl,       setReservationUrl]       = useState(initial?.reservation_url        ?? '')
  const [loyaltyEnabled,       setLoyaltyEnabled]       = useState(initial?.loyalty_enabled        ?? false)
  const [loyaltyStampsRequired, setLoyaltyStampsRequired] = useState(initial?.loyalty_stamps_required ?? 10)
  const [loyaltyReward,        setLoyaltyReward]        = useState(initial?.loyalty_reward         ?? '')
  const [loyaltyTitle,         setLoyaltyTitle]         = useState(initial?.loyalty_title          ?? '')
  const [saveMsg,           setSaveMsg]           = useState('')
  const [currentSlug,       setCurrentSlug]       = useState<string | null>(initialSlug)
  const [isPending,         startTransition]      = useTransition()

  const logoInputRef = useRef<HTMLInputElement>(null)

  const heroBg = heroBgMode === 'color'
    ? heroColor
    : `linear-gradient(${gradAngle}deg, ${gradFrom}, ${gradTo})`

  // ── Uploads ──

  function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoPreview(URL.createObjectURL(file))
    const fd = new FormData()
    fd.append('file', file)
    startTransition(async () => {
      const res = await (uploadLogoFn ?? uploadLogo)(fd)
      if ('url' in res) {
        setLogoUrl(res.url)
        await (saveLogoUrlFn ?? saveLogoUrl)(res.url)
      }
    })
  }

  function handleItemPhotoSelect(sectionId: string, itemId: string, file: File) {
    // Immediate local preview
    setSections(prev => prev.map(s => s.id !== sectionId ? s : {
      ...s, items: s.items.map(i => i.id !== itemId ? i : { ...i, photoPreview: URL.createObjectURL(file) }),
    }))
    startTransition(async () => {
      let publicUrl: string

      if (uploadItemPhotoFn) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await uploadItemPhotoFn(itemId, fd)
        if ('error' in res) { console.error('[ItemPhoto] upload failed:', res.error); return }
        publicUrl = res.url
      } else {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { console.error('[ItemPhoto] not authenticated'); return }

        const path = `${user.id}/menu/${itemId}`
        const { error: uploadError } = await supabase.storage
          .from('client-assets')
          .upload(path, file, { upsert: true })

        if (uploadError) { console.error('[ItemPhoto] upload failed:', uploadError.message); return }

        const { data: { publicUrl: url } } = supabase.storage
          .from('client-assets')
          .getPublicUrl(path)
        publicUrl = url
      }

      // Compute updated sections directly — do not rely on React state commit timing
      const updatedSections = sections.map(s => s.id !== sectionId ? s : {
        ...s, items: s.items.map(i => i.id !== itemId ? i : { ...i, photo_url: publicUrl }),
      })
      setSections(updatedSections)

      // Full save passing the updated sections directly
      await doSave(updatedSections)
      setSaveMsg('Photo saved!')
      setTimeout(() => setSaveMsg(''), 2000)
    })
  }

  // ── Menu helpers ──

  function toggleSection(id: string) {
    setSections(prev => prev.map(s => s.id === id ? { ...s, expanded: !s.expanded } : s))
  }
  function updateSectionName(id: string, name: string) {
    setSections(prev => prev.map(s => s.id === id ? { ...s, name } : s))
  }
  function removeSection(id: string) {
    setSections(prev => prev.filter(s => s.id !== id))
  }
  function addItem(sectionId: string) {
    setSections(prev => prev.map(s => s.id !== sectionId ? s : { ...s, items: [...s.items, makeItem()] }))
  }
  function removeItem(sectionId: string, itemId: string) {
    setSections(prev => prev.map(s => s.id !== sectionId ? s : { ...s, items: s.items.filter(i => i.id !== itemId) }))
  }
  function updateItem(sectionId: string, itemId: string, patch: Partial<LocalItem>) {
    setSections(prev => prev.map(s => s.id !== sectionId ? s : {
      ...s, items: s.items.map(i => i.id !== itemId ? i : { ...i, ...patch }),
    }))
  }
  function moveSection(id: string, dir: -1 | 1) {
    setSections(prev => {
      const idx = prev.findIndex(s => s.id === id)
      const next = [...prev]
      const swap = idx + dir
      if (swap < 0 || swap >= next.length) return prev
      ;[next[idx], next[swap]] = [next[swap], next[idx]]
      return next
    })
  }
  function moveItem(sectionId: string, itemId: string, dir: -1 | 1) {
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s
      const idx = s.items.findIndex(i => i.id === itemId)
      const next = [...s.items]
      const swap = idx + dir
      if (swap < 0 || swap >= next.length) return s
      ;[next[idx], next[swap]] = [next[swap], next[idx]]
      return { ...s, items: next }
    }))
  }

  // ── Google Places fetch ──

  async function handleFetchFromGoogle() {
    const id = googlePlaceId.trim()
    if (!id) return
    setIsFetching(true)
    setPlaceIdMsg('')
    try {
      const res  = await fetch(`/api/google-places?placeId=${encodeURIComponent(id)}`)
      const json = await res.json() as { rating?: number | null; review_count?: number | null; error?: string }
      if (json.error) {
        setPlaceIdMsg(json.error)
      } else {
        if (json.rating       != null) setRating(String(json.rating))
        if (json.review_count != null) setReviewCount(String(json.review_count))
        setPlaceIdMsg('✓ Rating synced from Google')
        setTimeout(() => setPlaceIdMsg(''), 4000)
      }
    } catch {
      setPlaceIdMsg('Network error — could not reach Google')
    } finally {
      setIsFetching(false)
    }
  }

  // ── Save ──

  async function doSave(overrideSections?: LocalSection[]) {
    const sectionsToSave = overrideSections ?? sections
    const data: PageData = {
      restaurant_name:     restaurantName,
      tagline,
      hero_bg:             heroBg,
      logo_url:            logoUrl,
      google_review_url:   googleReviewUrl,
      instagram_url:       instagramUrl,
      facebook_url:        facebookUrl,
      tiktok_url:          tiktokUrl,
      whatsapp_number:     whatsappNumber,
      opening_hours:            openingHours,
      opening_hours_structured: openingHoursStructured,
      phone,
      address,
      wifi_name:           wifiName,
      wifi_password:       wifiPassword,
      call_waiter_enabled: callWaiter,
      waiter_whatsapp:     waiterWhatsapp,
      waiter_message:      waiterMessage,
      restaurant_type:     restaurantType,
      city,
      rating,
      review_count:        reviewCount,
      todays_specials:     todaysSpecials,
      trip_advisor_url:    tripAdvisorUrl,
      website_url:         websiteUrl,
      reservation_url:          reservationUrl,
      loyalty_enabled:          loyaltyEnabled,
      loyalty_stamps_required:  loyaltyStampsRequired,
      loyalty_reward:           loyaltyReward,
      loyalty_title:            loyaltyTitle,
      google_place_id:          googlePlaceId,
      menu_sections: sectionsToSave.map(({ id, name, items }) => ({
        id, name,
        items: items.map(({ id, name, price, description, photo_url, available, allergens, is_popular, badge }) => ({
          id, name, price, description, photo_url, available: available !== false, allergens,
          ...(is_popular ? { is_popular } : {}),
          ...(badge       ? { badge }      : {}),
        })),
      })),
    }
    const res = await (savePageFn ?? savePage)(data)
    setSaveMsg(res.error ? `Error: ${res.error}` : 'Saved!')
    if (!res.error) {
      if (res.slug) setCurrentSlug(res.slug)
      setTimeout(() => setSaveMsg(''), 3000)
    }
  }

  function handleSave() {
    setSaveMsg('')
    startTransition(() => doSave())
  }

  // ── Preview sections (LocalSection → MenuSectionData) ──

  const previewSections: MenuSectionData[] = sections.map(s => ({
    id: s.id,
    name: s.name,
    items: s.items.map(i => ({
      id: i.id, name: i.name, price: i.price,
      description: i.description,
      photo_url: i.photoPreview ?? i.photo_url,
      available: i.available !== false,
      allergens: i.allergens,
      is_popular: i.is_popular,
      badge: i.badge,
    })),
  }))

  // ── Render ──

  return (
    <div className="flex h-full overflow-hidden">

      {/* ─ Left: controls ─ */}
      <div className="w-[420px] shrink-0 flex flex-col overflow-hidden border-r border-white/[0.06] bg-[#111318]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-2.5">
            {backHref && (
              <a
                href={backHref}
                className="text-white/30 hover:text-white/70 transition-colors"
                aria-label="Back"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            )}
            <h1 className="text-sm font-semibold text-white">Page Editor</h1>
          </div>
          <div className="flex items-center gap-3">
            {saveMsg && (
              <span className={cn('text-xs', saveMsg.startsWith('Error') ? 'text-red-400' : 'text-emerald-400')}>
                {saveMsg}
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2B5CE6] text-white text-xs font-medium hover:bg-[#2B5CE6]/80 disabled:opacity-50 transition-colors"
            >
              {isPending ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Save
            </button>
          </div>
        </div>

        {/* Page URL banner */}
        {currentSlug && (
          <div className="flex items-center gap-2 px-5 py-2.5 border-b border-white/[0.06] bg-[#0A0C10] shrink-0">
            <span className="text-[11px] text-white/35 shrink-0">Your page:</span>
            <a
              href={`/p/${currentSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-[#2B5CE6] hover:underline font-mono truncate min-w-0"
            >
              <span className="truncate">
                {(process.env.NEXT_PUBLIC_APP_URL ?? '')}/p/{currentSlug}
              </span>
              <ExternalLink size={10} className="shrink-0" />
            </a>
          </div>
        )}

        {/* Scrollable form */}
        <div className="flex-1 overflow-y-auto">

          {/* Identity */}
          <SectionPanel title="Identity">
            <Field label="Restaurant Category">
              <input type="text" value={restaurantType} onChange={e => setRestaurantType(e.target.value)}
                placeholder="Greek Restaurant, Café, Bar…" className={inputCls} />
            </Field>
            <Field label="City">
              <input type="text" value={city} onChange={e => setCity(e.target.value)}
                placeholder="Athens" className={inputCls} />
            </Field>
            <Field label="Rating">
              <input type="text" value={rating} onChange={e => setRating(e.target.value)}
                placeholder="4.9" className={inputCls} />
            </Field>
            <Field label="Review Count">
              <input type="text" value={reviewCount} onChange={e => setReviewCount(e.target.value)}
                placeholder="200+" className={inputCls} />
            </Field>
            <Field label="Google Place ID">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={googlePlaceId}
                  onChange={e => { setGooglePlaceId(e.target.value); setPlaceIdMsg('') }}
                  placeholder="e.g. ChIJN1t_tDeuEmsRUsoyG83frY4"
                  className={cn(inputCls, 'flex-1 min-w-0')}
                />
                <button
                  type="button"
                  onClick={handleFetchFromGoogle}
                  disabled={!googlePlaceId.trim() || isFetching}
                  className="px-3 py-2 rounded-lg text-xs font-medium border border-white/[0.08] text-white/55 hover:text-white/80 hover:border-white/20 transition-colors disabled:opacity-40 shrink-0"
                >
                  {isFetching ? 'Fetching…' : 'Fetch from Google'}
                </button>
              </div>
              <p className="text-[10px] text-white/25 mt-1">Find your Place ID on Google Maps</p>
              {placeIdMsg && (
                <p className={cn('text-[10px] mt-1', placeIdMsg.startsWith('✓') ? 'text-emerald-400' : 'text-red-400')}>
                  {placeIdMsg}
                </p>
              )}
            </Field>
            <Field label="Today&apos;s Specials">
              <input type="text" value={todaysSpecials} onChange={e => setTodaysSpecials(e.target.value)}
                placeholder="Moussaka, Grilled Octopus, Tzatziki…" className={inputCls} />
              <p className="text-[10px] text-white/25 mt-1">Comma-separated list shown as a banner</p>
            </Field>
          </SectionPanel>

          {/* Branding */}
          <SectionPanel title="Branding">
            <Field label="Restaurant Name">
              <input
                type="text"
                value={restaurantName}
                onChange={e => setRestaurantName(e.target.value)}
                placeholder="My Restaurant"
                className={inputCls}
              />
            </Field>
            <Field label="Tagline">
              <input
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                placeholder="Scan. Explore. Order."
                className={inputCls}
              />
            </Field>
          </SectionPanel>

          {/* Hero Background */}
          <SectionPanel title="Hero Background">
            <div className="flex rounded-lg border border-white/[0.08] overflow-hidden w-fit">
              {(['color', 'gradient'] as HeroBgMode[]).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setHeroBgMode(m)}
                  className={cn(
                    'px-3.5 py-1.5 text-xs font-medium capitalize transition-colors',
                    heroBgMode === m
                      ? 'bg-[#2B5CE6] text-white'
                      : 'text-white/45 hover:text-white/70',
                  )}
                >
                  {m}
                </button>
              ))}
            </div>

            {heroBgMode === 'color' ? (
              <Field label="Color">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={heroColor}
                    onChange={e => setHeroColor(e.target.value)}
                    className="w-9 h-9 rounded-lg cursor-pointer border border-white/10 bg-transparent p-0.5 shrink-0"
                  />
                  <input
                    type="text"
                    value={heroColor}
                    onChange={e => setHeroColor(e.target.value)}
                    className={cn(inputCls, 'font-mono')}
                  />
                </div>
              </Field>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Field label="From">
                    <div className="flex items-center gap-1.5">
                      <input type="color" value={gradFrom} onChange={e => setGradFrom(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border border-white/10 bg-transparent p-0.5 shrink-0" />
                      <input type="text" value={gradFrom} onChange={e => setGradFrom(e.target.value)}
                        className={cn(inputCls, 'font-mono text-xs')} />
                    </div>
                  </Field>
                  <Field label="To">
                    <div className="flex items-center gap-1.5">
                      <input type="color" value={gradTo} onChange={e => setGradTo(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border border-white/10 bg-transparent p-0.5 shrink-0" />
                      <input type="text" value={gradTo} onChange={e => setGradTo(e.target.value)}
                        className={cn(inputCls, 'font-mono text-xs')} />
                    </div>
                  </Field>
                </div>
                <Field label="Direction">
                  <select
                    value={gradAngle}
                    onChange={e => setGradAngle(e.target.value)}
                    className={cn(inputCls, 'cursor-pointer bg-[#111318]')}
                  >
                    <option value="0">Top → Bottom</option>
                    <option value="45">Diagonal ↘</option>
                    <option value="90">Left → Right</option>
                    <option value="135">Diagonal ↙</option>
                    <option value="180">Bottom → Top</option>
                  </select>
                </Field>
              </div>
            )}

            {/* Live swatch */}
            <div
              className="h-10 rounded-lg border border-white/[0.06]"
              style={{ background: heroBg }}
            />
          </SectionPanel>

          {/* Logo */}
          <SectionPanel title="Logo">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl border border-white/[0.08] flex items-center justify-center bg-white/[0.03] shrink-0 overflow-hidden">
                {logoPreview
                  ? <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-1" />
                  : <Upload size={18} className="text-white/20" />}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] text-xs text-white/55 hover:text-white/80 hover:border-white/20 transition-colors"
                >
                  <Upload size={12} />
                  {logoPreview ? 'Replace logo' : 'Upload logo'}
                </button>
                {logoPreview && (
                  <button
                    type="button"
                    onClick={() => { setLogoUrl(null); setLogoPreview(null) }}
                    className="text-xs text-red-400/60 hover:text-red-400 transition-colors text-left"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="hidden" onChange={handleLogoSelect} />
          </SectionPanel>

          {/* Social Links */}
          <SectionPanel title="Social Links">
            <Field label="Google Review URL">
              <input type="url" value={googleReviewUrl} onChange={e => setGoogleReviewUrl(e.target.value)}
                placeholder="https://g.page/r/..." className={inputCls} />
            </Field>
            <Field label="Instagram URL">
              <input type="url" value={instagramUrl} onChange={e => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/yourpage" className={inputCls} />
            </Field>
            <Field label="Facebook URL">
              <input type="url" value={facebookUrl} onChange={e => setFacebookUrl(e.target.value)}
                placeholder="https://facebook.com/yourpage" className={inputCls} />
            </Field>
            <Field label="TikTok URL">
              <input type="url" value={tiktokUrl} onChange={e => setTiktokUrl(e.target.value)}
                placeholder="https://tiktok.com/@yourpage" className={inputCls} />
            </Field>
            <Field label="WhatsApp Number">
              <input type="tel" value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)}
                placeholder="+30 210 000 0000" className={inputCls} />
            </Field>
            <Field label="TripAdvisor URL">
              <input type="url" value={tripAdvisorUrl} onChange={e => setTripAdvisorUrl(e.target.value)}
                placeholder="https://tripadvisor.com/Restaurant_Review-…" className={inputCls} />
            </Field>
            <Field label="Website URL">
              <input type="url" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)}
                placeholder="https://yourrestaurant.com" className={inputCls} />
            </Field>
          </SectionPanel>

          {/* Info */}
          <SectionPanel title="Info" defaultOpen={false}>
            <Field label="Opening Hours">
              <StructuredHoursEditor
                value={openingHoursStructured}
                onChange={setOpeningHoursStructured}
              />
              <p className="text-[10px] text-white/25 mt-2">
                Legacy text fallback (shown if no structured hours)
              </p>
              <input
                type="text"
                value={openingHours}
                onChange={e => setOpeningHours(e.target.value)}
                placeholder="e.g. Mon–Fri 09:00–22:00"
                className={cn(inputCls, 'mt-1.5')}
              />
            </Field>
            <Field label="Phone Number">
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+30 210 000 0000"
                className={inputCls}
              />
            </Field>
            <Field label="Address">
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="123 Main Street, Athens"
                className={inputCls}
              />
            </Field>
            <Field label="WiFi Network">
              <input
                type="text"
                value={wifiName}
                onChange={e => setWifiName(e.target.value)}
                placeholder="Network name"
                className={inputCls}
              />
            </Field>
            <Field label="WiFi Password">
              <input
                type="text"
                value={wifiPassword}
                onChange={e => setWifiPassword(e.target.value)}
                placeholder="Password"
                className={inputCls}
              />
            </Field>
            <Field label="Reservation Link">
              <input
                type="text"
                value={reservationUrl}
                onChange={e => setReservationUrl(e.target.value)}
                placeholder="https://www.opentable.com/... or tel:+43..."
                className={inputCls}
              />
              <p className="text-[10px] text-white/25 mt-1">Shows a &quot;Reserve a Table&quot; button on your page</p>
            </Field>
            <div className="flex items-center justify-between py-1">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-white/50">Call Waiter Button</p>
                  {isPro === false && (
                    <span
                      className="font-sans text-[9px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(43,92,230,0.15)', color: '#2B5CE6', letterSpacing: '0.05em' }}
                    >
                      PRO
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-white/25 mt-0.5">Show a &quot;Call Waiter&quot; button on the landing page</p>
              </div>
              <button
                type="button"
                onClick={() => setCallWaiter(v => !v)}
                className={cn(
                  'relative w-10 h-5.5 rounded-full transition-colors shrink-0',
                  callWaiter ? 'bg-[#2B5CE6]' : 'bg-white/[0.10]',
                )}
                style={{ height: 22, width: 40 }}
              >
                <span
                  className={cn(
                    'absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform',
                    callWaiter ? 'translate-x-[19px]' : 'translate-x-0.5',
                  )}
                />
              </button>
            </div>

            <Field label="Waiter WhatsApp Number">
              <input
                type="tel"
                value={waiterWhatsapp}
                onChange={e => setWaiterWhatsapp(e.target.value)}
                placeholder="+43 664 123456"
                className={inputCls}
              />
            </Field>
            <Field label="Waiter Notification Message">
              <input
                type="text"
                value={waiterMessage}
                onChange={e => setWaiterMessage(e.target.value)}
                placeholder="Table {table} needs assistance"
                className={inputCls}
              />
              <p className="text-[10px] text-white/25 mt-1">Use &#123;table&#125; as a placeholder for the table number</p>
            </Field>
          </SectionPanel>

          {/* Menu */}
          <SectionPanel title="Menu Sections">
            {/* AI feature flag banner */}
            {isPro === false && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-1" style={{ background: 'rgba(43,92,230,0.08)', border: '1px solid rgba(43,92,230,0.15)' }}>
                <span className="text-xs">✨</span>
                <span className="font-sans text-xs text-white/50 flex-1">AI Descriptions — Pro Feature</span>
                <span
                  className="font-sans text-[10px] text-white/35 cursor-default"
                  title="Upgrade to Pro to unlock AI-generated menu descriptions"
                >
                  Upgrade to Pro to unlock ℹ
                </span>
              </div>
            )}
            <div className="space-y-2.5">
              {sections.map((section, si) => (
                <MenuSectionEditor
                  key={section.id}
                  section={section}
                  isFirst={si === 0}
                  isLast={si === sections.length - 1}
                  onToggle={() => toggleSection(section.id)}
                  onNameChange={name => updateSectionName(section.id, name)}
                  onRemove={() => removeSection(section.id)}
                  onMoveUp={() => moveSection(section.id, -1)}
                  onMoveDown={() => moveSection(section.id, 1)}
                  onAddItem={() => addItem(section.id)}
                  onRemoveItem={itemId => removeItem(section.id, itemId)}
                  onUpdateItem={(itemId, patch) => updateItem(section.id, itemId, patch)}
                  onMoveItem={(itemId, dir) => moveItem(section.id, itemId, dir)}
                  onItemPhotoSelect={(itemId, file) => handleItemPhotoSelect(section.id, itemId, file)}
                  isPro={isPro}
                  clientId={clientId}
                />
              ))}
              <button
                type="button"
                onClick={() => setSections(prev => [...prev, makeSection()])}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-dashed border-white/[0.1] text-xs text-white/35 hover:text-white/55 hover:border-white/[0.18] transition-colors"
              >
                <Plus size={12} />
                Add section
              </button>
            </div>
          </SectionPanel>

          {/* Loyalty */}
          <SectionPanel title="Loyalty" defaultOpen={false}>
            {isPro === false ? (
              <div className="rounded-xl p-4 text-center space-y-2" style={{ background: 'rgba(43,92,230,0.06)', border: '1px solid rgba(43,92,230,0.14)' }}>
                <div className="flex items-center justify-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2" stroke="rgba(43,92,230,0.6)" strokeWidth="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" stroke="rgba(43,92,230,0.6)" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span
                    className="font-sans text-[10px] font-bold px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(43,92,230,0.15)', color: '#2B5CE6', letterSpacing: '0.05em' }}
                  >
                    PRO
                  </span>
                </div>
                <p className="font-sans text-xs text-white/40">Upgrade to Pro to enable the Loyalty Stamp Card</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Enable toggle */}
                <div className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-xs font-medium text-white/50">Enable Loyalty Card</p>
                    <p className="text-[11px] text-white/25 mt-0.5">Show a stamp card on the landing page</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLoyaltyEnabled(v => !v)}
                    className={cn('relative rounded-full transition-colors shrink-0', loyaltyEnabled ? 'bg-[#2B5CE6]' : 'bg-white/[0.10]')}
                    style={{ height: 22, width: 40 }}
                  >
                    <span
                      className={cn('absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform', loyaltyEnabled ? 'translate-x-[19px]' : 'translate-x-0.5')}
                    />
                  </button>
                </div>

                <Field label="Card Title">
                  <input
                    type="text"
                    value={loyaltyTitle}
                    onChange={e => setLoyaltyTitle(e.target.value)}
                    placeholder="Coffee Club"
                    className={inputCls}
                  />
                </Field>

                <Field label="Stamps Required for Reward">
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={loyaltyStampsRequired}
                    onChange={e => setLoyaltyStampsRequired(Math.max(1, parseInt(e.target.value) || 1))}
                    className={inputCls}
                  />
                </Field>

                <Field label="Reward Description">
                  <input
                    type="text"
                    value={loyaltyReward}
                    onChange={e => setLoyaltyReward(e.target.value)}
                    placeholder="Free coffee"
                    className={inputCls}
                  />
                </Field>
              </div>
            )}
          </SectionPanel>

        </div>
      </div>

      {/* ─ Right: preview ─ */}
      <div className="flex-1 overflow-y-auto flex items-start justify-center py-10 bg-[#0D0F14]">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/25 text-center mb-5">Live Preview</p>
          <div
            className="rounded-[40px] overflow-hidden shadow-2xl border-[3px] border-white/[0.08] mx-auto"
            style={{ width: 375, height: 760, overflowY: 'auto' }}
          >
            <LandingClient
              standId={null}
              clientId="preview"
              tableNumber={null}
              restaurantName={restaurantName}
              tagline={tagline}
              logoUrl={logoPreview}
              googleReviewUrl={googleReviewUrl || null}
              instagramUrl={instagramUrl || null}
              facebookUrl={facebookUrl || null}
              tiktokUrl={tiktokUrl || null}
              whatsappNumber={whatsappNumber || null}
              menuSections={previewSections}
              openingHours={openingHours || null}
              phone={phone || null}
              address={address || null}
              wifiName={wifiName || null}
              wifiPassword={wifiPassword || null}
              callWaiterEnabled={callWaiter}
              waiterWhatsapp={waiterWhatsapp || null}
              waiterMessage={waiterMessage || null}
              restaurantType={restaurantType || null}
              city={city || null}
              rating={rating || null}
              reviewCount={reviewCount || null}
              todaysSpecials={todaysSpecials || null}
              tripAdvisorUrl={tripAdvisorUrl || null}
              websiteUrl={websiteUrl || null}
              reservationUrl={reservationUrl || null}
              isPro={isPro ?? false}
              loyaltyEnabled={loyaltyEnabled}
              loyaltyStampsRequired={loyaltyStampsRequired}
              loyaltyReward={loyaltyReward || null}
              loyaltyTitle={loyaltyTitle || null}
              openingHoursStructured={openingHoursStructured}
            />
          </div>
        </div>
      </div>

    </div>
  )
}

// ─── Menu section editor ──────────────────────────────────────────────────────

interface MenuSectionEditorProps {
  section: LocalSection
  isFirst: boolean
  isLast: boolean
  onToggle: () => void
  onNameChange: (name: string) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onAddItem: () => void
  onRemoveItem: (itemId: string) => void
  onUpdateItem: (itemId: string, patch: Partial<LocalItem>) => void
  onMoveItem: (itemId: string, dir: -1 | 1) => void
  onItemPhotoSelect: (itemId: string, file: File) => void
  isPro?: boolean
  clientId?: string
}

function MenuSectionEditor({
  section, isFirst, isLast, onToggle, onNameChange, onRemove, onMoveUp, onMoveDown,
  onAddItem, onRemoveItem, onUpdateItem, onMoveItem, onItemPhotoSelect, isPro, clientId,
}: MenuSectionEditorProps) {
  const btnCls = 'text-white/20 hover:text-white/60 transition-colors disabled:opacity-20 disabled:cursor-not-allowed'
  return (
    <div className="rounded-xl border border-white/[0.07] overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-2.5 bg-white/[0.025]">
        <button type="button" onClick={onToggle} className="text-white/30 hover:text-white/60 transition-colors shrink-0">
          {section.expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </button>
        <input
          type="text"
          value={section.name}
          onChange={e => onNameChange(e.target.value)}
          placeholder="Section name"
          className="flex-1 bg-transparent text-sm font-medium text-white/80 focus:outline-none placeholder-white/20 min-w-0"
        />
        <button type="button" onClick={onMoveUp} disabled={isFirst} className={btnCls}>
          <ArrowUp size={12} />
        </button>
        <button type="button" onClick={onMoveDown} disabled={isLast} className={btnCls}>
          <ArrowDown size={12} />
        </button>
        <button type="button" onClick={onRemove} className="text-white/20 hover:text-red-400/70 transition-colors shrink-0">
          <Trash2 size={13} />
        </button>
      </div>

      {section.expanded && (
        <div className="px-3 pt-1 pb-3 space-y-2">
          {section.items.map((item, ii) => (
            <MenuItemEditor
              key={item.id}
              item={item}
              isFirst={ii === 0}
              isLast={ii === section.items.length - 1}
              sectionName={section.name}
              onRemove={() => onRemoveItem(item.id)}
              onUpdate={patch => onUpdateItem(item.id, patch)}
              onMoveUp={() => onMoveItem(item.id, -1)}
              onMoveDown={() => onMoveItem(item.id, 1)}
              onPhotoSelect={file => onItemPhotoSelect(item.id, file)}
              isPro={isPro}
              clientId={clientId}
            />
          ))}
          <button
            type="button"
            onClick={onAddItem}
            className="w-full flex items-center justify-center gap-1 py-1.5 text-xs text-white/30 hover:text-white/50 transition-colors"
          >
            <Plus size={11} /> Add item
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Menu item editor ─────────────────────────────────────────────────────────

interface MenuItemEditorProps {
  item: LocalItem
  isFirst: boolean
  isLast: boolean
  sectionName: string
  onRemove: () => void
  onUpdate: (patch: Partial<LocalItem>) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onPhotoSelect: (file: File) => void
  isPro?: boolean
  clientId?: string
}

function MenuItemEditor({ item, isFirst, isLast, sectionName, onRemove, onUpdate, onMoveUp, onMoveDown, onPhotoSelect, isPro, clientId }: MenuItemEditorProps) {
  const inputRef       = useRef<HTMLInputElement>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const preview  = item.photoPreview ?? item.photo_url
  const available = item.available !== false
  const reorderBtnCls = 'text-white/15 hover:text-white/50 transition-colors disabled:opacity-20 disabled:cursor-not-allowed'

  const handleAiGenerate = useCallback(async () => {
    if (!isPro || aiLoading) return
    setAiLoading(true)
    try {
      const res  = await fetch('/api/admin/ai-description', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          clientId,
          itemName:            item.name,
          category:            sectionName,
          existingDescription: item.description,
        }),
      })
      const data = await res.json() as { description?: string; error?: string }
      if (data.description) onUpdate({ description: data.description })
    } catch {
      // silent — description field stays unchanged
    } finally {
      setAiLoading(false)
    }
  }, [isPro, aiLoading, clientId, item.name, item.description, sectionName, onUpdate])

  return (
    <div className={cn('rounded-lg border p-2.5 space-y-1.5', available ? 'bg-white/[0.03] border-white/[0.05]' : 'bg-white/[0.01] border-white/[0.03] opacity-60')}>
      <div className="flex items-center gap-1.5">
        {/* Reorder */}
        <div className="flex flex-col shrink-0">
          <button type="button" onClick={onMoveUp} disabled={isFirst} className={reorderBtnCls}>
            <ArrowUp size={10} />
          </button>
          <button type="button" onClick={onMoveDown} disabled={isLast} className={reorderBtnCls}>
            <ArrowDown size={10} />
          </button>
        </div>

        {/* Photo thumbnail */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          title="Upload photo"
          className="w-10 h-10 shrink-0 rounded-lg border border-white/[0.08] flex items-center justify-center overflow-hidden hover:border-white/20 transition-colors"
        >
          {preview
            ? <img src={preview} alt="" className="w-full h-full object-cover" />
            : <Upload size={12} className="text-white/20" />}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) onPhotoSelect(f) }}
        />

        <input
          type="text"
          value={item.name}
          onChange={e => onUpdate({ name: e.target.value })}
          placeholder="Item name"
          className={cn(inputCls, 'flex-1 py-1.5 text-xs')}
        />
        <input
          type="text"
          value={item.price}
          onChange={e => onUpdate({ price: e.target.value })}
          placeholder="€0.00"
          className={cn(inputCls, 'w-[68px] py-1.5 text-xs shrink-0')}
        />
        <button type="button" onClick={onRemove} className="text-white/20 hover:text-red-400/70 transition-colors shrink-0">
          <Trash2 size={12} />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={item.description}
          onChange={e => onUpdate({ description: e.target.value })}
          placeholder="Description (optional)"
          className={cn(inputCls, 'py-1.5 text-xs flex-1')}
        />
        {isPro && (
          <button
            type="button"
            onClick={handleAiGenerate}
            disabled={aiLoading || !item.name.trim()}
            title="Generate description with AI"
            className="shrink-0 flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-semibold border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'rgba(139,92,246,0.10)', border: '1px solid rgba(139,92,246,0.25)', color: '#a78bfa' }}
          >
            {aiLoading
              ? <svg className="animate-spin" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              : <span>✨</span>}
            AI
          </button>
        )}
        <input
          type="text"
          value={item.allergens ?? ''}
          onChange={e => onUpdate({ allergens: e.target.value })}
          placeholder="e.g. G, D, A"
          className={cn(inputCls, 'py-1.5 text-xs w-[96px] shrink-0')}
        />
        {/* Available toggle */}
        <button
          type="button"
          onClick={() => onUpdate({ available: !available })}
          title={available ? 'Mark unavailable' : 'Mark available'}
          className={cn(
            'shrink-0 px-2 py-1.5 rounded-lg text-[10px] font-medium border transition-colors',
            available
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
              : 'bg-white/[0.03] border-white/[0.06] text-white/25 hover:text-white/40',
          )}
        >
          {available ? 'On' : 'Off'}
        </button>
      </div>
      <input
        type="text"
        value={item.badge ?? ''}
        onChange={e => onUpdate({ badge: e.target.value.slice(0, 15) })}
        placeholder="Badge (optional) — e.g. Popular, Vegan, Spicy, New"
        maxLength={15}
        className={cn(inputCls, 'py-1.5 text-xs w-full')}
      />
    </div>
  )
}


