import { Header } from '@/components/header';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log('[DEBUG] user in layout:', user);
  if (!user) {
    redirect('/login');
  }
  // Redireciona usuários sem assinatura paga para a página de pricing
  const { data: subscription } = await supabase
    .from('stripe_user_subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!subscription) {
    redirect('/pricing');
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
