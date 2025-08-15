
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function PricingPage() {
    const [currency, setCurrency] = useState<'USD' | 'BRL'>('USD');
    const prices = { pessoal: 9.90, business: 14.99, exclusivo: 24.99 };
    const conversionRate = 6;
    const formatPrice = (amount: number) => {
        const value = currency === 'BRL' ? amount * conversionRate : amount;
        return new Intl.NumberFormat(
            currency === 'USD' ? 'en-US' : 'pt-BR',
            { style: 'currency', currency: currency === 'USD' ? 'USD' : 'BRL' }
        ).format(value);
    };
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
             <header className="flex h-16 items-center justify-between px-4 md:px-6 border-b border-border/40">
                 <Link
                    href="/"
                    className="flex items-center gap-2 text-lg font-semibold"
                    >
                    <Zap className="h-6 w-6 text-primary" />
                    <span className="font-headline font-bold">Agilizap</span>
                </Link>
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link href="/#features" className="text-muted-foreground hover:text-foreground">
                        Funcionalidades
                    </Link>
                    <Link href="/pricing" className="text-foreground font-semibold">
                        Preços
                    </Link>
                </nav>
                 <div className="flex items-center gap-4">
                    <Button variant="outline" asChild>
                        <Link href="/login">Entrar</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/signup">Cadastre-se</Link>
                    </Button>
                </div>
            </header>
            <main className="flex-1">
                <section className="w-full py-12 md:py-24 lg:py-32">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center space-y-4 text-center">
                            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Preços Flexíveis para Todos</h1>
                            <p className="max-w-[600px] text-muted-foreground md:text-xl">
                                Escolha o plano ideal para você. Cancele a qualquer momento.
                            </p>
            </div>
            <div className="flex justify-center mb-8">
                <div className="inline-flex rounded-md shadow-sm" role="group">
                    <button
                        type="button"
                        onClick={() => setCurrency('USD')}
                        className={`px-4 py-2 text-sm font-medium border border-border ${currency === 'USD' ? 'bg-primary text-white' : 'bg-background text-foreground'}`}
                    >
                        Dólar (USD)
                    </button>
                    <button
                        type="button"
                        onClick={() => setCurrency('BRL')}
                        className={`px-4 py-2 text-sm font-medium border border-border ${currency === 'BRL' ? 'bg-primary text-white' : 'bg-background text-foreground'}`}
                    >
                        Real (BRL)
                    </button>
                </div>
            </div>
            {currency === 'BRL' && (
                <p className="text-center text-sm text-muted-foreground mb-4">
                    Simulação com base em 1 Dólar = 6 Reais
                </p>
            )}
            <div className="mx-auto grid max-w-sm gap-8 pt-12 sm:max-w-4xl sm:grid-cols-2 lg:max-w-5xl lg:grid-cols-3">
                            <Card className="flex flex-col border-border/50 hover:border-accent/50 transition-colors">
                                <CardHeader>
                                    <CardTitle>Pessoal</CardTitle>
                                    <CardDescription>Para usuários individuais que desejam economizar tempo.</CardDescription>
                                    <div>
                                        <span className="text-4xl font-bold">{formatPrice(prices.pessoal)}</span>
                                        <span className="text-muted-foreground">/mês</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    <div className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-primary" />
                                        <span>200 minutos de transcrição de audio por mês</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-primary" />
                                        <span>Resumo dos audios com IA</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="mt-auto">
                                    <Button className="w-full" asChild>
                                        <Link href="/signup">Escolher Plano</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                            <Card className="flex flex-col border-primary shadow-lg shadow-primary/20">
                                 <CardHeader>
                                    <CardTitle>Business</CardTitle>
                                    <CardDescription>Para pequenas equipes e profissionais.</CardDescription>
                                    <div>
                                        <span className="text-4xl font-bold">{formatPrice(prices.business)}</span>
                                        <span className="text-muted-foreground">/mês</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    <div className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-primary" />
                                        <span>400 minutos de transcrição de audio por mês</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-primary" />
                                        <span>Resumo dos audios com IA</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="mt-auto">
                                    <Button className="w-full" asChild>
                                        <Link href="/signup">Escolher Plano</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                            <Card className="flex flex-col border-border/50 hover:border-accent/50 transition-colors">
                                 <CardHeader>
                                    <CardTitle>Exclusivo</CardTitle>
                                    <CardDescription>Para agências e empreendedores que desejam oferecer este serviço aos seus clientes.</CardDescription>
                                     <div>
                                        <span className="text-4xl font-bold">{formatPrice(prices.exclusivo)}</span>
                                        <span className="text-muted-foreground">/mês</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    <div className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-primary" />
                                        <span>1000 minutos de transcrição de audio por mês</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-primary" />
                                        <span>Resumo dos audios com IA</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="mt-auto">
                                    <Button className="w-full" variant="outline" asChild>
                                        <Link href="/contact">Entre em Contato</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
