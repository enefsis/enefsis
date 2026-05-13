import { NextRequest, NextResponse } from 'next/server'

// Maps our 2-letter codes to DeepL target_lang codes.
// Languages absent from this map (HE, HI, HR, MS, TH, VI) are unsupported by
// DeepL — the endpoint returns the original strings unchanged for those.
const DEEPL_LANG: Record<string, string> = {
  AR: 'AR',    BG: 'BG',    CS: 'CS',    DA: 'DA',    DE: 'DE',
  EL: 'EL',    EN: 'EN-US', ES: 'ES',    FI: 'FI',    FR: 'FR',
  HU: 'HU',    ID: 'ID',    IT: 'IT',    JA: 'JA',    KO: 'KO',
  NL: 'NL',    NO: 'NB',    PL: 'PL',    PT: 'PT-BR', RO: 'RO',
  RU: 'RU',    SK: 'SK',    SL: 'SL',    SV: 'SV',    TR: 'TR',
  UK: 'UK',    ZH: 'ZH-HANS',
}

export async function POST(req: NextRequest) {
  let text: string[]
  let targetLang: string

  try {
    const body = await req.json() as { text: unknown; targetLang: unknown }
    text      = body.text      as string[]
    targetLang = body.targetLang as string
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!Array.isArray(text) || typeof targetLang !== 'string') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const deeplLang = DEEPL_LANG[targetLang.toUpperCase()]
  if (!deeplLang) {
    // Unsupported language — return originals so the client gracefully falls back
    return NextResponse.json({ translations: text })
  }

  const apiKey = process.env.DEEPL_API_KEY
  if (!apiKey) {
    console.error('[translate] DEEPL_API_KEY not set')
    return NextResponse.json({ translations: text })
  }

  const baseUrl = apiKey.endsWith(':fx')
    ? 'https://api-free.deepl.com/v2/translate'
    : 'https://api.deepl.com/v2/translate'

  try {
    const resp = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, target_lang: deeplLang }),
    })

    if (!resp.ok) {
      console.error('[translate] DeepL error', resp.status, await resp.text())
      return NextResponse.json({ translations: text })
    }

    const data = await resp.json() as { translations: { text: string }[] }
    return NextResponse.json({ translations: data.translations.map(t => t.text) })
  } catch (err) {
    console.error('[translate] fetch error:', err)
    return NextResponse.json({ translations: text })
  }
}
