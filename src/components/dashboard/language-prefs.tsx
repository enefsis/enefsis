export interface LangEntry {
  language: string
  count: number
}

function getLanguageName(code: string): string {
  const map: Record<string, string> = {
    'en-GB': 'English (UK)',
    'en-US': 'English (US)',
    'en':    'English',
    'de':    'German',
    'el':    'Greek',
    'fr':    'French',
    'it':    'Italian',
    'es':    'Spanish',
    'ru':    'Russian',
    'zh':    'Chinese',
    'ja':    'Japanese',
    'ar':    'Arabic',
    'pt':    'Portuguese',
    'ko':    'Korean',
    'nl':    'Dutch',
    'pl':    'Polish',
    'tr':    'Turkish',
  }
  return map[code] ?? map[code.split('-')[0]] ?? code
}

export function LanguagePrefs({ data }: { data: LangEntry[] }) {
  if (data.length === 0) {
    return (
      <div className="py-8 flex items-center justify-center">
        <p className="font-sans text-sm text-white/25">No language data yet</p>
      </div>
    )
  }

  const max = data[0].count
  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <div className="space-y-4">
      {data.map(({ language, count }, i) => {
        const pct = total > 0 ? Math.round((count / total) * 100) : 0
        return (
          <div key={language}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-sans font-medium text-white/25 w-4 text-right">
                  {i + 1}
                </span>
                <span className="font-sans text-sm font-medium text-white/80">
                  {getLanguageName(language)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-sans text-xs text-white/40 tabular-nums">
                  {count.toLocaleString()}
                </span>
                <span className="font-sans text-[10px] text-white/25 tabular-nums w-7 text-right">
                  {pct}%
                </span>
              </div>
            </div>
            <div className="ml-6 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2B5CE6] rounded-full transition-all duration-500"
                style={{ width: `${Math.round((count / max) * 100)}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
