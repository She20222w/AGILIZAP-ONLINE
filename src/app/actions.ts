'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createUser, updateUserStatus, getUserById, updateUser } from '@/services/user-service';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { redirect } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "A senha é obrigatória"),
});

const signupSchema = z.object({
    name: z.string().min(1, "O nome é obrigatório"),
    email: z.string().email(),
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
    phone: z.string().refine(phone => {
        try {
            const parsed = parsePhoneNumberFromString(phone);
            return !!parsed && parsed.isValid();
        } catch {
            return false;
        }
    }, "Número de telefone inválido. Use o formato internacional (ex: +5511999999999)."),
    plan: z.enum(['pessoal', 'business', 'exclusivo']),
});

export async function login(values: z.infer<typeof loginSchema>) {
    const validatedFields = loginSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Campos inválidos!" };
    }

    const { email, password } = validatedFields.data;
    const supabase = await createClient();

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('[Login Action Error]:', error); // Adicionado para depuração
            switch (error.message) {
                case 'Invalid login credentials':
                    return { error: "Email ou senha inválidos." };
                default:
                    return { error: "Ocorreu um erro inesperado. Por favor, tente novamente." };
            }
        }

        return { success: "Login bem-sucedido!" };
    } catch (error: any) {
        return { error: "Ocorreu um erro inesperado. Por favor, tente novamente." };
    }
}

export async function signup(values: z.infer<typeof signupSchema>) {
    const validatedFields = signupSchema.safeParse(values);

    if (!validatedFields.success) {
         const errors = validatedFields.error.flatten().fieldErrors;
        return { error: errors.phone?.[0] ?? "Campos inválidos!" };
    }

        const { name, email, password, phone, plan } = validatedFields.data;
    console.log('[DEBUG] signup data:', { email, password: '***', phone, plan });
    const supabase = await createClient();

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
            },
        });
        console.log('[DEBUG] supabase.auth.signUp result:', { data, error });
        console.log('[DEBUG] signup result data.user:', data.user);

        if (error) {
            switch (error.message) {
                case 'User already registered':
                    return { error: "Este email já está em uso." };
                case 'Password should be at least 6 characters':
                    return { error: "A senha deve ter pelo menos 6 caracteres." };
                default:
                    return { error: "Ocorreu um erro inesperado. Por favor, tente novamente." };
            }
        }

            if (data.user) {
                await createUser({ email, phone, plan, service_type: null, name, stripe_customer_id: null, last_payment_at: new Date().toISOString() }, data.user.id);
                console.log('[DEBUG] creating checkout session payload:', { plan, userId: data.user.id, phone });
                const checkoutResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/stripe/create-checkout-session`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ plan, userId: data.user.id, phone }),
                });
            const checkoutData = await checkoutResponse.json();
            console.log('[DEBUG] checkoutData:', checkoutData);
            if (checkoutData.url) {
                // Em vez de redirecionar no servidor, retornamos a URL para o cliente.
                return { checkoutUrl: checkoutData.url };
            } else {
                return { error: checkoutData.error || 'Não foi possível iniciar o pagamento.' };
            }
        }

        // Este retorno agora é para casos onde o data.user não existe, o que não deveria acontecer
        // se o signUp teve sucesso sem erro.
        return { error: "Não foi possível obter os dados do usuário após o cadastro." };
    } catch (error: any) {
        return { error: "Ocorreu um erro inesperado. Por favor, tente novamente." };
    }
}

export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
}

export async function generateQrCode(data: { serviceType: 'transcribe' | 'summarize' | 'resumetranscribe' | 'auto'; phoneNumber: string }) {
  console.log('Generating QR code for:', data);
  
  const isProduction = process.env.NODE_ENV === 'production';
  const webhookUrl = isProduction 
    ? process.env.NEXT_PUBLIC_QR_CODE_WEBHOOK_URL_PROD 
    : process.env.NEXT_PUBLIC_QR_CODE_WEBHOOK_URL_DEV;

  if (!webhookUrl) {
      const errorMessage = "A URL do webhook de QR Code não está configurada nas variáveis de ambiente.";
      console.error(errorMessage);
      return { success: false, error: errorMessage };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: data.phoneNumber,
        service: data.serviceType,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Webhook error response: ${response.status} ${response.statusText}`, errorBody);
      throw new Error(`O serviço de QR Code falhou: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.success === false) {
        return { success: false, error: 'Seu whatsapp já está conectado atualmente!' };
    }

    if (!result.qrCodeImageBase64) {
        throw new Error('A resposta do webhook não continha um QR Code.');
    }

    return { success: true, qrCode: `data:image/png;base64,${result.qrCodeImageBase64}` };

  } catch (error: any) {
    console.error('Failed to generate QR Code via webhook:', error);
    
    // Fallback mock QR code for development UI testing if the webhook fails
    const mockQrCode = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARIAAESFAQMAAABp6J22AAAABlBMVEX///8AAABVwtN+AAACUklEQVR42u2ZQXLDMAxEUZqA5EoiSaokSSYkKSAJSQIk6f5XWKnr45MXx/YszszO7M2tJ2M5sYszE+y3LzNlQ2bIhtylGzJDNmSH3soMWZMN2Q03ZIYsyYbcvRsyQzZkh9zJDlmSDRkht+CGLMkG3L0bMkM2ZIbcsQ0Zkm3YIbtjhizJhuwwQ5YkQ7Y/hmySDRlyzD5DkmQDRshttCGLZMNW2CHbZ0OWZMNW2CG7ZQsyZMNW2A7ZfRsyZMNW2CHbT4YsycY9sgO25xYk2YBNsX3bIbtzCzJkwz7JDtlzCzJkw2bIDhmyIVsyZMNW2CG7Y4YsycY9sgO23IYM2SAbMkNuyQ5Zkg0Zcl02ZIZsyA7ZIzZkhmyIDtkhGzJDNmQHbMkM2ZIdsmEHMmSHbMkMWZIN2SM2ZIZsyA7ZIRsyQzbkhmyIDtkhGzJDNmQHbMkM2ZIdsmEHMmSHbMkMWZIN2SM2ZIZsyA7ZIRsyQzbkhmyIDtkhGzJDNmQHbMkM2ZIdsmEHMmSHLMnW/wB/3AAB3oDBqEAAAAASUVORK5CYII=';
    return { 
        success: false, 
        error: `Falha ao conectar com o WhatsApp. Por favor, tente novamente mais tarde. (${error.message})`,
        qrCode: mockQrCode 
    };
  }
}

export async function getUserProfile(userId: string) {
    try {
        const user = await getUserById(userId);
        return { success: true, data: user };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateUserProfile(userId: string, updates: { plan?: 'pessoal' | 'business' | 'exclusivo', service_type?: 'transcribe' | 'summarize' | 'resumetranscribe' | 'auto' | null }) {
    try {
        await updateUser(userId, updates);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateUserStatusAction(userId: string, status: 'active' | 'inactive' | 'reseller') {
  try {
    await updateUserStatus(userId, status);
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao atualizar status do usuário:', error);
    return { success: false, error: error.message };
  }
}

// export function to cancel user account
export async function cancelUserAccount({ userId, phoneNumber }: { userId: string; phoneNumber: string; }) {
  try {
    await updateUserStatusAction(userId, 'inactive');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateUserMinutes(userId: string, minutes: number) {
  try {
    await updateUser(userId, { minutes_used: minutes });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Função não exportada para disparar o webhook
async function triggerCreateInstanceWebhook(phoneNumber: string) {
  const isProduction = process.env.NODE_ENV === 'production';
  const webhookUrl = isProduction
    ? process.env.CREATE_INSTANCE_WEBHOOK_URL_PROD
    : process.env.CREATE_INSTANCE_WEBHOOK_URL_DEV;

  if (!webhookUrl) {
    console.error("A URL do webhook para criar instância não está configurada.");
    return;
  }

  try {
    // Não esperamos a resposta, apenas disparamos a requisição (fire-and-forget)
    fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber }),
    });
    console.log(`Webhook para criar instância para o número ${phoneNumber} disparado.`);
  } catch (error) {
    // Mesmo que falhe, não queremos que isso bloqueie o fluxo do usuário.
    // Apenas registramos o erro no servidor.
    console.error(`Falha ao disparar o webhook para criar instância para o número ${phoneNumber}:`, error);
  }
}
