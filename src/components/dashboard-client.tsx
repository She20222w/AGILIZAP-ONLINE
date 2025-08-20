
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { generateQrCode, updateUserStatusAction, updateUserProfile } from '@/app/actions';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import {
  CreditCard,
  FileText,
  Loader2,
  MessageSquareText,
  QrCode,
  Smartphone,
} from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import Image from 'next/image';
import { UserProfile } from '@/services/user-service';
import { getUserProfile } from '@/app/actions';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { createSupabaseClient } from '@/lib/supabase-client';
import { User as SupabaseUser } from '@supabase/supabase-js';

import { getProductByPriceId } from '@/stripe-config';

type ServiceType = 'transcribe' | 'summarize' | 'resumetranscribe' | 'auto';

type PlanType = 'pessoal' | 'business' | 'exclusivo';

export function DashboardClient() {
  const [user, setUser] = React.useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [serviceType, setServiceType] = React.useState<ServiceType>('transcribe');
const [phoneInput, setPhoneInput] = React.useState<string>(userProfile?.phone || '');
const [plan, setPlan] = React.useState<PlanType>('pessoal');
  const [qrCode, setQrCode] = React.useState<string | null>(null);
const [countdown, setCountdown] = React.useState<number | null>(null);
const [status, setStatus] = React.useState<'active' | 'inactive' | null>(null);
const [isVerifying, setIsVerifying] = React.useState<boolean>(false);
const [isCreatingInstance, setIsCreatingInstance] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isPortalLoading, setIsPortalLoading] = React.useState(false);
  const [isUserLoading, setIsUserLoading] = React.useState(true);
  const [subscriptionData, setSubscriptionData] = React.useState<any>(null);
  const { toast } = useToast();
  const supabase = createSupabaseClient();

 // Plano e limites de minutos
 const planLimits: Record<string, number> = { pessoal: 200, business: 400, exclusivo: 1000 };
 const userPlan = userProfile?.plan as keyof typeof planLimits;
 const planLimitMinutes = userPlan ? planLimits[userPlan] : 0;
 const planLimitSeconds = planLimitMinutes * 60;
 const secondsUsed = userProfile?.minutes_used || 0;
 const minutesUsed = secondsUsed / 60;
 const isLimitExceeded = secondsUsed >= planLimitSeconds;

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const result = await getUserProfile(user.id);
        if (result.success && result.data) {
            setUserProfile(result.data);
            setPlan(result.data.plan);
            setServiceType(result.data.service_type ?? 'transcribe');
            setPhoneInput(result.data.phone);
            const initialStatus = result.data.status === 'active' ? 'active' : 'inactive';
            setStatus(initialStatus);
            
            // Fetch subscription data
            const { data: subscription } = await supabase
              .from('stripe_user_subscriptions')
              .select('*')
              .maybeSingle();
            setSubscriptionData(subscription);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setIsUserLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (session?.user) {
        setUser(session.user);
        const result = await getUserProfile(session.user.id);
          if (result.success && result.data) {
              setUserProfile(result.data);
              setPlan(result.data.plan);
              setServiceType(result.data.service_type ?? 'transcribe');
            setPhoneInput(result.data.phone);
              
              // Fetch subscription data
              const { data: subscription } = await supabase
                .from('stripe_user_subscriptions')
                .select('*')
                .maybeSingle();
              setSubscriptionData(subscription);
          }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setIsUserLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

const handleServiceTypeChange = async (value: ServiceType) => {
    setServiceType(value);
    if (userProfile && user) {
        const result = await updateUserProfile(user.id, { service_type: value });
        if (result.success) {
            setUserProfile((prev: UserProfile | null) => prev ? { ...prev, service_type: value } : prev);
            toast({ title: 'Tipo de serviço atualizado!', description: `Tipo de serviço alterado para ${value}.` });
        } else {
            toast({ title: 'Erro', description: `Não foi possível atualizar o tipo de serviço. ${result.error}`, variant: 'destructive' });
        }
    }
};

const handlePhoneSave = async () => {
  if (!phoneInput) {
    toast({ title: 'Erro', description: 'Digite um número de telefone.', variant: 'destructive' });
    return;
  }
  try {
    const parsed = parsePhoneNumberFromString(phoneInput);
    const formatted = parsed && parsed.isValid() ? parsed.number : phoneInput;
    if (user) {
      const result = await updateUserProfile(user.id, { phone: formatted });
      if (result.success) {
        setUserProfile(prev => prev ? { ...prev, phone: formatted } : prev);
        toast({ title: 'Telefone atualizado!', description: `Telefone salvo: ${formatted}` });
      } else {
        toast({ title: 'Erro', description: `Não foi possível atualizar o telefone. ${result.error}`, variant: 'destructive' });
      }
    }
  } catch {
    toast({ title: 'Erro', description: 'Número de telefone inválido.', variant: 'destructive' });
  }
};

  const handleGenerateQr = async () => {
    if (!userProfile?.phone) {
      toast({
        title: 'Erro',
        description: 'Perfil de usuário não encontrado ou sem número de telefone.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setQrCode(null);
    toast({
      title: 'Gerando QR Code...',
      description: 'Aguarde enquanto conectamos ao WhatsApp.',
    });

    const result = await generateQrCode({
      serviceType,
      phoneNumber: userProfile.phone,
    });
    
    setIsLoading(false);
    if (result.success && result.qrCode) {
      setQrCode(result.qrCode);
      setCountdown(60);
      setStatus(null);
      toast({
        title: 'QR Code Gerado!',
        description: 'Leia o código com seu aplicativo WhatsApp.',
      });
    } else {
      setQrCode(result.qrCode || null); // Show mock QR code on failure for dev
      toast({
        title: 'Erro ao Gerar QR Code',
        description: result.error || 'Não foi possível gerar o QR Code. Tente novamente.',
        variant: 'destructive',
      });
    }
    };
    
        const handleCreateInstance = async () => {
  if (!userProfile?.phone) {
    toast({ title: 'Erro', description: 'Nenhum telefone encontrado.', variant: 'destructive' });
    return;
  }
  setIsCreatingInstance(true);
  try {
    const response = await fetch('/api/create-instance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: userProfile.phone }),
    });
    const result = await response.json();
    if (result.success) {
      toast({ title: 'Instância criada!', description: 'Instância iniciada com sucesso.' });
    } else {
      toast({ title: 'Erro ao criar instância', description: result.error || 'Não foi possível criar a instância.', variant: 'destructive' });
    }
  } catch (error) {
    toast({ title: 'Erro', description: 'Erro ao criar instância.', variant: 'destructive' });
  } finally {
    setIsCreatingInstance(false);
  }
};

const verifyStatus = async () => {
      if (!userProfile?.phone) {
        return;
      }
      setIsVerifying(true);
      try {
        const response = await fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: userProfile.phone }),
        });
        const result = await response.json();
        const newStatus = result.success ? 'active' : 'inactive';
        setStatus(newStatus);
        if (user) {
          await updateUserStatusAction(user.id, newStatus);
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
        setStatus('inactive');
      } finally {
        setIsVerifying(false);
      }
    };
    
    React.useEffect(() => {
      if (countdown === null) return;
      if (countdown === 0) {
        verifyStatus();
        return;
      }
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }, [countdown]);
    
    const currentProduct = subscriptionData?.price_id ? getProductByPriceId(subscriptionData.price_id) : null;

      const handleManageSubscription = () => {
        const name = userProfile?.name || '';
        const email = userProfile?.email || '';
        const text = encodeURIComponent(`Olá, meu nome é ${name} e meu email é ${email}. Preciso de suporte para meu plano.`);
        window.open(`https://wa.me/5599981788458?text=${text}`, '_blank');
      };
    
    if (isUserLoading) {
      return (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent><Skeleton className="h-48 w-full" /></CardContent>
                <CardFooter><Skeleton className="h-12 w-48" /></CardFooter>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-full" />
                </CardHeader>
                 <CardContent><Skeleton className="h-10 w-full" /></CardContent>
                <CardFooter><Skeleton className="h-12 w-full" /></CardFooter>
            </Card>
        </div>
      );
  }

  return (
    <>
      <h2 className="mb-4 text-2xl font-semibold">Olá, {userProfile?.name}</h2>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-6 w-6" />
            Conecte seu WhatsApp
          </CardTitle>
          <CardDescription>
            <ol className="list-decimal list-inside space-y-1">
              <li>Passo 1: Escolha o tipo de serviço que melhor atende você.</li>
              <li>Passo 2: Clique em "Gerar QR Code" e escaneie o código com o seu celular, da mesma forma como se estivesse conectando ao WhatsApp Web.</li>
            </ol>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div>
            <Label className="text-base font-medium">Tipo de Serviço</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Escolha se deseja transcrições completas ou resumos das mensagens de áudio.
            </p>
            <RadioGroup
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              value={serviceType}
              onValueChange={(value: ServiceType) => handleServiceTypeChange(value)}
              disabled={isLoading || isUserLoading || isLimitExceeded}
            >
              <Label
                htmlFor="transcribe"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem value="transcribe" id="transcribe" className="sr-only" />
                <MessageSquareText className="mb-3 h-6 w-6" />
                Transcrição Completa
              </Label>
              <Label
                htmlFor="summarize"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem value="summarize" id="summarize" className="sr-only" />
                <FileText className="mb-3 h-6 w-6" />
                Resumo com IA
              </Label>
              <Label
                htmlFor="resumetranscribe"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem value="resumetranscribe" id="resumetranscribe" className="sr-only" />
                <div className="mb-3 flex gap-1">
                  <MessageSquareText className="h-6 w-6" />
                  <FileText className="h-6 w-6" />
                </div>
                Resumo + Transcrição
              </Label>
              <Label
                htmlFor="auto"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem value="auto" id="auto" className="sr-only" />
                <div className="mb-3 flex gap-1">
                  <MessageSquareText className="h-6 w-6" />
                  <FileText className="h-6 w-6" />
                </div>
                Modo Automático
              </Label>
</RadioGroup>
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="mt-2 w-full"
              />
              <Button onClick={handlePhoneSave} variant="outline" className="mt-2">
                Salvar Telefone
              </Button>
            </div>

          <div className="flex justify-center">
            {isLoading && (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="text-muted-foreground">Conectando ao WhatsApp...</p>
                <Skeleton className="h-[250px] w-[250px] rounded-lg" />
              </div>
            )}
            {!isLoading && qrCode && (
              <div className="flex flex-col items-center gap-4">
                 <Image
                    src={qrCode}
                    alt="WhatsApp QR Code"
                    width={250}
                    height={250}
                    className="rounded-lg border p-2 bg-white"
                  />
                 <p className="text-sm text-muted-foreground text-center max-w-xs">
                    Para conectar, abra o WhatsApp no seu celular, vá em "Aparelhos Conectados" e aponte a câmera para ler este código.
                 </p>
                 {countdown !== null && countdown > 0 && (
                   <p className="text-sm text-muted-foreground">Verificando em: {countdown}s</p>
                 )}
                 {countdown !== null && countdown === 0 && (
                   <Button onClick={verifyStatus} disabled={isVerifying} variant="outline">
                     {isVerifying && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                     Verificar novamente
                   </Button>
                 )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
            <Button onClick={handleCreateInstance} disabled={isCreatingInstance || isUserLoading || isLimitExceeded} size="lg" className="w-full sm:w-auto mr-2">
              {isCreatingInstance ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Smartphone className="mr-2 h-4 w-4" />
              )}
              Ativar Número
            </Button>
            <Button onClick={handleGenerateQr} disabled={isLoading || isUserLoading || isLimitExceeded} size="lg" className="w-full sm:w-auto">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <QrCode className="mr-2 h-4 w-4" />
            )}
            {qrCode ? 'Gerar Novo QR Code' : 'Gerar QR Code'}
          </Button>
          {status === 'active' && <Badge variant="default">Ativo</Badge>}
          {status === 'inactive' && <Badge variant="destructive">Offline</Badge>}
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            Assinatura
          </CardTitle>
          <CardDescription>
            Gerencie sua assinatura e detalhes de pagamento.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {currentProduct && (
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Plano Atual:</span>
                <Badge variant="default">{currentProduct.name}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{currentProduct.description}</p>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">{minutesUsed.toFixed(2)} / {planLimitMinutes.toFixed(2)} minutos</span>
            <Badge variant={isLimitExceeded ? 'destructive' : 'default'}>
              {isLimitExceeded ? 'Limite Excedido' : 'Dentro do Limite'}
            </Badge>
          </div>
          <div>
            <Label className="text-base font-medium">Plano</Label>
            <RadioGroup
              className="grid grid-cols-1 gap-2 mt-2"
              value={plan}
              onValueChange={async () => {}}
              disabled={true}
            >
              <Label htmlFor="pessoal" className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="pessoal" id="pessoal" className="sr-only" />
                <div>
                  <div className="font-medium">Pessoal</div>
                  <div className="text-sm text-muted-foreground">200 minutos</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">$9.90</div>
                  <div className="text-xs text-muted-foreground">/mês</div>
                </div>
              </Label>
              <Label htmlFor="business" className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="business" id="business" className="sr-only" />
                <div>
                  <div className="font-medium">Business</div>
                  <div className="text-sm text-muted-foreground">400 minutos</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">$14.90</div>
                  <div className="text-xs text-muted-foreground">/mês</div>
                </div>
              </Label>
              <Label htmlFor="exclusivo" className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="exclusivo" id="exclusivo" className="sr-only" />
                <div>
                  <div className="font-medium">Exclusivo</div>
                  <div className="text-sm text-muted-foreground">1000 minutos</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">$24.90</div>
                  <div className="text-xs text-muted-foreground">/mês</div>
                </div>
              </Label>
            </RadioGroup>
          </div>
                  </CardContent>
        <CardFooter>
          <Button onClick={handleManageSubscription} className="w-full">
            {isPortalLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Gerenciar Plano/Suporte
          </Button>
        </CardFooter>
      </Card>
    </div>
    </>
  );
}
