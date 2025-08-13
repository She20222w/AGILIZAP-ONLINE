import { SignupForm } from '@/components/signup-form';
import { Zap } from 'lucide-react';

export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center justify-center gap-4 mb-8">
        <Zap className="h-12 w-12 text-primary" />
        <h1 className="text-3xl font-bold font-headline">Crie uma Conta</h1>
        <p className="text-muted-foreground">Junte-se ao Agilizap hoje.</p>
      </div>
      <SignupForm />
    </main>
  );
}
