import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    waiterWhatsapp?: string
    tableNumber?:    number | null
    message?:        string
  }

  const { waiterWhatsapp, tableNumber, message } = body

  if (!waiterWhatsapp?.trim()) {
    return NextResponse.json({ error: 'waiterWhatsapp is required' }, { status: 400 })
  }

  // Normalise number: strip +, spaces, dashes → digits only
  const number = waiterWhatsapp.replace(/[\s\-+]/g, '')

  // Replace {table} token with actual table number (or "?" if unknown)
  const text = (message ?? 'Table {table} needs assistance')
    .replace('{table}', tableNumber != null ? String(tableNumber) : '?')

  const url = `https://wa.me/${number}?text=${encodeURIComponent(text)}`

  return NextResponse.json({ url })
}
