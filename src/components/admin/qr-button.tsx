'use client'

import { useState, useEffect } from 'react'
import QRCode from 'qrcode'

function deriveFilename(url: string): string {
  try {
    const u = new URL(url)
    const slug  = u.pathname.split('/').filter(Boolean).pop() ?? 'stand'
    const table = u.searchParams.get('table')
    return table ? `${slug}-table-${table}-qr.png` : `${slug}-qr.png`
  } catch {
    return 'qr.png'
  }
}

export function QrButton({ url }: { url: string }) {
  const [open,    setOpen]    = useState(false)
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    if (dataUrl) return
    QRCode.toDataURL(url, { width: 400, margin: 2, color: { dark: '#000000', light: '#ffffff' } })
      .then(setDataUrl)
      .catch(() => {})
  }, [open, url, dataUrl])

  function handleClose() { setOpen(false) }

  function download() {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = deriveFilename(url)
    a.click()
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center px-3 py-1.5 rounded-lg font-sans text-xs font-medium shrink-0 transition-colors hover:brightness-110"
        style={{ color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.09)' }}
      >
        QR
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={handleClose}
        >
          <div
            className="rounded-2xl p-6 flex flex-col items-center gap-5 w-full max-w-xs"
            style={{ background: '#161920', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center">
              <h2 className="font-display font-bold text-white text-lg">QR Code</h2>
              <p className="font-mono text-[10px] text-white/30 mt-1 break-all">{url}</p>
            </div>

            {dataUrl ? (
              <img src={dataUrl} alt="QR code" className="rounded-xl" style={{ width: 240, height: 240 }} />
            ) : (
              <div
                className="w-60 h-60 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <span className="font-sans text-sm text-white/25">Generating…</span>
              </div>
            )}

            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 h-10 rounded-xl font-sans text-sm font-semibold transition-colors"
                style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.55)' }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={download}
                disabled={!dataUrl}
                className="flex-1 h-10 rounded-xl font-sans text-sm font-semibold transition-colors disabled:opacity-40"
                style={{ background: '#2B5CE6', color: '#fff' }}
              >
                Download PNG
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
