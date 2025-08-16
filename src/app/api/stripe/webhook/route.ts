import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { updateUserStatus, updateUserPayment } from '@/services/user-service';
import type Stripe from 'stripe';

export const config = {
  api: {
    bodyParser: false, // We need the raw body to verify Stripe signature
  },
};

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature')!;
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id;
    if (userId) {
      // Activate the user and record payment timestamp
      await updateUserStatus(userId, 'active');
      await updateUserPayment(userId);
    }
  }

  return NextResponse.json({ received: true });
}
