'use client';

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { SignupForm } from '@/components/signup-form';
import BackButton from '@/components/back-button';
import { Zap } from 'lucide-react';

export default function SignupPageClient() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    if (searchParams.get('canceled') === 'true') {
      toast({
        title: 'Pagamento Cancelado',
        description: 'Você cancelou o processo de pagamento.',
        variant: 'destructive',
      });
    }
  }, [searchParams, toast]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-4 left-4">
        <BackButton />
      </div>
      <div className="flex flex-col items-center justify-center gap-4 mb-8">
        <Zap className="h-12 w-12 text-primary" />
        <h1 className="text-3xl font-bold font-headline">Crie uma Conta</h1>
        <p className="text-muted-foreground">Junte-se ao AgilyZap hoje.</p>
      </div>
      <SignupForm />
    </main>
  );
}
