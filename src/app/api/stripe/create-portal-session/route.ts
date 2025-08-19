import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/route-handler-client';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/supabase';
import Stripe from 'stripe';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient(cookieStore);
  
  // Obter usuário autenticado do Supabase
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
  if (authError || !authUser) {
    return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 });
  }
  // Temporariamente, vamos apenas retornar os dados do usuário para depuração
  return NextResponse.json({ user: authUser });

  /*
  const userId = authUser.id;
  console.log(`[Stripe Portal] Authenticated User ID: ${userId}`);

  // Buscar customer_id salvo
  const userResponse = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', userId)
    .maybeSingle();

  console.log('[Stripe Portal] User DB Response:', userResponse);

const user = userResponse.data;
const userError = userResponse.error;
  if (userError || !user?.stripe_customer_id) {
    console.error(`[Stripe Portal] Failed to find Stripe Customer ID for user ${userId}. DB Error:`, userError);
    return NextResponse.json({ error: 'Customer ID não encontrado.' }, { status: 400 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-07-30.basil' });
  // Criar sessão do Billing Portal
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
  });
  return NextResponse.json({ url: portalSession.url });
  */
}
