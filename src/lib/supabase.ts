import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'


// This client is safe to use in client-side and server-side components.
export const createSupabaseClient = () => createClientComponentClient()


export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          phone: string
          service_type: 'transcribe' | 'summarize'
          status: 'active' | 'inactive' | 'reseller'
          created_at: string
          last_payment_at: string
        }
        Insert: {
          id: string
          email: string
          phone: string
          service_type: 'transcribe' | 'summarize'
          status?: 'active' | 'inactive' | 'reseller'
          created_at?: string
          last_payment_at?: string
        }
        Update: {
          id?: string
          email?: string
          phone?: string
          service_type?: 'transcribe' | 'summarize'
          status?: 'active' | 'inactive' | 'reseller'
          created_at?: string
          last_payment_at?: string
        }
      }
    }
  }
}
