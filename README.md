# Agilizap SaaS - Guia de Produção

Bem-vindo ao Agilizap! Este documento é o seu guia completo para configurar e implantar a aplicação em um ambiente de produção.

O projeto utiliza Supabase como backend (autenticação e banco de dados) e foi estruturado para exigir o mínimo de configuração manual.

## Tabela de Conteúdos

1.  [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
2.  [Configuração do Supabase](#configuração-do-supabase)
3.  [Passos para Produção](#passos-para-produção)
    1.  [Configuração de Variáveis de Ambiente](#1-configuração-de-variáveis-de-ambiente)
    2.  [Cadastro do Administrador](#2-cadastro-do-administrador-automático)
3.  [Acesso ao Painel de Administração](#acesso-ao-painel-de-administração)
4.  [Integração de Webhooks](#integração-de-webhooks)
    - [Ambientes de Desenvolvimento e Produção](#ambientes-de-desenvolvimento-e-produção)
    - [Geração de QR Code](#geração-de-qr-code)
    - [Cancelamento de Instância](#cancelamento-de-instância)
5.  [Estrutura do Projeto](#estrutura-do-projeto)
6.  [Scripts Disponíveis](#scripts-disponíveis)

---

## Visão Geral da Arquitetura

O Agilizap é um SaaS construído com Next.js, Supabase e Genkit. Ele utiliza a autenticação e o banco de dados do Supabase para gerenciar usuários e suas preferências. A lógica de negócio principal, que envolve a comunicação com seu robô de WhatsApp, é gerenciada por meio de webhooks.

---

## Configuração do Supabase

Antes de implantar, você precisa configurar um projeto no Supabase:

1. **Crie uma conta no [Supabase](https://supabase.com)**
2. **Crie um novo projeto**
3. **Configure o banco de dados** executando o seguinte SQL no SQL Editor:

```sql
-- Criar tabela de usuários
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('transcribe', 'summarize')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'reseller')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_payment_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Política para admins (resellers) lerem todos os dados
CREATE POLICY "Resellers can read all data" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND status = 'reseller'
    )
  );

-- Política para admins (resellers) atualizarem todos os dados
CREATE POLICY "Resellers can update all data" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND status = 'reseller'
    )
  );
```

4. **Obtenha as credenciais** na seção Settings > API do seu projeto Supabase

---

## Passos para Produção

Para implantar este projeto, você precisa seguir os passos abaixo.

### 1. Configuração de Variáveis de Ambiente

Configure as seguintes variáveis de ambiente no seu provedor de hospedagem:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico_do_supabase

# Webhook URLs for QR Code Generation
NEXT_PUBLIC_QR_CODE_WEBHOOK_URL_DEV=https://automation.thisispec.lat/webhook-test/qr-agilizap
NEXT_PUBLIC_QR_CODE_WEBHOOK_URL_PROD=https://automation.thisispec.lat/webhook/qr-agilizap

# Webhook URLs for Account Cancellation
NEXT_PUBLIC_CANCEL_INSTANCE_WEBHOOK_URL_DEV=https://automation.thisispec.lat/webhook-test/agilizap-cancelar
NEXT_PUBLIC_CANCEL_INSTANCE_WEBHOOK_URL_PROD=https://automation.thisispec.lat/webhook/agilizap-cancelar

# WhatsApp Admin Link
NEXT_PUBLIC_WHATSAPP_ADMIN_LINK=https://wa.me/5599981788458

# Site URL (para callbacks de autenticação)
NEXT_PUBLIC_SITE_URL=https://seu-dominio.com
```

### 2. Cadastro do Administrador (Automático)

O sistema foi projetado para ser autoconfigurável. Não é necessário definir manualmente um ID de administrador.

**O primeiro usuário a se cadastrar na aplicação será automaticamente definido como o administrador (status `reseller`).**

**Credenciais do primeiro administrador:**
- Email: socialia@gmail.com
- Senha: social123#@!IA

Após o deploy, use essas credenciais para fazer login e você terá acesso ao painel de administração.

---

## Acesso ao Painel de Administração

O painel de administração é uma área restrita para gerenciamento de usuários.

-   **URL de Acesso:** O painel não possui um link de navegação visível na interface. Para acessá-lo, navegue diretamente para a rota `/admin` (ex: `https://seusite.com/admin`).
-   **Autenticação:** O acesso é concedido apenas ao usuário administrador (o primeiro que se cadastrou). Qualquer outra tentativa de acesso resultará em um redirecionamento para o dashboard do usuário.

---

## Integração de Webhooks

A aplicação se comunica com seu serviço de robô de WhatsApp através de webhooks.

### Ambientes de Desenvolvimento e Produção

A lógica da aplicação diferencia automaticamente entre URLs de desenvolvimento e produção com base no ambiente `NODE_ENV`. Ao executar localmente (`npm run dev`), as URLs `_DEV` serão usadas. Na Vercel, as URLs `_PROD` serão usadas automaticamente.

### Geração de QR Code

-   **Ação:** Quando um usuário clica em "Gerar QR Code" no dashboard.
-   **Endpoint Chamado:** 
    - Desenvolvimento: `https://automation.thisispec.lat/webhook-test/qr-agilizap`
    - Produção: `https://automation.thisispec.lat/webhook/qr-agilizap`
-   **Payload Enviado (POST):**
    ```json
    {
      "phoneNumber": "+5511999999999",
      "service": "transcribe" // ou "summarize"
    }
    ```
-   **Resposta Esperada:**
    -   `200 OK` com um corpo JSON contendo a string do QR Code em Base64.
        ```json
        {
          "qrCode": "iVBORw0KGgoAAAANSUhEUg..."
        }
        ```

### Cancelamento de Instância

-   **Ação:** Quando um administrador clica em "Cancelar Conta" no painel de admin.
-   **Endpoint Chamado:**
    - Desenvolvimento: `https://automation.thisispec.lat/webhook-test/agilizap-cancelar`
    - Produção: `https://automation.thisispec.lat/webhook/agilizap-cancelar`
-   **Payload Enviado (POST):**
    ```json
    {
      "phoneNumber": "+5511999999999"
    }
    ```
-   **Resposta Esperada:**
    -   `200 OK` para confirmar que a instância foi desativada. Após a confirmação, o status do usuário no Supabase será definido como `inactive`.

---

## Estrutura do Projeto

```
/src
├── app/                  # Rotas do Next.js App Router (páginas e layouts)
│   ├── (main)/           # Grupo de rotas para páginas públicas (home, pricing)
│   ├── admin/            # Página e layout do painel de admin
│   ├── dashboard/        # Página e layout do dashboard do usuário
│   ├── login/            # Página de login
│   ├── signup/           # Página de cadastro
│   └── actions.ts        # Server Actions (login, signup, chamadas de webhook)
│
├── components/           # Componentes React reutilizáveis
│   ├── ui/               # Componentes ShadCN UI (Button, Card, etc.)
│   ├── admin-client.tsx  # Lógica do lado do cliente para o painel de admin
│   └── ...               # Outros componentes (formulários, header, etc.)
│
├── ai/                   # Lógica de Inteligência Artificial com Genkit
│   ├── flows/            # Definições de fluxos do Genkit (transcrição, resumo)
│   └── genkit.ts         # Configuração e inicialização do Genkit
│
├── lib/                  # Utilitários e configurações
│   ├── supabase.ts       # Configuração do Supabase
│   └── utils.ts          # Funções utilitárias (ex: cn para classnames)
│
└── services/             # Funções para interagir com serviços externos
    └── user-service.ts   # CRUD de usuários no Supabase
```

---

## Scripts Disponíveis

No `package.json`, você encontrará os seguintes scripts:

-   `npm run dev`: Inicia o servidor de desenvolvimento do Next.js.
-   `npm run build`: Compila a aplicação para produção (usado pela Vercel).
-   `npm run start`: Inicia um servidor de produção (após o build).
-   `npm run lint`: Executa o linter para verificar a qualidade do código.