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
      contacts: {
        Row: {
          address: string | null
          business_hours: string | null
          city: string | null
          contact_name: string | null
          contact_position: string | null
          contact_type: string
          created_at: string
          email: string | null
          follow_up_action: string | null
          id: string
          instagram: string | null
          last_visit: string | null
          latitude: number | null
          longitude: number | null
          name: string
          organization_id: string | null
          phone: string | null
          potential: string | null
          priority: string | null
          product_interest_ids: string[] | null
          promoted_products: string[] | null
          rating: number | null
          rif: string | null
          sector: string | null
          segmentation: string | null
          specialty: string | null
          state: string | null
          status: string | null
          user_id: string | null
          visit_count: number | null
          zone_id: string | null
        }
        Insert: {
          address?: string | null
          business_hours?: string | null
          city?: string | null
          contact_name?: string | null
          contact_position?: string | null
          contact_type: string
          created_at?: string
          email?: string | null
          follow_up_action?: string | null
          id?: string
          instagram?: string | null
          last_visit?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          organization_id?: string | null
          phone?: string | null
          potential?: string | null
          priority?: string | null
          product_interest_ids?: string[] | null
          promoted_products?: string[] | null
          rating?: number | null
          rif?: string | null
          sector?: string | null
          segmentation?: string | null
          specialty?: string | null
          state?: string | null
          status?: string | null
          user_id?: string | null
          visit_count?: number | null
          zone_id?: string | null
        }
        Update: {
          address?: string | null
          business_hours?: string | null
          city?: string | null
          contact_name?: string | null
          contact_position?: string | null
          contact_type?: string
          created_at?: string
          email?: string | null
          follow_up_action?: string | null
          id?: string
          instagram?: string | null
          last_visit?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          organization_id?: string | null
          phone?: string | null
          potential?: string | null
          priority?: string | null
          product_interest_ids?: string[] | null
          promoted_products?: string[] | null
          rating?: number | null
          rif?: string | null
          sector?: string | null
          segmentation?: string | null
          specialty?: string | null
          state?: string | null
          status?: string | null
          user_id?: string | null
          visit_count?: number | null
          zone_id?: string | null
        }
        Relationships: []
      }
      natural_stores: {
        Row: {
          address: string | null
          city: string | null
          contact_type: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          organization_id: string | null
          owner_name: string | null
          phone: string | null
          rif: string
          sanitary_permits: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_type?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          organization_id?: string | null
          owner_name?: string | null
          phone?: string | null
          rif: string
          sanitary_permits?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_type?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          owner_name?: string | null
          phone?: string | null
          rif?: string
          sanitary_permits?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          first_name: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          organization_id: string | null
          role: string | null
        }
        Insert: {
          first_name?: string | null
          id: string
          is_active?: boolean | null
          last_name?: string | null
          organization_id?: string | null
          role?: string | null
        }
        Update: {
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          organization_id?: string | null
          role?: string | null
        }
        Relationships: []
      }
      transfer_orders: {
        Row: {
          created_at: string
          drugstore_id: string | null
          drugstore_name: string | null
          id: string
          order_date: string
          order_number: string
          organization_id: string | null
          pharmacy_id: string | null
          pharmacy_name: string | null
          status: string
          total: number | null
        }
        Insert: {
          created_at?: string
          drugstore_id?: string | null
          drugstore_name?: string | null
          id?: string
          order_date?: string
          order_number: string
          organization_id?: string | null
          pharmacy_id?: string | null
          pharmacy_name?: string | null
          status?: string
          total?: number | null
        }
        Update: {
          created_at?: string
          drugstore_id?: string | null
          drugstore_name?: string | null
          id?: string
          order_date?: string
          order_number?: string
          organization_id?: string | null
          pharmacy_id?: string | null
          pharmacy_name?: string | null
          status?: string
          total?: number | null
        }
        Relationships: []
      }
      zones: {
        Row: {
          id: string
          name: string
          organization_id: string | null
          region: string | null
          state: string | null
        }
        Insert: {
          id?: string
          name: string
          organization_id?: string | null
          region?: string | null
          state?: string | null
        }
        Update: {
          id?: string
          name?: string
          organization_id?: string | null
          region?: string | null
          state?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      unified_contacts: {
        Row: {
          address: string | null
          city: string | null
          contact_type: string | null
          id: string | null
          last_visit: string | null
          latitude: number | null
          longitude: number | null
          name: string | null
          organization_id: string | null
          phone: string | null
          potential: string | null
          priority: string | null
          rating: number | null
          rif: string | null
          segmentation: string | null
          source: string | null
          specialty: string | null
          user_id: string | null
          visit_count: number | null
        }
      }
      view_geo_map: {
        Row: {
          address: string | null
          city: string | null
          contact_type: string | null
          id: string | null
          lat: number | null
          lng: number | null
          name: string | null
          organization_id: string | null
          priority: string | null
          specialty: string | null
        }
      }
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