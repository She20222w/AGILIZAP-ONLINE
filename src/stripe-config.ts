export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'subscription' | 'payment';
  price: number;
  currency: string;
}

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'prod_SsJj4EqvhCtMo4',
    priceId: 'price_1RwZ6VLhqNLrDL71kC57xXvR',
    name: '200 minutos Agilyzap',
    description: '200 minutos Agilyzap',
    mode: 'subscription',
    price: 9.90,
    currency: 'USD'
  },
  {
    id: 'prod_SsJmW1vHTKCBU9',
    priceId: 'price_1RwZ8jLhqNLrDL713SLzYz4i',
    name: '400 minutos Agilyzap',
    description: '400 minutos Agilyzap',
    mode: 'subscription',
    price: 14.90,
    currency: 'USD'
  },
  {
    id: 'prod_SsJo0igysXMeko',
    priceId: 'price_1RwZAoLhqNLrDL7116BMcELR',
    name: '1000 minutos Agilyzap',
    description: '1000 minutos Agilyzap',
    mode: 'subscription',
    price: 24.90,
    currency: 'USD'
  }
];

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return STRIPE_PRODUCTS.find(product => product.priceId === priceId);
}

export function getProductByPlan(plan: 'pessoal' | 'business' | 'exclusivo'): StripeProduct | undefined {
  const planMapping = {
    'pessoal': 'price_1RwZ6VLhqNLrDL71kC57xXvR',
    'business': 'price_1RwZ8jLhqNLrDL713SLzYz4i',
    'exclusivo': 'price_1RwZAoLhqNLrDL7116BMcELR'
  };
  
  return getProductByPriceId(planMapping[plan]);
}