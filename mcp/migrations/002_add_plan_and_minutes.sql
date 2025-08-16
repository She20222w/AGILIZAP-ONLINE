-- 002_add_plan_and_minutes.sql

-- Remover constraint antiga sobre service_type
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_service_type_check;

-- Renomear coluna service_type para plan
ALTER TABLE public.users RENAME COLUMN service_type TO plan;

-- Atualizar valores antigos de plan para padrão 'pessoal'
UPDATE public.users
SET plan = 'pessoal'
WHERE plan NOT IN ('pessoal','business','exclusivo');

-- Remover constraint antiga e adicionar nova para os planos
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_service_type_check;
ALTER TABLE public.users ADD CONSTRAINT users_plan_check CHECK (plan IN ('pessoal','business','exclusivo'));

-- Adicionar coluna de consumo de minutos
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS minutes_used INTEGER NOT NULL DEFAULT 0;
