'use client'

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

export interface AnalyticsDay { date: string; taps: number; uniqueTaps: number }

function CustomTooltip({
  active, payload, label,
}: {
  active?: boolean
  payload?: { value: number; dataKey: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  const total  = payload.find(p => p.dataKey === 'taps')?.value ?? 0
  const unique = payload.find(p => p.dataKey === 'uniqueTaps')?.value ?? 0
  return (
    <div className="bg-[#1a1f2e] border border-white/[0.08] rounded-lg px-3 py-2.5 shadow-xl">
      <p className="font-sans text-xs text-white/40 mb-1.5">{label}</p>
      <p className="font-display text-sm font-semibold text-[#2B5CE6]">{total.toLocaleString()} total taps</p>
      <p className="font-display text-sm font-semibold text-[#38BEFF]">{unique.toLocaleString()} unique</p>
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
    <div>
      <div className="flex items-center gap-5 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-0.5 rounded-full bg-[#2B5CE6]" />
          <span className="font-sans text-xs text-white/45">Total Taps</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-0.5 rounded-full bg-[#38BEFF]" />
          <span className="font-sans text-xs text-white/45">Unique Taps</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={224}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }} />
          <Line type="monotone" dataKey="taps"       stroke="#2B5CE6" strokeWidth={2} dot={false} activeDot={{ r: 3, fill: '#2B5CE6' }} />
          <Line type="monotone" dataKey="uniqueTaps" stroke="#38BEFF" strokeWidth={2} dot={false} activeDot={{ r: 3, fill: '#38BEFF' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
