import { supabaseAdmin } from '@/lib/supabase-admin';
import type { Database } from '@/lib/supabase';

export type UserProfile = Database['public']['Tables']['users']['Row'] & {
  uid: string; // Alias for id to maintain compatibility
  stripe_customer_id?: string | null;
  name: string;
};

export async function createUser(user: Omit<UserProfile, 'id' | 'uid' | 'status' | 'created_at' | 'plan' | 'minutes_used' | 'service_type'> & { plan: 'pessoal' | 'business' | 'exclusivo', service_type: 'transcribe' | 'summarize' | 'resumetranscribe' | 'auto' | null, name: string }, uid: string) {
  // Check if there are any users already to determine if this should be the first admin
  const { data: existingUsers, error: countError } = await supabaseAdmin
    .from('users')
    .select('id')
    .limit(1);

  if (countError) {
    throw new Error(`Error checking existing users: ${countError.message}`);
  }

  let status: 'inactive' | 'reseller' = 'inactive';
  // If no users exist, the first one to sign up is the admin (reseller)
  if (!existingUsers || existingUsers.length === 0) {
    status = 'reseller';
  }

  const { data, error } = await supabaseAdmin
    .from('users')
      .insert({
      id: uid,
      email: user.email,
      phone: user.phone,
      name: user.name,
      plan: user.plan,
      minutes_used: 0,
      service_type: user.service_type,
      status,
      created_at: new Date().toISOString(),
      last_payment_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating user: ${error.message}`);
  }

  return data;
}

export async function getUserById(uid: string): Promise<UserProfile | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', uid)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // User not found
    }
    throw new Error(`Error fetching user: ${error.message}`);
  }

  return {
    ...data,
    uid: data.id, // Add uid alias for compatibility
  };
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching users: ${error.message}`);
  }

  return data.map(user => ({
    ...user,
    uid: user.id, // Add uid alias for compatibility
  }));
}

export async function updateUserStatus(uid: string, status: 'active' | 'inactive' | 'reseller') {
  const { error } = await supabaseAdmin
    .from('users')
    .update({ status })
    .eq('id', uid);

  if (error) {
    throw new Error(`Error updating user status: ${error.message}`);
  }
}

export async function updateUserPayment(uid: string) {
  const { error } = await supabaseAdmin
    .from('users')
    .update({ last_payment_at: new Date().toISOString() })
    .eq('id', uid);

  if (error) {
    throw new Error(`Error updating user payment: ${error.message}`);
  }
}

export async function updateUser(uid: string, updates: { plan?: 'pessoal' | 'business' | 'exclusivo', phone?: string, email?: string, minutes_used?: number, service_type?: 'transcribe' | 'summarize' | 'resumetranscribe' | 'auto' | null, name?: string }) {
  const { error } = await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('id', uid);

  if (error) {
    throw new Error(`Error updating user: ${error.message}`);
  }
}

export async function updateUserMinutes(uid: string, minutes: number) {
  const { error } = await supabaseAdmin
    .from('users')
    .update({ minutes_used: minutes })
    .eq('id', uid);

  if (error) {
    throw new Error(`Error updating user minutes: ${error.message}`);
  }
}
