import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { mixpanel } from '@/lib/mixpanel'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature')
  const body = await request.text()
  
  let event: Stripe.Event
  
  try {
    event = stripe.webhooks.constructEvent(body, signature!, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const customerId = session.customer as string
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
    const price = subscription.items.data[0].price
    
    const customer = await stripe.customers.retrieve(customerId)
    const userId = (customer as Stripe.Customer).metadata.userId
    
    await updateUserSubscription(userId, {
      subscriptionId: subscription.id,
      planName: price.nickname || 'Base',
      status: subscription.status
    })
    
    mixpanel.identify(userId)
    mixpanel.track('subscription_started', {
      plan_name: price.nickname || 'Base',
      price_amount: price.unit_amount || 0
    })
  }
  
  return NextResponse.json({ received: true })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const priceId = searchParams.get('priceId')
  const userId = searchParams.get('userId')
  
  if (!priceId || !userId) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
  }
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price: priceId,
      quantity: 1
    }],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
    customer_creation: 'always',
    metadata: { userId }
  })
  
  return NextResponse.json({ url: session.url })
}