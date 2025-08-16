-- 001_create_users.sql

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('transcribe', 'summarize', 'resumetranscribe')),
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'reseller')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_payment_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Política para admins (resellers) lerem todos os dados
CREATE POLICY "Resellers can read all data" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND status = 'reseller'
    )
  );

-- Política para admins (resellers) atualizarem todos os dados
CREATE POLICY "Resellers can update all data" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND status = 'reseller'
    )
  );
