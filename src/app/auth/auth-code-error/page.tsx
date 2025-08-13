export default function AuthCodeError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Erro na Autenticação</h1>
        <p className="text-muted-foreground mb-4">
          Houve um problema ao confirmar sua conta. Por favor, tente fazer login novamente.
        </p>
        <a 
          href="/login" 
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Voltar ao Login
        </a>
      </div>
    </div>
  )
}