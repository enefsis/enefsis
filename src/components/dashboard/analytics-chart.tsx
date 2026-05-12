'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

export interface AnalyticsDay { date: string; taps: number }

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a1f2e] border border-white/[0.08] rounded-lg px-3 py-2 shadow-xl">
      <p className="font-sans text-xs text-white/40 mb-0.5">{label}</p>
      <p className="font-display text-sm font-semibold text-white">{payload[0].value.toLocaleString()} taps</p>
    </div>
  )
}

export function AnalyticsChart({ data }: { data: AnalyticsDay[] }) {
  const hasData = data.some(d => d.taps > 0)
  if (!hasData) return (
    <div className="h-56 flex items-center justify-center">
      <p className="font-sans text-sm text-white/25">No tap data for this period</p>
    </div>
  )
  return (
    <ResponsiveContainer width="100%" height={224}>
      <BarChart data={data} barSize={4} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: 'rgba(255,255,255,0.28)', fontSize: 10, fontFamily: 'var(--font-dm-sans)' }}
          axisLine={false}
          tickLine={false}
          interval={13}
        />
        <YAxis
          tick={{ fill: 'rgba(255,255,255,0.28)', fontSize: 10, fontFamily: 'var(--font-dm-sans)' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="taps" fill="#2B5CE6" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
