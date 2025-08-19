import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from './supabase';

export function createSupabaseServerClient() {
  return createRouteHandlerClient<Database>({ cookies });
}
