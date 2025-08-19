import React, { Suspense } from 'react';
import SignupPageClient from './SignupPageClient';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function SignupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Se usuário não estiver logado, exibe o formulário de cadastro
  if (!user) {
    return (
      <Suspense fallback={null}>
        <SignupPageClient />
      </Suspense>
    );
  }

  // Usuário autenticado, verifica assinatura ativa
  const { data: appUser } = await supabase
    .from('users')
    .select('stripe_customer_id, status')
    .eq('id', user.id)
    .maybeSingle();

  const bypass = process.env.DEV_BYPASS_SUBSCRIPTION === 'true';
  if (!bypass && (!appUser?.stripe_customer_id || appUser.status !== 'active')) {
    redirect('/pricing');
  }

  return (
    <Suspense fallback={null}>
      <SignupPageClient />
    </Suspense>
  );
}
