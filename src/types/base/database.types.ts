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
      assignments: {
        Row: {
          assignee_id: string
          comment: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          due_date: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["entity_type"]
          id: string
          is_deleted: boolean | null
          role: Database["public"]["Enums"]["assignment_role"]
          status: Database["public"]["Enums"]["requirement_status"]
          updated_at: string | null
          updated_by: string | null
          version: number
        }
        Insert: {
          assignee_id: string
          comment?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          due_date?: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["entity_type"]
          id?: string
          is_deleted?: boolean | null
          role: Database["public"]["Enums"]["assignment_role"]
          status: Database["public"]["Enums"]["requirement_status"]
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Update: {
          assignee_id?: string
          comment?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          due_date?: string | null
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["entity_type"]
          id?: string
          is_deleted?: boolean | null
          role?: Database["public"]["Enums"]["assignment_role"]
          status?: Database["public"]["Enums"]["requirement_status"]
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          new_data: Json | null
          old_data: Json | null
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
        }
        Relationships: []
      }
      billing_cache: {
        Row: {
          billing_status: Json
          current_period_usage: Json
          organization_id: string
          period_end: string
          period_start: string
          synced_at: string
        }
        Insert: {
          billing_status?: Json
          current_period_usage?: Json
          organization_id: string
          period_end?: string
          period_start?: string
          synced_at?: string
        }
        Update: {
          billing_status?: Json
          current_period_usage?: Json
          organization_id?: string
          period_end?: string
          period_start?: string
          synced_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_cache_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      block_property_schemas: {
        Row: {
          block_id: string
          created_at: string | null
          created_by: string | null
          data_type: string
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_deleted: boolean | null
          name: string
          updated_at: string | null
          updated_by: string | null
          version: number
        }
        Insert: {
          block_id: string
          created_at?: string | null
          created_by?: string | null
          data_type: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_deleted?: boolean | null
          name: string
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Update: {
          block_id?: string
          created_at?: string | null
          created_by?: string | null
          data_type?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_deleted?: boolean | null
          name?: string
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "block_property_schemas_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      blocks: {
        Row: {
          content: Json | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          document_id: string
          id: string
          is_deleted: boolean | null
          position: number
          type: string
          updated_at: string | null
          updated_by: string | null
          version: number
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          document_id: string
          id?: string
          is_deleted?: boolean | null
          position: number
          type: string
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          document_id?: string
          id?: string
          is_deleted?: boolean | null
          position?: number
          type?: string
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "blocks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "document_summary"
            referencedColumns: ["document_id"]
          },
          {
            foreignKeyName: "blocks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_property_schemas: {
        Row: {
          created_at: string | null
          created_by: string | null
          data_type: Database["public"]["Enums"]["property_type"]
          deleted_at: string | null
          deleted_by: string | null
          document_id: string
          id: string
          is_deleted: boolean | null
          name: string
          updated_at: string | null
          updated_by: string | null
          version: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          data_type?: Database["public"]["Enums"]["property_type"]
          deleted_at?: string | null
          deleted_by?: string | null
          document_id: string
          id?: string
          is_deleted?: boolean | null
          name: string
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          data_type?: Database["public"]["Enums"]["property_type"]
          deleted_at?: string | null
          deleted_by?: string | null
          document_id?: string
          id?: string
          is_deleted?: boolean | null
          name?: string
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_property_schemas_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "document_summary"
            referencedColumns: ["document_id"]
          },
          {
            foreignKeyName: "document_property_schemas_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          id: string
          is_deleted: boolean | null
          name: string
          project_id: string
          slug: string
          tags: string[] | null
          updated_at: string | null
          updated_by: string | null
          version: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string
          is_deleted?: boolean | null
          name: string
          project_id: string
          slug: string
          tags?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string
          is_deleted?: boolean | null
          name?: string
          project_id?: string
          slug?: string
          tags?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          metadata: Json | null
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          unread: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          read_at?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          unread?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          unread?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      organization_invitations: {
        Row: {
          created_at: string | null
          created_by: string
          deleted_at: string | null
          deleted_by: string | null
          email: string
          expires_at: string
          id: string
          is_deleted: boolean | null
          metadata: Json | null
          organization_id: string
          role: Database["public"]["Enums"]["user_role_type"]
          status: Database["public"]["Enums"]["invitation_status"]
          token: string
          updated_at: string | null
          updated_by: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          deleted_at?: string | null
          deleted_by?: string | null
          email: string
          expires_at?: string
          id?: string
          is_deleted?: boolean | null
          metadata?: Json | null
          organization_id: string
          role?: Database["public"]["Enums"]["user_role_type"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
          updated_at?: string | null
          updated_by: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          email?: string
          expires_at?: string
          id?: string
          is_deleted?: boolean | null
          metadata?: Json | null
          organization_id?: string
          role?: Database["public"]["Enums"]["user_role_type"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
          updated_at?: string | null
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_deleted: boolean | null
          last_active_at: string | null
          organization_id: string
          permissions: Json | null
          role: Database["public"]["Enums"]["user_role_type"]
          status: Database["public"]["Enums"]["user_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_deleted?: boolean | null
          last_active_at?: string | null
          organization_id: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["user_role_type"]
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_deleted?: boolean | null
          last_active_at?: string | null
          organization_id?: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["user_role_type"]
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          billing_cycle: Database["public"]["Enums"]["pricing_plan_interval"]
          billing_plan: Database["public"]["Enums"]["billing_plan"]
          created_at: string | null
          created_by: string
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          id: string
          is_deleted: boolean | null
          logo_url: string | null
          max_members: number
          max_monthly_requests: number
          member_count: number | null
          metadata: Json | null
          name: string
          settings: Json | null
          slug: string
          status: Database["public"]["Enums"]["user_status"] | null
          storage_used: number | null
          type: Database["public"]["Enums"]["organization_type"]
          updated_at: string | null
          updated_by: string
        }
        Insert: {
          billing_cycle?: Database["public"]["Enums"]["pricing_plan_interval"]
          billing_plan?: Database["public"]["Enums"]["billing_plan"]
          created_at?: string | null
          created_by: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string
          is_deleted?: boolean | null
          logo_url?: string | null
          max_members?: number
          max_monthly_requests?: number
          member_count?: number | null
          metadata?: Json | null
          name: string
          settings?: Json | null
          slug: string
          status?: Database["public"]["Enums"]["user_status"] | null
          storage_used?: number | null
          type?: Database["public"]["Enums"]["organization_type"]
          updated_at?: string | null
          updated_by: string
        }
        Update: {
          billing_cycle?: Database["public"]["Enums"]["pricing_plan_interval"]
          billing_plan?: Database["public"]["Enums"]["billing_plan"]
          created_at?: string | null
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string
          is_deleted?: boolean | null
          logo_url?: string | null
          max_members?: number
          max_monthly_requests?: number
          member_count?: number | null
          metadata?: Json | null
          name?: string
          settings?: Json | null
          slug?: string
          status?: Database["public"]["Enums"]["user_status"] | null
          storage_used?: number | null
          type?: Database["public"]["Enums"]["organization_type"]
          updated_at?: string | null
          updated_by?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          current_organization_id: string | null
          deleted_at: string | null
          deleted_by: string | null
          email: string
          full_name: string | null
          id: string
          is_deleted: boolean | null
          job_title: string | null
          last_login_at: string | null
          login_count: number | null
          personal_organization_id: string | null
          preferences: Json | null
          status: Database["public"]["Enums"]["user_status"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          current_organization_id?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          email: string
          full_name?: string | null
          id: string
          is_deleted?: boolean | null
          job_title?: string | null
          last_login_at?: string | null
          login_count?: number | null
          personal_organization_id?: string | null
          preferences?: Json | null
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          current_organization_id?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_deleted?: boolean | null
          job_title?: string | null
          last_login_at?: string | null
          login_count?: number | null
          personal_organization_id?: string | null
          preferences?: Json | null
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_invitations: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string
          is_deleted: boolean | null
          metadata: Json | null
          project_id: string
          role: Database["public"]["Enums"]["project_role"]
          status: Database["public"]["Enums"]["invitation_status"]
          token: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          is_deleted?: boolean | null
          metadata?: Json | null
          project_id: string
          role?: Database["public"]["Enums"]["project_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          is_deleted?: boolean | null
          metadata?: Json | null
          project_id?: string
          role?: Database["public"]["Enums"]["project_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_invitations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_deleted: boolean | null
          last_accessed_at: string | null
          permissions: Json | null
          project_id: string
          role: Database["public"]["Enums"]["project_role"]
          status: Database["public"]["Enums"]["user_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_deleted?: boolean | null
          last_accessed_at?: string | null
          permissions?: Json | null
          project_id: string
          role?: Database["public"]["Enums"]["project_role"]
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_deleted?: boolean | null
          last_accessed_at?: string | null
          permissions?: Json | null
          project_id?: string
          role?: Database["public"]["Enums"]["project_role"]
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          created_by: string
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          id: string
          is_deleted: boolean | null
          metadata: Json | null
          name: string
          organization_id: string
          owned_by: string
          settings: Json | null
          slug: string
          star_count: number | null
          status: Database["public"]["Enums"]["project_status"]
          tags: string[] | null
          updated_at: string | null
          updated_by: string
          version: number | null
          visibility: Database["public"]["Enums"]["visibility"]
        }
        Insert: {
          created_at?: string | null
          created_by: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string
          is_deleted?: boolean | null
          metadata?: Json | null
          name: string
          organization_id: string
          owned_by: string
          settings?: Json | null
          slug: string
          star_count?: number | null
          status?: Database["public"]["Enums"]["project_status"]
          tags?: string[] | null
          updated_at?: string | null
          updated_by: string
          version?: number | null
          visibility?: Database["public"]["Enums"]["visibility"]
        }
        Update: {
          created_at?: string | null
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string
          is_deleted?: boolean | null
          metadata?: Json | null
          name?: string
          organization_id?: string
          owned_by?: string
          settings?: Json | null
          slug?: string
          star_count?: number | null
          status?: Database["public"]["Enums"]["project_status"]
          tags?: string[] | null
          updated_at?: string | null
          updated_by?: string
          version?: number | null
          visibility?: Database["public"]["Enums"]["visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      requirement_property_kv: {
        Row: {
          block_id: string
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_deleted: boolean | null
          position: number
          property_name: string
          property_value: string
          requirement_id: string
          updated_at: string | null
          updated_by: string | null
          version: number
        }
        Insert: {
          block_id: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_deleted?: boolean | null
          position: number
          property_name: string
          property_value: string
          requirement_id: string
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Update: {
          block_id?: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_deleted?: boolean | null
          position?: number
          property_name?: string
          property_value?: string
          requirement_id?: string
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "requirement_property_kv_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requirement_property_kv_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      requirements: {
        Row: {
          ai_analysis: Json | null
          block_id: string
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          document_id: string
          enchanced_requirement: string | null
          external_id: string | null
          format: Database["public"]["Enums"]["requirement_format"]
          id: string
          is_deleted: boolean | null
          level: Database["public"]["Enums"]["requirement_level"]
          name: string
          original_requirement: string | null
          priority: Database["public"]["Enums"]["requirement_priority"]
          status: Database["public"]["Enums"]["requirement_status"]
          tags: string[] | null
          updated_at: string | null
          updated_by: string | null
          version: number
        }
        Insert: {
          ai_analysis?: Json | null
          block_id: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          document_id: string
          enchanced_requirement?: string | null
          external_id?: string | null
          format?: Database["public"]["Enums"]["requirement_format"]
          id?: string
          is_deleted?: boolean | null
          level?: Database["public"]["Enums"]["requirement_level"]
          name: string
          original_requirement?: string | null
          priority?: Database["public"]["Enums"]["requirement_priority"]
          status?: Database["public"]["Enums"]["requirement_status"]
          tags?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Update: {
          ai_analysis?: Json | null
          block_id?: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          document_id?: string
          enchanced_requirement?: string | null
          external_id?: string | null
          format?: Database["public"]["Enums"]["requirement_format"]
          id?: string
          is_deleted?: boolean | null
          level?: Database["public"]["Enums"]["requirement_level"]
          name?: string
          original_requirement?: string | null
          priority?: Database["public"]["Enums"]["requirement_priority"]
          status?: Database["public"]["Enums"]["requirement_status"]
          tags?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "requirements_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requirements_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "document_summary"
            referencedColumns: ["document_id"]
          },
          {
            foreignKeyName: "requirements_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_customers: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          organization_id: string
          payment_method_brand: string | null
          payment_method_last4: string | null
          price_id: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          updated_at: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          organization_id: string
          payment_method_brand?: string | null
          payment_method_last4?: string | null
          price_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          updated_at?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          organization_id?: string
          payment_method_brand?: string | null
          payment_method_last4?: string | null
          price_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_customers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      trace_links: {
        Row: {
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          id: string
          is_deleted: boolean | null
          link_type: Database["public"]["Enums"]["trace_link_type"]
          source_id: string
          source_type: Database["public"]["Enums"]["entity_type"]
          target_id: string
          target_type: Database["public"]["Enums"]["entity_type"]
          updated_at: string | null
          updated_by: string | null
          version: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string
          is_deleted?: boolean | null
          link_type: Database["public"]["Enums"]["trace_link_type"]
          source_id: string
          source_type: Database["public"]["Enums"]["entity_type"]
          target_id: string
          target_type: Database["public"]["Enums"]["entity_type"]
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string
          is_deleted?: boolean | null
          link_type?: Database["public"]["Enums"]["trace_link_type"]
          source_id?: string
          source_type?: Database["public"]["Enums"]["entity_type"]
          target_id?: string
          target_type?: Database["public"]["Enums"]["entity_type"]
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Relationships: []
      }
      usage_logs: {
        Row: {
          created_at: string | null
          feature: string
          id: string
          metadata: Json | null
          organization_id: string
          quantity: number
          unit_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          feature: string
          id?: string
          metadata?: Json | null
          organization_id: string
          quantity: number
          unit_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          feature?: string
          id?: string
          metadata?: Json | null
          organization_id?: string
          quantity?: number
          unit_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      document_summary: {
        Row: {
          block_count: number | null
          document_id: string | null
          document_name: string | null
          project_id: string | null
          requirement_count: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_invitation: {
        Args: {
          invitation_token: string
        }
        Returns: boolean
      }
      can_use_resource: {
        Args: {
          org_id: string
          resource_type: string
          quantity: number
        }
        Returns: boolean
      }
      create_notification: {
        Args: {
          user_id: string
          type: Database["public"]["Enums"]["notification_type"]
          title: string
          message?: string
          metadata?: Json
        }
        Returns: string
      }
      create_personal_organization: {
        Args: {
          user_id: string
          name: string
        }
        Returns: string
      }
      gbt_bit_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_bool_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_bool_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_bpchar_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_bytea_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_cash_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_cash_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_date_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_date_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_enum_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_enum_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_float4_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_float4_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_float8_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_float8_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_inet_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_int2_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_int2_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_int4_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_int4_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_int8_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_int8_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_intv_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_intv_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_intv_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_macad_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_macad_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_macad8_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_macad8_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_numeric_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_oid_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_oid_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_text_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_time_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_time_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_timetz_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_ts_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_ts_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_tstz_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_uuid_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_uuid_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_var_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_var_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbtreekey_var_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbtreekey_var_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbtreekey16_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbtreekey16_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbtreekey2_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbtreekey2_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbtreekey32_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbtreekey32_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbtreekey4_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbtreekey4_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbtreekey8_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbtreekey8_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      generate_slug: {
        Args: {
          name: string
        }
        Returns: string
      }
      get_organization_usage: {
        Args: {
          org_id: string
          start_date?: string
          end_date?: string
        }
        Returns: Json
      }
      get_user_organizations: {
        Args: {
          user_id: string
          include_inactive?: boolean
        }
        Returns: {
          id: string
          name: string
          slug: string
          role: Database["public"]["Enums"]["user_role_type"]
          type: Database["public"]["Enums"]["organization_type"]
          billing_plan: Database["public"]["Enums"]["billing_plan"]
          member_count: number
          is_personal: boolean
          status: Database["public"]["Enums"]["user_status"]
        }[]
      }
      has_project_access: {
        Args: {
          project_id: string
          user_id: string
          required_role?: Database["public"]["Enums"]["project_role"]
        }
        Returns: boolean
      }
      initialize_billing: {
        Args: {
          user_id: string
          org_id: string
        }
        Returns: undefined
      }
      invite_organization_member: {
        Args: {
          org_id: string
          email: string
          role?: Database["public"]["Enums"]["user_role_type"]
        }
        Returns: string
      }
      is_valid_email: {
        Args: {
          email: string
        }
        Returns: boolean
      }
      is_valid_slug: {
        Args: {
          slug: string
        }
        Returns: boolean
      }
      log_resource_usage: {
        Args: {
          org_id: string
          user_id: string
          feature: string
          quantity: number
          unit_type: string
          metadata?: Json
        }
        Returns: boolean
      }
      switch_organization: {
        Args: {
          user_id: string
          org_id: string
        }
        Returns: boolean
      }
      sync_billing_data: {
        Args: {
          org_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      assignment_role: "assignee" | "reviewer" | "approver"
      billing_plan: "free" | "pro" | "enterprise"
      entity_type: "document" | "requirement"
      invitation_status: "pending" | "accepted" | "rejected" | "revoked"
      notification_type: "invitation" | "mention" | "system"
      organization_type: "personal" | "team"
      pricing_plan_interval: "none" | "month" | "year"
      project_role: "owner" | "admin" | "maintainer" | "editor" | "viewer"
      project_status: "active" | "archived" | "draft" | "deleted"
      property_type:
        | "string"
        | "number"
        | "boolean"
        | "date"
        | "url"
        | "array"
        | "enum"
        | "entity_reference"
      requirement_format: "incose" | "ears" | "other"
      requirement_level: "component" | "system" | "subsystem"
      requirement_priority: "low" | "medium" | "high"
      requirement_status:
        | "active"
        | "archived"
        | "draft"
        | "deleted"
        | "pending"
        | "in_progress"
        | "approved"
        | "rejected"
      subscription_status:
        | "active"
        | "inactive"
        | "trialing"
        | "past_due"
        | "canceled"
        | "paused"
      trace_link_type:
        | "derives_from"
        | "implements"
        | "relates_to"
        | "conflicts_with"
        | "is_related_to"
        | "parent_of"
        | "child_of"
      user_role_type: "member" | "admin" | "owner" | "super_admin"
      user_status: "active" | "inactive"
      visibility: "private" | "team" | "organization" | "public"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never