export interface MenuItem {
  name: string
  views: number
}

export function TopMenuItems({ items }: { items: MenuItem[] }) {
  if (items.length === 0) {
    return (
      <div className="py-8 flex items-center justify-center">
        <p className="font-sans text-sm text-white/25">No menu view data yet</p>
      </div>
    )
  }

  const max = items[0].views

  return (
    <div className="space-y-4">
      {items.map(({ name, views }, i) => (
        <div key={name}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-sans font-medium text-white/25 w-4 text-right">
                {i + 1}
              </span>
              <span className="font-sans text-sm font-medium text-white/80 truncate max-w-[200px]">
                {name}
              </span>
            </div>
            <span className="font-sans text-sm text-white/40 tabular-nums">
              {views.toLocaleString()}
            </span>
          </div>
          <div className="ml-6 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2B5CE6] rounded-full transition-all duration-500"
              style={{ width: `${Math.round((views / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
