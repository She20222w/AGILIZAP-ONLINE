
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="flex h-16 items-center justify-between px-4 md:px-6 border-b border-border/40 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold"
        >
          <Zap className="h-6 w-6 text-primary" />
          <span className="font-headline font-bold">Agilizap</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
            Preços
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild className="font-bold">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild className="font-bold text-black text-base">
            <Link href="/signup">Comece Agora</Link>
          </Button>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-20 md:py-32 lg:py-40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary">
                Otimize seu tempo. Agilize suas conversas.
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl">
                Para profissionais que usam o WhatsApp para negócios, cada segundo conta. O Agilizap transforma longos áudios em textos claros ou resumos objetivos, permitindo que você responda clientes e tome decisões com a velocidade que seu negócio exige.
              </p>
              <Button size="lg" asChild className="font-bold text-black text-base">
                <Link href="/signup" className="flex items-center gap-2">
                  Experimente e Acelere seus Resultados <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-semibold">Conversas Ágeis no WhatsApp</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Projetado para Performance Profissional</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                Soluções para profissionais que constroem relacionamentos e precisam gerir sua comunicação para melhorar seus resultados.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-primary/50">
                <CardHeader>
                  <CardTitle>
                    <div className="inline-block bg-primary text-black font-bold py-2 px-4 rounded-md">
                        Velocidade e Decisão
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Ideal para vendedores e empresários. Receba resumos rápidos de áudios longos para tomar decisões imediatas e não perder oportunidades.</p>
                </CardContent>
              </Card>
              <Card className="border-primary/50">
                <CardHeader>
                   <CardTitle>
                     <div className="inline-block bg-primary text-black font-bold py-2 px-4 rounded-md">
                        Clareza e Precisão
                     </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Obtenha transcrições legíveis e precisas, superiores às do WhatsApp, perfeitas para advogados e lojistas que precisam de todos os detalhes registrados.</p>
                </CardContent>
              </Card>
              <Card className="border-primary/50">
                 <CardHeader>
                   <CardTitle>
                     <div className="inline-block bg-primary text-black font-bold py-2 px-4 rounded-md">
                       Relacionamento com Cliente
                     </div>
                   </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Fortaleça o relacionamento com seus clientes. Responda com agilidade e atenção, sem deixar que áudios longos se tornem um gargalo no seu atendimento.</p>
                </CardContent>
              </Card>
            </div>
            <div className="mt-12 flex justify-center">
                <Button asChild variant="outline">
                    <Link href="/pricing">Confira Nossos Planos</Link>
                </Button>
            </div>
          </div>
        </section>
        
        <section id="roadmap" className="w-full py-12 md:py-24 bg-muted/20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-semibold">Nossa Visão</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Construído por Profissionais, para Profissionais</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                  O Agilizap nasceu da nossa própria necessidade de otimizar a comunicação. Estamos comprometidos em evoluir constantemente, criando ferramentas que resolvem problemas reais.
              </p>
            </div>

            <div className="relative mx-auto max-w-5xl">
              {/* Desktop Timeline */}
              <div className="absolute left-1/2 top-0 hidden h-full w-px bg-border md:block -translate-x-1/2"></div>
              {/* Mobile Timeline */}
              <div className="absolute left-0 top-0 h-full w-px bg-border md:hidden ml-4"></div>

              <div className="grid grid-cols-1 gap-y-12">
                
                {/* Item 1 */}
                <div className="relative flex items-start md:items-center md:justify-center">
                  <div className="absolute left-0 top-0 md:left-1/2 md:-translate-x-1/2 mt-1 md:mt-0">
                    <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary ml-4 md:ml-0">
                    </div>
                  </div>
                  <Card className="w-full ml-16 md:w-2/5 md:ml-auto md:mr-12 border-accent/50">
                    <CardHeader>
                      <CardTitle>O Início: Nossa Necessidade</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">Como você, enfrentávamos o desafio de gerenciar longos áudios. O Agilizap foi a nossa primeira solução para transformar comunicação em resultados.</p>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Item 2 */}
                 <div className="relative flex items-start md:items-center md:justify-center">
                  <div className="absolute left-0 top-0 md:left-1/2 md:-translate-x-1/2 mt-1 md:mt-0">
                    <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary ml-4 md:ml-0">
                    </div>
                  </div>
                   <Card className="w-full ml-16 md:w-2/5 md:mr-auto md:ml-12 border-accent/50">
                    <CardHeader>
                      <CardTitle>Presente: Foco no Cliente</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">Aderindo como um dos primeiros clientes, você garante o preço atual e influencia diretamente no desenvolvimento de novas funcionalidades.</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Item 3 */}
                <div className="relative flex items-start md:items-center md:justify-center">
                  <div className="absolute left-0 top-0 md:left-1/2 md:-translate-x-1/2 mt-1 md:mt-0">
                     <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary ml-4 md:ml-0">
                    </div>
                  </div>
                  <Card className="w-full ml-16 md:w-2/5 md:ml-auto md:mr-12 border-accent/50">
                    <CardHeader>
                      <CardTitle>Futuro: Novas Soluções</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">O plano é expandir! Estamos desenvolvendo mais ferramentas para automatizar e otimizar outros gargalos do seu dia a dia profissional.</p>
                    </CardContent>
                  </Card>
                </div>

              </div>
            </div>
            
            <div className="flex flex-col items-center gap-4 mt-16">
              <Button size="lg" asChild className="font-bold text-black text-base">
                <Link href="/signup">Comece Agora</Link>
              </Button>
               <p className="text-sm text-center text-muted-foreground">
                Este é um produto desenvolvido pela Social IA onde a inteligência artificial aumenta o poder da produção humana.
              </p>
            </div>
          </div>
        </section>

      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-border/40">
        <p className="text-xs text-muted-foreground">&copy; 2025 Agilizap. Todos os direitos reservados.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Termos de Serviço
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacidade
          </Link>
        </nav>
      </footer>
    </div>
  );
}
