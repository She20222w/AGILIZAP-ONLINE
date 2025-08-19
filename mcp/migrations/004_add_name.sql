-- 004_add_name.sql

-- Adicionar coluna name na tabela de usuários
ALTER TABLE public.users
ADD COLUMN name TEXT NOT NULL DEFAULT '';
