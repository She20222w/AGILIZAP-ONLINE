import { supabaseAdmin } from '@/lib/supabase-admin';
import type { Database } from '@/lib/supabase';

export type UserProfile = Database['public']['Tables']['users']['Row'] & {
  uid: string; // Alias for id to maintain compatibility
};

export async function createUser(user: Omit<UserProfile, 'id' | 'uid' | 'status' | 'created_at'>, uid: string) {
  // Check if there are any users already to determine if this should be the first admin
  const { data: existingUsers, error: countError } = await supabaseAdmin
    .from('users')
    .select('id')
    .limit(1);

  if (countError) {
    throw new Error(`Error checking existing users: ${countError.message}`);
  }

  let status: 'active' | 'reseller' = 'active';
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

export async function updateUser(uid: string, updates: Partial<Pick<UserProfile, 'service_type' | 'phone' | 'email'>>) {
  const updateData: any = {};
  
  if (updates.service_type) updateData.service_type = updates.service_type;
  if (updates.phone) updateData.phone = updates.phone;
  if (updates.email) updateData.email = updates.email;

  const { error } = await supabaseAdmin
    .from('users')
    .update(updateData)
    .eq('id', uid);

  if (error) {
    throw new Error(`Error updating user: ${error.message}`);
  }
}
