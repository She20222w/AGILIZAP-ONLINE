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
    service_type: z.enum(['transcribe', 'summarize', 'resumetranscribe', 'auto'], { required_error: "Por favor, selecione um tipo de serviço." }),
  });

type PlanType = 'pessoal' | 'business' | 'exclusivo';

export function SignupForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      plan: 'pessoal',
      service_type: 'auto',
    },
  });

function onSubmit(values: z.infer<typeof formSchema>) {
  startTransition(async () => {
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (!response.ok) {
        toast({
          title: 'Erro no Cadastro',
          description: data.error || 'Ocorreu um erro durante o cadastro.',
          variant: 'destructive',
        });
        return;
      }
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast({
          title: data.success ? 'Sucesso!' : 'Erro no Cadastro',
          description: data.success || data.error || 'Ocorreu um erro.',
          variant: data.success ? 'default' : 'destructive',
        });
        if (data.success) {
          router.push('/dashboard');
        }
      }
    } catch (error: any) {
      toast({
        title: 'Erro no Cadastro',
        description: 'Falha na comunicação com o servidor.',
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
              name="service_type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo de Serviço Padrão</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Qual serviço você usará com mais frequência?
                  </p>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-2 gap-4"
                      disabled={isPending}
                    >
                      <FormItem>
                        <Label
                          htmlFor="auto"
                          className="flex flex-col items-center justify-center rounded-md border-2 border-primary/50 bg-popover p-4 text-popover-foreground transition-colors hover:bg-gradient-to-r hover:from-primary hover:via-accent hover:to-secondary hover:text-white [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <FormControl>
                            <RadioGroupItem value="auto" id="auto" className="sr-only" />
                          </FormControl>
                          <div className="font-medium">Automático</div>
                        </Label>
                      </FormItem>
                      <FormItem>
                        <Label
                          htmlFor="transcribe"
                          className="flex flex-col items-center justify-center rounded-md border-2 border-primary/50 bg-popover p-4 text-popover-foreground transition-colors hover:bg-gradient-to-r hover:from-primary hover:via-accent hover:to-secondary hover:text-white [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <FormControl>
                            <RadioGroupItem value="transcribe" id="transcribe" className="sr-only" />
                          </FormControl>
                          <div className="font-medium">Transcrever</div>
                        </Label>
                      </FormItem>
                      <FormItem>
                        <Label
                          htmlFor="summarize"
                          className="flex flex-col items-center justify-center rounded-md border-2 border-primary/50 bg-popover p-4 text-popover-foreground transition-colors hover:bg-gradient-to-r hover:from-primary hover:via-accent hover:to-secondary hover:text-white [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <FormControl>
                            <RadioGroupItem value="summarize" id="summarize" className="sr-only" />
                          </FormControl>
                          <div className="font-medium">Resumir</div>
                        </Label>
                      </FormItem>
                    </RadioGroup>
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
          <div className="px-6">
            <h3 className="text-lg font-semibold">Todos os planos incluem:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Resumo dos áudios com IA</li>
              <li>Transcrição de áudios</li>
              <li>Modo inteligente para alternar entre resumo e transcrição</li>
            </ul>
          </div>
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
