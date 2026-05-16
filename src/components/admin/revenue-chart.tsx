'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

export type RevenueMonth = {
  month: string   // e.g. "Jun '24"
  mrr:   number
  isCurrent: boolean
}

function CustomTooltip({ active, payload, label }: {
  active?:  boolean
  payload?: { value: number }[]
  label?:   string
}) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-xl px-3 py-2 font-sans text-xs"
      style={{ background: '#1E2130', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
    >
      <p className="text-white/50 mb-0.5">{label}</p>
      <p className="text-white font-semibold">€{payload[0].value.toLocaleString()}</p>
    </div>
  )
}

export function RevenueChart({ data, currentMrr }: { data: RevenueMonth[]; currentMrr: number }) {
  return (
    <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-display font-semibold text-white text-base">Revenue History</h2>
          <p className="font-sans text-xs text-white/35 mt-0.5">Monthly Recurring Revenue — since first client</p>
        </div>
        <div className="text-right">
          <p className="font-display text-xl font-bold text-white">€{currentMrr.toLocaleString()}</p>
          <p className="font-sans text-[11px] text-white/35 mt-0.5">Current MRR</p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barCategoryGap="30%" margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="month"
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'sans-serif' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={v => `€${v}`}
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'sans-serif' }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Bar dataKey="mrr" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.isCurrent ? '#2B5CE6' : 'rgba(43,92,230,0.35)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Note */}
      <p className="font-sans text-[11px] text-white/25 mt-4 text-center">
        Past months show MRR from active subscriptions created by that date
      </p>
    </div>
  )
}
