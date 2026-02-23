/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      app_permissions: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          module: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          module: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          module?: string
          name?: string
        }
        Relationships: []
      }
      app_roles: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_system: boolean | null
          name: string
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          name: string
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      assignment_items: {
        Row: {
          assignment_id: string
          id: string
          product_id: string
          quantity: number
        }
        Insert: {
          assignment_id: string
          id?: string
          product_id: string
          quantity: number
        }
        Update: {
          assignment_id?: string
          id?: string
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "assignment_items_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "sample_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_opciones_abastecimiento"
            referencedColumns: ["product_id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          operation: string
          organization_id: string
          record_id: string
          table_name: string
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          organization_id: string
          record_id: string
          table_name: string
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          organization_id?: string
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      bank_inventory: {
        Row: {
          bank_id: string
          id: string
          min_stock_alert: number | null
          product_id: string
          quantity: number
          updated_at: string
        }
        Insert: {
          bank_id: string
          id?: string
          min_stock_alert?: number | null
          product_id: string
          quantity?: number
          updated_at?: string
        }
        Update: {
          bank_id?: string
          id?: string
          min_stock_alert?: number | null
          product_id?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_inventory_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "sample_banks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_opciones_abastecimiento"
            referencedColumns: ["product_id"]
          },
        ]
      }
      billing_plans: {
        Row: {
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          tier: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          tier: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          tier?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      billing_prices: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          interval: string | null
          is_active: boolean | null
          paypal_plan_id: string | null
          plan_id: string | null
          provider_price_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          interval?: string | null
          is_active?: boolean | null
          paypal_plan_id?: string | null
          plan_id?: string | null
          provider_price_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          interval?: string | null
          is_active?: boolean | null
          paypal_plan_id?: string | null
          plan_id?: string | null
          provider_price_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_prices_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "billing_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          payment_method_type: string | null
          provider: string
          provider_transaction_id: string | null
          status: string
          subscription_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          payment_method_type?: string | null
          provider: string
          provider_transaction_id?: string | null
          status: string
          subscription_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          payment_method_type?: string | null
          provider?: string
          provider_transaction_id?: string | null
          status?: string
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_transactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_offers: {
        Row: {
          active: boolean | null
          bonus_quantity: number | null
          created_at: string | null
          discount_percentage: number | null
          id: string
          min_quantity: number
          product_id: string | null
          title: string
        }
        Insert: {
          active?: boolean | null
          bonus_quantity?: number | null
          created_at?: string | null
          discount_percentage?: number | null
          id?: string
          min_quantity?: number
          product_id?: string | null
          title: string
        }
        Update: {
          active?: boolean | null
          bonus_quantity?: number | null
          created_at?: string | null
          discount_percentage?: number | null
          id?: string
          min_quantity?: number
          product_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "commercial_offers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_offers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_opciones_abastecimiento"
            referencedColumns: ["product_id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_health_centers: {
        Row: {
          contact_id: string
          created_at: string
          health_center_id: string
          id: string
          is_primary: boolean | null
          schedule: string | null
        }
        Insert: {
          contact_id: string
          created_at?: string
          health_center_id: string
          id?: string
          is_primary?: boolean | null
          schedule?: string | null
        }
        Update: {
          contact_id?: string
          created_at?: string
          health_center_id?: string
          id?: string
          is_primary?: boolean | null
          schedule?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_health_centers_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          address: string | null
          city: string | null
          company_id: string | null
          contact_type: Database["public"]["Enums"]["contact_type"]
          created_at: string
          email: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          notes: string | null
          organization_id: string | null
          phone: string | null
          priority: Database["public"]["Enums"]["priority_level"] | null
          region: string | null
          specialty: string | null
          state: string | null
          updated_at: string
          user_id: string
          work_hours: string | null
          zone_id: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_id?: string | null
          contact_type: Database["public"]["Enums"]["contact_type"]
          created_at?: string
          email?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          region?: string | null
          specialty?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
          work_hours?: string | null
          zone_id?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company_id?: string | null
          contact_type?: Database["public"]["Enums"]["contact_type"]
          created_at?: string
          email?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          region?: string | null
          specialty?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
          work_hours?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "view_kpi_zonas"
            referencedColumns: ["zone_id"]
          },
          {
            foreignKeyName: "contacts_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      cycles: {
        Row: {
          created_at: string | null
          end_date: string
          goals_json: Json | null
          id: string
          name: string
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          goals_json?: Json | null
          id?: string
          name: string
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          goals_json?: Json | null
          id?: string
          name?: string
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_plan_details: {
        Row: {
          created_at: string | null
          date: string
          day_of_week: string
          directory_item_id: string
          id: string
          status: string | null
          turn: string | null
          visit_order: number | null
          weekly_plan_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          day_of_week: string
          directory_item_id: string
          id?: string
          status?: string | null
          turn?: string | null
          visit_order?: number | null
          weekly_plan_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          day_of_week?: string
          directory_item_id?: string
          id?: string
          status?: string | null
          turn?: string | null
          visit_order?: number | null
          weekly_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_plan_details_directory_item_id_fkey"
            columns: ["directory_item_id"]
            isOneToOne: false
            referencedRelation: "directory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_plan_details_weekly_plan_id_fkey"
            columns: ["weekly_plan_id"]
            isOneToOne: false
            referencedRelation: "weekly_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_plan_items: {
        Row: {
          contact_id: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          notes: string | null
          plan_id: string | null
          priority: number | null
          scheduled_time: string | null
          status: string | null
          title: string
          user_id: string
          visit_id: string | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          plan_id?: string | null
          priority?: number | null
          scheduled_time?: string | null
          status?: string | null
          title: string
          user_id: string
          visit_id?: string | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          plan_id?: string | null
          priority?: number | null
          scheduled_time?: string | null
          status?: string | null
          title?: string
          user_id?: string
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_plan_items_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_plan_items_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "daily_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_plans: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          organization_id: string | null
          plan_date: string
          priority: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          plan_date: string
          priority?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          plan_date?: string
          priority?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_plans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      debug_auth_dump: {
        Row: {
          aud: string | null
          created_at: string | null
          email: string | null
          email_confirmed_at: string | null
          id: string | null
          instance_id: string | null
          is_sso_user: boolean | null
          last_sign_in_at: string | null
          raw_user_meta_data: Json | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          aud?: string | null
          created_at?: string | null
          email?: string | null
          email_confirmed_at?: string | null
          id?: string | null
          instance_id?: string | null
          is_sso_user?: boolean | null
          last_sign_in_at?: string | null
          raw_user_meta_data?: Json | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          aud?: string | null
          created_at?: string | null
          email?: string | null
          email_confirmed_at?: string | null
          id?: string | null
          instance_id?: string | null
          is_sso_user?: boolean | null
          last_sign_in_at?: string | null
          raw_user_meta_data?: Json | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      debug_roles_dump: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string | null
          is_active: boolean | null
          permissions: Json | null
          role: string | null
          supervisor_id: string | null
          territory: string | null
          updated_at: string | null
          user_id: string | null
          zone_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          permissions?: Json | null
          role?: string | null
          supervisor_id?: string | null
          territory?: string | null
          updated_at?: string | null
          user_id?: string | null
          zone_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          permissions?: Json | null
          role?: string | null
          supervisor_id?: string | null
          territory?: string | null
          updated_at?: string | null
          user_id?: string | null
          zone_id?: string | null
        }
        Relationships: []
      }
      debug_triggers_dump: {
        Row: {
          action_statement: string | null
          action_timing: string | null
          event_object_schema: unknown
          event_object_table: unknown
          trigger_name: unknown
        }
        Insert: {
          action_statement?: string | null
          action_timing?: string | null
          event_object_schema?: unknown
          event_object_table?: unknown
          trigger_name?: unknown
        }
        Update: {
          action_statement?: string | null
          action_timing?: string | null
          event_object_schema?: unknown
          event_object_table?: unknown
          trigger_name?: unknown
        }
        Relationships: []
      }
      detalle_entrega_banco: {
        Row: {
          cantidad_inicial: number
          created_at: string | null
          entrega_banco_id: string
          id: string
          stock_muestra_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cantidad_inicial: number
          created_at?: string | null
          entrega_banco_id: string
          id?: string
          stock_muestra_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cantidad_inicial?: number
          created_at?: string | null
          entrega_banco_id?: string
          id?: string
          stock_muestra_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "detalle_entrega_banco_entrega_banco_id_fkey"
            columns: ["entrega_banco_id"]
            isOneToOne: false
            referencedRelation: "entregas_banco"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "detalle_entrega_banco_stock_muestra_id_fkey"
            columns: ["stock_muestra_id"]
            isOneToOne: false
            referencedRelation: "inventario_muestras"
            referencedColumns: ["id"]
          },
        ]
      }
      directory_items: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          name: string
          zone_id: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          name: string
          zone_id?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          name?: string
          zone_id?: string | null
        }
        Relationships: []
      }
      dispensacion_muestras: {
        Row: {
          cantidad_dispensada: number
          created_at: string | null
          entregado_a: string | null
          fecha_dispensacion: string
          id: string
          inventario_banco_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cantidad_dispensada: number
          created_at?: string | null
          entregado_a?: string | null
          fecha_dispensacion: string
          id?: string
          inventario_banco_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cantidad_dispensada?: number
          created_at?: string | null
          entregado_a?: string | null
          fecha_dispensacion?: string
          id?: string
          inventario_banco_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispensacion_muestras_inventario_banco_id_fkey"
            columns: ["inventario_banco_id"]
            isOneToOne: false
            referencedRelation: "inventario_muestras"
            referencedColumns: ["id"]
          },
        ]
      }
      dispensacion_pacientes: {
        Row: {
          cantidad_dispensada: number
          cedula: string | null
          created_at: string | null
          diagnostico: string | null
          dispensado_por: string | null
          fecha_dispensacion: string
          fecha_vencimiento: string | null
          health_center_id: string | null
          id: string
          lote: string | null
          nombre_paciente: string
          product_id: string | null
          telefono: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cantidad_dispensada: number
          cedula?: string | null
          created_at?: string | null
          diagnostico?: string | null
          dispensado_por?: string | null
          fecha_dispensacion: string
          fecha_vencimiento?: string | null
          health_center_id?: string | null
          id?: string
          lote?: string | null
          nombre_paciente: string
          product_id?: string | null
          telefono?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cantidad_dispensada?: number
          cedula?: string | null
          created_at?: string | null
          diagnostico?: string | null
          dispensado_por?: string | null
          fecha_dispensacion?: string
          fecha_vencimiento?: string | null
          health_center_id?: string | null
          id?: string
          lote?: string | null
          nombre_paciente?: string
          product_id?: string | null
          telefono?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispensacion_pacientes_health_center_id_fkey"
            columns: ["health_center_id"]
            isOneToOne: false
            referencedRelation: "health_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispensacion_pacientes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispensacion_pacientes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_opciones_abastecimiento"
            referencedColumns: ["product_id"]
          },
        ]
      }
      doctor_schedules: {
        Row: {
          activo: boolean | null
          ciudad: string | null
          created_at: string | null
          dias_atencion: string
          direccion: string | null
          doctor_id: string
          estado: string | null
          health_center_id: string | null
          hora_fin: string
          hora_inicio: string
          id: string
          notas: string | null
          updated_at: string | null
          user_id: string
          zona_sector: string | null
        }
        Insert: {
          activo?: boolean | null
          ciudad?: string | null
          created_at?: string | null
          dias_atencion: string
          direccion?: string | null
          doctor_id: string
          estado?: string | null
          health_center_id?: string | null
          hora_fin: string
          hora_inicio: string
          id?: string
          notas?: string | null
          updated_at?: string | null
          user_id: string
          zona_sector?: string | null
        }
        Update: {
          activo?: boolean | null
          ciudad?: string | null
          created_at?: string | null
          dias_atencion?: string
          direccion?: string | null
          doctor_id?: string
          estado?: string | null
          health_center_id?: string | null
          hora_fin?: string
          hora_inicio?: string
          id?: string
          notas?: string | null
          updated_at?: string | null
          user_id?: string
          zona_sector?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctor_schedules_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_schedules_health_center_id_fkey"
            columns: ["health_center_id"]
            isOneToOne: false
            referencedRelation: "health_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_scores: {
        Row: {
          avg_visit_duration_minutes: number | null
          contact_id: string | null
          created_at: string | null
          days_since_last_visit: number | null
          id: string
          ideal_visit_frequency_days: number | null
          last_calculated_at: string | null
          last_visit_date: string | null
          products_presented: number | null
          samples_received: number | null
          score_category: string | null
          score_value: number | null
          total_visits: number | null
          updated_at: string | null
          visit_gap_status: string | null
          visits_last_30_days: number | null
          visits_last_90_days: number | null
        }
        Insert: {
          avg_visit_duration_minutes?: number | null
          contact_id?: string | null
          created_at?: string | null
          days_since_last_visit?: number | null
          id?: string
          ideal_visit_frequency_days?: number | null
          last_calculated_at?: string | null
          last_visit_date?: string | null
          products_presented?: number | null
          samples_received?: number | null
          score_category?: string | null
          score_value?: number | null
          total_visits?: number | null
          updated_at?: string | null
          visit_gap_status?: string | null
          visits_last_30_days?: number | null
          visits_last_90_days?: number | null
        }
        Update: {
          avg_visit_duration_minutes?: number | null
          contact_id?: string | null
          created_at?: string | null
          days_since_last_visit?: number | null
          id?: string
          ideal_visit_frequency_days?: number | null
          last_calculated_at?: string | null
          last_visit_date?: string | null
          products_presented?: number | null
          samples_received?: number | null
          score_category?: string | null
          score_value?: number | null
          total_visits?: number | null
          updated_at?: string | null
          visit_gap_status?: string | null
          visits_last_30_days?: number | null
          visits_last_90_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "doctor_scores_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: true
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          address: string | null
          birth_date: string | null
          city: string | null
          cm: string | null
          created_at: string | null
          days: string | null
          email: string | null
          end_time: string | null
          health_center: string | null
          id: string
          instagram: string | null
          last_visit: string | null
          lat: number | null
          lng: number | null
          location: string | null
          mobile: string | null
          msds: string | null
          name: string
          observations: string | null
          organization_id: string | null
          phone: string | null
          potential: string | null
          representative_id: string | null
          specialty: string | null
          specialty_id: string | null
          start_time: string | null
          state: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          city?: string | null
          cm?: string | null
          created_at?: string | null
          days?: string | null
          email?: string | null
          end_time?: string | null
          health_center?: string | null
          id?: string
          instagram?: string | null
          last_visit?: string | null
          lat?: number | null
          lng?: number | null
          location?: string | null
          mobile?: string | null
          msds?: string | null
          name: string
          observations?: string | null
          organization_id?: string | null
          phone?: string | null
          potential?: string | null
          representative_id?: string | null
          specialty?: string | null
          specialty_id?: string | null
          start_time?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          city?: string | null
          cm?: string | null
          created_at?: string | null
          days?: string | null
          email?: string | null
          end_time?: string | null
          health_center?: string | null
          id?: string
          instagram?: string | null
          last_visit?: string | null
          lat?: number | null
          lng?: number | null
          location?: string | null
          mobile?: string | null
          msds?: string | null
          name?: string
          observations?: string | null
          organization_id?: string | null
          phone?: string | null
          potential?: string | null
          representative_id?: string | null
          specialty?: string | null
          specialty_id?: string | null
          start_time?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctors_representative_id_fkey"
            columns: ["representative_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctors_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      drugstores: {
        Row: {
          address: string | null
          code: string | null
          contact_id: string | null
          contact_name: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          location: string | null
          name: string
          notes: string | null
          organization_id: string | null
          phone: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          code?: string | null
          contact_id?: string | null
          contact_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          name: string
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          code?: string | null
          contact_id?: string | null
          contact_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          name?: string
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drugstores_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drugstores_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      entrega_muestras: {
        Row: {
          cantidad_entregada: number
          created_at: string | null
          doctor_id: string | null
          fecha_entrega: string
          id: string
          stock_muestra_id: string
          updated_at: string | null
          user_id: string
          visit_id: string | null
        }
        Insert: {
          cantidad_entregada: number
          created_at?: string | null
          doctor_id?: string | null
          fecha_entrega: string
          id?: string
          stock_muestra_id: string
          updated_at?: string | null
          user_id: string
          visit_id?: string | null
        }
        Update: {
          cantidad_entregada?: number
          created_at?: string | null
          doctor_id?: string | null
          fecha_entrega?: string
          id?: string
          stock_muestra_id?: string
          updated_at?: string | null
          user_id?: string
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entrega_muestras_stock_muestra_id_fkey"
            columns: ["stock_muestra_id"]
            isOneToOne: false
            referencedRelation: "inventario_muestras"
            referencedColumns: ["id"]
          },
        ]
      }
      entregas_banco: {
        Row: {
          created_at: string | null
          entregado_por: string | null
          fecha_entrega: string
          foto_acta_url: string | null
          health_center_id: string | null
          id: string
          jefe_servicio: string | null
          servicio: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          entregado_por?: string | null
          fecha_entrega: string
          foto_acta_url?: string | null
          health_center_id?: string | null
          id?: string
          jefe_servicio?: string | null
          servicio?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          entregado_por?: string | null
          fecha_entrega?: string
          foto_acta_url?: string | null
          health_center_id?: string | null
          id?: string
          jefe_servicio?: string | null
          servicio?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entregas_banco_health_center_id_fkey"
            columns: ["health_center_id"]
            isOneToOne: false
            referencedRelation: "health_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          attendees_count: number | null
          company_id: string | null
          contact_id: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          event_type: string | null
          id: string
          location: string | null
          materials_used: string[] | null
          notes: string | null
          organization_id: string | null
          products_presented: string[] | null
          scheduled_date: string
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attendees_count?: number | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          event_type?: string | null
          id?: string
          location?: string | null
          materials_used?: string[] | null
          notes?: string | null
          organization_id?: string | null
          products_presented?: string[] | null
          scheduled_date: string
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attendees_count?: number | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          event_type?: string | null
          id?: string
          location?: string | null
          materials_used?: string[] | null
          notes?: string | null
          organization_id?: string | null
          products_presented?: string[] | null
          scheduled_date?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_budgets: {
        Row: {
          budget_amount: number
          category: string
          company_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          period_end: string
          period_start: string
          period_type: string | null
          user_id: string
        }
        Insert: {
          budget_amount: number
          category: string
          company_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          period_end: string
          period_start: string
          period_type?: string | null
          user_id: string
        }
        Update: {
          budget_amount?: number
          category?: string
          company_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          period_end?: string
          period_start?: string
          period_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_budgets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          category: string
          company_id: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          expense_date: string
          id: string
          notes: string | null
          organization_id: string | null
          receipt_url: string | null
          status: string | null
          subcategory: string | null
          updated_at: string | null
          user_id: string
          vendor: string | null
          visit_id: string | null
          zone_id: string | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          category: string
          company_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          expense_date?: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          receipt_url?: string | null
          status?: string | null
          subcategory?: string | null
          updated_at?: string | null
          user_id: string
          vendor?: string | null
          visit_id?: string | null
          zone_id?: string | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          category?: string
          company_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          expense_date?: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          receipt_url?: string | null
          status?: string | null
          subcategory?: string | null
          updated_at?: string | null
          user_id?: string
          vendor?: string | null
          visit_id?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "view_kpi_zonas"
            referencedColumns: ["zone_id"]
          },
          {
            foreignKeyName: "expenses_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      fixed_assets: {
        Row: {
          assigned_date: string | null
          assigned_to: string | null
          code: string
          condition: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          assigned_date?: string | null
          assigned_to?: string | null
          code: string
          condition?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          assigned_date?: string | null
          assigned_to?: string | null
          code?: string
          condition?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      health_centers: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          facility_type: string
          id: string
          last_visit: string | null
          lat: number | null
          lng: number | null
          name: string
          organization_id: string | null
          phone: string | null
          potential: string | null
          state: string | null
          updated_at: string | null
          user_id: string
          zone_id: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          facility_type: string
          id?: string
          last_visit?: string | null
          lat?: number | null
          lng?: number | null
          name: string
          organization_id?: string | null
          phone?: string | null
          potential?: string | null
          state?: string | null
          updated_at?: string | null
          user_id: string
          zone_id?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          facility_type?: string
          id?: string
          last_visit?: string | null
          lat?: number | null
          lng?: number | null
          name?: string
          organization_id?: string | null
          phone?: string | null
          potential?: string | null
          state?: string | null
          updated_at?: string | null
          user_id?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_centers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      help_articles: {
        Row: {
          category: string
          content: string
          created_at: string | null
          helpful_count: number | null
          id: string
          is_published: boolean | null
          not_helpful_count: number | null
          order_index: number | null
          subcategory: string | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_published?: boolean | null
          not_helpful_count?: number | null
          order_index?: number | null
          subcategory?: string | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_published?: boolean | null
          not_helpful_count?: number | null
          order_index?: number | null
          subcategory?: string | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: []
      }
      inventario_droguerias: {
        Row: {
          cantidad: number
          drogueria_id: string
          id: string
          precio_venta_farmacia: number
          producto_id: string
          updated_at: string
        }
        Insert: {
          cantidad?: number
          drogueria_id: string
          id?: string
          precio_venta_farmacia: number
          producto_id: string
          updated_at?: string
        }
        Update: {
          cantidad?: number
          drogueria_id?: string
          id?: string
          precio_venta_farmacia?: number
          producto_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventario_droguerias_drogueria_id_fkey"
            columns: ["drogueria_id"]
            isOneToOne: false
            referencedRelation: "drugstores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventario_droguerias_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventario_droguerias_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "view_opciones_abastecimiento"
            referencedColumns: ["product_id"]
          },
        ]
      }
      inventario_muestras: {
        Row: {
          cantidad_asignada: number
          created_at: string | null
          fecha_fabricacion: string | null
          fecha_vencimiento: string
          id: string
          lote: string
          product_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cantidad_asignada?: number
          created_at?: string | null
          fecha_fabricacion?: string | null
          fecha_vencimiento: string
          id?: string
          lote: string
          product_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cantidad_asignada?: number
          created_at?: string | null
          fecha_fabricacion?: string | null
          fecha_vencimiento?: string
          id?: string
          lote?: string
          product_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventario_muestras_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventario_muestras_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_opciones_abastecimiento"
            referencedColumns: ["product_id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          contact_id: string | null
          created_at: string | null
          id: string
          movement_type: string
          notes: string | null
          product_id: string
          quantity_change: number
          user_id: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          id?: string
          movement_type: string
          notes?: string | null
          product_id: string
          quantity_change: number
          user_id: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          id?: string
          movement_type?: string
          notes?: string | null
          product_id?: string
          quantity_change?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_opciones_abastecimiento"
            referencedColumns: ["product_id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          due_date: string | null
          id: string
          invoice_number: string | null
          organization_id: string | null
          paid_at: string | null
          status: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          organization_id?: string | null
          paid_at?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          organization_id?: string | null
          paid_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      lista_precios_biofarco: {
        Row: {
          id: string
          precio_base: number
          producto_id: string
          updated_at: string
        }
        Insert: {
          id?: string
          precio_base: number
          producto_id: string
          updated_at?: string
        }
        Update: {
          id?: string
          precio_base?: number
          producto_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lista_precios_biofarco_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_precios_biofarco_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: true
            referencedRelation: "view_opciones_abastecimiento"
            referencedColumns: ["product_id"]
          },
        ]
      }
      materiales_promocionales: {
        Row: {
          cantidad_disponible: number
          cantidad_inicial: number
          created_at: string | null
          fecha_recepcion: string | null
          id: string
          nombre: string
          notas: string | null
          product_id: string | null
          tipo: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cantidad_disponible?: number
          cantidad_inicial: number
          created_at?: string | null
          fecha_recepcion?: string | null
          id?: string
          nombre: string
          notas?: string | null
          product_id?: string | null
          tipo?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cantidad_disponible?: number
          cantidad_inicial?: number
          created_at?: string | null
          fecha_recepcion?: string | null
          id?: string
          nombre?: string
          notas?: string | null
          product_id?: string | null
          tipo?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "materiales_promocionales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materiales_promocionales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_opciones_abastecimiento"
            referencedColumns: ["product_id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          category: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          notification_type: string | null
          organization_id: string | null
          priority: string | null
          read_at: string | null
          reference_id: string | null
          reference_type: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          category?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          notification_type?: string | null
          organization_id?: string | null
          priority?: string | null
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          category?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string | null
          organization_id?: string | null
          priority?: string | null
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      objectives: {
        Row: {
          category: string | null
          company_id: string | null
          created_at: string | null
          current_value: number | null
          description: string | null
          end_date: string
          id: string
          notes: string | null
          objective_type: string | null
          organization_id: string | null
          priority: string | null
          start_date: string
          status: string | null
          target_value: number
          title: string
          unit: string | null
          updated_at: string | null
          user_id: string
          zone_id: string | null
        }
        Insert: {
          category?: string | null
          company_id?: string | null
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          end_date: string
          id?: string
          notes?: string | null
          objective_type?: string | null
          organization_id?: string | null
          priority?: string | null
          start_date: string
          status?: string | null
          target_value?: number
          title: string
          unit?: string | null
          updated_at?: string | null
          user_id: string
          zone_id?: string | null
        }
        Update: {
          category?: string | null
          company_id?: string | null
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          end_date?: string
          id?: string
          notes?: string | null
          objective_type?: string | null
          organization_id?: string | null
          priority?: string | null
          start_date?: string
          status?: string | null
          target_value?: number
          title?: string
          unit?: string | null
          updated_at?: string | null
          user_id?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objectives_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objectives_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objectives_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "view_kpi_zonas"
            referencedColumns: ["zone_id"]
          },
          {
            foreignKeyName: "objectives_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          fiscal_address: string | null
          id: string
          logo_url: string | null
          name: string
          onboarding_completed: boolean | null
          phone: string | null
          plan_tier: string | null
          rif: string | null
          settings: Json | null
          slug: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          taxpayer_type: string | null
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fiscal_address?: string | null
          id?: string
          logo_url?: string | null
          name: string
          onboarding_completed?: boolean | null
          phone?: string | null
          plan_tier?: string | null
          rif?: string | null
          settings?: Json | null
          slug: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          taxpayer_type?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fiscal_address?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          onboarding_completed?: boolean | null
          phone?: string | null
          plan_tier?: string | null
          rif?: string | null
          settings?: Json | null
          slug?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          taxpayer_type?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pharmacies: {
        Row: {
          address: string | null
          business_hours: string | null
          city: string | null
          contact_name: string | null
          contact_phone: string | null
          contact_position: string | null
          created_at: string | null
          email: string | null
          follow_up_action: string | null
          id: string
          instagram: string | null
          last_visit: string | null
          lat: number | null
          lng: number | null
          main_contact: string | null
          name: string
          notes: string | null
          organization_id: string | null
          phone: string | null
          potential: string | null
          priority: string | null
          product_interest: string | null
          promoted_products: string[] | null
          region: string | null
          representative_id: string | null
          rif: string | null
          schedule: string | null
          sector: string | null
          segmentation: string | null
          state: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          zone_id: string | null
        }
        Insert: {
          address?: string | null
          business_hours?: string | null
          city?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_position?: string | null
          created_at?: string | null
          email?: string | null
          follow_up_action?: string | null
          id?: string
          instagram?: string | null
          last_visit?: string | null
          lat?: number | null
          lng?: number | null
          main_contact?: string | null
          name: string
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          potential?: string | null
          priority?: string | null
          product_interest?: string | null
          promoted_products?: string[] | null
          region?: string | null
          representative_id?: string | null
          rif?: string | null
          schedule?: string | null
          sector?: string | null
          segmentation?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          zone_id?: string | null
        }
        Update: {
          address?: string | null
          business_hours?: string | null
          city?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_position?: string | null
          created_at?: string | null
          email?: string | null
          follow_up_action?: string | null
          id?: string
          instagram?: string | null
          last_visit?: string | null
          lat?: number | null
          lng?: number | null
          main_contact?: string | null
          name?: string
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          potential?: string | null
          priority?: string | null
          product_interest?: string | null
          promoted_products?: string[] | null
          region?: string | null
          representative_id?: string | null
          rif?: string | null
          schedule?: string | null
          sector?: string | null
          segmentation?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pharmacies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacies_representative_id_fkey"
            columns: ["representative_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacies_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "view_kpi_zonas"
            referencedColumns: ["zone_id"]
          },
          {
            foreignKeyName: "pharmacies_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacy_drugstore_relations: {
        Row: {
          account_number: string | null
          created_at: string | null
          drugstore_id: string | null
          id: string
          is_preferred: boolean | null
          pharmacy_id: string | null
        }
        Insert: {
          account_number?: string | null
          created_at?: string | null
          drugstore_id?: string | null
          id?: string
          is_preferred?: boolean | null
          pharmacy_id?: string | null
        }
        Update: {
          account_number?: string | null
          created_at?: string | null
          drugstore_id?: string | null
          id?: string
          is_preferred?: boolean | null
          pharmacy_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_drugstore_relations_drugstore_id_fkey"
            columns: ["drugstore_id"]
            isOneToOne: false
            referencedRelation: "drugstores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_drugstore_relations_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacy_reports: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          pharmacy_id: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string | null
          zone_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          pharmacy_id?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          zone_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          pharmacy_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_reports_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_reports_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "view_kpi_zonas"
            referencedColumns: ["zone_id"]
          },
          {
            foreignKeyName: "pharmacy_reports_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacy_scores: {
        Row: {
          last_updated: string | null
          level: string | null
          pharmacy_id: string
          score: number | null
        }
        Insert: {
          last_updated?: string | null
          level?: string | null
          pharmacy_id: string
          score?: number | null
        }
        Update: {
          last_updated?: string | null
          level?: string | null
          pharmacy_id?: string
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_scores_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: true
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_scores_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: true
            referencedRelation: "view_opciones_abastecimiento"
            referencedColumns: ["pharmacy_id"]
          },
        ]
      }
      pharmacy_stock: {
        Row: {
          created_at: string | null
          id: string
          pharmacy_id: string | null
          product_id: string | null
          quantity: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          pharmacy_id?: string | null
          product_id?: string | null
          quantity?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          pharmacy_id?: string | null
          product_id?: string | null
          quantity?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_stock_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_opciones_abastecimiento"
            referencedColumns: ["product_id"]
          },
        ]
      }
      pharmacy_trainings: {
        Row: {
          attendees_count: number | null
          created_at: string | null
          created_by: string | null
          evidence_photo_url: string | null
          id: string
          pharmacy_id: string
          topics: string[]
          visit_id: string | null
        }
        Insert: {
          attendees_count?: number | null
          created_at?: string | null
          created_by?: string | null
          evidence_photo_url?: string | null
          id?: string
          pharmacy_id: string
          topics: string[]
          visit_id?: string | null
        }
        Update: {
          attendees_count?: number | null
          created_at?: string | null
          created_by?: string | null
          evidence_photo_url?: string | null
          id?: string
          pharmacy_id?: string
          topics?: string[]
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_trainings_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_trainings_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "view_next_best_action"
            referencedColumns: ["visit_id"]
          },
          {
            foreignKeyName: "pharmacy_trainings_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      pop_assignment_items: {
        Row: {
          assignment_id: string | null
          id: string
          material_id: string | null
          quantity: number
        }
        Insert: {
          assignment_id?: string | null
          id?: string
          material_id?: string | null
          quantity?: number
        }
        Update: {
          assignment_id?: string | null
          id?: string
          material_id?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "pop_assignment_items_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "pop_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pop_assignment_items_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "pop_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      pop_assignments: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          notes: string | null
          representative_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          representative_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          representative_id?: string | null
          status?: string | null
        }
        Relationships: []
      }
      pop_materials: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          organization_id: string | null
          sku: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          sku?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          sku?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pop_materials_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      product_assets: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          order_index: number | null
          product_id: string | null
          title: string
          type: string
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          order_index?: number | null
          product_id?: string | null
          title: string
          type: string
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          order_index?: number | null
          product_id?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_assets_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_assets_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_opciones_abastecimiento"
            referencedColumns: ["product_id"]
          },
        ]
      }
      product_inventory: {
        Row: {
          id: string
          last_updated: string | null
          product_id: string
          quantity: number | null
          user_id: string
        }
        Insert: {
          id?: string
          last_updated?: string | null
          product_id: string
          quantity?: number | null
          user_id: string
        }
        Update: {
          id?: string
          last_updated?: string | null
          product_id?: string
          quantity?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_opciones_abastecimiento"
            referencedColumns: ["product_id"]
          },
        ]
      }
      product_specialties: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          specialty: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          specialty: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          specialty?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_specialties_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_specialties_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_opciones_abastecimiento"
            referencedColumns: ["product_id"]
          },
        ]
      }
      products: {
        Row: {
          active_ingredients: string[] | null
          category: string | null
          company_id: string | null
          contraindications: string | null
          created_at: string
          description: string | null
          document_urls: string[] | null
          dosage: string | null
          id: string
          image_url: string | null
          indications: string | null
          key_message: string | null
          medical_specialties: string | null
          name: string
          organization_id: string | null
          pdf_link: string | null
          presentation: string | null
          price: number | null
          product_code: string | null
          safety_info: string | null
          side_effects: string | null
          therapeutic_area: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          active_ingredients?: string[] | null
          category?: string | null
          company_id?: string | null
          contraindications?: string | null
          created_at?: string
          description?: string | null
          document_urls?: string[] | null
          dosage?: string | null
          id?: string
          image_url?: string | null
          indications?: string | null
          key_message?: string | null
          medical_specialties?: string | null
          name: string
          organization_id?: string | null
          pdf_link?: string | null
          presentation?: string | null
          price?: number | null
          product_code?: string | null
          safety_info?: string | null
          side_effects?: string | null
          therapeutic_area?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          active_ingredients?: string[] | null
          category?: string | null
          company_id?: string | null
          contraindications?: string | null
          created_at?: string
          description?: string | null
          document_urls?: string[] | null
          dosage?: string | null
          id?: string
          image_url?: string | null
          indications?: string | null
          key_message?: string | null
          medical_specialties?: string | null
          name?: string
          organization_id?: string | null
          pdf_link?: string | null
          presentation?: string | null
          price?: number | null
          product_code?: string | null
          safety_info?: string | null
          side_effects?: string | null
          therapeutic_area?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company_id: string | null
          created_at: string
          email: string | null
          employee_id: string | null
          first_name: string
          id: string
          is_org_admin: boolean | null
          last_name: string
          organization_id: string | null
          phone: string | null
          position: string | null
          region: string | null
          state: string | null
          territory: string | null
          updated_at: string
          user_id: string
          invitation_status: string | null
          is_active: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          employee_id?: string | null
          first_name: string
          id?: string
          is_org_admin?: boolean | null
          last_name: string
          organization_id?: string | null
          phone?: string | null
          position?: string | null
          region?: string | null
          state?: string | null
          territory?: string | null
          updated_at?: string
          user_id: string
          invitation_status?: string | null
          is_active?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          employee_id?: string | null
          first_name?: string
          id?: string
          is_org_admin?: boolean | null
          last_name?: string
          organization_id?: string | null
          phone?: string | null
          position?: string | null
          region?: string | null
          state?: string | null
          territory?: string | null
          updated_at?: string
          user_id?: string
          invitation_status?: string | null
          is_active?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      promotional_cycle_products: {
        Row: {
          created_at: string | null
          cycle_id: string | null
          id: string
          notes: string | null
          product_id: string | null
          target_presentations: number | null
          target_samples: number | null
        }
        Insert: {
          created_at?: string | null
          cycle_id?: string | null
          id?: string
          notes?: string | null
          product_id?: string | null
          target_presentations?: number | null
          target_samples?: number | null
        }
        Update: {
          created_at?: string | null
          cycle_id?: string | null
          id?: string
          notes?: string | null
          product_id?: string | null
          target_presentations?: number | null
          target_samples?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "promotional_cycle_products_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "promotional_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotional_cycle_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotional_cycle_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_opciones_abastecimiento"
            referencedColumns: ["product_id"]
          },
        ]
      }
      promotional_cycles: {
        Row: {
          company_id: string | null
          created_at: string | null
          created_by: string | null
          current_presentations: number | null
          current_samples: number | null
          current_visits: number | null
          description: string | null
          end_date: string
          id: string
          name: string
          objectives: string | null
          start_date: string
          status: string | null
          target_presentations: number | null
          target_samples: number | null
          target_visits: number | null
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          current_presentations?: number | null
          current_samples?: number | null
          current_visits?: number | null
          description?: string | null
          end_date: string
          id?: string
          name: string
          objectives?: string | null
          start_date: string
          status?: string | null
          target_presentations?: number | null
          target_samples?: number | null
          target_visits?: number | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          current_presentations?: number | null
          current_samples?: number | null
          current_visits?: number | null
          description?: string | null
          end_date?: string
          id?: string
          name?: string
          objectives?: string | null
          start_date?: string
          status?: string | null
          target_presentations?: number | null
          target_samples?: number | null
          target_visits?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promotional_cycles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      promotional_materials: {
        Row: {
          created_at: string
          description: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          name: string
          product_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          name: string
          product_id?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          name?: string
          product_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotional_materials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotional_materials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_opciones_abastecimiento"
            referencedColumns: ["product_id"]
          },
        ]
      }
      quote_items: {
        Row: {
          created_at: string | null
          discount: number | null
          id: string
          product_id: string | null
          quantity: number
          quote_id: string | null
          total: number | null
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          discount?: number | null
          id?: string
          product_id?: string | null
          quantity?: number
          quote_id?: string | null
          total?: number | null
          unit_price?: number
        }
        Update: {
          created_at?: string | null
          discount?: number | null
          id?: string
          product_id?: string | null
          quantity?: number
          quote_id?: string | null
          total?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_opciones_abastecimiento"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          contact_id: string | null
          created_at: string | null
          id: string
          organization_id: string | null
          pharmacy_name: string | null
          status: string | null
          total_amount: number | null
          updated_at: string | null
          user_id: string | null
          valid_until: string | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          id?: string
          organization_id?: string | null
          pharmacy_name?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
          valid_until?: string | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          id?: string
          organization_id?: string | null
          pharmacy_name?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      registro_pvp_farmacia: {
        Row: {
          cantidad_actual: number | null
          cantidad_anterior: number | null
          created_at: string
          id: string
          pharmacy_id: string | null
          producto_id: string
          pvp: number | null
          tiene_stock: boolean | null
          ventas_estimadas: number | null
          visit_id: string | null
        }
        Insert: {
          cantidad_actual?: number | null
          cantidad_anterior?: number | null
          created_at?: string
          id?: string
          pharmacy_id?: string | null
          producto_id: string
          pvp?: number | null
          tiene_stock?: boolean | null
          ventas_estimadas?: number | null
          visit_id?: string | null
        }
        Update: {
          cantidad_actual?: number | null
          cantidad_anterior?: number | null
          created_at?: string
          id?: string
          pharmacy_id?: string | null
          producto_id?: string
          pvp?: number | null
          tiene_stock?: boolean | null
          ventas_estimadas?: number | null
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registro_pvp_farmacia_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registro_pvp_farmacia_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "view_opciones_abastecimiento"
            referencedColumns: ["pharmacy_id"]
          },
          {
            foreignKeyName: "registro_pvp_farmacia_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registro_pvp_farmacia_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "view_opciones_abastecimiento"
            referencedColumns: ["product_id"]
          },
        ]
      }
      rep_inventory: {
        Row: {
          id: string
          product_id: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rep_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rep_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_opciones_abastecimiento"
            referencedColumns: ["product_id"]
          },
        ]
      }
      rep_stats_summary: {
        Row: {
          created_at: string | null
          effectiveness: number | null
          last_updated: string | null
          total_orders: number | null
          total_sales: number | null
          total_visits: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          effectiveness?: number | null
          last_updated?: string | null
          total_orders?: number | null
          total_sales?: number | null
          total_visits?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          effectiveness?: number | null
          last_updated?: string | null
          total_orders?: number | null
          total_sales?: number | null
          total_visits?: number | null
          user_id?: string
        }
        Relationships: []
      }
      reposiciones_banco: {
        Row: {
          cantidad_repuesta: number
          created_at: string | null
          detalle_entrega_id: string
          fecha_reposicion: string
          id: string
          stock_muestra_id: string
          updated_at: string | null
          user_id: string
          usuario_reposicion: string | null
        }
        Insert: {
          cantidad_repuesta: number
          created_at?: string | null
          detalle_entrega_id: string
          fecha_reposicion: string
          id?: string
          stock_muestra_id: string
          updated_at?: string | null
          user_id: string
          usuario_reposicion?: string | null
        }
        Update: {
          cantidad_repuesta?: number
          created_at?: string | null
          detalle_entrega_id?: string
          fecha_reposicion?: string
          id?: string
          stock_muestra_id?: string
          updated_at?: string | null
          user_id?: string
          usuario_reposicion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reposiciones_banco_detalle_entrega_id_fkey"
            columns: ["detalle_entrega_id"]
            isOneToOne: false
            referencedRelation: "detalle_entrega_banco"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reposiciones_banco_stock_muestra_id_fkey"
            columns: ["stock_muestra_id"]
            isOneToOne: false
            referencedRelation: "inventario_muestras"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string | null
          permission_code: string
          role_slug: string
        }
        Insert: {
          created_at?: string | null
          permission_code: string
          role_slug: string
        }
        Update: {
          created_at?: string | null
          permission_code?: string
          role_slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_code_fkey"
            columns: ["permission_code"]
            isOneToOne: false
            referencedRelation: "app_permissions"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "role_permissions_role_slug_fkey"
            columns: ["role_slug"]
            isOneToOne: false
            referencedRelation: "app_roles"
            referencedColumns: ["slug"]
          },
        ]
      }
      sales_guides: {
        Row: {
          created_at: string | null
          display_order: number | null
          entity_target: string
          id: string
          is_active: boolean | null
          product_id: string | null
          question_text: string
          question_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          entity_target: string
          id?: string
          is_active?: boolean | null
          product_id?: string | null
          question_text: string
          question_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          entity_target?: string
          id?: string
          is_active?: boolean | null
          product_id?: string | null
          question_text?: string
          question_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_guides_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_guides_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_opciones_abastecimiento"
            referencedColumns: ["product_id"]
          },
        ]
      }
      sample_assignments: {
        Row: {
          created_at: string
          created_by: string
          id: string
          notes: string | null
          organization_id: string | null
          representative_id: string
          status: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          representative_id: string
          status?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          representative_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "sample_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sample_banks: {
        Row: {
          created_at: string
          health_center_id: string | null
          id: string
          last_audit_date: string | null
          name: string
          responsible_user_id: string | null
          service_name: string | null
        }
        Insert: {
          created_at?: string
          health_center_id?: string | null
          id?: string
          last_audit_date?: string | null
          name: string
          responsible_user_id?: string | null
          service_name?: string | null
        }
        Update: {
          created_at?: string
          health_center_id?: string | null
          id?: string
          last_audit_date?: string | null
          name?: string
          responsible_user_id?: string | null
          service_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sample_banks_health_center_id_fkey"
            columns: ["health_center_id"]
            isOneToOne: false
            referencedRelation: "health_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      sample_distributions: {
        Row: {
          contact_id: string | null
          created_at: string | null
          distribution_date: string | null
          id: string
          inventory_id: string | null
          notes: string | null
          quantity: number
          signature_url: string | null
          user_id: string
          visit_id: string | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          distribution_date?: string | null
          id?: string
          inventory_id?: string | null
          notes?: string | null
          quantity: number
          signature_url?: string | null
          user_id: string
          visit_id?: string | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          distribution_date?: string | null
          id?: string
          inventory_id?: string | null
          notes?: string | null
          quantity?: number
          signature_url?: string | null
          user_id?: string
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sample_distributions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sample_distributions_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "sample_inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      sample_inventory: {
        Row: {
          batch_number: string
          company_id: string | null
          created_at: string | null
          expiry_date: string
          id: string
          lot_number: string | null
          notes: string | null
          product_id: string | null
          quantity_available: number
          quantity_distributed: number | null
          quantity_expired: number | null
          quantity_total: number
          received_date: string | null
          status: string | null
          storage_location: string | null
          temperature_requirements: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          batch_number: string
          company_id?: string | null
          created_at?: string | null
          expiry_date: string
          id?: string
          lot_number?: string | null
          notes?: string | null
          product_id?: string | null
          quantity_available?: number
          quantity_distributed?: number | null
          quantity_expired?: number | null
          quantity_total?: number
          received_date?: string | null
          status?: string | null
          storage_location?: string | null
          temperature_requirements?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          batch_number?: string
          company_id?: string | null
          created_at?: string | null
          expiry_date?: string
          id?: string
          lot_number?: string | null
          notes?: string | null
          product_id?: string | null
          quantity_available?: number
          quantity_distributed?: number | null
          quantity_expired?: number | null
          quantity_total?: number
          received_date?: string | null
          status?: string | null
          storage_location?: string | null
          temperature_requirements?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sample_inventory_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sample_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sample_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_opciones_abastecimiento"
            referencedColumns: ["product_id"]
          },
        ]
      }
      sample_movements: {
        Row: {
          bank_id: string | null
          batch_number: string | null
          created_at: string
          event_id: string | null
          id: string
          movement_type: Database["public"]["Enums"]["sample_movement_type"]
          notes: string | null
          product_id: string
          quantity: number
          request_id: string | null
          signature_url: string | null
          user_id: string
          visit_id: string | null
        }
        Insert: {
          bank_id?: string | null
          batch_number?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          movement_type: Database["public"]["Enums"]["sample_movement_type"]
          notes?: string | null
          product_id: string
          quantity: number
          request_id?: string | null
          signature_url?: string | null
          user_id: string
          visit_id?: string | null
        }
        Update: {
          bank_id?: string | null
          batch_number?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          movement_type?: Database["public"]["Enums"]["sample_movement_type"]
          notes?: string | null
          product_id?: string
          quantity?: number
          request_id?: string | null
          signature_url?: string | null
          user_id?: string
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sample_movements_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "sample_banks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sample_movements_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sample_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sample_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_opciones_abastecimiento"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "sample_movements_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "sample_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      sample_request_items: {
        Row: {
          id: string
          product_id: string
          quantity_approved: number | null
          quantity_requested: number
          request_id: string
        }
        Insert: {
          id?: string
          product_id: string
          quantity_approved?: number | null
          quantity_requested: number
          request_id: string
        }
        Update: {
          id?: string
          product_id?: string
          quantity_approved?: number | null
          quantity_requested?: number
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sample_request_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sample_request_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_opciones_abastecimiento"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "sample_request_items_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "sample_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      sample_requests: {
        Row: {
          delivery_method: string | null
          id: string
          notes: string | null
          processed_date: string | null
          requested_date: string
          requester_id: string
          status: string
          tracking_number: string | null
        }
        Insert: {
          delivery_method?: string | null
          id?: string
          notes?: string | null
          processed_date?: string | null
          requested_date?: string
          requester_id: string
          status?: string
          tracking_number?: string | null
        }
        Update: {
          delivery_method?: string | null
          id?: string
          notes?: string | null
          processed_date?: string | null
          requested_date?: string
          requester_id?: string
          status?: string
          tracking_number?: string | null
        }
        Relationships: []
      }
      samples: {
        Row: {
          batch_number: string
          created_at: string
          expiry_date: string
          id: string
          product_id: string
          quantity_available: number
          quantity_distributed: number
          updated_at: string
          user_id: string
        }
        Insert: {
          batch_number: string
          created_at?: string
          expiry_date: string
          id?: string
          product_id: string
          quantity_available?: number
          quantity_distributed?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          batch_number?: string
          created_at?: string
          expiry_date?: string
          id?: string
          product_id?: string
          quantity_available?: number
          quantity_distributed?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "samples_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "samples_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_opciones_abastecimiento"
            referencedColumns: ["product_id"]
          },
        ]
      }
      specialties: {
        Row: {
          created_at: string | null
          detail: string | null
          id: string
          image_url: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          detail?: string | null
          id?: string
          image_url?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          detail?: string | null
          id?: string
          image_url?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          active: boolean | null
          created_at: string | null
          currency: string | null
          features: Json | null
          id: string
          interval: string | null
          name: string
          price: number
          slug: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          currency?: string | null
          features?: Json | null
          id?: string
          interval?: string | null
          name: string
          price: number
          slug?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          currency?: string | null
          features?: Json | null
          id?: string
          interval?: string | null
          name?: string
          price?: number
          slug?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          organization_id: string | null
          plan_name: string
          price_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          organization_id?: string | null
          plan_name: string
          price_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          organization_id?: string | null
          plan_name?: string
          price_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          attachment_url: string | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          organization_id: string | null
          priority: string | null
          resolution: string | null
          resolved_at: string | null
          status: string | null
          subject: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          attachment_url?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          organization_id?: string | null
          priority?: string | null
          resolution?: string | null
          resolved_at?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          attachment_url?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          organization_id?: string | null
          priority?: string | null
          resolution?: string | null
          resolved_at?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      system_alerts: {
        Row: {
          active: boolean | null
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_global: boolean | null
          message: string
          organization_id: string | null
          title: string
          type: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_global?: boolean | null
          message: string
          organization_id?: string | null
          title: string
          type?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_global?: boolean | null
          message?: string
          organization_id?: string | null
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      system_audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity: string | null
          id: string
          ip_address: string | null
          organization_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity?: string | null
          id?: string
          ip_address?: string | null
          organization_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity?: string | null
          id?: string
          ip_address?: string | null
          organization_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      system_documents: {
        Row: {
          category: string
          content: string
          created_at: string | null
          id: string
          title: string
          updated_at: string | null
          version: string | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          id?: string
          title: string
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
      transfer_order_history: {
        Row: {
          action: string
          changes_description: string | null
          created_at: string | null
          id: string
          new_data: Json | null
          previous_data: Json | null
          transfer_order_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          changes_description?: string | null
          created_at?: string | null
          id?: string
          new_data?: Json | null
          previous_data?: Json | null
          transfer_order_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          changes_description?: string | null
          created_at?: string | null
          id?: string
          new_data?: Json | null
          previous_data?: Json | null
          transfer_order_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transfer_order_history_transfer_order_id_fkey"
            columns: ["transfer_order_id"]
            isOneToOne: false
            referencedRelation: "transfer_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      transfer_order_items: {
        Row: {
          bonus_units: number | null
          created_at: string | null
          id: string
          product_id: string | null
          quantity: number
          subtotal: number
          transfer_order_id: string | null
          unit_price: number
        }
        Insert: {
          bonus_units?: number | null
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          subtotal?: number
          transfer_order_id?: string | null
          unit_price?: number
        }
        Update: {
          bonus_units?: number | null
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          subtotal?: number
          transfer_order_id?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "transfer_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_opciones_abastecimiento"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "transfer_order_items_transfer_order_id_fkey"
            columns: ["transfer_order_id"]
            isOneToOne: false
            referencedRelation: "transfer_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      transfer_orders: {
        Row: {
          codigo_pedido_externo: string | null
          confirmed_at: string | null
          contact_id: string | null
          created_at: string | null
          delivery_date: string | null
          document_generated: boolean | null
          document_url: string | null
          drogueria_final_id: string | null
          drugstore_code: string | null
          drugstore_id: string | null
          drugstore_name: string
          id: string
          internal_notes: string | null
          items_snapshot: Json | null
          notas_telemarketing: string | null
          notes: string | null
          order_date: string
          order_number: string | null
          order_type: Database["public"]["Enums"]["transfer_order_type"] | null
          organization_id: string | null
          pharmacy_address: string | null
          pharmacy_name: string
          pharmacy_phone: string | null
          products: Json
          sent_at: string | null
          sent_to_email: string | null
          status: string | null
          subtotal: number | null
          tax: number | null
          total: number | null
          updated_at: string | null
          user_id: string | null
          zone_id: string | null
        }
        Insert: {
          codigo_pedido_externo?: string | null
          confirmed_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          delivery_date?: string | null
          document_generated?: boolean | null
          document_url?: string | null
          drogueria_final_id?: string | null
          drugstore_code?: string | null
          drugstore_id?: string | null
          drugstore_name: string
          id?: string
          internal_notes?: string | null
          items_snapshot?: Json | null
          notas_telemarketing?: string | null
          notes?: string | null
          order_date?: string
          order_number?: string | null
          order_type?: Database["public"]["Enums"]["transfer_order_type"] | null
          organization_id?: string | null
          pharmacy_address?: string | null
          pharmacy_name: string
          pharmacy_phone?: string | null
          products?: Json
          sent_at?: string | null
          sent_to_email?: string | null
          status?: string | null
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          updated_at?: string | null
          user_id?: string | null
          zone_id?: string | null
        }
        Update: {
          codigo_pedido_externo?: string | null
          confirmed_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          delivery_date?: string | null
          document_generated?: boolean | null
          document_url?: string | null
          drogueria_final_id?: string | null
          drugstore_code?: string | null
          drugstore_id?: string | null
          drugstore_name?: string
          id?: string
          internal_notes?: string | null
          items_snapshot?: Json | null
          notas_telemarketing?: string | null
          notes?: string | null
          order_date?: string
          order_number?: string | null
          order_type?: Database["public"]["Enums"]["transfer_order_type"] | null
          organization_id?: string | null
          pharmacy_address?: string | null
          pharmacy_name?: string
          pharmacy_phone?: string | null
          products?: Json
          sent_at?: string | null
          sent_to_email?: string | null
          status?: string | null
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          updated_at?: string | null
          user_id?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transfer_orders_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_orders_drogueria_final_id_fkey"
            columns: ["drogueria_final_id"]
            isOneToOne: false
            referencedRelation: "drugstores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_orders_drugstore_id_fkey"
            columns: ["drugstore_id"]
            isOneToOne: false
            referencedRelation: "drugstores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_orders_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "view_kpi_zonas"
            referencedColumns: ["zone_id"]
          },
          {
            foreignKeyName: "transfer_orders_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_opciones_abastecimiento"
            referencedColumns: ["product_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          organization_id: string | null
          permissions: Json | null
          region: string | null
          role: string
          state: string | null
          supervisor_id: string | null
          territory: string | null
          updated_at: string | null
          user_id: string
          zone_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          permissions?: Json | null
          region?: string | null
          role?: string
          state?: string | null
          supervisor_id?: string | null
          territory?: string | null
          updated_at?: string | null
          user_id: string
          zone_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          permissions?: Json | null
          region?: string | null
          role?: string
          state?: string | null
          supervisor_id?: string | null
          territory?: string | null
          updated_at?: string | null
          user_id?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles_plain: {
        Row: {
          organization_id: string | null
          region: string | null
          role: string
          state: string | null
          supervisor_id: string | null
          updated_at: string | null
          user_id: string
          zone_id: string | null
        }
        Insert: {
          organization_id?: string | null
          region?: string | null
          role: string
          state?: string | null
          supervisor_id?: string | null
          updated_at?: string | null
          user_id: string
          zone_id?: string | null
        }
        Update: {
          organization_id?: string | null
          region?: string | null
          role?: string
          state?: string | null
          supervisor_id?: string | null
          updated_at?: string | null
          user_id?: string
          zone_id?: string | null
        }
        Relationships: []
      }
      visit_products: {
        Row: {
          created_at: string
          id: string
          material_left: string | null
          notes: string | null
          product_id: string
          quantity_presented: number | null
          samples_given: number | null
          visit_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          material_left?: string | null
          notes?: string | null
          product_id: string
          quantity_presented?: number | null
          samples_given?: number | null
          visit_id: string
        }
        Update: {
          created_at?: string
          id?: string
          material_left?: string | null
          notes?: string | null
          product_id?: string
          quantity_presented?: number | null
          samples_given?: number | null
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_opciones_abastecimiento"
            referencedColumns: ["product_id"]
          },
        ]
      }
      visit_series: {
        Row: {
          contact_id: string
          created_at: string | null
          day_of_week: number
          end_date: string | null
          frequency: string
          id: string
          is_active: boolean | null
          notes: string | null
          preferred_time: string
          start_date: string
          turn: string | null
          updated_at: string | null
          user_id: string
          visit_objective: string | null
          visit_type: string | null
        }
        Insert: {
          contact_id: string
          created_at?: string | null
          day_of_week: number
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          preferred_time?: string
          start_date?: string
          turn?: string | null
          updated_at?: string | null
          user_id: string
          visit_objective?: string | null
          visit_type?: string | null
        }
        Update: {
          contact_id?: string
          created_at?: string | null
          day_of_week?: number
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          preferred_time?: string
          start_date?: string
          turn?: string | null
          updated_at?: string | null
          user_id?: string
          visit_objective?: string | null
          visit_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visit_series_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          activity_performed: string | null
          actual_end_time: string | null
          actual_start_time: string | null
          agreements: string | null
          arrival_time: string | null
          attachments: string[] | null
          check_in_latitude: number | null
          check_in_longitude: number | null
          check_out_latitude: number | null
          check_out_longitude: number | null
          checkin_at: string | null
          checkout_at: string | null
          closure_commitment: string | null
          closure_reason: string | null
          company_id: string | null
          competitor_activity: string | null
          contact_id: string | null
          contact_reaction: string | null
          created_at: string | null
          cycle_condition: string | null
          departure_time: string | null
          detected_purchase_reason: string | null
          directory_item_id: string | null
          distance_meters: number | null
          doctor_interest: string | null
          emotional_state: string | null
          feedback: string | null
          file_url: string | null
          geolocation: string | null
          id: string
          interview_data: Json | null
          is_exception: boolean | null
          key_contact: boolean | null
          location_lat: number | null
          location_lng: number | null
          main_objection: string | null
          next_commitment: string | null
          next_step: string | null
          next_steps: string | null
          next_visit_date: string | null
          notes: string | null
          objective: string | null
          observations_feedback: string | null
          organization_id: string | null
          out_of_range: boolean | null
          pending_followup: string | null
          pharmacy_id: string | null
          photo_url: string | null
          products_prescribed: string | null
          products_presented: string[] | null
          promotional_materials: string | null
          purchase_driver: string | null
          representative: string | null
          results_notes: string | null
          samples_delivered: string | null
          scheduled_date: string | null
          series_id: string | null
          shelf_photo_url: string | null
          signature_url: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          visibility_audit: Json | null
          visit_objective: string | null
          visit_outcome: string | null
          visit_type: string | null
          zone_id: string | null
        }
        Insert: {
          activity_performed?: string | null
          actual_end_time?: string | null
          actual_start_time?: string | null
          agreements?: string | null
          arrival_time?: string | null
          attachments?: string[] | null
          check_in_latitude?: number | null
          check_in_longitude?: number | null
          check_out_latitude?: number | null
          check_out_longitude?: number | null
          checkin_at?: string | null
          checkout_at?: string | null
          closure_commitment?: string | null
          closure_reason?: string | null
          company_id?: string | null
          competitor_activity?: string | null
          contact_id?: string | null
          contact_reaction?: string | null
          created_at?: string | null
          cycle_condition?: string | null
          departure_time?: string | null
          detected_purchase_reason?: string | null
          directory_item_id?: string | null
          distance_meters?: number | null
          doctor_interest?: string | null
          emotional_state?: string | null
          feedback?: string | null
          file_url?: string | null
          geolocation?: string | null
          id?: string
          interview_data?: Json | null
          is_exception?: boolean | null
          key_contact?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          main_objection?: string | null
          next_commitment?: string | null
          next_step?: string | null
          next_steps?: string | null
          next_visit_date?: string | null
          notes?: string | null
          objective?: string | null
          observations_feedback?: string | null
          organization_id?: string | null
          out_of_range?: boolean | null
          pending_followup?: string | null
          pharmacy_id?: string | null
          photo_url?: string | null
          products_prescribed?: string | null
          products_presented?: string[] | null
          promotional_materials?: string | null
          purchase_driver?: string | null
          representative?: string | null
          results_notes?: string | null
          samples_delivered?: string | null
          scheduled_date?: string | null
          series_id?: string | null
          shelf_photo_url?: string | null
          signature_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          visibility_audit?: Json | null
          visit_objective?: string | null
          visit_outcome?: string | null
          visit_type?: string | null
          zone_id?: string | null
        }
        Update: {
          activity_performed?: string | null
          actual_end_time?: string | null
          actual_start_time?: string | null
          agreements?: string | null
          arrival_time?: string | null
          attachments?: string[] | null
          check_in_latitude?: number | null
          check_in_longitude?: number | null
          check_out_latitude?: number | null
          check_out_longitude?: number | null
          checkin_at?: string | null
          checkout_at?: string | null
          closure_commitment?: string | null
          closure_reason?: string | null
          company_id?: string | null
          competitor_activity?: string | null
          contact_id?: string | null
          contact_reaction?: string | null
          created_at?: string | null
          cycle_condition?: string | null
          departure_time?: string | null
          detected_purchase_reason?: string | null
          directory_item_id?: string | null
          distance_meters?: number | null
          doctor_interest?: string | null
          emotional_state?: string | null
          feedback?: string | null
          file_url?: string | null
          geolocation?: string | null
          id?: string
          interview_data?: Json | null
          is_exception?: boolean | null
          key_contact?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          main_objection?: string | null
          next_commitment?: string | null
          next_step?: string | null
          next_steps?: string | null
          next_visit_date?: string | null
          notes?: string | null
          objective?: string | null
          observations_feedback?: string | null
          organization_id?: string | null
          out_of_range?: boolean | null
          pending_followup?: string | null
          pharmacy_id?: string | null
          photo_url?: string | null
          products_prescribed?: string | null
          products_presented?: string[] | null
          promotional_materials?: string | null
          purchase_driver?: string | null
          representative?: string | null
          results_notes?: string | null
          samples_delivered?: string | null
          scheduled_date?: string | null
          series_id?: string | null
          shelf_photo_url?: string | null
          signature_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          visibility_audit?: Json | null
          visit_objective?: string | null
          visit_outcome?: string | null
          visit_type?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visits_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_directory_item_id_fkey"
            columns: ["directory_item_id"]
            isOneToOne: false
            referencedRelation: "directory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "view_opciones_abastecimiento"
            referencedColumns: ["pharmacy_id"]
          },
          {
            foreignKeyName: "visits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "visits_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "view_kpi_zonas"
            referencedColumns: ["zone_id"]
          },
          {
            foreignKeyName: "visits_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouse_batches: {
        Row: {
          batch_number: string
          created_at: string
          expiration_date: string | null
          expiry_date: string
          id: string
          organization_id: string
          product_id: string
          quantity: number
          warehouse_id: string
        }
        Insert: {
          batch_number: string
          created_at?: string
          expiration_date?: string | null
          expiry_date: string
          id?: string
          organization_id: string
          product_id: string
          quantity?: number
          warehouse_id: string
        }
        Update: {
          batch_number?: string
          created_at?: string
          expiration_date?: string | null
          expiry_date?: string
          id?: string
          organization_id?: string
          product_id?: string
          quantity?: number
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_batches_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_opciones_abastecimiento"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "warehouse_batches_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouse_movements: {
        Row: {
          batch_id: string
          created_at: string
          id: string
          movement_type: Database["public"]["Enums"]["warehouse_movement_type"]
          organization_id: string
          product_id: string
          quantity: number
          related_request_id: string | null
          user_id: string
          warehouse_id: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          id?: string
          movement_type: Database["public"]["Enums"]["warehouse_movement_type"]
          organization_id: string
          product_id: string
          quantity: number
          related_request_id?: string | null
          user_id: string
          warehouse_id: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          id?: string
          movement_type?: Database["public"]["Enums"]["warehouse_movement_type"]
          organization_id?: string
          product_id?: string
          quantity?: number
          related_request_id?: string | null
          user_id?: string
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_movements_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "warehouse_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_movements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_opciones_abastecimiento"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "warehouse_movements_related_request_id_fkey"
            columns: ["related_request_id"]
            isOneToOne: false
            referencedRelation: "sample_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_movements_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouses: {
        Row: {
          address: string | null
          created_at: string
          id: string
          is_main: boolean | null
          name: string
          organization_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          is_main?: boolean | null
          name: string
          organization_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          is_main?: boolean | null
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_plans: {
        Row: {
          created_at: string | null
          cycle_id: string
          end_date: string
          id: string
          start_date: string
          status: string | null
          supervisor_comment: string | null
          updated_at: string | null
          user_id: string
          week_number: number
        }
        Insert: {
          created_at?: string | null
          cycle_id: string
          end_date: string
          id?: string
          start_date: string
          status?: string | null
          supervisor_comment?: string | null
          updated_at?: string | null
          user_id: string
          week_number: number
        }
        Update: {
          created_at?: string | null
          cycle_id?: string
          end_date?: string
          id?: string
          start_date?: string
          status?: string | null
          supervisor_comment?: string | null
          updated_at?: string | null
          user_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "weekly_plans_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      work_processes: {
        Row: {
          created_at: string | null
          department: string | null
          description: string | null
          diagram_edges: Json | null
          diagram_nodes: Json | null
          id: string
          name: string
          objectives: string | null
          responsible_person: string | null
          risks: Json | null
          scope: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          description?: string | null
          diagram_edges?: Json | null
          diagram_nodes?: Json | null
          id?: string
          name: string
          objectives?: string | null
          responsible_person?: string | null
          risks?: Json | null
          scope?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          department?: string | null
          description?: string | null
          diagram_edges?: Json | null
          diagram_nodes?: Json | null
          id?: string
          name?: string
          objectives?: string | null
          responsible_person?: string | null
          risks?: Json | null
          scope?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      zones: {
        Row: {
          company_id: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          organization_id: string | null
          region: string | null
          state: string | null
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          organization_id?: string | null
          region?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          region?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "zones_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zones_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      user_visit_series: {
        Row: {
          contact_address: string | null
          contact_id: string | null
          contact_name: string | null
          created_at: string | null
          day_name: string | null
          day_of_week: number | null
          end_date: string | null
          frequency: string | null
          id: string | null
          is_active: boolean | null
          notes: string | null
          preferred_time: string | null
          specialty: string | null
          start_date: string | null
          time_formatted: string | null
          turn: string | null
          updated_at: string | null
          user_id: string | null
          visit_objective: string | null
          visit_type: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visit_series_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      view_farmacia_stock_actual: {
        Row: {
          cantidad: number | null
          cantidad_actual: number | null
          farmacia_id: string | null
          last_audit_date: string | null
          pharmacy_id: string | null
          product_name: string | null
          producto_id: string | null
          pvp: number | null
          tiene_stock: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "registro_pvp_farmacia_pharmacy_id_fkey"
            columns: ["farmacia_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registro_pvp_farmacia_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registro_pvp_farmacia_pharmacy_id_fkey"
            columns: ["farmacia_id"]
            isOneToOne: false
            referencedRelation: "view_opciones_abastecimiento"
            referencedColumns: ["pharmacy_id"]
          },
          {
            foreignKeyName: "registro_pvp_farmacia_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "view_opciones_abastecimiento"
            referencedColumns: ["pharmacy_id"]
          },
          {
            foreignKeyName: "registro_pvp_farmacia_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registro_pvp_farmacia_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "view_opciones_abastecimiento"
            referencedColumns: ["product_id"]
          },
        ]
      }
      view_geo_map: {
        Row: {
          address: string | null
          assigned_rep_id: string | null
          city: string | null
          detail: string | null
          id: string | null
          lat: number | null
          lng: number | null
          name: string | null
          priority: string | null
          region: string | null
          state: string | null
          type: string | null
          zone_id: string | null
        }
        Relationships: []
      }
      view_kpi_zonas: {
        Row: {
          active_reps: number | null
          total_amount: number | null
          total_orders: number | null
          zone_id: string | null
          zone_name: string | null
        }
        Relationships: []
      }
      view_next_best_action: {
        Row: {
          action_type: string | null
          contact_id: string | null
          description: string | null
          score: number | null
          user_id: string | null
          visit_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visits_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      view_opciones_abastecimiento: {
        Row: {
          pharmacy_id: string | null
          product_id: string | null
          quantity: number | null
          status: string | null
        }
        Relationships: []
      }
      view_warehouse_stock: {
        Row: {
          batch_count: number | null
          category: string | null
          next_expiration: string | null
          product_id: string | null
          product_name: string | null
          total_quantity: number | null
          warehouse_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_opciones_abastecimiento"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "warehouse_batches_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_assignment: { Args: { p_assignment_id: string }; Returns: Json }
      audit_sample_bank: {
        Args: {
          p_bank_id: string
          p_notes?: string
          p_physical_count: number
          p_product_id: string
        }
        Returns: Json
      }
      check_event_eligibility: {
        Args: { p_event_type: string; p_pharmacy_id: string }
        Returns: Json
      }
      confirm_delivery: {
        Args: { p_request_id: string; p_user_id: string }
        Returns: boolean
      }
      create_new_user: {
        Args: {
          email: string
          first_name: string
          last_name: string
          p_role: string
          password: string
          zone_id?: string
        }
        Returns: Json
      }
      create_visit_series: {
        Args: {
          p_contact_id: string
          p_day_of_week: number
          p_first_visit_date?: string
          p_frequency?: string
          p_notes?: string
          p_preferred_time: string
          p_turn?: string
          p_user_id: string
          p_visit_objective?: string
          p_visit_type?: string
        }
        Returns: Json
      }
      delete_organization_safely: {
        Args: {
          target_org_id: string
          migration_target_id?: string | null
        }
        Returns: void
      }
      delete_series: {
        Args: { p_delete_future_visits?: boolean; p_series_id: string }
        Returns: Json
      }
      deposit_to_sample_bank: {
        Args: {
          p_bank_id: string
          p_notes?: string
          p_product_id: string
          p_quantity: number
        }
        Returns: Json
      }
      generate_monthly_schedule: {
        Args: { p_month: number; p_user_id: string; p_year: number }
        Returns: Json
      }
      get_auth_user_organization_id: { Args: never; Returns: string }
      get_my_organization_id: { Args: never; Returns: string }
      get_my_region: { Args: never; Returns: string }
      get_my_role: { Args: never; Returns: string }
      get_my_state: { Args: never; Returns: string }
      get_my_zone_id: { Args: never; Returns: string }
      get_nearby_pharmacies: {
        Args: { p_doctor_id: string; p_radius_km?: number }
        Returns: {
          address: string
          distance_meters: number
          latitude: number
          longitude: number
          name: string
          pharmacy_id: string
        }[]
      }
      get_user_company_id: { Args: never; Returns: string }
      is_master: { Args: never; Returns: boolean }
      is_org_admin: { Args: never; Returns: boolean }
      is_subordinate: { Args: { target_user_id: string }; Returns: boolean }
      register_visit_sample_drop: {
        Args: {
          p_notes?: string
          p_product_id: string
          p_quantity: number
          p_visit_id: string
        }
        Returns: Json
      }
      reject_assignment: {
        Args: { p_assignment_id: string; p_reason?: string }
        Returns: Json
      }
      split_series: {
        Args: {
          p_from_date: string
          p_new_day_of_week?: number
          p_new_preferred_time?: string
          p_series_id: string
        }
        Returns: Json
      }
      update_single_visit: {
        Args: { p_new_date?: string; p_new_notes?: string; p_visit_id: string }
        Returns: Json
      }
      user_belongs_to_org: { Args: { org_id: string }; Returns: boolean }
      warehouse_direct_dispatch: {
        Args: {
          p_items: Json
          p_movement_type: Database["public"]["Enums"]["warehouse_movement_type"]
          p_notes?: string
          p_warehouse_id: string
        }
        Returns: boolean
      }
      warehouse_dispatch:
      | {
        Args: {
          p_batch_id: string
          p_delivery_method: string
          p_quantity: number
          p_request_id: string
          p_tracking_number: string
          p_user_id: string
          p_warehouse_id: string
        }
        Returns: boolean
      }
      | {
        Args: {
          p_items: Json
          p_request_id: string
          p_warehouse_id: string
        }
        Returns: boolean
      }
      warehouse_fraction_batch: {
        Args: {
          p_notes?: string
          p_source_batch_id: string
          p_source_quantity_to_reduce: number
          p_target_product_id: string
          p_target_quantity_to_add: number
        }
        Returns: undefined
      }
      warehouse_inbound:
      | {
        Args: {
          p_batch_number: string
          p_expiry_date: string
          p_organization_id: string
          p_product_id: string
          p_quantity: number
          p_user_id: string
          p_warehouse_id: string
        }
        Returns: string
      }
      | {
        Args: {
          p_batch_number: string
          p_expiration_date: string
          p_notes?: string
          p_product_id: string
          p_quantity: number
          p_warehouse_id: string
        }
        Returns: string
      }
    }
    Enums: {
      contact_type: "doctor" | "pharmacy" | "hospital" | "clinic" | "natural_store" | "drugstore"
      priority_level: "low" | "medium" | "high" | "urgent"
      sample_movement_type:
      | "promotion"
      | "transfer_in"
      | "transfer_out"
      | "treatment_start"
      | "bank_delivery"
      | "adjustment"
      | "warehouse_in"
      | "visit_drop"
      | "bank_deposit"
      | "bank_audit_consumption"
      transfer_order_type: "transfer" | "direct_sale"
      visit_status: "scheduled" | "completed" | "cancelled" | "no_show"
      warehouse_movement_type:
      | "inbound_purchase"
      | "outbound_dispatch"
      | "adjustment"
      | "return"
      | "sale"
      | "conversion_in"
      | "conversion_out"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {
      contact_type: ["doctor", "pharmacy", "hospital", "clinic", "natural_store", "drugstore"],
      priority_level: ["low", "medium", "high", "urgent"],
      sample_movement_type: [
        "promotion",
        "transfer_in",
        "transfer_out",
        "treatment_start",
        "bank_delivery",
        "adjustment",
        "warehouse_in",
        "visit_drop",
        "bank_deposit",
        "bank_audit_consumption",
      ],
      transfer_order_type: ["transfer", "direct_sale"],
      visit_status: ["scheduled", "completed", "cancelled", "no_show"],
      warehouse_movement_type: [
        "inbound_purchase",
        "outbound_dispatch",
        "adjustment",
        "return",
        "sale",
        "conversion_in",
        "conversion_out",
      ],
    },
  },
} as const
