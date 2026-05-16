'use client'

export type CsvClientRow = {
  name:       string
  email:      string
  business:   string
  plan:       string
  status:     string
  mrr:        number
  arr:        number
  nfcStands:  number
  joined:     string
  landingUrl: string
}

const HEADERS = ['Name', 'Email', 'Business', 'Plan', 'Status', 'MRR (€)', 'ARR (€)', 'NFC Stands', 'Joined Date', 'Landing Page URL']

function escapeCell(value: string | number): string {
  const s = String(value)
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"`
    : s
}

export function ExportCsvButton({ rows }: { rows: CsvClientRow[] }) {
  function handleExport() {
    const lines = [
      HEADERS.join(','),
      ...rows.map(r => [
        escapeCell(r.name),
        escapeCell(r.email),
        escapeCell(r.business),
        escapeCell(r.plan),
        escapeCell(r.status),
        escapeCell(r.mrr),
        escapeCell(r.arr),
        escapeCell(r.nfcStands),
        escapeCell(r.joined),
        escapeCell(r.landingUrl),
      ].join(',')),
    ]

    const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)
    a.href     = url
    a.download = `enefsis-clients-${date}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-sans font-semibold transition-colors hover:brightness-110"
      style={{ background: '#2B5CE6' }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      Export CSV
    </button>
  )
}
