import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

// ─── Products ─────────────────────────────────────────────────────────────────
// Two products: Basic and Pro.
// Each has a monthly and a yearly price.
// Set the corresponding env vars to the Price IDs from your Stripe dashboard.
//
//   Basic  – Monthly €49   → STRIPE_PRICE_BASIC_MONTHLY
//   Basic  – Yearly  €499  → STRIPE_PRICE_BASIC_YEARLY
//   Pro    – Monthly €100  → STRIPE_PRICE_PRO_MONTHLY
//   Pro    – Yearly  €900  → STRIPE_PRICE_PRO_YEARLY

export const STRIPE_PRICES = {
  basic: {
    monthly: process.env.STRIPE_PRICE_BASIC_MONTHLY ?? '',
    yearly:  process.env.STRIPE_PRICE_BASIC_YEARLY  ?? '',
  },
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY   ?? '',
    yearly:  process.env.STRIPE_PRICE_PRO_YEARLY    ?? '',
  },
} satisfies Record<string, Record<string, string>>

export type StripePlan    = keyof typeof STRIPE_PRICES
export type StripeBilling = 'monthly' | 'yearly'
