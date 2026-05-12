export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'manager' | 'user'
          organization_id: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'manager' | 'user'
          organization_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'manager' | 'user'
          organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          }
        ]
      }
      tap_events: {
        Row: {
          id: string
          created_at: string
          stand_id: string | null
          language: string | null
          device_type: string | null
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          stand_id?: string | null
          language?: string | null
          device_type?: string | null
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          stand_id?: string | null
          language?: string | null
          device_type?: string | null
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      nfc_stands: {
        Row: {
          id: string
          created_at: string
          name: string | null
          landing_page_url: string
          user_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name?: string | null
          landing_page_url: string
          user_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string | null
          landing_page_url?: string
          user_id?: string | null
        }
        Relationships: []
      }
      menu_item_views: {
        Row: {
          id: string
          created_at: string
          stand_id: string | null
          item_id: string | null
          item_name: string | null
          client_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          stand_id?: string | null
          item_id?: string | null
          item_name?: string | null
          client_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          stand_id?: string | null
          item_id?: string | null
          item_name?: string | null
          client_id?: string | null
        }
        Relationships: []
      }
      button_clicks: {
        Row: {
          id: string
          created_at: string
          stand_id: string | null
          button_type: string | null
          client_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          stand_id?: string | null
          button_type?: string | null
          client_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          stand_id?: string | null
          button_type?: string | null
          client_id?: string | null
        }
        Relationships: []
      }
      client_pages: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          slug: string | null
          restaurant_name: string | null
          tagline: string | null
          hero_bg: string | null
          logo_url: string | null
          google_review_url: string | null
          instagram_url: string | null
          facebook_url: string | null
          tiktok_url: string | null
          whatsapp_number: string | null
          menu_sections: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          slug?: string | null
          restaurant_name?: string | null
          tagline?: string | null
          hero_bg?: string | null
          logo_url?: string | null
          google_review_url?: string | null
          instagram_url?: string | null
          facebook_url?: string | null
          tiktok_url?: string | null
          whatsapp_number?: string | null
          menu_sections?: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          slug?: string | null
          restaurant_name?: string | null
          tagline?: string | null
          hero_bg?: string | null
          logo_url?: string | null
          google_review_url?: string | null
          instagram_url?: string | null
          facebook_url?: string | null
          tiktok_url?: string | null
          whatsapp_number?: string | null
          menu_sections?: Json
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          created_at: string
          status: string | null
          plan: string | null
          next_billing_date: string | null
          user_id: string | null
          amount: number | null
        }
        Insert: { id?: string; created_at?: string; status?: string | null; plan?: string | null; next_billing_date?: string | null; user_id?: string | null; amount?: number | null }
        Update: { id?: string; created_at?: string; status?: string | null; plan?: string | null; next_billing_date?: string | null; user_id?: string | null; amount?: number | null }
        Relationships: []
      }
      organizations: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          slug: string
          logo_url: string | null
          plan: 'free' | 'pro' | 'enterprise'
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          slug: string
          logo_url?: string | null
          plan?: 'free' | 'pro' | 'enterprise'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          slug?: string
          logo_url?: string | null
          plan?: 'free' | 'pro' | 'enterprise'
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
      user_role: 'admin' | 'manager' | 'user'
      plan_type: 'free' | 'pro' | 'enterprise'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Profile = Tables<'profiles'>
export type Organization = Tables<'organizations'>
