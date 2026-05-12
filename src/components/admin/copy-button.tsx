'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copy URL"
      className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-white/[0.07] transition-colors text-white/35 hover:text-white/70 shrink-0"
    >
      {copied
        ? <Check size={13} className="text-emerald-400" />
        : <Copy size={13} />}
    </button>
  )
}
