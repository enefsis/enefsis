import { TrendingUp, TrendingDown, Minus, Zap, BookOpen, Star, UserPlus, Users, CreditCard, Euro, CalendarDays, Coins } from 'lucide-react'
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
  commissions:   Coins,
}

interface StatCardProps {
  label: string
  subtitle?: string
  value: number
  change: number
  icon: keyof typeof icons
  prefix?: string
  accentColor?: 'blue' | 'amber'
}

export function StatCard({ label, subtitle, value, change, icon, prefix, accentColor = 'blue' }: StatCardProps) {
  const Icon    = icons[icon]
  const isAmber = accentColor === 'amber'

  const isPositive = change > 0
  const isNegative = change < 0
  const isNeutral  = change === 0

  return (
    <div className="bg-[#141720] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-4">
      {/* Icon */}
      <div className={cn(
        'w-9 h-9 rounded-lg flex items-center justify-center',
        isAmber ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-[#2B5CE6]/10 border border-[#2B5CE6]/20',
      )}>
        <Icon size={17} className={isAmber ? 'text-amber-400' : 'text-[#2B5CE6]'} strokeWidth={1.75} />
      </div>

      {/* Value */}
      <div>
        <p className="font-display text-3xl font-bold text-white leading-none">
          {prefix && <span className="text-white/50 mr-0.5">{prefix}</span>}
          {value.toLocaleString()}
        </p>
        <p className="font-sans text-sm text-white/45 mt-1.5">{label}</p>
        {subtitle && (
          <p className="font-sans text-[10px] text-white/25 mt-0.5 leading-tight">{subtitle}</p>
        )}
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
