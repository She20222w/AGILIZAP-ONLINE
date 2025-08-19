import { NextResponse } from 'next/server';
import { getProductByPlan } from '@/stripe-config';
import Stripe from 'stripe';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  console.log('[DEBUG] create-checkout-session request body:', await request.clone().json());
  try {
    const { plan, userId, phone } = (await request.json()) as { plan: 'pessoal' | 'business' | 'exclusivo'; userId: string; phone: string };

    const product = getProductByPlan(plan);
    if (!product) {
      return NextResponse.json({ error: 'Plano inválido.' }, { status: 400 });
    }

    // Cria sessão de checkout diretamente com Stripe SDK
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: product.priceId, quantity: 1 }],
      mode: product.mode,
      payment_method_types: ['card'],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/signup?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    return NextResponse.json({ error: 'Erro ao criar sessão de checkout.' }, { status: 500 });
  }
}
