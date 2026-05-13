import { TrendingUp, TrendingDown, Minus, Zap, BookOpen, Star, UserPlus, Users, CreditCard, Euro, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'

const icons = {
  tap:           Zap,
  menu:          BookOpen,
  star:          Star,
  users:         UserPlus,
  clients:       Users,
  subscriptions: CreditCard,
  revenue:       Euro,
  arr:           CalendarDays,
}

interface StatCardProps {
  label: string
  value: number
  change: number
  icon: keyof typeof icons
  prefix?: string
}

export function StatCard({ label, value, change, icon, prefix }: StatCardProps) {
  const Icon = icons[icon]

  const isPositive = change > 0
  const isNegative = change < 0
  const isNeutral  = change === 0

  return (
    <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-4">
      {/* Icon */}
      <div className="w-9 h-9 rounded-lg bg-[#2B5CE6]/10 border border-[#2B5CE6]/20 flex items-center justify-center">
        <Icon size={17} className="text-[#2B5CE6]" strokeWidth={1.75} />
      </div>

      {/* Value */}
      <div>
        <p className="font-display text-3xl font-bold text-white leading-none">
          {prefix && <span className="text-white/50 mr-0.5">{prefix}</span>}
          {value.toLocaleString()}
        </p>
        <p className="font-sans text-sm text-white/45 mt-1.5">{label}</p>
      </div>

      {/* Change */}
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            'inline-flex items-center gap-1 text-xs font-sans font-medium px-2 py-0.5 rounded-full',
            isPositive && 'bg-emerald-500/10 text-emerald-400',
            isNegative && 'bg-red-500/10 text-red-400',
            isNeutral  && 'bg-white/[0.06] text-white/35',
          )}
        >
          {isPositive && <TrendingUp  size={11} strokeWidth={2} />}
          {isNegative && <TrendingDown size={11} strokeWidth={2} />}
          {isNeutral  && <Minus        size={11} strokeWidth={2} />}
          {isPositive ? '+' : ''}{change}%
        </span>
        <span className="text-xs font-sans text-white/25">vs prev 30 days</span>
      </div>
    </div>
  )
}
