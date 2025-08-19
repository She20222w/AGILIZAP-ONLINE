-- 20250818145900_add_stripe_customer_id.sql

-- Adiciona a coluna stripe_customer_id na tabela users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- As políticas RLS existentes já permitem que cada usuário SELECT e UPDATE suas próprias colunas,
-- incluindo stripe_customer_id.
