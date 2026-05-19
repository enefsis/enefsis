'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export interface ChecklistData {
  hasLogo:         boolean
  hasGoogleReview: boolean
  hasMenu:         boolean
  hasSocials:      boolean
  hasOpeningHours: boolean
}

const LS_DISMISS_KEY = 'enefsis_onboarding_dismissed'

const STEPS: { key: keyof ChecklistData; label: string }[] = [
  { key: 'hasLogo',         label: 'Upload your logo'           },
  { key: 'hasGoogleReview', label: 'Add your Google Review link' },
  { key: 'hasMenu',         label: 'Add your menu'              },
  { key: 'hasSocials',      label: 'Add your social links'      },
  { key: 'hasOpeningHours', label: 'Add your opening hours'     },
]

interface Props {
  checklist: ChecklistData
}

export function GettingStartedCard({ checklist }: Props) {
  const [dismissed, setDismissed] = useState(false)
  const [mounted,   setMounted]   = useState(false)

  useEffect(() => {
    setDismissed(localStorage.getItem(LS_DISMISS_KEY) === 'true')
    setMounted(true)
  }, [])

  const completed  = STEPS.filter(s => checklist[s.key]).length
  const total      = STEPS.length
  const allDone    = completed === total
  const pct        = Math.round((completed / total) * 100)

  // Don't flash on SSR hydration
  if (!mounted) return null
  // Hide once all done AND explicitly dismissed
  if (allDone && dismissed) return null

  function handleDismiss() {
    localStorage.setItem(LS_DISMISS_KEY, 'true')
    setDismissed(true)
  }

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: '#141720', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="font-display font-semibold text-white text-base">
            {allDone ? '🎉 You\'re all set!' : 'Getting Started'}
          </h2>
          <p className="font-sans text-xs text-white/40 mt-0.5">
            {allDone
              ? 'Your page is fully configured and ready for customers.'
              : `${completed} of ${total} setup steps complete`}
          </p>
        </div>
        {allDone && (
          <button
            type="button"
            onClick={handleDismiss}
            className="shrink-0 font-sans text-xs font-medium text-white/40 hover:text-white/70 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.05]"
          >
            Dismiss
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: allDone ? '#22c55e' : '#2B5CE6',
            }}
          />
        </div>
        <p className="font-sans text-[11px] text-white/30 mt-1.5 tabular-nums">
          {completed}/{total} complete
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-2.5">
        {STEPS.map(step => {
          const done = checklist[step.key]
          return (
            <div key={step.key} className="flex items-center gap-3">
              {/* Checkbox icon */}
              <span className="shrink-0 text-base leading-none">
                {done ? '✅' : '⬜'}
              </span>

              {/* Label */}
              <span
                className="font-sans text-sm flex-1"
                style={{ color: done ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.80)' }}
              >
                {done ? <s style={{ textDecorationColor: 'rgba(255,255,255,0.2)' }}>{step.label}</s> : step.label}
              </span>

              {/* Fix it link */}
              {!done && (
                <Link
                  href="/dashboard/page-editor"
                  className="shrink-0 font-sans text-xs font-semibold text-[#2B5CE6] hover:text-[#5580f0] transition-colors"
                >
                  Fix it →
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
