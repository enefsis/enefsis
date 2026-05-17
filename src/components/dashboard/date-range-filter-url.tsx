'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { DateRangeFilter } from './date-range-filter'

const LS_KEY      = 'enefsis_date_range'
const DEFAULT_DAYS = 30

export function DateRangeFilterUrl() {
  const router      = useRouter()
  const pathname    = usePathname()
  const searchParams = useSearchParams()

  const urlDays = parseInt(searchParams.get('days') ?? '0') || 0
  const days    = urlDays || DEFAULT_DAYS

  // On first load: if URL has no days param, apply stored preference (or default)
  useEffect(() => {
    if (!urlDays) {
      const stored = parseInt(localStorage.getItem(LS_KEY) ?? String(DEFAULT_DAYS)) || DEFAULT_DAYS
      const params = new URLSearchParams(searchParams.toString())
      params.set('days', String(stored))
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function onChange(d: number) {
    localStorage.setItem(LS_KEY, String(d))
    const params = new URLSearchParams(searchParams.toString())
    params.set('days', String(d))
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
    // Invalidate Next.js router cache so server components always re-fetch
    router.refresh()
  }

  return <DateRangeFilter days={days} onChange={onChange} />
}
