'use client'

import { useState, useRef, useEffect } from 'react'
import type { SubscriptionData } from '@/components/dashboard/subscription-card'

const DAY_NAMES    = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const CLOCK_EMOJIS = ['🕛','🕐','🕑','🕒','🕓','🕔','🕕','🕖','🕗','🕘','🕙','🕚']

function fmtHour(h: number): string {
  if (h === 0)  return '12 AM'
  if (h < 12)   return `${h} AM`
  if (h === 12) return '12 PM'
  return `${h - 12} PM`
}

function csvEsc(s: string) { return s.replace(/"/g, '""') }
function htmlEsc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export interface ExportData {
  tapsCur:       number
  uniqueTapsCur: number
  viewsCur:      number
  reviewsCur:    number
  followersCur:  number
  chartData:   { date: string; taps: number }[]
  topItems:    { name: string; views: number }[]
  socialData:  { platform: string; count: number }[]
  langData:    { language: string; count: number }[]
  topTables:   { tableNumber: number; count: number }[]
  peakHour:    number | null
  peakDay:     number | null
  subscription: SubscriptionData | null
}

// ── CSV ────────────────────────────────────────────────────────────────────────

function downloadCSV(data: ExportData, rangeLabel: string) {
  const lines: string[] = []

  lines.push('SUMMARY')
  lines.push(`Range,"${csvEsc(rangeLabel)}"`)
  lines.push(`Total Taps,${data.tapsCur}`)
  lines.push(`Unique Taps,${data.uniqueTapsCur}`)
  lines.push(`Menu Views,${data.viewsCur}`)
  lines.push(`Google Reviews Gained,${data.reviewsCur}`)
  lines.push(`New Followers,${data.followersCur}`)
  lines.push('')

  lines.push('DAILY TAPS')
  lines.push('Date,Taps')
  data.chartData.forEach(d => lines.push(`"${csvEsc(d.date)}",${d.taps}`))
  lines.push('')

  lines.push('TOP MENU ITEMS')
  lines.push('Item,Views')
  data.topItems.forEach(i => lines.push(`"${csvEsc(i.name)}",${i.views}`))
  lines.push('')

  lines.push('LANGUAGE PREFERENCES')
  lines.push('Language,Count')
  data.langData.forEach(l => lines.push(`"${csvEsc(l.language)}",${l.count}`))
  lines.push('')

  lines.push('SOCIAL BUTTON CLICKS')
  lines.push('Platform,Clicks')
  data.socialData.forEach(s => lines.push(`"${csvEsc(s.platform)}",${s.count}`))
  lines.push('')

  lines.push('TOP TABLES')
  lines.push('Table Number,Taps')
  data.topTables.forEach(t => lines.push(`Table ${t.tableNumber},${t.count}`))

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `enefsis-report-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ── PDF ────────────────────────────────────────────────────────────────────────

const PLAN_LABELS: Record<string, string> = {
  basic_monthly: 'Basic Monthly',
  basic_yearly:  'Basic Yearly',
  pro_monthly:   'Pro Monthly',
  pro_yearly:    'Pro Yearly',
  basic:         'Basic',
  pro:           'Pro',
}
const PLAN_AMOUNTS: Record<string, string> = {
  basic_monthly: '€49/mo',
  basic_yearly:  '€499/yr',
  pro_monthly:   '€100/mo',
  pro_yearly:    '€900/yr',
  basic:         '€49/mo',
  pro:           '€100/mo',
}
const PAYMENT_LABELS: Record<string, string> = {
  stripe:        'Card (Stripe)',
  cash:          'Cash',
  bank_transfer: 'Bank Transfer',
}

function printPDF(data: ExportData, rangeLabel: string) {
  const generatedAt = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const sub = data.subscription
  const subHtml = sub ? `
    <div class="section">
      <div class="section-title">Subscription</div>
      <table>
        <tbody>
          <tr><td class="label">Plan</td><td>${htmlEsc(sub.plan ? (PLAN_LABELS[sub.plan] ?? sub.plan) : '—')}</td></tr>
          <tr><td class="label">Status</td><td style="text-transform:capitalize">${htmlEsc(sub.status ?? '—')}</td></tr>
          <tr><td class="label">Amount</td><td>${sub.custom_amount != null ? `€${sub.custom_amount}` : sub.plan && PLAN_AMOUNTS[sub.plan] ? PLAN_AMOUNTS[sub.plan] : sub.amount != null ? `€${sub.amount}` : '—'}</td></tr>
          <tr><td class="label">Payment</td><td>${htmlEsc(sub.payment_method ? (PAYMENT_LABELS[sub.payment_method] ?? sub.payment_method) : '—')}</td></tr>
          ${sub.next_billing_date ? `<tr><td class="label">Next Billing</td><td>${new Date(sub.next_billing_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>` : ''}
        </tbody>
      </table>
    </div>` : ''

  const peakHtml = (data.peakHour !== null || data.peakDay !== null) ? `
    <div class="section">
      <div class="section-title">Peak Activity</div>
      <table><tbody>
        ${data.peakHour !== null ? `<tr><td class="label">Busiest Hour</td><td>${CLOCK_EMOJIS[data.peakHour % 12]} ${fmtHour(data.peakHour)}</td></tr>` : ''}
        ${data.peakDay  !== null ? `<tr><td class="label">Busiest Day</td><td>📅 ${DAY_NAMES[data.peakDay]}</td></tr>` : ''}
      </tbody></table>
    </div>` : ''

  const tablesHtml = data.topTables.length > 0 ? `
    <div class="section">
      <div class="section-title">Top Tables</div>
      <table>
        <thead><tr><th>#</th><th>Table</th><th>Taps</th></tr></thead>
        <tbody>${data.topTables.map((t, i) => `<tr><td>${(['🥇','🥈','🥉'])[i]}</td><td>Table ${t.tableNumber}</td><td>${t.count.toLocaleString()}</td></tr>`).join('')}</tbody>
      </table>
    </div>` : ''

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Enefsis Dashboard Report</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827;padding:40px;max-width:900px;margin:0 auto;font-size:13px}
  h1{font-size:26px;font-weight:700;color:#111827;margin-bottom:4px}
  .meta{color:#6b7280;font-size:12px;margin-bottom:32px}
  .stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:32px}
  .stat-card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px}
  .stat-label{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:#9ca3af;margin-bottom:4px}
  .stat-value{font-size:22px;font-weight:700;color:#111827}
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:24px}
  .section{margin-bottom:28px;page-break-inside:avoid}
  .section-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#6b7280;border-bottom:1.5px solid #e5e7eb;padding-bottom:7px;margin-bottom:12px}
  table{width:100%;border-collapse:collapse;font-size:13px}
  thead th{text-align:left;font-weight:600;color:#374151;padding:8px 10px;background:#f1f5f9}
  tbody td{padding:7px 10px;border-bottom:1px solid #f3f4f6;color:#374151}
  tbody tr:last-child td{border-bottom:none}
  td.label{color:#6b7280;width:38%;font-size:12px}
  .no-data{color:#9ca3af;font-size:12px;padding:4px 0}
  .footer{margin-top:36px;padding-top:14px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af}
  @media print{body{padding:24px}button{display:none}}
</style>
</head>
<body>
<h1>Dashboard Report</h1>
<div class="meta">Generated on ${generatedAt} &nbsp;·&nbsp; Period: ${htmlEsc(rangeLabel)}</div>

<div class="stats-grid">
  <div class="stat-card"><div class="stat-label">Total Taps</div><div class="stat-value">${data.tapsCur.toLocaleString()}</div></div>
  <div class="stat-card"><div class="stat-label">Unique Taps</div><div class="stat-value">${data.uniqueTapsCur.toLocaleString()}</div></div>
  <div class="stat-card"><div class="stat-label">Menu Views</div><div class="stat-value">${data.viewsCur.toLocaleString()}</div></div>
  <div class="stat-card"><div class="stat-label">Google Reviews</div><div class="stat-value">${data.reviewsCur.toLocaleString()}</div></div>
  <div class="stat-card"><div class="stat-label">New Followers</div><div class="stat-value">${data.followersCur.toLocaleString()}</div></div>
</div>

<div class="two-col">
  <div class="section">
    <div class="section-title">Top Menu Items</div>
    ${data.topItems.length === 0
      ? '<p class="no-data">No data yet</p>'
      : `<table>
          <thead><tr><th>#</th><th>Item</th><th>Views</th></tr></thead>
          <tbody>${data.topItems.map((item, i) => `<tr><td style="color:#9ca3af">${i + 1}</td><td>${htmlEsc(item.name)}</td><td>${item.views.toLocaleString()}</td></tr>`).join('')}</tbody>
        </table>`}
  </div>
  <div class="section">
    <div class="section-title">Language Preferences</div>
    ${data.langData.length === 0
      ? '<p class="no-data">No data yet</p>'
      : `<table>
          <thead><tr><th>Language</th><th>Visitors</th></tr></thead>
          <tbody>${data.langData.map(l => `<tr><td>${htmlEsc(l.language)}</td><td>${l.count.toLocaleString()}</td></tr>`).join('')}</tbody>
        </table>`}
  </div>
</div>

<div class="two-col">
  <div class="section">
    <div class="section-title">Social Button Clicks</div>
    ${data.socialData.length === 0
      ? '<p class="no-data">No clicks yet</p>'
      : `<table>
          <thead><tr><th>Platform</th><th>Clicks</th></tr></thead>
          <tbody>${data.socialData.map(s => `<tr><td style="text-transform:capitalize">${htmlEsc(s.platform)}</td><td>${s.count.toLocaleString()}</td></tr>`).join('')}</tbody>
        </table>`}
  </div>
  ${tablesHtml || '<div></div>'}
</div>

${peakHtml}
${subHtml}

<div class="section">
  <div class="section-title">Daily Taps</div>
  <table>
    <thead><tr><th>Date</th><th>Taps</th></tr></thead>
    <tbody>${data.chartData.map(d => `<tr><td>${htmlEsc(d.date)}</td><td>${d.taps.toLocaleString()}</td></tr>`).join('')}</tbody>
  </table>
</div>

<div class="footer">Enefsis &nbsp;·&nbsp; Exported ${generatedAt}</div>
</body>
</html>`

  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) {
    alert('Please allow pop-ups for this site to download the PDF report.')
    return
  }
  win.document.write(html)
  win.document.close()
  setTimeout(() => { win.focus(); win.print() }, 300)
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ExportReport({ data, rangeLabel }: { data: ExportData; rangeLabel: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] text-white/70 hover:text-white text-sm font-sans transition-colors"
      >
        {/* download icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Export
        <svg
          width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 150ms' }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-48 bg-[#1a1f2e] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden z-50">
          <button
            onClick={() => { downloadCSV(data, rangeLabel); setOpen(false) }}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-sans text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors text-left"
          >
            {/* file-text icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            Download CSV
          </button>

          <div className="h-px bg-white/[0.05]" />

          <button
            onClick={() => { printPDF(data, rangeLabel); setOpen(false) }}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-sans text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors text-left"
          >
            {/* printer icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Download PDF
          </button>
        </div>
      )}
    </div>
  )
}
