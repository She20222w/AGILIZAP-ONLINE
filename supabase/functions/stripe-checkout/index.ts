import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);
const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripe = new Stripe(stripeSecret, {
  apiVersion: '2025-07-30.basil',
  appInfo: { name: 'AgilyZap', version: '1.0.0' },
});

// Helper function to create responses with CORS headers
function corsResponse(body: string | object | null, status = 200) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };
  if (status === 204) {
    return new Response(null, { status, headers });
  }
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return corsResponse({}, 204);
    }
    if (req.method !== 'POST') {
      return corsResponse({ error: 'Method not allowed' }, 405);
    }

    const { price_id, success_url, cancel_url, mode, userId, phone } = await req.json();

    const error = validateParameters(
      { price_id, success_url, cancel_url, mode, userId, phone },
      {
        price_id: 'string',
        success_url: 'string',
        cancel_url: 'string',
        mode: { values: ['payment', 'subscription'] },
        userId: 'string',
        phone: 'string',
      }
    );
    if (error) {
      return corsResponse({ error }, 400);
    }

    // Fetch user email from users table
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .maybeSingle();
    if (userError || !userRecord?.email) {
      return corsResponse({ error: 'Usuário não encontrado.' }, 404);
    }
    const userEmail = userRecord.email;

    // Fetch or create stripe customer
    const { data: customer, error: getCustomerError } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .maybeSingle();
    if (getCustomerError) {
      return corsResponse({ error: 'Failed to fetch customer information' }, 500);
    }

    let customerId = customer?.customer_id;

    if (!customerId) {
      const newCustomer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId },
      });
      customerId = newCustomer.id;
      await supabase
        .from('stripe_customers')
        .insert({ user_id: userId, customer_id: customerId });
      if (mode === 'subscription') {
        await supabase.from('stripe_subscriptions').insert({
          customer_id: customerId,
          status: 'not_started',
        });
      }
    } else if (mode === 'subscription') {
      const { data: subscription } = await supabase
        .from('stripe_subscriptions')
        .select('status')
        .eq('customer_id', customerId)
        .maybeSingle();
      if (!subscription) {
        await supabase.from('stripe_subscriptions').insert({
          customer_id: customerId,
          status: 'not_started',
        });
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: price_id, quantity: 1 }],
      mode,
      success_url,
      cancel_url,
    });

    return corsResponse({ sessionId: session.id, url: session.url });
  } catch (err: any) {
    return corsResponse({ error: err.message }, 500);
  }
});

type ExpectedType = 'string' | { values: string[] };
type Expectations<T> = { [K in keyof T]: ExpectedType };
function validateParameters<T extends Record<string, any>>(
  values: T,
  expected: Expectations<T>
): string | undefined {
  for (const [key, expectation] of Object.entries(expected)) {
    const value = (values as any)[key];
    if (expectation === 'string') {
      if (typeof value !== 'string') {
        return `Expected parameter ${key} to be a string`;
      }
    } else {
      if (!expectation.values.includes(value)) {
        return `Expected parameter ${key} to be one of ${expectation.values.join(', ')}`;
      }
    }
  }
  return undefined;
}
