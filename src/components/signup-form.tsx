'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, MessageSquareText, FileText } from 'lucide-react';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { createSupabaseClient } from '@/lib/supabase-client';


  const formSchema = z.object({
    name: z.string().min(1, { message: 'Por favor, insira seu nome.' }),
    email: z.string().email({ message: 'Por favor, insira um email válido.' }),
    password: z.string().min(8, { message: 'A senha deve ter pelo menos 8 caracteres.' }),
    phone: z.string().refine(phone => {
          try {
              const parsed = parsePhoneNumberFromString(phone);
              return !!parsed && parsed.isValid();
          } catch {
              return false;
          }
      }, "Número de telefone inválido. Use o formato internacional (ex: +5511999999999)."),
    plan: z.enum(['pessoal', 'business', 'exclusivo'], { required_error: 'Por favor, selecione um plano.' }),
  });

type PlanType = 'pessoal' | 'business' | 'exclusivo';

export function SignupForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();
  const supabase = createSupabaseClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      plan: 'pessoal',
    },
  });

function onSubmit(values: z.infer<typeof formSchema>) {
  startTransition(async () => {
    // Cria usuário no Supabase Auth
    const supabaseClient = createSupabaseClient();
    const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });
    let user = signUpData?.user ?? null;
    if (signUpError) {
      // Usuário já existe, tenta login
      const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (signInError) {
        toast({
          title: 'Erro no Cadastro',
          description: signInError.message,
          variant: 'destructive',
        });
        return;
      }
      user = signInData.user;
    }
    if (!user) {
      toast({
        title: 'Erro no Cadastro',
        description: 'Não foi possível obter dados do usuário.',
        variant: 'destructive',
      });
      return;
    }
    // Inicia sessão de checkout no Stripe
    const checkoutRes = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: values.plan, userId: user.id, phone: values.phone }),
    });
    const checkoutData = await checkoutRes.json();
    if (checkoutData.url) {
      window.location.href = checkoutData.url;
    } else {
      toast({
        title: 'Erro no Pagamento',
        description: checkoutData.error || 'Não foi possível iniciar o pagamento.',
        variant: 'destructive',
      });
    }
  });
}

  return (
    <Card className="w-full max-w-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid gap-4 pt-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome completo" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="nome@exemplo.com" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone (WhatsApp)</FormLabel>
                  <FormControl>
                    <Input placeholder="+5511999999999" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="plan"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Plano</FormLabel>
                   <p className="text-sm text-muted-foreground">
                    Escolha um plano. Você pode alterar isso mais tarde.
                  </p>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      disabled={isPending}
                    >
                      <FormItem>
                         <Label
                          htmlFor="pessoal"
                          className="flex items-center justify-between rounded-md border-2 border-primary/50 bg-popover p-4 text-popover-foreground transition-colors hover:bg-gradient-to-r hover:from-primary hover:via-accent hover:to-secondary hover:text-white [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                           <FormControl>
                            <RadioGroupItem value="pessoal" id="pessoal" className="sr-only" />
                           </FormControl>
                          <div>
                            <div className="font-medium">Pessoal</div>
                            <div className="text-sm opacity-80">200 minutos</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">$9.90</div>
                            <div className="text-xs opacity-80">/mês</div>
                          </div>
                        </Label>
                      </FormItem>
                      <FormItem>
                         <Label
                          htmlFor="business"
                          className="flex items-center justify-between rounded-md border-2 border-primary/50 bg-popover p-4 text-popover-foreground transition-colors hover:bg-gradient-to-r hover:from-primary hover:via-accent hover:to-secondary hover:text-white [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <FormControl>
                            <RadioGroupItem value="business" id="business" className="sr-only" />
                          </FormControl>
                          <div>
                            <div className="font-medium">Business</div>
                            <div className="text-sm opacity-80">400 minutos</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">$14.90</div>
                            <div className="text-xs opacity-80">/mês</div>
                          </div>
                        </Label>
                      </FormItem>

                      <FormItem>
                        <Label
                          htmlFor="exclusivo"
                          className="flex items-center justify-between rounded-md border-2 border-primary/50 bg-popover p-4 text-popover-foreground transition-colors hover:bg-gradient-to-r hover:from-primary hover:via-accent hover:to-secondary hover:text-white [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <FormControl>
                            <RadioGroupItem value="exclusivo" id="exclusivo" className="sr-only" />
                          </FormControl>
                          <div>
                            <div className="font-medium">Exclusivo</div>
                            <div className="text-sm opacity-80">1000 minutos</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">$24.90</div>
                            <div className="text-xs opacity-80">/mês</div>
                          </div>
                        </Label>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cadastrar
            </Button>
            <div className="text-center text-sm">
              Já tem uma conta?{' '}
              <Link href="/login" className="underline hover:text-primary">
                Entrar
              </Link>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
