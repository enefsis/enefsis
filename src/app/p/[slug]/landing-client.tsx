'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { MenuSectionData, MenuItemData } from '@/actions/page-editor'

// ─── Language data ────────────────────────────────────────────────────────────

const LANGUAGES = [
  { code: 'EN', flag: '🇬🇧', name: 'English',     nav: 'en' },
  { code: 'EL', flag: '🇬🇷', name: 'Ελληνικά',   nav: 'el' },
  { code: 'DE', flag: '🇩🇪', name: 'Deutsch',     nav: 'de' },
  { code: 'FR', flag: '🇫🇷', name: 'Français',    nav: 'fr' },
  { code: 'IT', flag: '🇮🇹', name: 'Italiano',    nav: 'it' },
  { code: 'ES', flag: '🇪🇸', name: 'Español',     nav: 'es' },
  { code: 'PT', flag: '🇵🇹', name: 'Português',   nav: 'pt' },
  { code: 'RU', flag: '🇷🇺', name: 'Русский',     nav: 'ru' },
  { code: 'UK', flag: '🇺🇦', name: 'Українська',  nav: 'uk' },
  { code: 'PL', flag: '🇵🇱', name: 'Polski',      nav: 'pl' },
  { code: 'NL', flag: '🇳🇱', name: 'Nederlands',  nav: 'nl' },
  { code: 'SV', flag: '🇸🇪', name: 'Svenska',     nav: 'sv' },
  { code: 'NO', flag: '🇳🇴', name: 'Norsk',       nav: 'no' },
  { code: 'DA', flag: '🇩🇰', name: 'Dansk',       nav: 'da' },
  { code: 'FI', flag: '🇫🇮', name: 'Suomi',       nav: 'fi' },
  { code: 'CS', flag: '🇨🇿', name: 'Čeština',     nav: 'cs' },
  { code: 'SK', flag: '🇸🇰', name: 'Slovenčina',  nav: 'sk' },
  { code: 'HU', flag: '🇭🇺', name: 'Magyar',      nav: 'hu' },
  { code: 'RO', flag: '🇷🇴', name: 'Română',      nav: 'ro' },
  { code: 'BG', flag: '🇧🇬', name: 'Български',   nav: 'bg' },
  { code: 'HR', flag: '🇭🇷', name: 'Hrvatski',    nav: 'hr' },
  { code: 'SL', flag: '🇸🇮', name: 'Slovenščina', nav: 'sl' },
  { code: 'TR', flag: '🇹🇷', name: 'Türkçe',      nav: 'tr' },
  { code: 'AR', flag: '🇸🇦', name: 'العربية',     nav: 'ar' },
  { code: 'HE', flag: '🇮🇱', name: 'עברית',       nav: 'he' },
  { code: 'HI', flag: '🇮🇳', name: 'हिन्दी',      nav: 'hi' },
  { code: 'ZH', flag: '🇨🇳', name: '中文',         nav: 'zh' },
  { code: 'JA', flag: '🇯🇵', name: '日本語',       nav: 'ja' },
  { code: 'KO', flag: '🇰🇷', name: '한국어',       nav: 'ko' },
  { code: 'TH', flag: '🇹🇭', name: 'ภาษาไทย',    nav: 'th' },
  { code: 'VI', flag: '🇻🇳', name: 'Tiếng Việt',  nav: 'vi' },
  { code: 'ID', flag: '🇮🇩', name: 'Indonesia',   nav: 'id' },
  { code: 'MS', flag: '🇲🇾', name: 'Melayu',      nav: 'ms' },
]

// Static UI strings sent to DeepL when translating
const UI_KEYS = [
  'Review us on Google',
  'Our Menu',
  'Follow Us',
  'Follow us',
  'Like us',
  'Watch us',
  'Review us',
  'Message us',
  'Visit us',
  'Info',
  'Today',
  'Open',
  'Phone',
  'Reservations',
  'Reserve a Table',
  'Address',
  'Free WiFi',
  "Today's Specials",
  'Call Waiter',
  'Call Waiter to Table',
  'Waiter notified!',
  'Share this restaurant',
  'Link copied!',
  'Table',
  'We use cookies',
  'We use cookies to analyse how you use our menu and improve your experience. You can accept or decline non-essential tracking.',
  'Accept',
  'Decline',
  'Closed',
  'Come back later for your next stamp',
  'Show this to staff',
  'Enjoying your visit?',
  'Leave us a quick review — it means the world to us',
  'Leave a Review',
  'Maybe later',
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

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}

function TripAdvisorIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm5 11.5c0 .28-.22.5-.5.5h-9c-.28 0-.5-.22-.5-.5v-1c0-.28.22-.5.5-.5H8v-4H7v-1h3v5h1v-5h3v5h1c.28 0 .5.22.5.5v1z" />
    </svg>
  )
}

function GlobeIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
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

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
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

function trackButton(clientId: string, buttonType: string, tableNumber: number | null = null) {
  if (localStorage.getItem('enefsis_cookie_consent') !== 'accepted') return
  const visitorId = localStorage.getItem('enefsis_visitor_id')
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_type:   'button_click',
      button_type:  buttonType,
      client_id:    clientId,
      table_number: tableNumber,
      visitor_id:   visitorId,
    }),
  }).catch(() => {})
}

function trackMenuView(standId: string | null, clientId: string, itemId: string, itemName: string, tableNumber: number | null = null) {
  if (localStorage.getItem('enefsis_cookie_consent') !== 'accepted') return
  fetch('/api/menu-view', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id:    clientId,
      item_id:      itemId,
      item_name:    itemName,
      table_number: tableNumber,
      ...(standId ? { stand_id: standId } : {}),
    }),
  }).catch(() => {})
}

// ─── Follow Us section ───────────────────────────────────────────────────────

interface FollowCard {
  key:      string
  href:     string
  label:    string
  subtitle: string
  icon:     React.ReactNode
  color:    string
  bg:       string
  border:   string
}

function FollowUsSection({
  instagramUrl, facebookUrl, tiktokUrl, tripAdvisorUrl, whatsappHref, websiteUrl,
  clientId, tableNumber, t,
}: {
  instagramUrl:    string | null
  facebookUrl:     string | null
  tiktokUrl:       string | null
  tripAdvisorUrl:  string | null
  whatsappHref:    string
  websiteUrl:      string | null
  clientId:        string
  tableNumber:     number | null
  t:               (s: string) => string
}) {
  const cards: FollowCard[] = ([
    instagramUrl   && { key: 'instagram',   href: instagramUrl,   label: 'Instagram',   subtitle: t('Follow us'),  icon: <InstagramIcon size={22} />,    color: '#E1306C', bg: 'rgba(225,48,108,0.10)',  border: 'rgba(225,48,108,0.22)'  },
    facebookUrl    && { key: 'facebook',    href: facebookUrl,    label: 'Facebook',    subtitle: t('Like us'),    icon: <FacebookIcon size={22} />,     color: '#1877F2', bg: 'rgba(24,119,242,0.10)',  border: 'rgba(24,119,242,0.22)'  },
    tiktokUrl      && { key: 'tiktok',      href: tiktokUrl,      label: 'TikTok',      subtitle: t('Watch us'),   icon: <TikTokIcon size={22} />,       color: '#ffffff', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)' },
    tripAdvisorUrl && { key: 'tripadvisor', href: tripAdvisorUrl, label: 'TripAdvisor', subtitle: t('Review us'),  icon: <TripAdvisorIcon size={22} />,  color: '#00AF87', bg: 'rgba(0,175,135,0.10)',   border: 'rgba(0,175,135,0.22)'   },
    whatsappHref   && { key: 'whatsapp',    href: whatsappHref,   label: 'WhatsApp',    subtitle: t('Message us'), icon: <WhatsAppIcon size={22} />,     color: '#25D366', bg: 'rgba(37,211,102,0.10)',  border: 'rgba(37,211,102,0.22)'  },
    websiteUrl     && { key: 'website',     href: websiteUrl,     label: 'Website',     subtitle: t('Visit us'),   icon: <GlobeIcon size={22} />,        color: '#38BEFF', bg: 'rgba(56,190,255,0.10)',  border: 'rgba(56,190,255,0.22)'  },
  ] as (FollowCard | false)[]).filter((c): c is FollowCard => !!c)

  if (!cards.length) return null

  return (
    <div className="px-4 pt-6 pb-2">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="font-display font-bold text-white" style={{ fontSize: 20 }}>{t('Follow Us')}</h2>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}><ShareIcon /></span>
      </div>

      {/* 2-column grid */}
      <div className="grid grid-cols-2 gap-3">
        {cards.map(card => (
          <a
            key={card.key}
            href={card.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackButton(clientId, card.key, tableNumber)}
            className="flex flex-col gap-3 p-4 rounded-2xl active:scale-[0.97] transition-transform"
            style={{ background: card.bg, border: `1px solid ${card.border}` }}
          >
            <span style={{ color: card.color }}>{card.icon}</span>
            <div>
              <p className="font-display font-bold text-white leading-tight" style={{ fontSize: 14 }}>
                {card.label}
              </p>
              <p className="font-sans mt-0.5" style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)' }}>
                {card.subtitle}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

// ─── Badge color map ─────────────────────────────────────────────────────────

function getBadgeStyle(text: string): { color: string; bg: string; border: string } {
  const key = text.trim().toLowerCase()
  const map: Record<string, { color: string; bg: string; border: string }> = {
    'popular':       { color: '#F5A623', bg: 'rgba(245,166,35,0.13)',   border: 'rgba(245,166,35,0.30)'  },
    'vegan':         { color: '#22C55E', bg: 'rgba(34,197,94,0.12)',    border: 'rgba(34,197,94,0.28)'   },
    'vegetarian':    { color: '#4ADE80', bg: 'rgba(74,222,128,0.12)',   border: 'rgba(74,222,128,0.28)'  },
    'spicy':         { color: '#F87171', bg: 'rgba(248,113,113,0.12)',  border: 'rgba(248,113,113,0.28)' },
    'new':           { color: '#38BEFF', bg: 'rgba(56,190,255,0.12)',   border: 'rgba(56,190,255,0.28)'  },
    'gluten free':   { color: '#C084FC', bg: 'rgba(192,132,252,0.12)',  border: 'rgba(192,132,252,0.28)' },
    "chef's choice": { color: '#FB923C', bg: 'rgba(251,146,60,0.12)',   border: 'rgba(251,146,60,0.28)'  },
  }
  return map[key] ?? { color: '#6B90F5', bg: 'rgba(43,92,230,0.12)', border: 'rgba(43,92,230,0.28)' }
}

// ─── Menu item card ───────────────────────────────────────────────────────────

interface MenuItemCardProps {
  item: MenuItemData
  onView: () => void
  onPhotoClick: (url: string) => void
  t: (s: string) => string
  unavailable?: boolean
}

function MenuItemCard({ item, onView, onPhotoClick, t, unavailable = false }: MenuItemCardProps) {
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

  const allergens = item.allergens
    ? item.allergens.split(',').map(a => a.trim()).filter(Boolean)
    : []

  console.log('[MenuPhoto]', item.name, item.photo_url)

  const hasPhoto = !!item.photo_url && item.photo_url !== ''

  return (
    <div
      ref={ref}
      className="flex items-start gap-3 p-3.5 rounded-2xl"
      style={{
        background: '#161920',
        border: '1px solid rgba(255,255,255,0.07)',
        opacity: unavailable ? 0.55 : 1,
      }}
    >
      {/* Photo or placeholder — always shown */}
      <div
        className="w-20 h-20 rounded-lg shrink-0 overflow-hidden flex items-center justify-center bg-[#2a2d35]"
        onClick={hasPhoto && !unavailable ? () => onPhotoClick(item.photo_url!) : undefined}
        style={hasPhoto && !unavailable ? { cursor: 'pointer' } : undefined}
      >
        {hasPhoto
          ? <img src={item.photo_url!} alt={item.name} className="w-full h-full object-cover" />
          : <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        {/* Name + badge row */}
        <div className="flex items-start justify-between gap-1.5 mb-0.5">
          <p className="font-sans font-semibold leading-snug flex-1 min-w-0" style={{ fontSize: 14, color: '#F0F2F8' }}>
            {t(item.name)}
          </p>
          {unavailable ? (
            <span
              className="shrink-0 font-sans font-bold rounded-full"
              style={{
                fontSize: 10,
                color: 'rgba(255,255,255,0.35)',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.10)',
                padding: '2px 7px',
                whiteSpace: 'nowrap',
              }}
            >
              Unavailable
            </span>
          ) : (item.badge || item.is_popular) && (() => {
            const badgeText = item.badge || 'Popular'
            const s = getBadgeStyle(badgeText)
            return (
              <span
                className="shrink-0 font-sans font-bold rounded-full"
                style={{
                  fontSize: 10,
                  color: s.color,
                  background: s.bg,
                  border: `1px solid ${s.border}`,
                  padding: '2px 7px',
                  whiteSpace: 'nowrap',
                }}
              >
                ★ {badgeText}
              </span>
            )
          })()}
        </div>

        {item.description && (
          <p className="font-sans line-clamp-2" style={{ fontSize: 12, color: '#8A90A0', lineHeight: 1.45 }}>
            {t(item.description)}
          </p>
        )}

        {/* Price + allergen badges */}
        <div className="flex items-center justify-between gap-2 mt-2">
          {item.price && (
            <p className="font-sans font-bold tabular-nums" style={{ fontSize: 14, color: '#38BEFF' }}>
              €{item.price}
            </p>
          )}
          {allergens.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap justify-end">
              {allergens.map(a => (
                <span
                  key={a}
                  className="font-mono font-bold rounded"
                  style={{
                    fontSize: 10,
                    color: '#8A90A0',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    padding: '1px 5px',
                  }}
                >
                  {a}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Today's specials banner ──────────────────────────────────────────────────

function TodaysSpecialsBanner({ specials, t }: { specials: string; t: (s: string) => string }) {
  const items = specials.split(',').map(s => s.trim()).filter(Boolean)
  if (!items.length) return null
  return (
    <div
      className="mx-4 rounded-2xl"
      style={{ background: '#1A1508', border: '1px solid rgba(212,168,83,0.22)' }}
    >
      <div className="px-4 py-3.5">
        <div className="flex items-center gap-2 mb-1.5">
          <span style={{ color: '#D4A853' }}><UtensilsIcon /></span>
          <span
            className="font-display font-bold tracking-widest"
            style={{ fontSize: 10, color: '#D4A853', letterSpacing: '0.16em' }}
          >
            {t("Today's Specials").toUpperCase()}
          </span>
        </div>
        <p className="font-sans leading-relaxed" style={{ fontSize: 13, color: 'rgba(212,168,83,0.72)' }}>
          {items.join(' · ')}
        </p>
      </div>
    </div>
  )
}

// ─── Menu tabs section ────────────────────────────────────────────────────────

interface MenuTabsSectionProps {
  sections: MenuSectionData[]
  standId: string | null
  clientId: string
  tableNumber: number | null
  onPhotoClick: (url: string) => void
  t: (s: string) => string
}

function MenuTabsSection({ sections, standId, clientId, tableNumber, onPhotoClick, t }: MenuTabsSectionProps) {
  // Keep all sections; only strip unnamed items
  const allSections = sections.map(s => ({ ...s, items: s.items.filter(i => i.name) }))

  const [activeId, setActiveId] = useState<string>(() => allSections[0]?.id ?? '')

  if (!allSections.length) return null

  const totalItems    = allSections.reduce((sum, s) => sum + s.items.filter(i => i.available !== false).length, 0)
  const activeSection = allSections.find(s => s.id === activeId) ?? allSections[0]

  return (
    <div id="menu-section" className="px-4 pt-6 pb-2">

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <h2 className="font-display font-bold text-white" style={{ fontSize: 22 }}>{t('Our Menu')}</h2>
        <span
          className="font-sans font-semibold rounded-full px-2.5 py-0.5"
          style={{
            fontSize: 11,
            color: '#8A90A0',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {totalItems}
        </span>
      </div>

      {/* Category tabs — always shown when there is at least 1 section */}
      <div
        className="flex gap-2 overflow-x-auto pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
      >
        {allSections.map(section => {
          const active = section.id === activeId
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveId(section.id)}
              className="shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full font-sans font-semibold transition-all active:scale-95"
              style={{
                fontSize: 13,
                background: active ? '#2B65F0' : 'rgba(255,255,255,0.065)',
                border: active ? '1px solid rgba(43,101,240,0.5)' : '1px solid rgba(255,255,255,0.07)',
                color: active ? '#ffffff' : 'rgba(255,255,255,0.45)',
                boxShadow: active ? '0 2px 12px rgba(43,101,240,0.35)' : 'none',
              }}
            >
              {section.emoji && <span style={{ fontSize: 15, lineHeight: 1 }}>{section.emoji}</span>}
              <span>{t(section.name)}</span>
            </button>
          )
        })}
      </div>

      {/* Items for active section */}
      {activeSection && (
        <div className="space-y-2.5">
          {activeSection.items.length === 0 ? (
            <p className="font-sans text-sm text-center py-6" style={{ color: 'rgba(255,255,255,0.25)' }}>
              No items yet
            </p>
          ) : (
            activeSection.items.map(item => {
              const isAvailable = item.available !== false
              return (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onView={isAvailable ? () => trackMenuView(standId, clientId, item.id, item.name, tableNumber) : () => {}}
                  onPhotoClick={onPhotoClick}
                  t={t}
                  unavailable={!isAvailable}
                />
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

// ─── Info section ────────────────────────────────────────────────────────────

function isWithinShifts(shifts: Array<{ open: string; close: string }>): boolean {
  const now = new Date()
  const cur = now.getHours() * 60 + now.getMinutes()
  return shifts.some(s => {
    const [oh, om] = s.open.split(':').map(Number)
    const [ch, cm] = s.close.split(':').map(Number)
    const o = oh * 60 + om
    const c = ch * 60 + cm
    return c < o ? (cur >= o || cur <= c) : (cur >= o && cur <= c)
  })
}

const DISPLAY_DAYS = [
  { key: 'monday',    label: 'Monday'    },
  { key: 'tuesday',   label: 'Tuesday'   },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday',  label: 'Thursday'  },
  { key: 'friday',    label: 'Friday'    },
  { key: 'saturday',  label: 'Saturday'  },
  { key: 'sunday',    label: 'Sunday'    },
]

function InfoSection({
  openingHours, openingHoursStructured, phone, address, wifiName, wifiPassword, reservationUrl, clientId, tableNumber, t,
}: {
  openingHours:           string | null
  openingHoursStructured: import('@/actions/page-editor').StructuredHours | null
  phone:                  string | null
  address:                string | null
  wifiName:               string | null
  wifiPassword:           string | null
  reservationUrl:         string | null
  clientId:               string
  tableNumber:            number | null
  t:                      (s: string) => string
}) {
  const hasAnyHours = !!(openingHoursStructured || openingHours)
  if (!hasAnyHours && !phone && !address && !wifiName && !wifiPassword && !reservationUrl) return null

  // Derive today's schedule
  const DAY_KEYS_ORDER = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
  const todayKey = DAY_KEYS_ORDER[new Date().getDay()]
  const todaySchedule  = openingHoursStructured?.[todayKey] ?? null
  const isTodayClosed  = todaySchedule === 'closed'
  const todayShifts    = Array.isArray(todaySchedule) ? todaySchedule : []
  const isOpenNow      = !isTodayClosed && todayShifts.length > 0 && isWithinShifts(todayShifts)
  const todayHoursText = isTodayClosed
    ? t('Closed')
    : todayShifts.map(s => `${s.open}–${s.close}`).join(' & ')

  const labelCls: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.12em',
    color: '#8A90A0',
    textTransform: 'uppercase',
    marginBottom: 4,
  }
  const cardStyle: React.CSSProperties = {
    background: '#161920',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 16,
    padding: '14px 16px',
  }

  return (
    <div className="px-4 pt-4 pb-2 space-y-2.5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-display font-bold text-white" style={{ fontSize: 20 }}>{t('Info')}</h2>
      </div>

      {/* STRUCTURED HOURS — today card + 7-day list */}
      {openingHoursStructured && (
        <div style={cardStyle}>
          {/* Today header row */}
          <div className="flex items-center justify-between mb-1">
            <span style={labelCls}>{t('Today')}</span>
            {todayShifts.length > 0 && isOpenNow ? (
              <span
                className="font-sans font-bold rounded-full"
                style={{
                  fontSize: 10, padding: '2px 8px',
                  color: '#4ade80', background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)',
                }}
              >
                ● {t('Open')}
              </span>
            ) : (
              <span
                className="font-sans font-bold rounded-full"
                style={{
                  fontSize: 10, padding: '2px 8px',
                  color: '#f87171', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)',
                }}
              >
                {t('Closed')}
              </span>
            )}
          </div>

          {/* Today's hours — only shown when shifts are actually set for today */}
          {todayShifts.length > 0 && (
            <p
              className="font-sans font-semibold"
              style={{ fontSize: 14, color: '#F0F2F8', marginBottom: 12 }}
            >
              {todayHoursText}
            </p>
          )}

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 0 10px' }} />

          {/* All 7 days */}
          <div className="space-y-2">
            {DISPLAY_DAYS.map(({ key, label }) => {
              const sched    = openingHoursStructured[key as keyof typeof openingHoursStructured]
              const isToday  = key === todayKey
              const isClosed = sched === 'closed'
              const shifts   = Array.isArray(sched) ? sched : []
              const text     = isClosed
                ? t('Closed')
                : shifts.map(s => `${s.open}–${s.close}`).join(' & ')

              return (
                <div key={key} className="flex items-center justify-between">
                  <span
                    className="font-sans"
                    style={{
                      fontSize: 12,
                      fontWeight: isToday ? 700 : 400,
                      color: isToday ? '#4ade80' : 'rgba(255,255,255,0.45)',
                      minWidth: 90,
                    }}
                  >
                    {label}
                  </span>
                  <span
                    className="font-sans"
                    style={{
                      fontSize: 12,
                      fontWeight: isToday ? 600 : 400,
                      color: isClosed
                        ? 'rgba(255,255,255,0.20)'
                        : isToday
                        ? '#4ade80'
                        : 'rgba(255,255,255,0.60)',
                      textAlign: 'right',
                    }}
                  >
                    {text}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* FALLBACK — plain text opening hours (no badge: structured data absent) */}
      {!openingHoursStructured && openingHours && (
        <div style={cardStyle}>
          <p style={labelCls}>{t('Today')}</p>
          <p className="font-sans" style={{ fontSize: 13, color: '#F0F2F8' }}>{t(openingHours)}</p>
        </div>
      )}

      {/* PHONE NUMBER */}
      {phone && (
        <div style={cardStyle}>
          <p style={labelCls}>{t('Phone')}</p>
          <a
            href={`tel:${phone.replace(/\s/g, '')}`}
            className="font-sans font-semibold"
            style={{ fontSize: 14, color: '#38BEFF' }}
          >
            {phone}
          </a>
        </div>
      )}

      {/* ADDRESS */}
      {address && (
        <div style={cardStyle}>
          <p style={labelCls}>{t('Address')}</p>
          <p className="font-sans" style={{ fontSize: 13, color: '#F0F2F8' }}>{address}</p>
        </div>
      )}

      {/* FREE WIFI */}
      {(wifiName || wifiPassword) && (
        <div style={cardStyle}>
          <p style={labelCls}>{t('Free WiFi')}</p>
          <p className="font-sans" style={{ fontSize: 13, color: '#F0F2F8' }}>
            {[wifiName, wifiPassword].filter(Boolean).join(' · ')}
          </p>
        </div>
      )}

      {/* RESERVE A TABLE */}
      {reservationUrl && (
        <a
          href={reservationUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackButton(clientId, 'reservation', tableNumber)}
          className="flex items-center gap-3 w-full rounded-2xl font-sans font-bold transition-opacity active:opacity-80"
          style={{
            background: '#1B4FD8',
            color: '#fff',
            fontSize: 15,
            padding: '15px 18px',
            textDecoration: 'none',
          }}
        >
          <svg
            width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true" className="shrink-0"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {t('Reserve a Table')}
        </a>
      )}
    </div>
  )
}

// ─── Call Waiter button ───────────────────────────────────────────────────────

function CallWaiterButton({
  clientId, tableNumber, waiterWhatsapp, waiterMessage, isPro, t,
}: {
  clientId:       string
  tableNumber:    number | null
  waiterWhatsapp: string | null
  waiterMessage:  string | null
  isPro:          boolean
  t:              (s: string) => string
}) {
  const [notified, setNotified] = useState(false)

  async function handleCall() {
    if (notified) return
    trackButton(clientId, 'call_waiter', tableNumber)
    setNotified(true)
    setTimeout(() => setNotified(false), 3000)

    if (isPro && waiterWhatsapp) {
      try {
        const res  = await fetch('/api/notify-waiter', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ waiterWhatsapp, tableNumber, message: waiterMessage }),
        })
        const data = await res.json() as { url?: string }
        if (data.url) window.open(data.url, '_blank', 'noopener,noreferrer')
      } catch {
        // silent — waiter notification is best-effort
      }
    }
  }

  const label = notified
    ? t('Waiter notified!')
    : tableNumber
      ? `${t('Call Waiter to Table')} ${tableNumber}`
      : t('Call Waiter')

  return (
    <button
      type="button"
      onClick={handleCall}
      className="w-full flex items-center justify-center gap-3 rounded-2xl active:scale-[0.98] transition-all"
      style={{
        background: notified
          ? 'linear-gradient(100deg, #16a34a 0%, #15803d 100%)'
          : 'linear-gradient(100deg, #2B65F0 0%, #1B4FD8 100%)',
        boxShadow: notified
          ? '0 6px 24px rgba(22,163,74,0.35)'
          : '0 6px 24px rgba(43,101,240,0.35)',
        paddingTop: 15,
        paddingBottom: 15,
        transition: 'background 0.3s, box-shadow 0.3s',
      }}
    >
      <span style={{ color: 'white' }}><BellIcon /></span>
      <span className="font-display font-bold text-white" style={{ fontSize: 15 }}>
        {label}
      </span>
    </button>
  )
}

// ─── Share button ─────────────────────────────────────────────────────────────

function ShareButton({ restaurantName, t }: { restaurantName: string; t: (s: string) => string }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      try { await navigator.share({ title: restaurantName, url }) } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {}
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex items-center gap-1.5 active:scale-95 transition-transform"
      style={{ color: 'rgba(255,255,255,0.32)' }}
    >
      <ShareIcon />
      <span className="font-sans" style={{ fontSize: 13 }}>
        {copied ? t('Link copied!') : t('Share this restaurant')}
      </span>
    </button>
  )
}

// ─── Powered by footer ────────────────────────────────────────────────────────

function PoweredByFooter() {
  return (
    <div className="flex justify-center py-10">
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="font-sans" style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
            Powered by
          </span>
          <a
            href="https://www.enefsis.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-display font-bold"
            style={{ fontSize: 13, color: 'rgba(240,242,248,0.55)', textDecoration: 'none' }}
          >
            Enefsis
          </a>
          <span
            className="font-sans font-semibold px-2 py-0.5 rounded-full"
            style={{
              fontSize: 9,
              letterSpacing: '0.08em',
              color: '#38BEFF',
              background: 'rgba(56,190,255,0.10)',
              border: '1px solid rgba(56,190,255,0.22)',
            }}
          >
            NFC Smart Hub
          </span>
        </div>
        <p className="font-sans font-semibold" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.18)', textTransform: 'uppercase' }}>
          Connect with one tap
        </p>
        <a
          href="/privacy-policy"
          className="font-sans"
          style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)' }}
        >
          Privacy Policy
        </a>
      </div>
    </div>
  )
}

// ─── Cookie consent banner ───────────────────────────────────────────────────

function CookieConsentBanner({ onAccept, onDecline, t }: { onAccept: () => void; onDecline: () => void; t: (s: string) => string }) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
      style={{ animation: 'slideUp 0.35s cubic-bezier(0.32, 0.72, 0, 1)' }}
    >
      <div
        className="mx-4 mb-4 rounded-2xl p-4 w-full max-w-[430px]"
        style={{
          background: '#1A1D26',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 -4px 32px rgba(0,0,0,0.45)',
        }}
      >
        <p className="font-sans font-semibold text-white mb-1" style={{ fontSize: 14 }}>
          {t('We use cookies')}
        </p>
        <p className="font-sans mb-4" style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
          {t('We use cookies to analyse how you use our menu and improve your experience. You can accept or decline non-essential tracking.')}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onDecline}
            className="flex-1 py-2.5 rounded-xl font-sans font-semibold active:scale-[0.97] transition-transform"
            style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.5)',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.09)',
            }}
          >
            {t('Decline')}
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="flex-1 py-2.5 rounded-xl font-sans font-semibold active:scale-[0.97] transition-transform"
            style={{
              fontSize: 13,
              color: '#ffffff',
              background: 'linear-gradient(100deg, #2B65F0 0%, #1B4FD8 100%)',
              boxShadow: '0 4px 16px rgba(43,101,240,0.35)',
            }}
          >
            {t('Accept')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Google review auto-prompt ────────────────────────────────────────────────

function GoogleReviewPrompt({
  url,
  clientId,
  tableNumber,
  onReview,
  onDismiss,
  t,
}: {
  url:         string
  clientId:    string
  tableNumber: number | null
  onReview:    () => void
  onDismiss:   () => void
  t:           (s: string) => string
}) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 flex justify-center"
      style={{ animation: 'slideUp 0.4s cubic-bezier(0.32, 0.72, 0, 1)' }}
    >
      <div
        className="mx-4 mb-4 rounded-2xl p-4 w-full max-w-[430px]"
        style={{
          background: '#1A1D26',
          border:     '1px solid rgba(255,255,255,0.12)',
          boxShadow:  '0 -4px 40px rgba(0,0,0,0.55)',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-1.5">
          <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-label="Google" className="shrink-0">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <p className="font-display font-bold text-white" style={{ fontSize: 15 }}>
            {t('Enjoying your visit?')} ⭐
          </p>
        </div>

        <p className="font-sans mb-4" style={{ fontSize: 12, color: 'rgba(255,255,255,0.42)', lineHeight: 1.55 }}>
          {t('Leave us a quick review — it means the world to us')}
        </p>

        {/* Gold CTA */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            trackButton(clientId, 'google_review_reminder', tableNumber)
            sessionStorage.setItem('review_tapped', 'true')
            onReview()
          }}
          className="flex items-center justify-center w-full py-3 rounded-xl font-display font-bold active:scale-[0.97] transition-transform"
          style={{
            background:     'linear-gradient(100deg, #F5A623 0%, #E8880A 100%)',
            boxShadow:      '0 4px 18px rgba(245,166,35,0.38)',
            color:          '#fff',
            fontSize:       14,
            textDecoration: 'none',
          }}
        >
          {t('Leave a Review')}
        </a>

        {/* Dismiss */}
        <div className="flex justify-center mt-3">
          <button
            type="button"
            onClick={() => {
              sessionStorage.setItem('review_dismissed', 'true')
              onDismiss()
            }}
            className="font-sans active:opacity-50 transition-opacity"
            style={{ fontSize: 12, color: 'rgba(255,255,255,0.26)' }}
          >
            {t('Maybe later')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Loyalty card section ─────────────────────────────────────────────────────

function LoyaltyCardSection({
  clientId,
  stampsRequired: initialRequired,
  reward: initialReward,
  title,
  t,
}: {
  clientId:       string
  stampsRequired: number
  reward:         string | null
  title:          string | null
  t:              (s: string) => string
}) {
  const [stamps,         setStamps]         = useState<number | null>(null)
  const [completed,      setCompleted]      = useState(false)
  const [cooldown,       setCooldown]       = useState(false)
  const [stampsRequired, setStampsRequired] = useState(initialRequired)
  const [reward,         setReward]         = useState(initialReward)

  useEffect(() => {
    let visitorId = localStorage.getItem('enefsis_visitor_id')
    if (!visitorId) {
      visitorId = crypto.randomUUID()
      localStorage.setItem('enefsis_visitor_id', visitorId)
    }
    fetch('/api/loyalty/stamp', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ visitorId, clientId }),
    })
      .then(r => r.json() as Promise<{
        stamps?:         number
        stampsRequired?: number
        reward?:         string | null
        completed?:      boolean
        cooldown?:       boolean
        error?:          string
      }>)
      .then(data => {
        if (data.error) return
        setStamps(data.stamps ?? 0)
        setCompleted(data.completed ?? false)
        setCooldown(data.cooldown ?? false)
        if (data.stampsRequired != null) setStampsRequired(data.stampsRequired)
        if (data.reward         !== undefined) setReward(data.reward ?? null)
      })
      .catch(() => setStamps(0))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId])

  const cardTitle    = title || 'Loyalty Card'
  const displayStamps = stamps ?? 0

  return (
    <div className="px-4 pt-6 pb-2">
      <div
        className="rounded-2xl p-5"
        style={{
          background: completed
            ? 'linear-gradient(135deg, rgba(43,101,240,0.15) 0%, rgba(56,190,255,0.08) 100%)'
            : '#161920',
          border: completed
            ? '1px solid rgba(56,190,255,0.30)'
            : '1px solid rgba(255,255,255,0.07)',
          transition: 'background 0.4s, border-color 0.4s',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-display font-bold text-white" style={{ fontSize: 17 }}>
              {cardTitle}
            </h2>
            <p className="font-sans mt-0.5" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
              {stamps === null ? '…' : `${displayStamps} / ${stampsRequired}`}
            </p>
          </div>
          <span style={{ fontSize: 26, lineHeight: 1 }}>🎟️</span>
        </div>

        {/* Stamp grid */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Array.from({ length: stampsRequired }).map((_, i) => {
            const filled = i < displayStamps
            return (
              <div
                key={i}
                className="flex items-center justify-center rounded-full"
                style={{
                  width:      34,
                  height:     34,
                  background: filled
                    ? 'linear-gradient(135deg, #2B65F0 0%, #38BEFF 100%)'
                    : 'rgba(255,255,255,0.06)',
                  border:     filled
                    ? '1px solid rgba(56,190,255,0.50)'
                    : '1px solid rgba(255,255,255,0.09)',
                  boxShadow:  filled ? '0 2px 8px rgba(43,101,240,0.30)' : 'none',
                  color:      'white',
                  fontSize:   15,
                  transition: 'all 0.3s ease',
                }}
              >
                {filled ? '✓' : ''}
              </div>
            )
          })}
        </div>

        {/* Completed reward */}
        {completed && reward && (
          <div
            className="rounded-xl px-4 py-3 text-center"
            style={{
              background: 'rgba(56,190,255,0.10)',
              border:     '1px solid rgba(56,190,255,0.25)',
            }}
          >
            <p className="font-display font-bold" style={{ fontSize: 15, color: '#F0F2F8' }}>
              🎉 You earned: {reward}!
            </p>
            <p className="font-sans mt-1" style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
              {t('Show this to staff')}
            </p>
          </div>
        )}

        {/* Cooldown hint */}
        {!completed && cooldown && stamps !== null && (
          <p className="font-sans text-center" style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)' }}>
            {t('Come back later for your next stamp')}
          </p>
        )}
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
  openingHours: string | null
  phone: string | null
  address: string | null
  wifiName: string | null
  wifiPassword: string | null
  callWaiterEnabled: boolean
  waiterWhatsapp: string | null
  waiterMessage: string | null
  restaurantType: string | null
  city: string | null
  rating: string | null
  reviewCount: string | null
  todaysSpecials: string | null
  tripAdvisorUrl: string | null
  websiteUrl: string | null
  reservationUrl: string | null
  isPro: boolean
  loyaltyEnabled?: boolean
  loyaltyStampsRequired?: number | null
  loyaltyReward?: string | null
  loyaltyTitle?: string | null
  openingHoursStructured?: import('@/actions/page-editor').StructuredHours | null
}

export function LandingClient({
  standId, clientId, tableNumber,
  restaurantName, tagline, logoUrl,
  googleReviewUrl, instagramUrl, facebookUrl, tiktokUrl, whatsappNumber,
  menuSections,
  openingHours, phone, address, wifiName, wifiPassword, callWaiterEnabled,
  waiterWhatsapp, waiterMessage,
  restaurantType, city, rating, reviewCount, todaysSpecials,
  tripAdvisorUrl, websiteUrl, reservationUrl, isPro,
  loyaltyEnabled, loyaltyStampsRequired, loyaltyReward, loyaltyTitle,
  openingHoursStructured,
}: Props) {
  const [lang, setLang] = useState('EN')
  const [langOpen, setLangOpen] = useState(false)
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null)
  const [translated, setTranslated] = useState<Record<string, string>>({})
  const [isTranslating, setIsTranslating] = useState(false)
  const translationCache = useRef<Record<string, Record<string, string>>>({})
  // Fallback: read table number from URL if server didn't parse it
  const [urlTableNum, setUrlTableNum] = useState<number | null>(null)
  const chipTable = tableNumber ?? urlTableNum
  const [cookieConsent, setCookieConsent] = useState<'accepted' | 'declined' | null>(null)

  // Google Review auto-prompt (PRO only)
  const [showReviewPrompt, setShowReviewPrompt] = useState(false)

  useEffect(() => {
    document.body.style.overflow = lightboxPhoto ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightboxPhoto])

  // Exit-intent review prompt — visibilitychange, pagehide, 90s fallback
  useEffect(() => {
    if (!googleReviewUrl) return

    function triggerReminder() {
      const tapped    = sessionStorage.getItem('review_tapped')    === 'true'
      const dismissed = sessionStorage.getItem('review_dismissed') === 'true'
      if (!tapped && !dismissed) setShowReviewPrompt(true)
    }

    function onVisibilityChange() {
      if (document.hidden) triggerReminder()
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('pagehide', triggerReminder)
    const fallback = setTimeout(triggerReminder, 90_000)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('pagehide', triggerReminder)
      clearTimeout(fallback)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleReviewUrl])

  // Mount-only: read consent + parse URL table number
  useEffect(() => {
    const stored = localStorage.getItem('enefsis_cookie_consent')
    if (stored === 'accepted' || stored === 'declined') {
      setCookieConsent(stored as 'accepted' | 'declined')
    }
    const params = new URLSearchParams(window.location.search)
    const tableNum = params.get('table')
    if (tableNum) {
      const parsed = parseInt(tableNum)
      if (!isNaN(parsed)) setUrlTableNum(parsed)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fire page_view only after consent is granted
  useEffect(() => {
    if (cookieConsent !== 'accepted') return
    let visitorId = localStorage.getItem('enefsis_visitor_id')
    if (!visitorId) {
      visitorId = crypto.randomUUID()
      localStorage.setItem('enefsis_visitor_id', visitorId)
    }
    const params = new URLSearchParams(window.location.search)
    const tableNum = params.get('table')
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type:   'page_view',
        client_id:    clientId,
        visitor_id:   visitorId,
        table_number: tableNum ? parseInt(tableNum) : null,
        language:     navigator.language,
        device_type:  /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
          ? 'mobile' : 'desktop',
      }),
    }).catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cookieConsent, clientId])

  function handleAcceptConsent() {
    localStorage.setItem('enefsis_cookie_consent', 'accepted')
    setCookieConsent('accepted')
  }

  function handleDeclineConsent() {
    localStorage.setItem('enefsis_cookie_consent', 'declined')
    localStorage.removeItem('enefsis_visitor_id')
    setCookieConsent('declined')
  }

  const selectLang = useCallback(
    async (code: string) => {
      setLang(code)
      localStorage.setItem('enefsis_lang', code)
      setLangOpen(false)

      if (code === 'EN') {
        setTranslated({})
        return
      }

      if (translationCache.current[code]) {
        setTranslated(translationCache.current[code])
        return
      }

      setIsTranslating(true)
      try {
        const menuStrings = menuSections.flatMap(s => [
          s.name,
          ...s.items.flatMap(i =>
            [i.name, i.description].filter((x): x is string => !!x),
          ),
        ])
        const strings = [
          ...UI_KEYS,
          ...(tagline        ? [tagline]        : []),
          ...(restaurantType ? [restaurantType] : []),
          ...(todaysSpecials ? [todaysSpecials] : []),
          ...(openingHours   ? [openingHours]   : []),
          ...menuStrings,
        ]

        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: strings, targetLang: code }),
        })

        if (res.ok) {
          const { translations }: { translations: string[] } = await res.json()
          const map: Record<string, string> = {}
          strings.forEach((orig, i) => { map[orig] = translations[i] })
          translationCache.current[code] = map
          setTranslated(map)
        }
      } finally {
        setIsTranslating(false)
      }
    },
    [tagline, restaurantType, todaysSpecials, openingHours, menuSections],
  )

  useEffect(() => {
    // 1. Respect an explicit stored preference
    const stored = localStorage.getItem('enefsis_lang')
    if (stored && LANGUAGES.some(l => l.code === stored)) {
      void selectLang(stored)
      return
    }
    // 2. Auto-detect: map navigator.language (e.g. "el-GR") to a DeepL code
    const nav   = navigator.language.slice(0, 2).toLowerCase()
    const match = LANGUAGES.find(l => l.nav === nav)
    // Only translate if a supported non-English language is detected
    if (match && match.code !== 'EN') void selectLang(match.code)
  }, [selectLang])

  const t = (text: string) => translated[text] ?? text

  console.log('[LandingClient] props:', {
    googleReviewUrl,
    instagramUrl,
    facebookUrl,
    tiktokUrl,
    whatsappNumber,
    menuSectionsCount: menuSections.length,
    callWaiterEnabled,
  })
  console.log('[CallWaiter] enabled:', callWaiterEnabled)


  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`
    : ''

  return (
    <div className="min-h-screen" style={{ background: '#0D0F14' }}>
      <div className="mx-auto max-w-[430px] min-h-screen flex flex-col">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden" style={{ height: 330 }}>
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(160deg, #0D1B4B 0%, #1B4FD8 45%, #0A2A6E 100%)' }} />
          <div className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 65% 55% at 85% 0%, rgba(43,101,240,0.65) 0%, transparent 70%)' }} />
          <div className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 55% 50% at 10% 110%, rgba(56,190,255,0.18) 0%, transparent 65%)' }} />
          <div className="absolute bottom-0 left-0 right-0"
            style={{ height: 110, background: 'linear-gradient(to bottom, transparent 0%, #0D0F14 100%)' }} />

          <div className="relative h-full flex flex-col justify-between px-5 pt-5 pb-8">

            {/* Top section: badge row + logo */}
            <div>
              {/* Badge row: Enefsis left, table chip right */}
              <div className="flex items-center justify-between">
                {!logoUrl ? (
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
                ) : <div />}

                {/* Table chip — gold glassmorphism pill */}
                {chipTable !== null && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
                    style={{
                      background: 'rgba(212,168,83,0.28)',
                      border: '1px solid rgba(212,168,83,0.6)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      boxShadow: '0 2px 16px rgba(212,168,83,0.22)',
                    }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                      stroke="#D4A853" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                      <line x1="9"  y1="3"  x2="9"  y2="21" />
                      <line x1="15" y1="3"  x2="15" y2="21" />
                      <line x1="3"  y1="9"  x2="21" y2="9"  />
                      <line x1="3"  y1="15" x2="21" y2="15" />
                    </svg>
                    <span className="font-sans font-bold"
                      style={{ fontSize: 12, color: '#E8C46A', letterSpacing: '0.03em' }}>
                      {t('Table')} {chipTable}
                    </span>
                  </div>
                )}
              </div>

              {/* Logo — centered at top of hero, just below badge row */}
              {logoUrl && (
                <div className="flex justify-center mt-4">
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="object-contain"
                    style={{ maxHeight: 72, maxWidth: 164 }}
                  />
                </div>
              )}
            </div>

            {/* Bottom content: category + name + meta */}
            <div>
              {/* Category tag — type only, city shown separately in meta row */}
              {restaurantType && (
                <p className="font-sans font-semibold mb-2 leading-none"
                  style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)', letterSpacing: '0.03em' }}>
                  {t(restaurantType)}
                </p>
              )}

              {/* Restaurant name */}
              <h1 className="font-display font-bold text-white leading-tight" style={{ fontSize: 34 }}>
                {restaurantName}
              </h1>
              {tagline && (
                <p className="font-sans mt-1.5 leading-snug" style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
                  {t(tagline)}
                </p>
              )}

              {/* Meta row */}
              <div className="flex items-center gap-2.5 mt-2.5 flex-wrap">
                {(rating || reviewCount) && (
                  <div className="flex items-center gap-1.5">
                    <StarFilledIcon />
                    {rating && (
                      <span className="font-sans text-xs font-semibold text-white/80">{rating}</span>
                    )}
                    {reviewCount && (
                      <span className="font-sans text-xs" style={{ color: '#8A90A0' }}>({reviewCount})</span>
                    )}
                  </div>
                )}
                {city && (rating || reviewCount) && (
                  <div className="w-px h-3 bg-white/20" />
                )}
                {city && (
                  <div className="flex items-center gap-1">
                    <LocationIcon />
                    <span className="font-sans text-xs" style={{ color: '#8A90A0' }}>{city}</span>
                  </div>
                )}
                {!rating && !reviewCount && !city && (
                  <div className="flex items-center gap-1.5">
                    <StarFilledIcon />
                    <span className="font-sans text-xs font-semibold text-white/80">4.9</span>
                    <span className="font-sans text-xs" style={{ color: '#8A90A0' }}>(200+)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Language picker trigger ───────────────────────────────────────── */}
        <div className="flex justify-end px-4 pt-4">
          <button
            type="button"
            onClick={() => !isTranslating && setLangOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
              opacity: isTranslating ? 0.55 : 1,
              color: '#ffffff',
            }}
          >
            <GlobeIcon size={13} />
            <span className="font-sans text-xs font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {isTranslating ? '···' : LANGUAGES.find(l => l.code === lang)?.name ?? lang}
            </span>
          </button>
        </div>

        {/* ── Google Review ─────────────────────────────────────────────────── */}
        {googleReviewUrl && (
          <div className="px-4 pt-4">
            <a
              href={googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackButton(clientId, 'google_review', tableNumber)
                sessionStorage.setItem('review_tapped', 'true')
                setShowReviewPrompt(false)
              }}
              className="flex items-center justify-between w-full px-5 rounded-2xl active:scale-[0.98] transition-transform"
              style={{
                background: 'linear-gradient(100deg, #F5A623 0%, #E8880A 100%)',
                boxShadow: '0 6px 28px rgba(245,166,35,0.38)',
                paddingTop: 15,
                paddingBottom: 15,
              }}
            >
              <div className="flex items-center gap-2.5">
                <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-label="Google">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="font-display font-bold text-white" style={{ fontSize: 15 }}>
                  {t('Review us on Google')}
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

        {/* ── Today's specials ─────────────────────────────────────────────── */}
        {todaysSpecials && <div className="pt-4"><TodaysSpecialsBanner specials={t(todaysSpecials)} t={t} /></div>}

        {/* ── Menu tabs ─────────────────────────────────────────────────────── */}
        {menuSections.length > 0 && (
          <MenuTabsSection
            sections={menuSections}
            standId={standId}
            clientId={clientId}
            tableNumber={tableNumber}
            onPhotoClick={url => setLightboxPhoto(url)}
            t={t}
          />
        )}

        {/* ── Loyalty card ─────────────────────────────────────────────────── */}
        {loyaltyEnabled && (loyaltyStampsRequired ?? 0) > 0 && (
          <LoyaltyCardSection
            clientId={clientId}
            stampsRequired={loyaltyStampsRequired ?? 10}
            reward={loyaltyReward ?? null}
            title={loyaltyTitle ?? null}
            t={t}
          />
        )}

        {/* ── Follow Us ────────────────────────────────────────────────────── */}
        <FollowUsSection
          instagramUrl={instagramUrl}
          facebookUrl={facebookUrl}
          tiktokUrl={tiktokUrl}
          tripAdvisorUrl={tripAdvisorUrl}
          whatsappHref={whatsappHref}
          websiteUrl={websiteUrl}
          clientId={clientId}
          tableNumber={tableNumber}
          t={t}
        />

        {/* ── Info ─────────────────────────────────────────────────────────── */}
        <InfoSection
          openingHours={openingHours}
          openingHoursStructured={openingHoursStructured ?? null}
          phone={phone}
          address={address}
          wifiName={wifiName}
          wifiPassword={wifiPassword}
          reservationUrl={reservationUrl}
          clientId={clientId}
          tableNumber={tableNumber}
          t={t}
        />

        {/* ── Call Waiter ──────────────────────────────────────────────────── */}
        {callWaiterEnabled && isPro && (
          <div className="px-4 pt-4">
            <CallWaiterButton
              clientId={clientId}
              tableNumber={tableNumber}
              waiterWhatsapp={waiterWhatsapp}
              waiterMessage={waiterMessage}
              isPro={isPro}
              t={t}
            />
          </div>
        )}

        {/* ── Share ────────────────────────────────────────────────────────── */}
        <div className="flex justify-center pt-6 pb-2">
          <ShareButton restaurantName={restaurantName} t={t} />
        </div>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <PoweredByFooter />

      </div>

      {/* ── Google Review auto-prompt ────────────────────────────────────── */}
      {googleReviewUrl && showReviewPrompt && (
        <GoogleReviewPrompt
          url={googleReviewUrl}
          clientId={clientId}
          tableNumber={tableNumber}
          onReview={() => setShowReviewPrompt(false)}
          onDismiss={() => setShowReviewPrompt(false)}
          t={t}
        />
      )}

      {/* ── Cookie consent banner ───────────────────────────────────────── */}
      {cookieConsent === null && !isTranslating && (
        <CookieConsentBanner onAccept={handleAcceptConsent} onDecline={handleDeclineConsent} t={t} />
      )}

      {/* ── Language picker modal ────────────────────────────────────────── */}
      {langOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end"
          style={{ background: 'rgba(0,0,0,0.55)', animation: 'fadeIn 0.15s ease' }}
          onClick={() => setLangOpen(false)}
        >
          <div
            style={{
              background: '#161920',
              borderRadius: '20px 20px 0 0',
              maxHeight: '60vh',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-9 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.18)' }} />
            </div>

            {/* Title */}
            <p className="font-display font-bold text-white text-center pb-3" style={{ fontSize: 16 }}>
              Select Language
            </p>

            {/* Scrollable list — no search, just tap */}
            <div className="overflow-y-auto pb-8" style={{ flex: 1 }}>
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => selectLang(l.code)}
                  className="w-full flex items-center gap-3 px-5 active:bg-white/5"
                  style={{
                    height: 52,
                    background: l.code === lang ? 'rgba(43,101,240,0.14)' : 'transparent',
                    borderLeft: l.code === lang ? '3px solid #2B65F0' : '3px solid transparent',
                  }}
                >
                  <span style={{ fontSize: 22, lineHeight: 1, width: 28, flexShrink: 0 }}>{l.flag}</span>
                  <span className="font-sans font-medium text-white" style={{ fontSize: 15 }}>{l.name}</span>
                  {l.code === lang && (
                    <span className="ml-auto font-sans font-bold" style={{ fontSize: 14, color: '#2B65F0' }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Lightbox overlay ─────────────────────────────────────────────── */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.9)', animation: 'fadeIn 0.18s ease' }}
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-4 right-4 flex items-center justify-center rounded-full text-white"
            style={{
              width: 36, height: 36,
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.25)',
              fontSize: 20, lineHeight: 1,
            }}
            aria-label="Close"
          >
            ×
          </button>
          <img
            src={lightboxPhoto}
            alt=""
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '90vw', maxHeight: '80vh',
              objectFit: 'contain', borderRadius: 12,
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes fadeIn  { from { opacity:0 }             to { opacity:1 }            }
        @keyframes slideUp { from { transform:translateY(100%) } to { transform:translateY(0) } }
      `}</style>
    </div>
  )
}
