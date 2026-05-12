import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe/client'
import { createAdminClient } from '@/lib/supabase/admin'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AMOUNTS: Record<string, Record<string, number>> = {
  basic: { monthly: 49,  yearly: 499 },
  pro:   { monthly: 100, yearly: 900 },
}

async function findUserIdByEmail(email: string): Promise<string | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle()
  return (data as { id: string } | null)?.id ?? null
}

async function updateSubscription(
  userId: string,
  patch: {
    status:             string
    plan?:              string
    billing_period?:    string
    next_billing_date?: string
  },
) {
  const admin   = createAdminClient()
  const amount  =
    patch.plan && patch.billing_period
      ? (AMOUNTS[patch.plan]?.[patch.billing_period] ?? null)
      : undefined

  await admin
    .from('subscriptions')
    .update({
      status:            patch.status,
      ...(patch.plan              && { plan: patch.plan }),
      ...(amount !== undefined    && { amount }),
      ...(patch.next_billing_date && { next_billing_date: patch.next_billing_date }),
    })
    .eq('user_id', userId)
}

function nextBillingDate(billingPeriod: string): string {
  const d = new Date()
  if (billingPeriod === 'yearly') {
    d.setFullYear(d.getFullYear() + 1)
  } else {
    d.setMonth(d.getMonth() + 1)
  }
  return d.toISOString().split('T')[0]
}

// ─── Event handlers ───────────────────────────────────────────────────────────

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const email         = session.customer_email ?? session.metadata?.client_email
  const plan          = session.metadata?.plan          ?? 'basic'
  const billingPeriod = session.metadata?.billing_period ?? 'monthly'

  if (!email) return

  const userId = await findUserIdByEmail(email)
  if (!userId) return

  await updateSubscription(userId, {
    status:          'active',
    plan,
    billing_period:  billingPeriod,
    next_billing_date: nextBillingDate(billingPeriod),
  })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const email = subscription.metadata?.client_email
  if (!email) return

  const userId = await findUserIdByEmail(email)
  if (!userId) return

  await updateSubscription(userId, { status: 'cancelled' })
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const email = invoice.customer_email
  if (!email) return

  const userId = await findUserIdByEmail(email)
  if (!userId) return

  await updateSubscription(userId, { status: 'suspended' })
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook signature verification failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        // Unhandled event type — return 200 so Stripe doesn't retry
        break
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Handler error'
    console.error(`[stripe-webhook] ${event.type}:`, message)
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
