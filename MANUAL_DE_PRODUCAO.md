# Guia de Implantação em Produção (Vercel)

## Visão Geral

Este documento fornece as instruções passo a passo para implantar a aplicação Agilizap em um ambiente de produção utilizando a Vercel.

O projeto foi desenhado para ser **autoconfigurável**. A única ação manual necessária é a configuração das variáveis de ambiente para os webhooks no painel da Vercel. Não é preciso interagir com o console do Firebase ou realizar configurações complexas.

---

## Passo 1: Deploy do Projeto na Vercel

1.  **Conecte seu Repositório Git:**
    *   Acesse sua conta na [Vercel](https://vercel.com).
    *   No seu dashboard, clique em "Add New..." e selecione "Project".
    *   Importe o repositório Git onde o código da aplicação está hospedado (GitHub, GitLab, etc.).

2.  **Configuração do Projeto:**
    *   A Vercel detectará automaticamente que é um projeto Next.js e preencherá as configurações de build (`next build`) e o diretório de output. **Nenhuma alteração é necessária aqui.**
    *   Antes de clicar em "Deploy", expanda a seção "Environment Variables".

---

## Passo 2: Configuração das Variáveis de Ambiente

Nesta seção, você irá configurar as URLs dos seus webhooks. Estes são os endpoints do seu robô de WhatsApp que a aplicação irá chamar.

**Copie os nomes das variáveis abaixo e cole-os na seção "Environment Variables" da Vercel, adicionando os valores (URLs) correspondentes aos seus serviços de produção.**

```dotenv
# -------------------------------------------------------------------------
# Variáveis OBRIGATÓRIAS para Produção
# -------------------------------------------------------------------------

# Para Geração de QR Code
# A Vercel usará esta URL quando um usuário gerar um QR Code.
NEXT_PUBLIC_QR_CODE_WEBHOOK_URL_PROD=https://seu-endpoint-de-producao.com/gerar-qr

# Para Cancelamento de Instância
# A Vercel usará esta URL quando um admin cancelar uma conta.
NEXT_PUBLIC_CANCEL_INSTANCE_WEBHOOK_URL_PROD=https://seu-endpoint-de-producao.com/cancelar-instancia

# -------------------------------------------------------------------------
# Variáveis opcionais para Desenvolvimento Local (se necessário)
# -------------------------------------------------------------------------

# Use um serviço como ngrok ou a URL de desenvolvimento para testes locais.
# Estas variáveis NÃO são usadas pela Vercel.
NEXT_PUBLIC_QR_CODE_WEBHOOK_URL_DEV=http://localhost:3000/api/mock/generate-qr
NEXT_PUBLIC_CANCEL_INSTANCE_WEBHOOK_URL_DEV=http://localhost:3000/api/mock/cancel-instance
```

**Após adicionar as variáveis, clique em "Deploy".** A Vercel iniciará o processo de build e implantação da sua aplicação.

---

## Passo 3: Configuração do Administrador (Automática)

O sistema foi projetado para ser autogerenciável.

**O primeiro usuário a se cadastrar na aplicação implantada será automaticamente definido como o administrador (status `reseller`).**

1.  **Acesse a Aplicação:** Após o deploy, acesse a URL da sua aplicação fornecida pela Vercel.
2.  **Crie sua Conta:** Navegue até a página de cadastro (`/signup`) e crie a primeira conta. **Esta conta terá privilégios de administrador.**
3.  **Acesse o Painel de Admin:** Para gerenciar os usuários, acesse diretamente a rota `/admin` (ex: `https://sua-app.vercel.app/admin`). O link não é visível na interface para usuários comuns.

---

## Resumo do Fluxo

1.  **Deploy:** Conecte o repositório à Vercel.
2.  **Configure:** Adicione as duas variáveis `_PROD` no painel da Vercel.
3.  **Cadastre-se:** Crie a primeira conta para se tornar o administrador.
4.  **Pronto!** Sua aplicação está em produção e funcionando.
