'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MenuSectionData, MenuItemData } from '@/actions/page-editor'

// ─── Language data ────────────────────────────────────────────────────────────

const LANGUAGES = [
  { code: 'EN', flag: '🇬🇧' },
  { code: 'EL', flag: '🇬🇷' },
  { code: 'DE', flag: '🇩🇪' },
  { code: 'FR', flag: '🇫🇷' },
  { code: 'IT', flag: '🇮🇹' },
  { code: 'RU', flag: '🇷🇺' },
]

// ─── SVG icons ────────────────────────────────────────────────────────────────

function NfcIcon({ muted = false }: { muted?: boolean }) {
  const op = muted ? 0.35 : 1
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="18" r="2" fill={`rgba(255,255,255,${op})`} />
      <path d="M7.5 13.5a6.5 6.5 0 019 0" stroke={`rgba(255,255,255,${op})`} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M3.5 9.5a12.5 12.5 0 0117 0" stroke={`rgba(255,255,255,${op * 0.5})`} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function StarFilledIcon({ size = 13, color = '#D4A853' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="rgba(255,255,255,0.35)" />
      <circle cx="12" cy="9" r="2.5" fill="rgba(255,255,255,0.7)" />
    </svg>
  )
}

function UtensilsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
    </svg>
  )
}

function ExternalArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="rgba(255,255,255,0.28)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17L17 7M17 7H7M17 7v10" />
    </svg>
  )
}

function InstagramIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.5" cy="6.5" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  )
}

function FacebookIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function TikTokIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.81a8.2 8.2 0 004.79 1.53V6.89a4.85 4.85 0 01-1.02-.2z" />
    </svg>
  )
}

function WhatsAppIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

// ─── Tracking helpers ─────────────────────────────────────────────────────────

function trackButton(standId: string | null, clientId: string, buttonType: string) {
  if (!standId) return
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stand_id: standId, button_type: buttonType, client_id: clientId }),
  }).catch(() => {})
}

function trackMenuView(standId: string | null, clientId: string, itemId: string, itemName: string) {
  if (!standId) return
  fetch('/api/menu-view', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stand_id: standId, item_id: itemId, item_name: itemName, client_id: clientId }),
  }).catch(() => {})
}

// ─── Social brand card ────────────────────────────────────────────────────────

interface SocialCardProps {
  href: string
  label: string
  icon: React.ReactNode
  cardBg: string
  cardBorder: string
  iconColor: string
  onClick: () => void
}

function SocialCard({ href, label, icon, cardBg, cardBorder, iconColor, onClick }: SocialCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className="flex flex-col justify-between p-4 rounded-2xl active:scale-[0.97] transition-transform"
      style={{ background: cardBg, border: `1px solid ${cardBorder}`, minHeight: 108 }}
    >
      <div className="flex items-start justify-between">
        <span style={{ color: iconColor }}>{icon}</span>
        <ExternalArrowIcon />
      </div>
      <span className="font-display font-bold text-white" style={{ fontSize: 14 }}>
        {label}
      </span>
    </a>
  )
}

// ─── Menu item card ───────────────────────────────────────────────────────────

interface MenuItemCardProps {
  item: MenuItemData
  onView: () => void
}

function MenuItemCard({ item, onView }: MenuItemCardProps) {
  const ref   = useRef<HTMLDivElement>(null)
  const fired = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired.current) {
          fired.current = true
          onView()
          observer.disconnect()
        }
      },
      { threshold: 0.6 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [onView])

  return (
    <div
      ref={ref}
      className="flex items-start gap-3 py-4 border-b last:border-0"
      style={{ borderColor: 'rgba(255,255,255,0.05)' }}
    >
      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="font-sans font-semibold leading-snug" style={{ fontSize: 14, color: '#F0F2F8' }}>
          {item.name}
        </p>
        {item.description && (
          <p
            className="font-sans leading-relaxed mt-1 line-clamp-2"
            style={{ fontSize: 12, color: '#8A90A0' }}
          >
            {item.description}
          </p>
        )}
        {item.price && (
          <p className="font-sans font-bold mt-2 tabular-nums" style={{ fontSize: 13, color: '#38BEFF' }}>
            {item.price}
          </p>
        )}
      </div>

      {/* Photo — right side */}
      {item.photo_url && (
        <img
          src={item.photo_url}
          alt={item.name}
          className="w-[72px] h-[72px] rounded-xl object-cover shrink-0"
          style={{ border: '1px solid rgba(255,255,255,0.07)' }}
        />
      )}
    </div>
  )
}

// ─── Menu section (collapsible accordion) ────────────────────────────────────

interface MenuSectionProps {
  section: MenuSectionData
  standId: string | null
  clientId: string
  defaultOpen: boolean
}

function MenuSection({ section, standId, clientId, defaultOpen }: MenuSectionProps) {
  const [open, setOpen]   = useState(defaultOpen)
  const visibleItems      = section.items.filter(i => i.name)
  if (!visibleItems.length) return null

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: '#161920', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5 active:bg-white/[0.03] transition-colors"
        style={{ background: '#1E2229' }}
      >
        <div className="flex items-center gap-2.5">
          <span className="font-display font-bold text-white" style={{ fontSize: 14 }}>
            {section.name}
          </span>
          <span
            className="font-sans font-semibold rounded-full px-2 py-0.5"
            style={{
              fontSize: 11,
              color: '#8A90A0',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {visibleItems.length}
          </span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {/* Items */}
      {open && (
        <div className="px-4">
          {visibleItems.map(item => (
            <MenuItemCard
              key={item.id}
              item={item}
              onView={() => trackMenuView(standId, clientId, item.id, item.name)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Powered by footer ────────────────────────────────────────────────────────

function PoweredByFooter() {
  return (
    <div className="flex justify-center py-10">
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-full"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <NfcIcon muted />
        <span className="font-sans" style={{ fontSize: 11, color: '#8A90A0' }}>
          Powered by
        </span>
        <span className="font-sans font-bold" style={{ fontSize: 11, color: 'rgba(240,242,248,0.65)' }}>
          Enefsis
        </span>
      </div>
    </div>
  )
}

// ─── Main landing client ──────────────────────────────────────────────────────

interface Props {
  standId: string | null
  clientId: string
  tableNumber: number | null
  restaurantName: string
  tagline: string | null
  logoUrl: string | null
  googleReviewUrl: string | null
  instagramUrl: string | null
  facebookUrl: string | null
  tiktokUrl: string | null
  whatsappNumber: string | null
  menuSections: MenuSectionData[]
}

export function LandingClient({
  standId, clientId, tableNumber,
  restaurantName, tagline, logoUrl,
  googleReviewUrl, instagramUrl, facebookUrl, tiktokUrl, whatsappNumber,
  menuSections,
}: Props) {
  const [lang, setLang] = useState('EN')

  console.log('[LandingClient] props:', {
    googleReviewUrl,
    instagramUrl,
    facebookUrl,
    tiktokUrl,
    whatsappNumber,
    menuSectionsCount: menuSections.length,
  })

  const hasMenu      = menuSections.some(s => s.items.some(i => i.name))
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`
    : ''

  const hasSocial = !!(instagramUrl || facebookUrl || tiktokUrl || whatsappHref)

  function scrollToMenu() {
    trackButton(standId, clientId, 'menu')
    document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen" style={{ background: '#0D0F14' }}>
      <div className="mx-auto max-w-[430px] min-h-screen flex flex-col">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden" style={{ height: 310 }}>
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(160deg, #0D1B4B 0%, #1B4FD8 45%, #0A2A6E 100%)' }} />
          <div className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 65% 55% at 85% 0%, rgba(43,101,240,0.65) 0%, transparent 70%)' }} />
          <div className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 55% 50% at 10% 110%, rgba(56,190,255,0.18) 0%, transparent 65%)' }} />
          <div className="absolute bottom-0 left-0 right-0"
            style={{ height: 100, background: 'linear-gradient(to bottom, transparent 0%, #0D0F14 100%)' }} />

          <div className="relative h-full flex flex-col justify-between px-5 pt-5 pb-7">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.18)',
                }}>
                <NfcIcon />
                <span className="font-sans font-bold tracking-[0.14em]"
                  style={{ fontSize: 10, color: 'rgba(255,255,255,0.9)' }}>ENEFSIS</span>
              </div>
              {tableNumber !== null && (
                <div className="px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(212,168,83,0.15)', border: '1px solid rgba(212,168,83,0.35)' }}>
                  <span className="font-sans font-bold tracking-wide"
                    style={{ fontSize: 11, color: '#D4A853' }}>Table {tableNumber}</span>
                </div>
              )}
            </div>

            <div>
              {tagline && (
                <p className="font-sans mb-1.5 leading-snug" style={{ fontSize: 12, color: '#8A90A0' }}>
                  {tagline}
                </p>
              )}
              <h1 className="font-display font-bold text-white leading-tight" style={{ fontSize: 36 }}>
                {restaurantName}
              </h1>
              <div className="flex items-center gap-3 mt-2.5">
                <div className="flex items-center gap-1.5">
                  <StarFilledIcon />
                  <span className="font-sans text-xs font-semibold text-white/80">4.9</span>
                  <span className="font-sans text-xs" style={{ color: '#8A90A0' }}>(200+)</span>
                </div>
                <div className="w-px h-3 bg-white/20" />
                <div className="flex items-center gap-1.5">
                  <LocationIcon />
                  <span className="font-sans text-xs" style={{ color: '#8A90A0' }}>See location</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Language strip ────────────────────────────────────────────────── */}
        <div
          className="flex gap-2 overflow-x-auto px-4 pt-5 pb-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
        >
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLang(l.code)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full font-sans font-semibold shrink-0 transition-all',
                lang === l.code ? 'text-white' : 'text-white/45 hover:text-white/65',
              )}
              style={{
                fontSize: 12,
                background: lang === l.code ? '#2B65F0' : 'rgba(255,255,255,0.065)',
                border: lang === l.code ? '1px solid rgba(43,101,240,0.5)' : '1px solid rgba(255,255,255,0.07)',
                boxShadow: lang === l.code ? '0 2px 12px rgba(43,101,240,0.35)' : 'none',
              }}
            >
              <span style={{ fontSize: 14 }}>{l.flag}</span>
              <span>{l.code}</span>
            </button>
          ))}
        </div>

        {/* ── Google Review ─────────────────────────────────────────────────── */}
        {googleReviewUrl && (
          <div className="px-4 pt-4">
            <a
              href={googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackButton(standId, clientId, 'google_review')}
              className="flex items-center justify-between w-full px-5 rounded-2xl active:scale-[0.98] transition-transform"
              style={{
                background: 'linear-gradient(100deg, #F5A623 0%, #E8880A 100%)',
                boxShadow: '0 6px 28px rgba(245,166,35,0.38)',
                paddingTop: 15,
                paddingBottom: 15,
              }}
            >
              <div className="flex items-center gap-2.5">
                <UtensilsIcon />
                <span className="font-display font-bold text-white" style={{ fontSize: 15 }}>
                  Leave a Google Review
                </span>
              </div>
              <div className="flex items-center gap-[3px] shrink-0">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarFilledIcon key={i} size={11} color="white" />
                ))}
              </div>
            </a>
          </div>
        )}

        {/* ── Social brand cards ────────────────────────────────────────────── */}
        {hasSocial && (
          <div className="px-4 pt-3">
            <div className="grid grid-cols-2 gap-3">
              {instagramUrl ? (
                <SocialCard
                  href={instagramUrl}
                  label="Instagram"
                  icon={<InstagramIcon />}
                  cardBg="linear-gradient(135deg, rgba(225,48,108,0.16) 0%, rgba(131,58,180,0.16) 100%)"
                  cardBorder="rgba(225,48,108,0.32)"
                  iconColor="#E1306C"
                  onClick={() => trackButton(standId, clientId, 'instagram')}
                />
              ) : null}
              {facebookUrl ? (
                <SocialCard
                  href={facebookUrl}
                  label="Facebook"
                  icon={<FacebookIcon />}
                  cardBg="rgba(24,119,242,0.12)"
                  cardBorder="rgba(24,119,242,0.30)"
                  iconColor="#1877F2"
                  onClick={() => trackButton(standId, clientId, 'facebook')}
                />
              ) : null}
              {tiktokUrl ? (
                <SocialCard
                  href={tiktokUrl}
                  label="TikTok"
                  icon={<TikTokIcon />}
                  cardBg="rgba(4,4,8,0.75)"
                  cardBorder="rgba(56,190,255,0.35)"
                  iconColor="#ffffff"
                  onClick={() => trackButton(standId, clientId, 'tiktok')}
                />
              ) : null}
              {whatsappHref ? (
                <SocialCard
                  href={whatsappHref}
                  label="WhatsApp"
                  icon={<WhatsAppIcon />}
                  cardBg="rgba(37,211,102,0.10)"
                  cardBorder="rgba(37,211,102,0.28)"
                  iconColor="#25D366"
                  onClick={() => trackButton(standId, clientId, 'whatsapp')}
                />
              ) : null}
            </div>
          </div>
        )}

        {/* ── View Menu CTA ─────────────────────────────────────────────────── */}
        {hasMenu && (
          <div className="px-4 pt-3">
            <button
              type="button"
              onClick={scrollToMenu}
              className="flex items-center justify-between w-full px-5 py-3.5 rounded-2xl font-sans font-semibold text-sm active:scale-[0.98] transition-all"
              style={{
                background: 'rgba(27,79,216,0.09)',
                border: '1px solid rgba(27,79,216,0.22)',
                color: '#2B65F0',
              }}
            >
              <span>View Menu</span>
              <ChevronDown size={16} />
            </button>
          </div>
        )}

        {/* ── Menu accordion ────────────────────────────────────────────────── */}
        {hasMenu && (
          <div id="menu-section" className="px-4 pt-6 space-y-2.5">
            {/* Section label */}
            <div className="flex items-center gap-3 mb-1">
              <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <span
                className="font-display font-bold uppercase tracking-[0.18em]"
                style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)' }}
              >
                Menu
              </span>
              <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>

            {menuSections.map((section, i) => (
              <MenuSection
                key={section.id}
                section={section}
                standId={standId}
                clientId={clientId}
                defaultOpen={i === 0}
              />
            ))}
          </div>
        )}

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <PoweredByFooter />

      </div>
    </div>
  )
}
