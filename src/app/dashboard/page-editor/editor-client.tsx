'use client'

import { useState, useRef, useTransition } from 'react'
import {
  ChevronDown, ChevronRight, Plus, Trash2, Upload, Save, Loader2, ExternalLink,
  ArrowUp, ArrowDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { savePage, uploadImage } from '@/actions/page-editor'
import type { PageData, MenuSectionData, MenuItemData } from '@/actions/page-editor'

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

export function PageEditorClient({ initial, slug: initialSlug }: { initial: PageData | null; slug: string | null }) {
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
  const [phone,             setPhone]             = useState(initial?.phone              ?? '')
  const [address,           setAddress]           = useState(initial?.address            ?? '')
  const [wifiName,          setWifiName]          = useState(initial?.wifi_name          ?? '')
  const [wifiPassword,      setWifiPassword]      = useState(initial?.wifi_password      ?? '')
  const [callWaiter,        setCallWaiter]        = useState(initial?.call_waiter_enabled ?? false)
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
      const res = await uploadImage(fd)
      if ('url' in res) setLogoUrl(res.url)
    })
  }

  function handleItemPhotoSelect(sectionId: string, itemId: string, file: File) {
    setSections(prev => prev.map(s => s.id !== sectionId ? s : {
      ...s, items: s.items.map(i => i.id !== itemId ? i : { ...i, photoPreview: URL.createObjectURL(file) }),
    }))
    const fd = new FormData()
    fd.append('file', file)
    startTransition(async () => {
      const res = await uploadImage(fd)
      if ('url' in res) {
        setSections(prev => prev.map(s => s.id !== sectionId ? s : {
          ...s, items: s.items.map(i => i.id !== itemId ? i : { ...i, photo_url: res.url }),
        }))
      }
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

  // ── Save ──

  function handleSave() {
    setSaveMsg('')
    startTransition(async () => {
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
        opening_hours:       openingHours,
        phone,
        address,
        wifi_name:           wifiName,
        wifi_password:       wifiPassword,
        call_waiter_enabled: callWaiter,
        menu_sections: sections.map(({ id, name, items }) => ({
          id, name,
          items: items.map(({ id, name, price, description, photo_url, available }) => ({
            id, name, price, description, photo_url, available: available !== false,
          })),
        })),
      }
      const res = await savePage(data)
      setSaveMsg(res.error ? `Error: ${res.error}` : 'Saved!')
      if (!res.error) {
        if (res.slug) setCurrentSlug(res.slug)
        setTimeout(() => setSaveMsg(''), 3000)
      }
    })
  }

  // ── Render ──

  return (
    <div className="flex h-full overflow-hidden">

      {/* ─ Left: controls ─ */}
      <div className="w-[420px] shrink-0 flex flex-col overflow-hidden border-r border-white/[0.06] bg-[#111318]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] shrink-0">
          <h1 className="text-sm font-semibold text-white">Page Editor</h1>
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
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoSelect} />
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
          </SectionPanel>

          {/* Info */}
          <SectionPanel title="Info" defaultOpen={false}>
            <Field label="Opening Hours">
              <input
                type="text"
                value={openingHours}
                onChange={e => setOpeningHours(e.target.value)}
                placeholder="Mon–Fri 09:00–23:00, Sat–Sun 10:00–00:00"
                className={inputCls}
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
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-xs font-medium text-white/50">Call Waiter Button</p>
                <p className="text-[11px] text-white/25 mt-0.5">Show a "Call Waiter" button on the landing page</p>
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
          </SectionPanel>

          {/* Menu */}
          <SectionPanel title="Menu Sections">
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

        </div>
      </div>

      {/* ─ Right: preview ─ */}
      <div className="flex-1 overflow-y-auto flex items-start justify-center py-10 bg-[#0D0F14]">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/25 text-center mb-5">Live Preview</p>
          <LandingPreview
            restaurantName={restaurantName}
            tagline={tagline}
            heroBg={heroBg}
            logoPreview={logoPreview}
            googleReviewUrl={googleReviewUrl}
            instagramUrl={instagramUrl}
            facebookUrl={facebookUrl}
            tiktokUrl={tiktokUrl}
            whatsappNumber={whatsappNumber}
            sections={sections}
          />
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
}

function MenuSectionEditor({
  section, isFirst, isLast, onToggle, onNameChange, onRemove, onMoveUp, onMoveDown,
  onAddItem, onRemoveItem, onUpdateItem, onMoveItem, onItemPhotoSelect,
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
              onRemove={() => onRemoveItem(item.id)}
              onUpdate={patch => onUpdateItem(item.id, patch)}
              onMoveUp={() => onMoveItem(item.id, -1)}
              onMoveDown={() => onMoveItem(item.id, 1)}
              onPhotoSelect={file => onItemPhotoSelect(item.id, file)}
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
  onRemove: () => void
  onUpdate: (patch: Partial<LocalItem>) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onPhotoSelect: (file: File) => void
}

function MenuItemEditor({ item, isFirst, isLast, onRemove, onUpdate, onMoveUp, onMoveDown, onPhotoSelect }: MenuItemEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const preview  = item.photoPreview ?? item.photo_url
  const available = item.available !== false
  const reorderBtnCls = 'text-white/15 hover:text-white/50 transition-colors disabled:opacity-20 disabled:cursor-not-allowed'

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
          accept="image/*"
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
    </div>
  )
}

// ─── Landing page preview ─────────────────────────────────────────────────────

const SOCIAL_BUTTONS = [
  { key: 'instagram', label: 'Instagram', color: '#E1306C',  emoji: '📷' },
  { key: 'facebook',  label: 'Facebook',  color: '#1877F2',  emoji: '👍' },
  { key: 'tiktok',    label: 'TikTok',    color: '#69C9D0',  emoji: '🎵' },
  { key: 'whatsapp',  label: 'WhatsApp',  color: '#25D366',  emoji: '💬' },
  { key: 'google',    label: 'Review Us', color: '#EA4335',  emoji: '⭐' },
  { key: 'menu',      label: 'Menu',      color: '#2B5CE6',  emoji: '📋' },
]

interface PreviewProps {
  restaurantName: string
  tagline: string
  heroBg: string
  logoPreview: string | null
  googleReviewUrl: string
  instagramUrl: string
  facebookUrl: string
  tiktokUrl: string
  whatsappNumber: string
  sections: LocalSection[]
}

function LandingPreview({
  restaurantName, tagline, heroBg, logoPreview,
  googleReviewUrl, instagramUrl, facebookUrl, tiktokUrl, whatsappNumber,
  sections,
}: PreviewProps) {
  const hasMenu = sections.some(s => s.items.some(i => i.name))

  const activeButtons = SOCIAL_BUTTONS.filter(b => {
    if (b.key === 'instagram') return !!instagramUrl
    if (b.key === 'facebook')  return !!facebookUrl
    if (b.key === 'tiktok')    return !!tiktokUrl
    if (b.key === 'whatsapp')  return !!whatsappNumber
    if (b.key === 'google')    return !!googleReviewUrl
    if (b.key === 'menu')      return hasMenu
    return false
  })

  return (
    <div
      className="rounded-[40px] overflow-hidden shadow-2xl border-[3px] border-white/[0.08] mx-auto"
      style={{ width: 375 }}
    >
      {/* Hero */}
      <div style={{ background: heroBg }} className="px-8 pt-16 pb-12 text-center">
        {logoPreview ? (
          <img
            src={logoPreview}
            alt="Logo"
            className="w-20 h-20 mx-auto rounded-2xl object-contain mb-5"
            style={{ background: 'rgba(255,255,255,0.12)', padding: 6 }}
          />
        ) : (
          <div className="w-20 h-20 mx-auto rounded-2xl bg-white/10 mb-5 flex items-center justify-center text-3xl">
            🍽️
          </div>
        )}
        <h1 className="text-[22px] font-bold text-white leading-tight">
          {restaurantName || <span className="opacity-30">Restaurant Name</span>}
        </h1>
        {tagline && <p className="text-sm text-white/60 mt-2">{tagline}</p>}
      </div>

      {/* Body */}
      <div className="bg-[#0D0F14] px-5 py-7 space-y-7 min-h-[320px]">

        {/* Social buttons */}
        {activeButtons.length > 0 && (
          <div className={cn('grid gap-2.5', activeButtons.length <= 3 ? 'grid-cols-3' : 'grid-cols-3')}>
            {activeButtons.map(btn => (
              <div
                key={btn.key}
                className="flex flex-col items-center gap-1.5 py-3.5 rounded-2xl cursor-default select-none"
                style={{ background: `${btn.color}15`, border: `1px solid ${btn.color}28` }}
              >
                <span className="text-xl">{btn.emoji}</span>
                <span className="text-[10px] font-medium text-white/65">{btn.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Menu */}
        {sections.map(section => {
          const visibleItems = section.items.filter(i => i.name)
          if (!visibleItems.length) return null
          return (
            <div key={section.id}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-3">
                {section.name || 'Section'}
              </p>
              <div className="space-y-2">
                {visibleItems.map(item => {
                  const photo = item.photoPreview ?? item.photo_url
                  const avail = item.available !== false
                  return (
                    <div key={item.id} className={cn('flex items-center gap-3 bg-white/[0.03] rounded-2xl p-3', !avail && 'opacity-40')}>
                      {photo && (
                        <img src={photo} alt="" className="w-11 h-11 rounded-xl object-cover shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-xs font-semibold text-white truncate">{item.name}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {item.price && (
                              <span className={cn('text-xs font-medium text-[#2B5CE6]', !avail && 'line-through')}>{item.price}</span>
                            )}
                            {!avail && <span className="text-[9px] text-white/30 bg-white/[0.06] rounded px-1 py-0.5">Off</span>}
                          </div>
                        </div>
                        {item.description && (
                          <p className="text-[10px] text-white/35 mt-0.5 truncate">{item.description}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Empty state */}
        {activeButtons.length === 0 && sections.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-xs text-white/20">Fill in the fields on the left to see your page</p>
          </div>
        )}
      </div>
    </div>
  )
}
