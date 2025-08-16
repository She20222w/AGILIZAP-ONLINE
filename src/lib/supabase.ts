import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          last_payment_at: string | null
          minutes_used: number
          phone: string
          plan: 'pessoal' | 'business' | 'exclusivo'
          service_type: 'transcribe' | 'summarize' | 'resumetranscribe' | 'auto' | null
          status: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          last_payment_at?: string | null
          minutes_used?: number
          phone: string
          plan: 'pessoal' | 'business' | 'exclusivo'
          service_type?: 'transcribe' | 'summarize' | 'resumetranscribe' | 'auto' | null
          status?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          last_payment_at?: string | null
          minutes_used?: number
          phone?: string
          plan?: 'pessoal' | 'business' | 'exclusivo'
          service_type?: 'transcribe' | 'summarize' | 'resumetranscribe' | 'auto' | null
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export function createSupabaseClient() {
    return createPagesBrowserClient<Database>();
}
