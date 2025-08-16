
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
import { signup } from '@/app/actions';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, MessageSquareText, FileText } from 'lucide-react';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { createSupabaseClient } from '@/lib/supabase';


  const formSchema = z.object({
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
      email: '',
      password: '',
      phone: '',
      plan: 'pessoal',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = await signup(values);
      if (result.success) {
        toast({
          title: 'Conta Criada',
          description: result.success,
        });
        router.push('/dashboard');
      } else if (result.error) {
        toast({
          title: 'Erro no Cadastro',
          description: result.error,
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
                          className="flex flex-col items-center justify-between rounded-md border-2 border-primary/50 bg-popover p-4 text-popover-foreground transition-colors hover:bg-gradient-to-r hover:from-primary hover:via-accent hover:to-secondary hover:text-white [&:has([data-state=checked])]:border-primary"
                        >
                           <FormControl>
                            <RadioGroupItem value="pessoal" id="pessoal" className="sr-only" />
                           </FormControl>
                          <MessageSquareText className="mb-3 h-6 w-6" />
                          Pessoal – R$9,90 – 200 min
                        </Label>
                      </FormItem>
                      <FormItem>
                         <Label
                          htmlFor="business"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-primary/50 bg-popover p-4 text-popover-foreground transition-colors hover:bg-gradient-to-r hover:from-primary hover:via-accent hover:to-secondary hover:text-white [&:has([data-state=checked])]:border-primary"
                        >
                          <FormControl>
                            <RadioGroupItem value="business" id="business" className="sr-only" />
                          </FormControl>
                          <FileText className="mb-3 h-6 w-6" />
                          Business – R$14,99 – 400 min
                        </Label>
                      </FormItem>

                      <FormItem>
                        <Label
                          htmlFor="exclusivo"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-primary/50 bg-popover p-4 text-popover-foreground transition-colors hover:bg-gradient-to-r hover:from-primary hover:via-accent hover:to-secondary hover:text-white [&:has([data-state=checked])]:border-primary"
                        >
                          <FormControl>
                            <RadioGroupItem value="exclusivo" id="exclusivo" className="sr-only" />
                          </FormControl>
                          <div className="mb-3 flex gap-1">
                            <MessageSquareText className="h-6 w-6" />
                            <FileText className="h-6 w-6" />
                          </div>
                          Exclusivo – R$24,99 – 1000 min
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
