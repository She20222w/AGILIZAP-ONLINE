# Documentação Completa do Projeto Agilizap

## Visão Geral do Projeto

O Agilizap é uma aplicação SaaS construída com Next.js, Supabase e Genkit, que oferece funcionalidades de transcrição, resumo e automação de áudio via integração com um robô de WhatsApp. A aplicação utiliza Supabase para autenticação e banco de dados, e Stripe para gerenciamento de pagamentos.

---

## Arquitetura

- Frontend: Next.js com React, utilizando o App Router e componentes ShadCN UI.
- Backend: Supabase para autenticação, banco de dados e políticas de segurança.
- Integrações: Stripe para pagamentos, webhooks para comunicação com o robô de WhatsApp.
- IA: Genkit para fluxos de inteligência artificial (transcrição, resumo, automação).

---

## Banco de Dados

### Estrutura da Tabela `users`

- `id`: UUID, chave primária, referência à tabela `auth.users`.
- `email`: Texto, email do usuário.
- `phone`: Texto, telefone do usuário.
- `plan`: Texto, tipo de plano do usuário (`pessoal`, `business`, `exclusivo`).
- `service_type`: Texto, tipo de serviço (`transcribe`, `summarize`, `resumetranscribe`, `auto`).
- `status`: Texto, status do usuário (`active`, `inactive`, `reseller`).
- `minutes_used`: Inteiro, minutos consumidos pelo usuário.
- `created_at`: Timestamp, data de criação.
- `last_payment_at`: Timestamp, data do último pagamento.

### Políticas de Segurança

- RLS habilitado para garantir que usuários só acessem seus próprios dados.
- Administradores (`reseller`) podem ler e atualizar todos os dados.

---

## Componentes Principais do Frontend

### Formulário de Login (`src/components/login-form.tsx`)

- Validação de email e senha com Zod.
- Integração com Supabase para autenticação.
- Feedback visual com toasts para sucesso e erro.
- Redirecionamento para dashboard após login bem-sucedido.

---

## Rotas e APIs

### Webhook Stripe (`src/app/api/stripe/webhook/route.ts`)

- Recebe eventos do Stripe via webhook.
- Encaminha o webhook para uma função edge do Supabase para processamento.
- Valida a assinatura do webhook para segurança.
- Retorna status de sucesso ou erro conforme o processamento.

---

## Implantação

### Guia de Implantação (Vercel)

- Projeto autoconfigurável, com configuração manual apenas das variáveis de ambiente para webhooks.
- Primeiro usuário cadastrado é automaticamente administrador.
- Variáveis de ambiente para URLs de webhooks de QR Code e cancelamento de instância.
- Fluxo de deploy detalhado no arquivo `MANUAL_DE_PRODUCAO.md`.

---

## Fluxos de Trabalho

- Cadastro e autenticação de usuários.
- Geração de QR Code via webhook.
- Cancelamento de instância via webhook.
- Gerenciamento de planos e minutos consumidos.
- Processamento de pagamentos via Stripe.

---

## Scripts Disponíveis

- `npm run dev`: Inicia servidor de desenvolvimento.
- `npm run build`: Compila para produção.
- `npm run start`: Inicia servidor de produção.
- `npm run lint`: Verifica qualidade do código.

---

## Estrutura de Diretórios

```
/src
├── app/                  # Rotas e páginas Next.js
├── components/           # Componentes React reutilizáveis
├── ai/                   # Fluxos de IA com Genkit
├── lib/                  # Utilitários e configurações
└── services/             # Serviços externos e lógica de negócio
```

---

## Próximos Passos para Atualização da Documentação

- Documentar detalhadamente os componentes React restantes.
- Documentar todas as rotas e APIs.
- Documentar fluxos de IA e integrações.
- Atualizar o MANUAL_DE_PRODUCAO.md com links para esta documentação detalhada.
