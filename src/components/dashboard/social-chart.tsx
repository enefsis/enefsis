'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

export interface SocialEntry {
  platform: string
  count: number
}

const SOCIALS: Record<string, { label: string; color: string }> = {
  instagram: { label: 'Instagram', color: '#E1306C' },
  google:    { label: 'Google',    color: '#4285F4' },
  whatsapp:  { label: 'WhatsApp',  color: '#25D366' },
  facebook:  { label: 'Facebook',  color: '#1877F2' },
  tiktok:    { label: 'TikTok',    color: '#69C9D0' },
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { name: string; value: number; payload: { color: string } }[]
}) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="bg-[#1a1f2e] border border-white/[0.08] rounded-lg px-3 py-2 shadow-xl">
      <p className="font-sans text-xs text-white/40 mb-0.5">{item.name}</p>
      <p className="font-display text-sm font-semibold text-white">
        {item.value.toLocaleString()} clicks
      </p>
    </div>
  )
}

export function SocialChart({ data }: { data: SocialEntry[] }) {
  if (data.length === 0 || data.every(d => d.count === 0)) {
    return (
      <div className="h-48 flex items-center justify-center">
        <p className="font-sans text-sm text-white/25">No button click data yet</p>
      </div>
    )
  }

  const total = data.reduce((s, d) => s + d.count, 0)

  const chartData = data.map(d => ({
    name:  SOCIALS[d.platform]?.label ?? d.platform,
    value: d.count,
    color: SOCIALS[d.platform]?.color ?? '#6b7280',
  }))

  return (
    <div className="flex items-center gap-5">
      {/* Donut */}
      <div className="relative shrink-0" style={{ width: 140, height: 140 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={44}
              outerRadius={64}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-display text-xl font-bold text-white leading-none">
            {total.toLocaleString()}
          </span>
          <span className="font-sans text-[10px] text-white/35 mt-0.5">total</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-2.5">
        {chartData.map(entry => {
          const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0
          return (
            <div key={entry.name} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: entry.color }}
                />
                <span className="font-sans text-xs text-white/60 truncate">{entry.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-sans text-xs font-medium text-white/80 tabular-nums">
                  {entry.value.toLocaleString()}
                </span>
                <span className="font-sans text-[10px] text-white/30 tabular-nums w-7 text-right">
                  {pct}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
