'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, Zap } from 'lucide-react';
import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase-client';
import { getProductByPriceId, getProductByPlan } from '@/stripe-config';

export function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createSupabaseClient();

  useEffect(() => {
    if (!sessionId) {
      setError('Session ID não encontrado');
      setIsLoading(false);
      return;
    }

    // Demo fallback for TEST_SESSION_ID without real webhook data
    if (sessionId === 'TEST_SESSION_ID') {
      const demoProduct = getProductByPlan('pessoal');
      setSubscriptionData({ price_id: demoProduct?.priceId });
      setIsLoading(false);
      return;
    }

    const fetchSubscriptionData = async () => {
      try {
        // Wait a bit for webhook processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const { data: subscription, error: subError } = await supabase
          .from('stripe_subscriptions')
          .select('*')
          .maybeSingle();

        if (subError) {
          console.error('Error fetching subscription:', subError);
          setError('Erro ao buscar dados da assinatura');
          return;
        }

        setSubscriptionData(subscription);
      } catch (err) {
        console.error('Error:', err);
        setError('Erro inesperado');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [sessionId, supabase]);

  useEffect(() => {
    if (!isLoading && !error) {
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, error, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Processando pagamento...</h2>
            <p className="text-muted-foreground text-center">
              Aguarde enquanto confirmamos seu pagamento e ativamos sua assinatura.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Erro</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <Link href="/dashboard">Ir para Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const product = subscriptionData?.price_id ? getProductByPriceId(subscriptionData.price_id) : null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center justify-center gap-4 mb-8">
        <Zap className="h-12 w-12 text-primary" />
        <h1 className="text-3xl font-bold font-headline">AgilyZap</h1>
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Pagamento Confirmado!</CardTitle>
          <CardDescription>
            Sua assinatura foi ativada com sucesso.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {product && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Plano Ativado:</h3>
              <p className="text-lg font-medium">{product.name}</p>
              <p className="text-sm text-muted-foreground">{product.description}</p>
              <p className="text-lg font-bold text-primary mt-2">
                ${product.price}/mês
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <h3 className="font-semibold">Próximos Passos:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Acesse seu dashboard para conectar o WhatsApp</li>
              <li>• Configure seu tipo de serviço preferido</li>
              <li>• Comece a transcrever seus áudios!</li>
            </ul>
          </div>
          
          <Button asChild className="w-full">
            <Link href="/dashboard">Ir para Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
