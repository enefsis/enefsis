import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_PRICES } from '@/lib/stripe/client'
import type { StripePlan, StripeBilling } from '@/lib/stripe/client'

const VALID_PLANS   = new Set<string>(['basic', 'pro'])
const VALID_BILLING = new Set<string>(['monthly', 'yearly'])

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { client_email, plan, billing_period } = body as Record<string, unknown>

  if (!client_email || typeof client_email !== 'string') {
    return NextResponse.json({ error: 'client_email is required' }, { status: 400 })
  }
  if (!plan || !VALID_PLANS.has(plan as string)) {
    return NextResponse.json({ error: 'plan must be "basic" or "pro"' }, { status: 400 })
  }
  if (!billing_period || !VALID_BILLING.has(billing_period as string)) {
    return NextResponse.json({ error: 'billing_period must be "monthly" or "yearly"' }, { status: 400 })
  }

  const priceId = STRIPE_PRICES[plan as StripePlan][billing_period as StripeBilling]
  if (!priceId) {
    return NextResponse.json(
      { error: `Price ID not configured for ${plan} ${billing_period}. Set STRIPE_PRICE_${(plan as string).toUpperCase()}_${(billing_period as string).toUpperCase()} in your environment.` },
      { status: 500 },
    )
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  try {
    const session = await stripe.checkout.sessions.create({
      mode:                       'subscription',
      payment_method_types:       ['card'],
      customer_email:             client_email,
      line_items:                 [{ price: priceId, quantity: 1 }],
      allow_promotion_codes:      true,
      billing_address_collection: 'required',
      tax_id_collection:          { enabled: true },
      metadata: {
        plan:           plan           as string,
        billing_period: billing_period as string,
        client_email,
      },
      subscription_data: {
        metadata: {
          plan:           plan           as string,
          billing_period: billing_period as string,
          client_email,
        },
      },
      success_url: `${appUrl}/admin/clients`,
      cancel_url:  `${appUrl}/admin/clients/new`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
