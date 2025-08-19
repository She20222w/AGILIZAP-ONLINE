export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          created_at: string | null;
          email: string;
          id: string;
          last_payment_at: string | null;
          stripe_customer_id: string | null;
          minutes_used: number;
          phone: string;
          plan: 'pessoal' | 'business' | 'exclusivo';
          service_type: 'transcribe' | 'summarize' | 'resumetranscribe' | 'auto' | null;
          status: string;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          id: string;
          last_payment_at?: string | null;
          stripe_customer_id?: string | null;
          minutes_used?: number;
          phone: string;
          plan: 'pessoal' | 'business' | 'exclusivo';
          service_type?: 'transcribe' | 'summarize' | 'resumetranscribe' | 'auto' | null;
          status?: string;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          id?: string;
          last_payment_at?: string | null;
          stripe_customer_id?: string | null;
          minutes_used?: number;
          phone?: string;
          plan?: 'pessoal' | 'business' | 'exclusivo';
          service_type?: 'transcribe' | 'summarize' | 'resumetranscribe' | 'auto' | null;
          status?: string;
        };
        Relationships: [];
      };
      // ...other tables, views, functions, enums, composite types...
    };
  };
};
