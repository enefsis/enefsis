'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import type { MenuSectionData, MenuItemData } from '@/actions/page-editor'

// ─── Language data ────────────────────────────────────────────────────────────

const LANGUAGES = [
  { code: 'EN', flag: '🇬🇧', name: 'English'    },
  { code: 'EL', flag: '🇬🇷', name: 'Ελληνικά'  },
  { code: 'DE', flag: '🇩🇪', name: 'Deutsch'    },
  { code: 'FR', flag: '🇫🇷', name: 'Français'   },
  { code: 'IT', flag: '🇮🇹', name: 'Italiano'   },
  { code: 'RU', flag: '🇷🇺', name: 'Русский'    },
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
  standId, clientId,
}: {
  instagramUrl:    string | null
  facebookUrl:     string | null
  tiktokUrl:       string | null
  tripAdvisorUrl:  string | null
  whatsappHref:    string
  websiteUrl:      string | null
  standId:         string | null
  clientId:        string
}) {
  const cards: FollowCard[] = ([
    instagramUrl   && { key: 'instagram',   href: instagramUrl,   label: 'Instagram',   subtitle: 'Follow us',  icon: <InstagramIcon size={22} />,    color: '#E1306C', bg: 'rgba(225,48,108,0.10)',  border: 'rgba(225,48,108,0.22)'  },
    facebookUrl    && { key: 'facebook',    href: facebookUrl,    label: 'Facebook',    subtitle: 'Like us',    icon: <FacebookIcon size={22} />,     color: '#1877F2', bg: 'rgba(24,119,242,0.10)',  border: 'rgba(24,119,242,0.22)'  },
    tiktokUrl      && { key: 'tiktok',      href: tiktokUrl,      label: 'TikTok',      subtitle: 'Watch us',   icon: <TikTokIcon size={22} />,       color: '#ffffff', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)' },
    tripAdvisorUrl && { key: 'tripadvisor', href: tripAdvisorUrl, label: 'TripAdvisor', subtitle: 'Review us',  icon: <TripAdvisorIcon size={22} />,  color: '#00AF87', bg: 'rgba(0,175,135,0.10)',   border: 'rgba(0,175,135,0.22)'   },
    whatsappHref   && { key: 'whatsapp',    href: whatsappHref,   label: 'WhatsApp',    subtitle: 'Message us', icon: <WhatsAppIcon size={22} />,     color: '#25D366', bg: 'rgba(37,211,102,0.10)',  border: 'rgba(37,211,102,0.22)'  },
    websiteUrl     && { key: 'website',     href: websiteUrl,     label: 'Website',     subtitle: 'Visit us',   icon: <GlobeIcon size={22} />,        color: '#38BEFF', bg: 'rgba(56,190,255,0.10)',  border: 'rgba(56,190,255,0.22)'  },
  ] as (FollowCard | false)[]).filter((c): c is FollowCard => !!c)

  if (!cards.length) return null

  return (
    <div className="px-4 pt-6 pb-2">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="font-display font-bold text-white" style={{ fontSize: 20 }}>Follow Us</h2>
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
            onClick={() => trackButton(standId, clientId, card.key)}
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

  const allergens = item.allergens
    ? item.allergens.split(',').map(a => a.trim()).filter(Boolean)
    : []

  return (
    <div
      ref={ref}
      className="flex items-start gap-3 p-3.5 rounded-2xl"
      style={{ background: '#161920', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Photo or placeholder — always shown */}
      <div className="w-12 h-12 rounded-lg shrink-0 overflow-hidden flex items-center justify-center bg-[#2a2d35]">
        {item.photo_url
          ? <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover" />
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
        {/* Name + Popular badge */}
        <div className="flex items-start justify-between gap-1.5 mb-0.5">
          <p className="font-sans font-semibold leading-snug flex-1 min-w-0" style={{ fontSize: 14, color: '#F0F2F8' }}>
            {item.name}
          </p>
          {item.is_popular && (
            <span
              className="shrink-0 font-sans font-bold rounded-full"
              style={{
                fontSize: 10,
                color: '#F5A623',
                background: 'rgba(245,166,35,0.12)',
                border: '1px solid rgba(245,166,35,0.25)',
                padding: '2px 7px',
                whiteSpace: 'nowrap',
              }}
            >
              ★ Popular
            </span>
          )}
        </div>

        {item.description && (
          <p className="font-sans line-clamp-2" style={{ fontSize: 12, color: '#8A90A0', lineHeight: 1.45 }}>
            {item.description}
          </p>
        )}

        {/* Price + allergen badges */}
        <div className="flex items-center justify-between gap-2 mt-2">
          {item.price && (
            <p className="font-sans font-bold tabular-nums" style={{ fontSize: 14, color: '#38BEFF' }}>
              {item.price}
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

function TodaysSpecialsBanner({ specials }: { specials: string }) {
  const items = specials.split(',').map(s => s.trim()).filter(Boolean)
  if (!items.length) return null
  return (
    <div
      className="mx-4 rounded-2xl"
      style={{ background: '#1A1508', border: '1px solid rgba(212,168,83,0.22)' }}
    >
      <div className="px-4 py-3.5">
        <div className="flex items-center gap-2 mb-1.5">
          <span style={{ fontSize: 14, lineHeight: 1 }}>✨</span>
          <span
            className="font-display font-bold tracking-widest"
            style={{ fontSize: 10, color: '#D4A853', letterSpacing: '0.16em' }}
          >
            TODAY&apos;S SPECIALS
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
}

function MenuTabsSection({ sections, standId, clientId }: MenuTabsSectionProps) {
  const visibleSections = sections
    .map(s => ({ ...s, items: s.items.filter(i => i.name && i.available !== false) }))
    .filter(s => s.items.length > 0)

  const [activeId, setActiveId] = useState<string>(() => visibleSections[0]?.id ?? '')

  if (!visibleSections.length) return null

  const totalItems    = visibleSections.reduce((sum, s) => sum + s.items.length, 0)
  const activeSection = visibleSections.find(s => s.id === activeId) ?? visibleSections[0]

  return (
    <div id="menu-section" className="px-4 pt-6 pb-2">

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <h2 className="font-display font-bold text-white" style={{ fontSize: 22 }}>Our Menu</h2>
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

      {/* Category tabs */}
      {visibleSections.length > 1 && (
        <div
          className="flex gap-2 overflow-x-auto pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
        >
          {visibleSections.map(section => {
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
                <span>{section.name}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Items for active section */}
      {activeSection && (
        <div className="space-y-2.5">
          {activeSection.items.map(item => (
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

// ─── Info section ────────────────────────────────────────────────────────────

function getOpenStatus(hours: string): 'open' | 'closed' | null {
  const times = hours.match(/(\d{1,2}):(\d{2})/g)
  if (!times || times.length < 2) return null
  const [oh, om] = times[0].split(':').map(Number)
  const [ch, cm] = times[1].split(':').map(Number)
  const now = new Date()
  const nowM = now.getHours() * 60 + now.getMinutes()
  const openM = oh * 60 + om
  const closeM = ch * 60 + cm
  if (closeM <= openM) return (nowM >= openM || nowM < closeM) ? 'open' : 'closed'
  return (nowM >= openM && nowM < closeM) ? 'open' : 'closed'
}

function InfoSection({
  openingHours, phone, address, wifiName, wifiPassword,
}: {
  openingHours: string | null
  phone:        string | null
  address:      string | null
  wifiName:     string | null
  wifiPassword: string | null
}) {
  if (!openingHours && !phone && !address && !wifiName && !wifiPassword) return null
  const openStatus = openingHours ? getOpenStatus(openingHours) : null

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
        <h2 className="font-display font-bold text-white" style={{ fontSize: 20 }}>Info</h2>
      </div>

      {/* TODAY — opening hours */}
      {openingHours && (
        <div style={cardStyle}>
          <div className="flex items-center justify-between mb-1">
            <span style={labelCls}>TODAY</span>
            {openStatus && (
              <span
                className="font-sans font-bold rounded-full"
                style={{
                  fontSize: 10,
                  padding: '2px 8px',
                  color:       openStatus === 'open' ? '#4ade80' : '#f87171',
                  background:  openStatus === 'open' ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
                  border: `1px solid ${openStatus === 'open' ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}`,
                }}
              >
                {openStatus === 'open' ? '● Open' : '● Closed'}
              </span>
            )}
          </div>
          <p className="font-sans" style={{ fontSize: 13, color: '#F0F2F8' }}>{openingHours}</p>
        </div>
      )}

      {/* RESERVATIONS — phone */}
      {phone && (
        <div style={cardStyle}>
          <p style={labelCls}>RESERVATIONS</p>
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
          <p style={labelCls}>ADDRESS</p>
          <p className="font-sans" style={{ fontSize: 13, color: '#F0F2F8' }}>{address}</p>
        </div>
      )}

      {/* FREE WIFI */}
      {(wifiName || wifiPassword) && (
        <div style={cardStyle}>
          <p style={labelCls}>FREE WIFI</p>
          <p className="font-sans" style={{ fontSize: 13, color: '#F0F2F8' }}>
            {[wifiName, wifiPassword].filter(Boolean).join(' · ')}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Call Waiter button ───────────────────────────────────────────────────────

function CallWaiterButton({
  standId, clientId, tableNumber,
}: {
  standId: string | null
  clientId: string
  tableNumber: number | null
}) {
  const [notified, setNotified] = useState(false)

  function handleCall() {
    if (notified) return
    trackButton(standId, clientId, 'call_waiter')
    setNotified(true)
    setTimeout(() => setNotified(false), 3000)
  }

  const label = notified
    ? 'Waiter notified!'
    : tableNumber !== null
      ? `Call Waiter to Table ${tableNumber}`
      : 'Call Waiter'

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

function ShareButton({ restaurantName }: { restaurantName: string }) {
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
        {copied ? 'Link copied!' : 'Share this restaurant'}
      </span>
    </button>
  )
}

// ─── Powered by footer ────────────────────────────────────────────────────────

function PoweredByFooter() {
  return (
    <div className="flex justify-center py-10">
      <div className="flex items-center gap-2">
        <span className="font-sans" style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
          Powered by
        </span>
        <span className="font-display font-bold" style={{ fontSize: 13, color: 'rgba(240,242,248,0.55)' }}>
          Enefsis
        </span>
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
  restaurantType: string | null
  city: string | null
  yearEstablished: string | null
  rating: string | null
  reviewCount: string | null
  todaysSpecials: string | null
  tripAdvisorUrl: string | null
  websiteUrl: string | null
}

export function LandingClient({
  standId, clientId, tableNumber,
  restaurantName,
  googleReviewUrl, instagramUrl, facebookUrl, tiktokUrl, whatsappNumber,
  menuSections,
  openingHours, phone, address, wifiName, wifiPassword, callWaiterEnabled,
  restaurantType, city, yearEstablished, rating, reviewCount, todaysSpecials,
  tripAdvisorUrl, websiteUrl,
}: Props) {
  const [lang, setLang] = useState('EN')

  console.log('[LandingClient] props:', {
    googleReviewUrl,
    instagramUrl,
    facebookUrl,
    tiktokUrl,
    whatsappNumber,
    menuSectionsCount: menuSections.length,
    callWaiterEnabled,
  })

  const hasMenu      = menuSections.some(s => s.items.some(i => i.name))
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

            {/* Top bar: Enefsis badge left, table chip right */}
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

            {/* Bottom content */}
            <div>
              {/* Category / location tag */}
              {(restaurantType || city) && (
                <p className="font-sans font-semibold mb-2 leading-none"
                  style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)', letterSpacing: '0.03em' }}>
                  {[restaurantType, city].filter(Boolean).join(' · ')}
                </p>
              )}

              {/* Restaurant name */}
              <h1 className="font-display font-bold text-white leading-tight" style={{ fontSize: 34 }}>
                {restaurantName}
              </h1>

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
                {yearEstablished && (rating || reviewCount) && (
                  <div className="w-px h-3 bg-white/20" />
                )}
                {yearEstablished && (
                  <span className="font-sans text-xs" style={{ color: '#8A90A0' }}>
                    Est. {yearEstablished}
                  </span>
                )}
                {city && (yearEstablished || rating || reviewCount) && (
                  <div className="w-px h-3 bg-white/20" />
                )}
                {city && (
                  <div className="flex items-center gap-1">
                    <LocationIcon />
                    <span className="font-sans text-xs" style={{ color: '#8A90A0' }}>{city}</span>
                  </div>
                )}
                {/* Fallback when no dynamic meta is set */}
                {!rating && !reviewCount && !yearEstablished && !city && (
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

        {/* ── Language bar ──────────────────────────────────────────────────── */}
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
              <span>{l.name}</span>
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

        {/* ── Today's specials ─────────────────────────────────────────────── */}
        {todaysSpecials && <div className="pt-4"><TodaysSpecialsBanner specials={todaysSpecials} /></div>}

        {/* ── Menu tabs ─────────────────────────────────────────────────────── */}
        {hasMenu && (
          <MenuTabsSection
            sections={menuSections}
            standId={standId}
            clientId={clientId}
          />
        )}

        {/* ── Call Waiter + Share ──────────────────────────────────────────── */}
        <div className="px-4 pt-4 space-y-3">
          {callWaiterEnabled && (
            <CallWaiterButton standId={standId} clientId={clientId} tableNumber={tableNumber} />
          )}
          <div className="flex justify-center">
            <ShareButton restaurantName={restaurantName} />
          </div>
        </div>

        {/* ── Follow Us ────────────────────────────────────────────────────── */}
        <FollowUsSection
          instagramUrl={instagramUrl}
          facebookUrl={facebookUrl}
          tiktokUrl={tiktokUrl}
          tripAdvisorUrl={tripAdvisorUrl}
          whatsappHref={whatsappHref}
          websiteUrl={websiteUrl}
          standId={standId}
          clientId={clientId}
        />

        {/* ── Info ─────────────────────────────────────────────────────────── */}
        <InfoSection
          openingHours={openingHours}
          phone={phone}
          address={address}
          wifiName={wifiName}
          wifiPassword={wifiPassword}
        />

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <PoweredByFooter />

      </div>
    </div>
  )
}
