import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY não está definida.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15'
});

/**
 * Mapeamento de planos para seus respectivos Price IDs no Stripe.
 * Preencha as variáveis de ambiente abaixo com os seus Price IDs de teste ou produção.
 */
export const PRICE_IDS: Record<'pessoal' | 'business' | 'exclusivo', string> = {
  pessoal: process.env.STRIPE_PRICE_PESSOAL || '',     // ex: 'price_1ABC...'
  business: process.env.STRIPE_PRICE_BUSINESS || '',   // ex: 'price_1DEF...'
  exclusivo: process.env.STRIPE_PRICE_EXCLUSIVO || ''  // ex: 'price_1GHI...'
};

export type PlanType = keyof typeof PRICE_IDS;
