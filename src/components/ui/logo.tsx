import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const heights: Record<NonNullable<LogoProps['size']>, number> = {
  sm: 28,
  md: 36,
  lg: 48,
}

export function Logo({ size = 'md', className }: LogoProps) {
  const h = heights[size]
  return (
    <div className={cn('flex items-center', className)}>
      <img
        src="/logo.svg"
        alt="Enefsis"
        height={h}
        style={{ height: h, width: 'auto', objectFit: 'contain' }}
      />
    </div>
  )
}
