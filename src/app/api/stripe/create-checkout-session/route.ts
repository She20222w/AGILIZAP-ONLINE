import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getProductByPlan } from '@/stripe-config';

export async function POST(request: Request) {
  console.log('[DEBUG] create-checkout-session request body:', await request.clone().json());
  try {
    const { plan, userId, phone } = (await request.json()) as { plan: 'pessoal' | 'business' | 'exclusivo'; userId: string; phone: string };

    const product = getProductByPlan(plan);
    if (!product) {
      return NextResponse.json({ error: 'Plano inválido.' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    
    // Get the user's session to pass the JWT token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 });
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/stripe-checkout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_id: product.priceId,
        mode: product.mode,
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/signup?canceled=true`,
        userId,
        phone,
        plan,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: result.error || 'Erro ao criar sessão de checkout.' }, { status: response.status });
    }

    return NextResponse.json({ url: result.url });
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    return NextResponse.json({ error: 'Erro ao criar sessão de checkout.' }, { status: 500 });
  }
}
