import { NextResponse } from 'next/server';
import { stripe, PRICE_IDS, PlanType } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const { plan, userId } = (await request.json()) as { plan: PlanType; userId: string };

    if (!PRICE_IDS[plan]) {
      return NextResponse.json({ error: 'Plano inválido.' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRICE_IDS[plan],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      client_reference_id: userId,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/signup?canceled=true`,
      metadata: { plan, userId },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    return NextResponse.json({ error: 'Erro ao criar sessão de checkout.' }, { status: 500 });
  }
}
