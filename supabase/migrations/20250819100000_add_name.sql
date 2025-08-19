-- Adiciona coluna name na tabela users para armazenar o nome do usuário
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '';
