
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { generateQrCode } from '@/app/actions';
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
import { getUserProfile, updateUserProfile } from '@/app/actions';
import { createSupabaseClient } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

type ServiceType = 'transcribe' | 'summarize' | 'resumetranscribe';

export function DashboardClient() {
  const [user, setUser] = React.useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [serviceType, setServiceType] = React.useState<ServiceType>('transcribe');
  const [qrCode, setQrCode] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isUserLoading, setIsUserLoading] = React.useState(true);
  const { toast } = useToast();
  const supabase = createSupabaseClient();

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const result = await getUserProfile(user.id);
        if (result.success && result.data) {
            setUserProfile(result.data);
            setServiceType(result.data.service_type);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setIsUserLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const result = await getUserProfile(session.user.id);
        if (result.success && result.data) {
            setUserProfile(result.data);
            setServiceType(result.data.service_type);
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
    if (user && userProfile) {
        const result = await updateUserProfile(user.id, { service_type: value });
        if (result.success) {
            toast({
                title: "Serviço Atualizado",
                description: "Funcionalidade trocada com sucesso.",
            });
        } else {
            toast({
                title: "Erro",
                description: result.error || "Não foi possível atualizar o tipo de serviço.",
                variant: "destructive",
            });
        }
    }
  }

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
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-6 w-6" />
            Conecte seu WhatsApp
          </CardTitle>
          <CardDescription>
            Escolha o serviço e leia o QR code para conectar sua conta.
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
              disabled={isLoading}
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
            </RadioGroup>
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
              <div className="flex flex-col items-center gap-2">
                 <Image
                    src={qrCode}
                    alt="WhatsApp QR Code"
                    width={250}
                    height={250}
                    className="rounded-lg border p-2 bg-white"
                  />
                 <p className="text-sm text-muted-foreground text-center max-w-xs">
                    Abra o WhatsApp no seu celular, vá em Aparelhos Conectados e leia este código.
                 </p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerateQr} disabled={isLoading || isUserLoading} size="lg" className="w-full sm:w-auto">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <QrCode className="mr-2 h-4 w-4" />
            )}
            {qrCode ? 'Gerar Novo QR Code' : 'Gerar QR Code'}
          </Button>
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
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Seu plano atual está ativo. Para gerenciar sua assinatura, acesse o portal do nosso parceiro de pagamentos.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href={process.env.NEXT_PUBLIC_WHATSAPP_ADMIN_LINK || "https://wa.me"} target="_blank">
              Gerenciar Assinatura
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
