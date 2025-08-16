import BackButton from '@/components/back-button';

export default function AuthCodeError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Erro na Autenticação</h1>
        <p className="text-muted-foreground mb-4">
          Houve um problema ao confirmar sua conta. Por favor, tente fazer login novamente.
        </p>
        <BackButton />
      </div>
    </div>
  )
}
