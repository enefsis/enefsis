import Link from 'next/link'

export type ContractLog = {
  id: string
  language: string | null
  plan: string | null
  amount: number | null
  stands: number | null
  generated_at: string
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtPlan(plan: string) {
  return plan.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function LangBadge({ lang }: { lang: string | null }) {
  const label = (lang ?? 'en').toUpperCase()
  const isDE  = label === 'DE'
  return (
    <span
      className="inline-flex items-center font-sans text-[11px] font-semibold px-2 py-0.5 rounded-md"
      style={isDE
        ? { background: 'rgba(251,191,36,0.10)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.20)' }
        : { background: 'rgba(43,92,230,0.12)',  color: '#6B90F5', border: '1px solid rgba(43,92,230,0.22)' }}
    >
      {label}
    </span>
  )
}

export function ContractHistory({ logs, userId }: { logs: ContractLog[]; userId: string }) {
  return (
    <div className="bg-[#141720] border border-white/[0.06] rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <h2 className="font-display font-semibold text-white text-sm">Contract History</h2>
        <span
          className="font-sans text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(43,92,230,0.13)', color: '#6B90F5' }}
        >
          {logs.length}
        </span>
      </div>

      {logs.length === 0 ? (
        <div className="py-10 text-center">
          <p className="font-sans text-sm text-white/25">No contracts generated yet</p>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.04]">
          {logs.map(log => (
            <div key={log.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.018] transition-colors">
              <LangBadge lang={log.language} />
              <div className="flex-1 min-w-0">
                <p className="font-sans text-sm text-white/75">
                  {log.plan ? fmtPlan(log.plan) : '—'}
                  {log.amount != null && (
                    <span className="text-white/35 ml-2">€{log.amount}</span>
                  )}
                  {log.stands != null && log.stands > 0 && (
                    <span className="text-white/30 ml-2 text-xs">{log.stands} stand{log.stands !== 1 ? 's' : ''}</span>
                  )}
                </p>
                <p className="font-sans text-xs text-white/30 mt-0.5">{fmt(log.generated_at)}</p>
              </div>
              <Link
                href={`/contracts/${log.language ?? 'en'}/${userId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 font-sans text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                style={{ color: '#6B90F5', background: 'rgba(43,92,230,0.10)' }}
              >
                Reprint
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
