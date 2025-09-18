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
    PostgrestVersion: "13.0.4"
  }
  graphql: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _internal_resolve: {
        Args: {
          extensions?: Json
          operationName?: string
          query: string
          variables?: Json
        }
        Returns: Json
      }
      comment_directive: {
        Args: { comment_: string }
        Returns: Json
      }
      exception: {
        Args: { message: string }
        Returns: string
      }
      get_schema_version: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      resolve: {
        Args: {
          extensions?: Json
          operationName?: string
          query: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      accessories: {
        Row: {
          active: boolean | null
          description: string | null
          hide_in_configurator: boolean | null
          id: number
          name: string | null
          price: number | null
          sku_code: string | null
          sort: number | null
          webflow_id: string | null
        }
        Insert: {
          active?: boolean | null
          description?: string | null
          hide_in_configurator?: boolean | null
          id?: number
          name?: string | null
          price?: number | null
          sku_code?: string | null
          sort?: number | null
          webflow_id?: string | null
        }
        Update: {
          active?: boolean | null
          description?: string | null
          hide_in_configurator?: boolean | null
          id?: number
          name?: string | null
          price?: number | null
          sku_code?: string | null
          sort?: number | null
          webflow_id?: string | null
        }
        Relationships: []
      }
      api_test: {
        Row: {
          created_at: string | null
          id: number
          message: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          message: string
        }
        Update: {
          created_at?: string | null
          id?: number
          message?: string
        }
        Relationships: []
      }
      api_test_v2: {
        Row: {
          created_at: string | null
          id: number
          message: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          message: string
        }
        Update: {
          created_at?: string | null
          id?: number
          message?: string
        }
        Relationships: []
      }
      color_temperatures: {
        Row: {
          active: boolean | null
          description: string | null
          id: number
          name: string | null
          sku_code: string | null
          sort: number | null
          webflow_id: string | null
        }
        Insert: {
          active?: boolean | null
          description?: string | null
          id?: number
          name?: string | null
          sku_code?: string | null
          sort?: number | null
          webflow_id?: string | null
        }
        Update: {
          active?: boolean | null
          description?: string | null
          id?: number
          name?: string | null
          sku_code?: string | null
          sort?: number | null
          webflow_id?: string | null
        }
        Relationships: []
      }
      configuration_attributes: {
        Row: {
          code: string
          created_at: string | null
          data_type: string
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          updated_at: string | null
          validation_rules: Json | null
        }
        Insert: {
          code: string
          created_at?: string | null
          data_type: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          updated_at?: string | null
          validation_rules?: Json | null
        }
        Update: {
          code?: string
          created_at?: string | null
          data_type?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          updated_at?: string | null
          validation_rules?: Json | null
        }
        Relationships: []
      }
      configuration_dependencies: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          priority: number | null
          target_actions: Json
          trigger_conditions: Json
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          priority?: number | null
          target_actions: Json
          trigger_conditions: Json
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          priority?: number | null
          target_actions?: Json
          trigger_conditions?: Json
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      configuration_options: {
        Row: {
          attribute_id: string | null
          code: string
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          updated_at: string | null
          value: Json | null
        }
        Insert: {
          attribute_id?: string | null
          code: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          updated_at?: string | null
          value?: Json | null
        }
        Update: {
          attribute_id?: string | null
          code?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          updated_at?: string | null
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "configuration_options_attribute_id_fkey"
            columns: ["attribute_id"]
            isOneToOne: false
            referencedRelation: "configuration_attributes"
            referencedColumns: ["id"]
          },
        ]
      }
      configuration_pricing: {
        Row: {
          conditions: Json | null
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          is_active: boolean | null
          price_modifier: Json
          pricing_type: string
          priority: number | null
          updated_at: string | null
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          conditions?: Json | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          is_active?: boolean | null
          price_modifier: Json
          pricing_type: string
          priority?: number | null
          updated_at?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          conditions?: Json | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          is_active?: boolean | null
          price_modifier?: Json
          pricing_type?: string
          priority?: number | null
          updated_at?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: []
      }
      configuration_ui: {
        Row: {
          collection: string | null
          date_updated: string | null
          id: string
          sort: number | null
          ui_type: string | null
        }
        Insert: {
          collection?: string | null
          date_updated?: string | null
          id: string
          sort?: number | null
          ui_type?: string | null
        }
        Update: {
          collection?: string | null
          date_updated?: string | null
          id?: string
          sort?: number | null
          ui_type?: string | null
        }
        Relationships: []
      }
      diagnostic_results: {
        Row: {
          id: number
          result: Json | null
          run_timestamp: string | null
          test_name: string | null
        }
        Insert: {
          id?: number
          result?: Json | null
          run_timestamp?: string | null
          test_name?: string | null
        }
        Update: {
          id?: number
          result?: Json | null
          run_timestamp?: string | null
          test_name?: string | null
        }
        Relationships: []
      }
      directus_access: {
        Row: {
          id: string
          policy: string
          role: string | null
          sort: number | null
          user: string | null
        }
        Insert: {
          id: string
          policy: string
          role?: string | null
          sort?: number | null
          user?: string | null
        }
        Update: {
          id?: string
          policy?: string
          role?: string | null
          sort?: number | null
          user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "directus_access_policy_foreign"
            columns: ["policy"]
            isOneToOne: false
            referencedRelation: "directus_policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_access_role_foreign"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "directus_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_access_user_foreign"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "directus_users"
            referencedColumns: ["id"]
          },
        ]
      }
      directus_activity: {
        Row: {
          action: string
          collection: string
          id: number
          ip: string | null
          item: string
          origin: string | null
          timestamp: string
          user: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          collection: string
          id?: number
          ip?: string | null
          item: string
          origin?: string | null
          timestamp?: string
          user?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          collection?: string
          id?: number
          ip?: string | null
          item?: string
          origin?: string | null
          timestamp?: string
          user?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      directus_collections: {
        Row: {
          accountability: string | null
          archive_app_filter: boolean
          archive_field: string | null
          archive_value: string | null
          collapse: string
          collection: string
          color: string | null
          display_template: string | null
          group: string | null
          hidden: boolean
          icon: string | null
          item_duplication_fields: Json | null
          note: string | null
          preview_url: string | null
          singleton: boolean
          sort: number | null
          sort_field: string | null
          translations: Json | null
          unarchive_value: string | null
          versioning: boolean
        }
        Insert: {
          accountability?: string | null
          archive_app_filter?: boolean
          archive_field?: string | null
          archive_value?: string | null
          collapse?: string
          collection: string
          color?: string | null
          display_template?: string | null
          group?: string | null
          hidden?: boolean
          icon?: string | null
          item_duplication_fields?: Json | null
          note?: string | null
          preview_url?: string | null
          singleton?: boolean
          sort?: number | null
          sort_field?: string | null
          translations?: Json | null
          unarchive_value?: string | null
          versioning?: boolean
        }
        Update: {
          accountability?: string | null
          archive_app_filter?: boolean
          archive_field?: string | null
          archive_value?: string | null
          collapse?: string
          collection?: string
          color?: string | null
          display_template?: string | null
          group?: string | null
          hidden?: boolean
          icon?: string | null
          item_duplication_fields?: Json | null
          note?: string | null
          preview_url?: string | null
          singleton?: boolean
          sort?: number | null
          sort_field?: string | null
          translations?: Json | null
          unarchive_value?: string | null
          versioning?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "directus_collections_group_foreign"
            columns: ["group"]
            isOneToOne: false
            referencedRelation: "directus_collections"
            referencedColumns: ["collection"]
          },
        ]
      }
      directus_comments: {
        Row: {
          collection: string
          comment: string
          date_created: string | null
          date_updated: string | null
          id: string
          item: string
          user_created: string | null
          user_updated: string | null
        }
        Insert: {
          collection: string
          comment: string
          date_created?: string | null
          date_updated?: string | null
          id: string
          item: string
          user_created?: string | null
          user_updated?: string | null
        }
        Update: {
          collection?: string
          comment?: string
          date_created?: string | null
          date_updated?: string | null
          id?: string
          item?: string
          user_created?: string | null
          user_updated?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "directus_comments_user_created_foreign"
            columns: ["user_created"]
            isOneToOne: false
            referencedRelation: "directus_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_comments_user_updated_foreign"
            columns: ["user_updated"]
            isOneToOne: false
            referencedRelation: "directus_users"
            referencedColumns: ["id"]
          },
        ]
      }
      directus_dashboards: {
        Row: {
          color: string | null
          date_created: string | null
          icon: string
          id: string
          name: string
          note: string | null
          user_created: string | null
        }
        Insert: {
          color?: string | null
          date_created?: string | null
          icon?: string
          id: string
          name: string
          note?: string | null
          user_created?: string | null
        }
        Update: {
          color?: string | null
          date_created?: string | null
          icon?: string
          id?: string
          name?: string
          note?: string | null
          user_created?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "directus_dashboards_user_created_foreign"
            columns: ["user_created"]
            isOneToOne: false
            referencedRelation: "directus_users"
            referencedColumns: ["id"]
          },
        ]
      }
      directus_extensions: {
        Row: {
          bundle: string | null
          enabled: boolean
          folder: string
          id: string
          source: string
        }
        Insert: {
          bundle?: string | null
          enabled?: boolean
          folder: string
          id: string
          source: string
        }
        Update: {
          bundle?: string | null
          enabled?: boolean
          folder?: string
          id?: string
          source?: string
        }
        Relationships: []
      }
      directus_fields: {
        Row: {
          collection: string
          conditions: Json | null
          display: string | null
          display_options: Json | null
          field: string
          group: string | null
          hidden: boolean
          id: number
          interface: string | null
          note: string | null
          options: Json | null
          readonly: boolean
          required: boolean | null
          sort: number | null
          special: string | null
          translations: Json | null
          validation: Json | null
          validation_message: string | null
          width: string | null
        }
        Insert: {
          collection: string
          conditions?: Json | null
          display?: string | null
          display_options?: Json | null
          field: string
          group?: string | null
          hidden?: boolean
          id?: number
          interface?: string | null
          note?: string | null
          options?: Json | null
          readonly?: boolean
          required?: boolean | null
          sort?: number | null
          special?: string | null
          translations?: Json | null
          validation?: Json | null
          validation_message?: string | null
          width?: string | null
        }
        Update: {
          collection?: string
          conditions?: Json | null
          display?: string | null
          display_options?: Json | null
          field?: string
          group?: string | null
          hidden?: boolean
          id?: number
          interface?: string | null
          note?: string | null
          options?: Json | null
          readonly?: boolean
          required?: boolean | null
          sort?: number | null
          special?: string | null
          translations?: Json | null
          validation?: Json | null
          validation_message?: string | null
          width?: string | null
        }
        Relationships: []
      }
      directus_files: {
        Row: {
          charset: string | null
          created_on: string
          description: string | null
          duration: number | null
          embed: string | null
          filename_disk: string | null
          filename_download: string
          filesize: number | null
          focal_point_x: number | null
          focal_point_y: number | null
          folder: string | null
          height: number | null
          id: string
          location: string | null
          metadata: Json | null
          modified_by: string | null
          modified_on: string
          storage: string
          tags: string | null
          title: string | null
          tus_data: Json | null
          tus_id: string | null
          type: string | null
          uploaded_by: string | null
          uploaded_on: string | null
          width: number | null
        }
        Insert: {
          charset?: string | null
          created_on?: string
          description?: string | null
          duration?: number | null
          embed?: string | null
          filename_disk?: string | null
          filename_download: string
          filesize?: number | null
          focal_point_x?: number | null
          focal_point_y?: number | null
          folder?: string | null
          height?: number | null
          id: string
          location?: string | null
          metadata?: Json | null
          modified_by?: string | null
          modified_on?: string
          storage: string
          tags?: string | null
          title?: string | null
          tus_data?: Json | null
          tus_id?: string | null
          type?: string | null
          uploaded_by?: string | null
          uploaded_on?: string | null
          width?: number | null
        }
        Update: {
          charset?: string | null
          created_on?: string
          description?: string | null
          duration?: number | null
          embed?: string | null
          filename_disk?: string | null
          filename_download?: string
          filesize?: number | null
          focal_point_x?: number | null
          focal_point_y?: number | null
          folder?: string | null
          height?: number | null
          id?: string
          location?: string | null
          metadata?: Json | null
          modified_by?: string | null
          modified_on?: string
          storage?: string
          tags?: string | null
          title?: string | null
          tus_data?: Json | null
          tus_id?: string | null
          type?: string | null
          uploaded_by?: string | null
          uploaded_on?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "directus_files_folder_foreign"
            columns: ["folder"]
            isOneToOne: false
            referencedRelation: "directus_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_files_modified_by_foreign"
            columns: ["modified_by"]
            isOneToOne: false
            referencedRelation: "directus_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_files_uploaded_by_foreign"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "directus_users"
            referencedColumns: ["id"]
          },
        ]
      }
      directus_flows: {
        Row: {
          accountability: string | null
          color: string | null
          date_created: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          operation: string | null
          options: Json | null
          status: string
          trigger: string | null
          user_created: string | null
        }
        Insert: {
          accountability?: string | null
          color?: string | null
          date_created?: string | null
          description?: string | null
          icon?: string | null
          id: string
          name: string
          operation?: string | null
          options?: Json | null
          status?: string
          trigger?: string | null
          user_created?: string | null
        }
        Update: {
          accountability?: string | null
          color?: string | null
          date_created?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          operation?: string | null
          options?: Json | null
          status?: string
          trigger?: string | null
          user_created?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "directus_flows_user_created_foreign"
            columns: ["user_created"]
            isOneToOne: false
            referencedRelation: "directus_users"
            referencedColumns: ["id"]
          },
        ]
      }
      directus_folders: {
        Row: {
          id: string
          name: string
          parent: string | null
        }
        Insert: {
          id: string
          name: string
          parent?: string | null
        }
        Update: {
          id?: string
          name?: string
          parent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "directus_folders_parent_foreign"
            columns: ["parent"]
            isOneToOne: false
            referencedRelation: "directus_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      directus_migrations: {
        Row: {
          name: string
          timestamp: string | null
          version: string
        }
        Insert: {
          name: string
          timestamp?: string | null
          version: string
        }
        Update: {
          name?: string
          timestamp?: string | null
          version?: string
        }
        Relationships: []
      }
      directus_notifications: {
        Row: {
          collection: string | null
          id: number
          item: string | null
          message: string | null
          recipient: string
          sender: string | null
          status: string | null
          subject: string
          timestamp: string | null
        }
        Insert: {
          collection?: string | null
          id?: number
          item?: string | null
          message?: string | null
          recipient: string
          sender?: string | null
          status?: string | null
          subject: string
          timestamp?: string | null
        }
        Update: {
          collection?: string | null
          id?: number
          item?: string | null
          message?: string | null
          recipient?: string
          sender?: string | null
          status?: string | null
          subject?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "directus_notifications_recipient_foreign"
            columns: ["recipient"]
            isOneToOne: false
            referencedRelation: "directus_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_notifications_sender_foreign"
            columns: ["sender"]
            isOneToOne: false
            referencedRelation: "directus_users"
            referencedColumns: ["id"]
          },
        ]
      }
      directus_operations: {
        Row: {
          date_created: string | null
          flow: string
          id: string
          key: string
          name: string | null
          options: Json | null
          position_x: number
          position_y: number
          reject: string | null
          resolve: string | null
          type: string
          user_created: string | null
        }
        Insert: {
          date_created?: string | null
          flow: string
          id: string
          key: string
          name?: string | null
          options?: Json | null
          position_x: number
          position_y: number
          reject?: string | null
          resolve?: string | null
          type: string
          user_created?: string | null
        }
        Update: {
          date_created?: string | null
          flow?: string
          id?: string
          key?: string
          name?: string | null
          options?: Json | null
          position_x?: number
          position_y?: number
          reject?: string | null
          resolve?: string | null
          type?: string
          user_created?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "directus_operations_flow_foreign"
            columns: ["flow"]
            isOneToOne: false
            referencedRelation: "directus_flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_operations_reject_foreign"
            columns: ["reject"]
            isOneToOne: true
            referencedRelation: "directus_operations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_operations_resolve_foreign"
            columns: ["resolve"]
            isOneToOne: true
            referencedRelation: "directus_operations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_operations_user_created_foreign"
            columns: ["user_created"]
            isOneToOne: false
            referencedRelation: "directus_users"
            referencedColumns: ["id"]
          },
        ]
      }
      directus_panels: {
        Row: {
          color: string | null
          dashboard: string
          date_created: string | null
          height: number
          icon: string | null
          id: string
          name: string | null
          note: string | null
          options: Json | null
          position_x: number
          position_y: number
          show_header: boolean
          type: string
          user_created: string | null
          width: number
        }
        Insert: {
          color?: string | null
          dashboard: string
          date_created?: string | null
          height: number
          icon?: string | null
          id: string
          name?: string | null
          note?: string | null
          options?: Json | null
          position_x: number
          position_y: number
          show_header?: boolean
          type: string
          user_created?: string | null
          width: number
        }
        Update: {
          color?: string | null
          dashboard?: string
          date_created?: string | null
          height?: number
          icon?: string | null
          id?: string
          name?: string | null
          note?: string | null
          options?: Json | null
          position_x?: number
          position_y?: number
          show_header?: boolean
          type?: string
          user_created?: string | null
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "directus_panels_dashboard_foreign"
            columns: ["dashboard"]
            isOneToOne: false
            referencedRelation: "directus_dashboards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_panels_user_created_foreign"
            columns: ["user_created"]
            isOneToOne: false
            referencedRelation: "directus_users"
            referencedColumns: ["id"]
          },
        ]
      }
      directus_permissions: {
        Row: {
          action: string
          collection: string
          fields: string | null
          id: number
          permissions: Json | null
          policy: string
          presets: Json | null
          validation: Json | null
        }
        Insert: {
          action: string
          collection: string
          fields?: string | null
          id?: number
          permissions?: Json | null
          policy: string
          presets?: Json | null
          validation?: Json | null
        }
        Update: {
          action?: string
          collection?: string
          fields?: string | null
          id?: number
          permissions?: Json | null
          policy?: string
          presets?: Json | null
          validation?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "directus_permissions_policy_foreign"
            columns: ["policy"]
            isOneToOne: false
            referencedRelation: "directus_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      directus_policies: {
        Row: {
          admin_access: boolean
          app_access: boolean
          description: string | null
          enforce_tfa: boolean
          icon: string
          id: string
          ip_access: string | null
          name: string
        }
        Insert: {
          admin_access?: boolean
          app_access?: boolean
          description?: string | null
          enforce_tfa?: boolean
          icon?: string
          id: string
          ip_access?: string | null
          name: string
        }
        Update: {
          admin_access?: boolean
          app_access?: boolean
          description?: string | null
          enforce_tfa?: boolean
          icon?: string
          id?: string
          ip_access?: string | null
          name?: string
        }
        Relationships: []
      }
      directus_presets: {
        Row: {
          bookmark: string | null
          collection: string | null
          color: string | null
          filter: Json | null
          icon: string | null
          id: number
          layout: string | null
          layout_options: Json | null
          layout_query: Json | null
          refresh_interval: number | null
          role: string | null
          search: string | null
          user: string | null
        }
        Insert: {
          bookmark?: string | null
          collection?: string | null
          color?: string | null
          filter?: Json | null
          icon?: string | null
          id?: number
          layout?: string | null
          layout_options?: Json | null
          layout_query?: Json | null
          refresh_interval?: number | null
          role?: string | null
          search?: string | null
          user?: string | null
        }
        Update: {
          bookmark?: string | null
          collection?: string | null
          color?: string | null
          filter?: Json | null
          icon?: string | null
          id?: number
          layout?: string | null
          layout_options?: Json | null
          layout_query?: Json | null
          refresh_interval?: number | null
          role?: string | null
          search?: string | null
          user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "directus_presets_role_foreign"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "directus_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_presets_user_foreign"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "directus_users"
            referencedColumns: ["id"]
          },
        ]
      }
      directus_relations: {
        Row: {
          id: number
          junction_field: string | null
          many_collection: string
          many_field: string
          one_allowed_collections: string | null
          one_collection: string | null
          one_collection_field: string | null
          one_deselect_action: string
          one_field: string | null
          sort_field: string | null
        }
        Insert: {
          id?: number
          junction_field?: string | null
          many_collection: string
          many_field: string
          one_allowed_collections?: string | null
          one_collection?: string | null
          one_collection_field?: string | null
          one_deselect_action?: string
          one_field?: string | null
          sort_field?: string | null
        }
        Update: {
          id?: number
          junction_field?: string | null
          many_collection?: string
          many_field?: string
          one_allowed_collections?: string | null
          one_collection?: string | null
          one_collection_field?: string | null
          one_deselect_action?: string
          one_field?: string | null
          sort_field?: string | null
        }
        Relationships: []
      }
      directus_revisions: {
        Row: {
          activity: number
          collection: string
          data: Json | null
          delta: Json | null
          id: number
          item: string
          parent: number | null
          version: string | null
        }
        Insert: {
          activity: number
          collection: string
          data?: Json | null
          delta?: Json | null
          id?: number
          item: string
          parent?: number | null
          version?: string | null
        }
        Update: {
          activity?: number
          collection?: string
          data?: Json | null
          delta?: Json | null
          id?: number
          item?: string
          parent?: number | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "directus_revisions_activity_foreign"
            columns: ["activity"]
            isOneToOne: false
            referencedRelation: "directus_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_revisions_parent_foreign"
            columns: ["parent"]
            isOneToOne: false
            referencedRelation: "directus_revisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_revisions_version_foreign"
            columns: ["version"]
            isOneToOne: false
            referencedRelation: "directus_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      directus_roles: {
        Row: {
          description: string | null
          icon: string
          id: string
          name: string
          parent: string | null
        }
        Insert: {
          description?: string | null
          icon?: string
          id: string
          name: string
          parent?: string | null
        }
        Update: {
          description?: string | null
          icon?: string
          id?: string
          name?: string
          parent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "directus_roles_parent_foreign"
            columns: ["parent"]
            isOneToOne: false
            referencedRelation: "directus_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      directus_sessions: {
        Row: {
          expires: string
          ip: string | null
          next_token: string | null
          origin: string | null
          share: string | null
          token: string
          user: string | null
          user_agent: string | null
        }
        Insert: {
          expires: string
          ip?: string | null
          next_token?: string | null
          origin?: string | null
          share?: string | null
          token: string
          user?: string | null
          user_agent?: string | null
        }
        Update: {
          expires?: string
          ip?: string | null
          next_token?: string | null
          origin?: string | null
          share?: string | null
          token?: string
          user?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "directus_sessions_share_foreign"
            columns: ["share"]
            isOneToOne: false
            referencedRelation: "directus_shares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_sessions_user_foreign"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "directus_users"
            referencedColumns: ["id"]
          },
        ]
      }
      directus_settings: {
        Row: {
          accepted_terms: boolean | null
          auth_login_attempts: number | null
          auth_password_policy: string | null
          basemaps: Json | null
          custom_aspect_ratios: Json | null
          custom_css: string | null
          default_appearance: string
          default_language: string
          default_theme_dark: string | null
          default_theme_light: string | null
          id: number
          mapbox_key: string | null
          module_bar: Json | null
          project_color: string
          project_descriptor: string | null
          project_id: string | null
          project_logo: string | null
          project_name: string
          project_url: string | null
          public_background: string | null
          public_favicon: string | null
          public_foreground: string | null
          public_note: string | null
          public_registration: boolean
          public_registration_email_filter: Json | null
          public_registration_role: string | null
          public_registration_verify_email: boolean
          report_bug_url: string | null
          report_error_url: string | null
          report_feature_url: string | null
          storage_asset_presets: Json | null
          storage_asset_transform: string | null
          storage_default_folder: string | null
          theme_dark_overrides: Json | null
          theme_light_overrides: Json | null
          visual_editor_urls: Json | null
        }
        Insert: {
          accepted_terms?: boolean | null
          auth_login_attempts?: number | null
          auth_password_policy?: string | null
          basemaps?: Json | null
          custom_aspect_ratios?: Json | null
          custom_css?: string | null
          default_appearance?: string
          default_language?: string
          default_theme_dark?: string | null
          default_theme_light?: string | null
          id?: number
          mapbox_key?: string | null
          module_bar?: Json | null
          project_color?: string
          project_descriptor?: string | null
          project_id?: string | null
          project_logo?: string | null
          project_name?: string
          project_url?: string | null
          public_background?: string | null
          public_favicon?: string | null
          public_foreground?: string | null
          public_note?: string | null
          public_registration?: boolean
          public_registration_email_filter?: Json | null
          public_registration_role?: string | null
          public_registration_verify_email?: boolean
          report_bug_url?: string | null
          report_error_url?: string | null
          report_feature_url?: string | null
          storage_asset_presets?: Json | null
          storage_asset_transform?: string | null
          storage_default_folder?: string | null
          theme_dark_overrides?: Json | null
          theme_light_overrides?: Json | null
          visual_editor_urls?: Json | null
        }
        Update: {
          accepted_terms?: boolean | null
          auth_login_attempts?: number | null
          auth_password_policy?: string | null
          basemaps?: Json | null
          custom_aspect_ratios?: Json | null
          custom_css?: string | null
          default_appearance?: string
          default_language?: string
          default_theme_dark?: string | null
          default_theme_light?: string | null
          id?: number
          mapbox_key?: string | null
          module_bar?: Json | null
          project_color?: string
          project_descriptor?: string | null
          project_id?: string | null
          project_logo?: string | null
          project_name?: string
          project_url?: string | null
          public_background?: string | null
          public_favicon?: string | null
          public_foreground?: string | null
          public_note?: string | null
          public_registration?: boolean
          public_registration_email_filter?: Json | null
          public_registration_role?: string | null
          public_registration_verify_email?: boolean
          report_bug_url?: string | null
          report_error_url?: string | null
          report_feature_url?: string | null
          storage_asset_presets?: Json | null
          storage_asset_transform?: string | null
          storage_default_folder?: string | null
          theme_dark_overrides?: Json | null
          theme_light_overrides?: Json | null
          visual_editor_urls?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "directus_settings_project_logo_foreign"
            columns: ["project_logo"]
            isOneToOne: false
            referencedRelation: "directus_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_settings_public_background_foreign"
            columns: ["public_background"]
            isOneToOne: false
            referencedRelation: "directus_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_settings_public_favicon_foreign"
            columns: ["public_favicon"]
            isOneToOne: false
            referencedRelation: "directus_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_settings_public_foreground_foreign"
            columns: ["public_foreground"]
            isOneToOne: false
            referencedRelation: "directus_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_settings_public_registration_role_foreign"
            columns: ["public_registration_role"]
            isOneToOne: false
            referencedRelation: "directus_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_settings_storage_default_folder_foreign"
            columns: ["storage_default_folder"]
            isOneToOne: false
            referencedRelation: "directus_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      directus_shares: {
        Row: {
          collection: string
          date_created: string | null
          date_end: string | null
          date_start: string | null
          id: string
          item: string
          max_uses: number | null
          name: string | null
          password: string | null
          role: string | null
          times_used: number | null
          user_created: string | null
        }
        Insert: {
          collection: string
          date_created?: string | null
          date_end?: string | null
          date_start?: string | null
          id: string
          item: string
          max_uses?: number | null
          name?: string | null
          password?: string | null
          role?: string | null
          times_used?: number | null
          user_created?: string | null
        }
        Update: {
          collection?: string
          date_created?: string | null
          date_end?: string | null
          date_start?: string | null
          id?: string
          item?: string
          max_uses?: number | null
          name?: string | null
          password?: string | null
          role?: string | null
          times_used?: number | null
          user_created?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "directus_shares_collection_foreign"
            columns: ["collection"]
            isOneToOne: false
            referencedRelation: "directus_collections"
            referencedColumns: ["collection"]
          },
          {
            foreignKeyName: "directus_shares_role_foreign"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "directus_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_shares_user_created_foreign"
            columns: ["user_created"]
            isOneToOne: false
            referencedRelation: "directus_users"
            referencedColumns: ["id"]
          },
        ]
      }
      directus_translations: {
        Row: {
          id: string
          key: string
          language: string
          value: string
        }
        Insert: {
          id: string
          key: string
          language: string
          value: string
        }
        Update: {
          id?: string
          key?: string
          language?: string
          value?: string
        }
        Relationships: []
      }
      directus_users: {
        Row: {
          appearance: string | null
          auth_data: Json | null
          avatar: string | null
          description: string | null
          email: string | null
          email_notifications: boolean | null
          external_identifier: string | null
          first_name: string | null
          id: string
          language: string | null
          last_access: string | null
          last_name: string | null
          last_page: string | null
          location: string | null
          password: string | null
          provider: string
          role: string | null
          status: string
          tags: Json | null
          text_direction: string
          tfa_secret: string | null
          theme_dark: string | null
          theme_dark_overrides: Json | null
          theme_light: string | null
          theme_light_overrides: Json | null
          title: string | null
          token: string | null
        }
        Insert: {
          appearance?: string | null
          auth_data?: Json | null
          avatar?: string | null
          description?: string | null
          email?: string | null
          email_notifications?: boolean | null
          external_identifier?: string | null
          first_name?: string | null
          id: string
          language?: string | null
          last_access?: string | null
          last_name?: string | null
          last_page?: string | null
          location?: string | null
          password?: string | null
          provider?: string
          role?: string | null
          status?: string
          tags?: Json | null
          text_direction?: string
          tfa_secret?: string | null
          theme_dark?: string | null
          theme_dark_overrides?: Json | null
          theme_light?: string | null
          theme_light_overrides?: Json | null
          title?: string | null
          token?: string | null
        }
        Update: {
          appearance?: string | null
          auth_data?: Json | null
          avatar?: string | null
          description?: string | null
          email?: string | null
          email_notifications?: boolean | null
          external_identifier?: string | null
          first_name?: string | null
          id?: string
          language?: string | null
          last_access?: string | null
          last_name?: string | null
          last_page?: string | null
          location?: string | null
          password?: string | null
          provider?: string
          role?: string | null
          status?: string
          tags?: Json | null
          text_direction?: string
          tfa_secret?: string | null
          theme_dark?: string | null
          theme_dark_overrides?: Json | null
          theme_light?: string | null
          theme_light_overrides?: Json | null
          title?: string | null
          token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "directus_users_role_foreign"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "directus_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      directus_versions: {
        Row: {
          collection: string
          date_created: string | null
          date_updated: string | null
          delta: Json | null
          hash: string | null
          id: string
          item: string
          key: string
          name: string | null
          user_created: string | null
          user_updated: string | null
        }
        Insert: {
          collection: string
          date_created?: string | null
          date_updated?: string | null
          delta?: Json | null
          hash?: string | null
          id: string
          item: string
          key: string
          name?: string | null
          user_created?: string | null
          user_updated?: string | null
        }
        Update: {
          collection?: string
          date_created?: string | null
          date_updated?: string | null
          delta?: Json | null
          hash?: string | null
          id?: string
          item?: string
          key?: string
          name?: string | null
          user_created?: string | null
          user_updated?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "directus_versions_collection_foreign"
            columns: ["collection"]
            isOneToOne: false
            referencedRelation: "directus_collections"
            referencedColumns: ["collection"]
          },
          {
            foreignKeyName: "directus_versions_user_created_foreign"
            columns: ["user_created"]
            isOneToOne: false
            referencedRelation: "directus_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directus_versions_user_updated_foreign"
            columns: ["user_updated"]
            isOneToOne: false
            referencedRelation: "directus_users"
            referencedColumns: ["id"]
          },
        ]
      }
      directus_webhooks: {
        Row: {
          actions: string
          collections: string
          data: boolean
          headers: Json | null
          id: number
          method: string
          migrated_flow: string | null
          name: string
          status: string
          url: string
          was_active_before_deprecation: boolean
        }
        Insert: {
          actions: string
          collections: string
          data?: boolean
          headers?: Json | null
          id?: number
          method?: string
          migrated_flow?: string | null
          name: string
          status?: string
          url: string
          was_active_before_deprecation?: boolean
        }
        Update: {
          actions?: string
          collections?: string
          data?: boolean
          headers?: Json | null
          id?: number
          method?: string
          migrated_flow?: string | null
          name?: string
          status?: string
          url?: string
          was_active_before_deprecation?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "directus_webhooks_migrated_flow_foreign"
            columns: ["migrated_flow"]
            isOneToOne: false
            referencedRelation: "directus_flows"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          active: boolean | null
          description: string | null
          id: number
          name: string | null
          sku_code: string | null
          sort: number | null
          specs: Json | null
          webflow_id: string | null
        }
        Insert: {
          active?: boolean | null
          description?: string | null
          id?: number
          name?: string | null
          sku_code?: string | null
          sort?: number | null
          specs?: Json | null
          webflow_id?: string | null
        }
        Update: {
          active?: boolean | null
          description?: string | null
          id?: number
          name?: string | null
          sku_code?: string | null
          sort?: number | null
          specs?: Json | null
          webflow_id?: string | null
        }
        Relationships: []
      }
      dynamic_sku_index: {
        Row: {
          configuration: Json
          configuration_hash: string
          created_at: string | null
          id: string
          is_valid: boolean | null
          metadata: Json | null
          price_cache: number | null
          product_id: number | null
          sku_code: string
          updated_at: string | null
        }
        Insert: {
          configuration: Json
          configuration_hash: string
          created_at?: string | null
          id?: string
          is_valid?: boolean | null
          metadata?: Json | null
          price_cache?: number | null
          product_id?: number | null
          sku_code: string
          updated_at?: string | null
        }
        Update: {
          configuration?: Json
          configuration_hash?: string
          created_at?: string | null
          id?: string
          is_valid?: boolean | null
          metadata?: Json | null
          price_cache?: number | null
          product_id?: number | null
          sku_code?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dynamic_sku_index_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "mv_product_option_matrix"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "dynamic_sku_index_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dynamic_sku_index_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_product_configurator"
            referencedColumns: ["product_id"]
          },
        ]
      }
      frame_colors: {
        Row: {
          active: boolean | null
          description: string | null
          hex_code: string | null
          id: number
          name: string | null
          sku_code: string | null
          sort: number | null
          webflow_id: string | null
        }
        Insert: {
          active?: boolean | null
          description?: string | null
          hex_code?: string | null
          id?: number
          name?: string | null
          sku_code?: string | null
          sort?: number | null
          webflow_id?: string | null
        }
        Update: {
          active?: boolean | null
          description?: string | null
          hex_code?: string | null
          id?: number
          name?: string | null
          sku_code?: string | null
          sort?: number | null
          webflow_id?: string | null
        }
        Relationships: []
      }
      frame_thicknesses: {
        Row: {
          active: boolean | null
          id: number
          name: string | null
          sku_code: string | null
          sort: number | null
          webflow_id: string | null
        }
        Insert: {
          active?: boolean | null
          id?: number
          name?: string | null
          sku_code?: string | null
          sort?: number | null
          webflow_id?: string | null
        }
        Update: {
          active?: boolean | null
          id?: number
          name?: string | null
          sku_code?: string | null
          sort?: number | null
          webflow_id?: string | null
        }
        Relationships: []
      }
      hanging_techniques: {
        Row: {
          date_updated: string | null
          id: number
          name: string | null
          sku_code: string | null
          sort: number | null
          status: string
        }
        Insert: {
          date_updated?: string | null
          id?: number
          name?: string | null
          sku_code?: string | null
          sort?: number | null
          status?: string
        }
        Update: {
          date_updated?: string | null
          id?: number
          name?: string | null
          sku_code?: string | null
          sort?: number | null
          status?: string
        }
        Relationships: []
      }
      kv_store_7a15d1c5: {
        Row: {
          key: string
          value: Json
        }
        Insert: {
          key: string
          value: Json
        }
        Update: {
          key?: string
          value?: Json
        }
        Relationships: []
      }
      kv_store_8bb96920: {
        Row: {
          key: string
          value: Json
        }
        Insert: {
          key: string
          value: Json
        }
        Update: {
          key?: string
          value?: Json
        }
        Relationships: []
      }
      kv_store_bfa1f56b: {
        Row: {
          key: string
          value: Json
        }
        Insert: {
          key: string
          value: Json
        }
        Update: {
          key?: string
          value?: Json
        }
        Relationships: []
      }
      light_directions: {
        Row: {
          active: boolean | null
          description: string | null
          id: number
          name: string | null
          sku_code: string | null
          sort: number | null
          svg_code: Json | null
          webflow_id: string | null
        }
        Insert: {
          active?: boolean | null
          description?: string | null
          id?: number
          name?: string | null
          sku_code?: string | null
          sort?: number | null
          svg_code?: Json | null
          webflow_id?: string | null
        }
        Update: {
          active?: boolean | null
          description?: string | null
          id?: number
          name?: string | null
          sku_code?: string | null
          sort?: number | null
          svg_code?: Json | null
          webflow_id?: string | null
        }
        Relationships: []
      }
      light_outputs: {
        Row: {
          active: boolean | null
          description: string | null
          id: number
          name: string | null
          sku_code: string | null
          sort: number | null
          webflow_id: string | null
        }
        Insert: {
          active?: boolean | null
          description?: string | null
          id?: number
          name?: string | null
          sku_code?: string | null
          sort?: number | null
          webflow_id?: string | null
        }
        Update: {
          active?: boolean | null
          description?: string | null
          id?: number
          name?: string | null
          sku_code?: string | null
          sort?: number | null
          webflow_id?: string | null
        }
        Relationships: []
      }
      mirror_styles: {
        Row: {
          active: boolean | null
          description: string | null
          id: number
          installation_guide: string | null
          name: string | null
          sku_code: string | null
          sort: number | null
          svg_code: Json | null
          webflow_id: string | null
        }
        Insert: {
          active?: boolean | null
          description?: string | null
          id?: number
          installation_guide?: string | null
          name?: string | null
          sku_code?: string | null
          sort?: number | null
          svg_code?: Json | null
          webflow_id?: string | null
        }
        Update: {
          active?: boolean | null
          description?: string | null
          id?: number
          installation_guide?: string | null
          name?: string | null
          sku_code?: string | null
          sort?: number | null
          svg_code?: Json | null
          webflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mirror_styles_installation_guide_foreign"
            columns: ["installation_guide"]
            isOneToOne: false
            referencedRelation: "directus_files"
            referencedColumns: ["id"]
          },
        ]
      }
      mounting_options: {
        Row: {
          active: boolean | null
          description: string | null
          id: number
          name: string | null
          sku_code: string | null
          sort: number | null
          webflow_id: string | null
        }
        Insert: {
          active?: boolean | null
          description?: string | null
          id?: number
          name?: string | null
          sku_code?: string | null
          sort?: number | null
          webflow_id?: string | null
        }
        Update: {
          active?: boolean | null
          description?: string | null
          id?: number
          name?: string | null
          sku_code?: string | null
          sort?: number | null
          webflow_id?: string | null
        }
        Relationships: []
      }
      option_compatibility: {
        Row: {
          attribute_code: string
          available_products: number[] | null
          compatible_with: Json | null
          created_at: string | null
          id: string
          incompatible_with: Json | null
          is_active: boolean | null
          option_code: string
          priority: number | null
          product_line_id: number | null
          updated_at: string | null
        }
        Insert: {
          attribute_code: string
          available_products?: number[] | null
          compatible_with?: Json | null
          created_at?: string | null
          id?: string
          incompatible_with?: Json | null
          is_active?: boolean | null
          option_code: string
          priority?: number | null
          product_line_id?: number | null
          updated_at?: string | null
        }
        Update: {
          attribute_code?: string
          available_products?: number[] | null
          compatible_with?: Json | null
          created_at?: string | null
          id?: string
          incompatible_with?: Json | null
          is_active?: boolean | null
          option_code?: string
          priority?: number | null
          product_line_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "option_compatibility_product_line_id_fkey"
            columns: ["product_line_id"]
            isOneToOne: false
            referencedRelation: "product_line_option_matrix"
            referencedColumns: ["product_line_id"]
          },
          {
            foreignKeyName: "option_compatibility_product_line_id_fkey"
            columns: ["product_line_id"]
            isOneToOne: false
            referencedRelation: "product_lines"
            referencedColumns: ["id"]
          },
        ]
      }
      product_configurations: {
        Row: {
          attribute_id: string | null
          created_at: string | null
          default_option_id: string | null
          display_order: number | null
          id: string
          is_required: boolean | null
          is_visible: boolean | null
          metadata: Json | null
          product_id: number | null
          ui_component: string | null
          updated_at: string | null
        }
        Insert: {
          attribute_id?: string | null
          created_at?: string | null
          default_option_id?: string | null
          display_order?: number | null
          id?: string
          is_required?: boolean | null
          is_visible?: boolean | null
          metadata?: Json | null
          product_id?: number | null
          ui_component?: string | null
          updated_at?: string | null
        }
        Update: {
          attribute_id?: string | null
          created_at?: string | null
          default_option_id?: string | null
          display_order?: number | null
          id?: string
          is_required?: boolean | null
          is_visible?: boolean | null
          metadata?: Json | null
          product_id?: number | null
          ui_component?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_configurations_attribute_id_fkey"
            columns: ["attribute_id"]
            isOneToOne: false
            referencedRelation: "configuration_attributes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_configurations_default_option_id_fkey"
            columns: ["default_option_id"]
            isOneToOne: false
            referencedRelation: "configuration_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_configurations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "mv_product_option_matrix"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_configurations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_configurations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_product_configurator"
            referencedColumns: ["product_id"]
          },
        ]
      }
      product_line_configurations: {
        Row: {
          attribute_code: string
          created_at: string | null
          display_order: number | null
          id: string
          is_required: boolean | null
          metadata: Json | null
          product_line_id: number | null
          show_when_conditions: Json | null
          ui_component: string | null
          updated_at: string | null
        }
        Insert: {
          attribute_code: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_required?: boolean | null
          metadata?: Json | null
          product_line_id?: number | null
          show_when_conditions?: Json | null
          ui_component?: string | null
          updated_at?: string | null
        }
        Update: {
          attribute_code?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_required?: boolean | null
          metadata?: Json | null
          product_line_id?: number | null
          show_when_conditions?: Json | null
          ui_component?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_line_configurations_product_line_id_fkey"
            columns: ["product_line_id"]
            isOneToOne: false
            referencedRelation: "product_line_option_matrix"
            referencedColumns: ["product_line_id"]
          },
          {
            foreignKeyName: "product_line_configurations_product_line_id_fkey"
            columns: ["product_line_id"]
            isOneToOne: false
            referencedRelation: "product_lines"
            referencedColumns: ["id"]
          },
        ]
      }
      product_lines: {
        Row: {
          active: boolean | null
          date_updated: string | null
          description: string | null
          id: number
          image: string | null
          name: string | null
          sku_code: string | null
          sort: number | null
        }
        Insert: {
          active?: boolean | null
          date_updated?: string | null
          description?: string | null
          id?: number
          image?: string | null
          name?: string | null
          sku_code?: string | null
          sort?: number | null
        }
        Update: {
          active?: boolean | null
          date_updated?: string | null
          description?: string | null
          id?: number
          image?: string | null
          name?: string | null
          sku_code?: string | null
          sort?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_lines_image_foreign"
            columns: ["image"]
            isOneToOne: false
            referencedRelation: "directus_files"
            referencedColumns: ["id"]
          },
        ]
      }
      product_lines_default_options: {
        Row: {
          collection: string | null
          id: number
          item: string | null
          product_lines_id: number | null
        }
        Insert: {
          collection?: string | null
          id?: number
          item?: string | null
          product_lines_id?: number | null
        }
        Update: {
          collection?: string | null
          id?: number
          item?: string | null
          product_lines_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_lines_default_options_product_lines_id_foreign"
            columns: ["product_lines_id"]
            isOneToOne: false
            referencedRelation: "product_line_option_matrix"
            referencedColumns: ["product_line_id"]
          },
          {
            foreignKeyName: "product_lines_default_options_product_lines_id_foreign"
            columns: ["product_lines_id"]
            isOneToOne: false
            referencedRelation: "product_lines"
            referencedColumns: ["id"]
          },
        ]
      }
      product_option_cache: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          option_combination: Json
          option_hash: string | null
          product_id: number | null
          product_line_id: number | null
          sku_code: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          option_combination: Json
          option_hash?: string | null
          product_id?: number | null
          product_line_id?: number | null
          sku_code?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          option_combination?: Json
          option_hash?: string | null
          product_id?: number | null
          product_line_id?: number | null
          sku_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_option_cache_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "mv_product_option_matrix"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_option_cache_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_option_cache_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_product_configurator"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_option_cache_product_line_id_fkey"
            columns: ["product_line_id"]
            isOneToOne: false
            referencedRelation: "product_line_option_matrix"
            referencedColumns: ["product_line_id"]
          },
          {
            foreignKeyName: "product_option_cache_product_line_id_fkey"
            columns: ["product_line_id"]
            isOneToOne: false
            referencedRelation: "product_lines"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          description: string | null
          frame_thickness: Json | null
          horizontal_image: string | null
          id: number
          light_direction: number | null
          mirror_style: number | null
          name: string | null
          product_line: number | null
          revit_file: string | null
          sku_code: string | null
          sort: number | null
          spec_sheet: string | null
          vertical_image: string | null
          webflow_id: string | null
        }
        Insert: {
          active?: boolean | null
          description?: string | null
          frame_thickness?: Json | null
          horizontal_image?: string | null
          id?: number
          light_direction?: number | null
          mirror_style?: number | null
          name?: string | null
          product_line?: number | null
          revit_file?: string | null
          sku_code?: string | null
          sort?: number | null
          spec_sheet?: string | null
          vertical_image?: string | null
          webflow_id?: string | null
        }
        Update: {
          active?: boolean | null
          description?: string | null
          frame_thickness?: Json | null
          horizontal_image?: string | null
          id?: number
          light_direction?: number | null
          mirror_style?: number | null
          name?: string | null
          product_line?: number | null
          revit_file?: string | null
          sku_code?: string | null
          sort?: number | null
          spec_sheet?: string | null
          vertical_image?: string | null
          webflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_horizontal_image_foreign"
            columns: ["horizontal_image"]
            isOneToOne: false
            referencedRelation: "directus_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_light_direction_foreign"
            columns: ["light_direction"]
            isOneToOne: false
            referencedRelation: "light_directions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_mirror_style_foreign"
            columns: ["mirror_style"]
            isOneToOne: false
            referencedRelation: "mirror_styles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_product_line_foreign"
            columns: ["product_line"]
            isOneToOne: false
            referencedRelation: "product_line_option_matrix"
            referencedColumns: ["product_line_id"]
          },
          {
            foreignKeyName: "products_product_line_foreign"
            columns: ["product_line"]
            isOneToOne: false
            referencedRelation: "product_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_revit_file_foreign"
            columns: ["revit_file"]
            isOneToOne: false
            referencedRelation: "directus_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_spec_sheet_foreign"
            columns: ["spec_sheet"]
            isOneToOne: false
            referencedRelation: "directus_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_vertical_image_foreign"
            columns: ["vertical_image"]
            isOneToOne: false
            referencedRelation: "directus_files"
            referencedColumns: ["id"]
          },
        ]
      }
      products_files_1: {
        Row: {
          directus_files_id: string | null
          id: number
          products_id: number | null
        }
        Insert: {
          directus_files_id?: string | null
          id?: number
          products_id?: number | null
        }
        Update: {
          directus_files_id?: string | null
          id?: number
          products_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_files_1_directus_files_id_foreign"
            columns: ["directus_files_id"]
            isOneToOne: false
            referencedRelation: "directus_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_files_1_products_id_foreign"
            columns: ["products_id"]
            isOneToOne: false
            referencedRelation: "mv_product_option_matrix"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "products_files_1_products_id_foreign"
            columns: ["products_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_files_1_products_id_foreign"
            columns: ["products_id"]
            isOneToOne: false
            referencedRelation: "v_product_configurator"
            referencedColumns: ["product_id"]
          },
        ]
      }
      products_options_overrides: {
        Row: {
          collection: string | null
          id: number
          item: string | null
          products_id: number | null
        }
        Insert: {
          collection?: string | null
          id?: number
          item?: string | null
          products_id?: number | null
        }
        Update: {
          collection?: string | null
          id?: number
          item?: string | null
          products_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_options_overrides_products_id_foreign"
            columns: ["products_id"]
            isOneToOne: false
            referencedRelation: "mv_product_option_matrix"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "products_options_overrides_products_id_foreign"
            columns: ["products_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_options_overrides_products_id_foreign"
            columns: ["products_id"]
            isOneToOne: false
            referencedRelation: "v_product_configurator"
            referencedColumns: ["product_id"]
          },
        ]
      }
      quote_items: {
        Row: {
          custom_details: string | null
          id: number
          is_custom: boolean | null
          price: number | null
          product_variant_id: string | null
          quantity: number | null
          quote_id: string | null
          sort: number | null
          webflow_id: string | null
        }
        Insert: {
          custom_details?: string | null
          id?: number
          is_custom?: boolean | null
          price?: number | null
          product_variant_id?: string | null
          quantity?: number | null
          quote_id?: string | null
          sort?: number | null
          webflow_id?: string | null
        }
        Update: {
          custom_details?: string | null
          id?: number
          is_custom?: boolean | null
          price?: number | null
          product_variant_id?: string | null
          quantity?: number | null
          quote_id?: string | null
          sort?: number | null
          webflow_id?: string | null
        }
        Relationships: []
      }
      quotes: {
        Row: {
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          date_created: string | null
          date_updated: string | null
          id: number
          notes: string | null
          status: string | null
          webflow_id: string | null
        }
        Insert: {
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          date_created?: string | null
          date_updated?: string | null
          id?: number
          notes?: string | null
          status?: string | null
          webflow_id?: string | null
        }
        Update: {
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          date_created?: string | null
          date_updated?: string | null
          id?: number
          notes?: string | null
          status?: string | null
          webflow_id?: string | null
        }
        Relationships: []
      }
      rules: {
        Row: {
          id: string
          if_this: Json | null
          name: string | null
          priority: number | null
          then_that: Json | null
        }
        Insert: {
          id: string
          if_this?: Json | null
          name?: string | null
          priority?: number | null
          then_that?: Json | null
        }
        Update: {
          id?: string
          if_this?: Json | null
          name?: string | null
          priority?: number | null
          then_that?: Json | null
        }
        Relationships: []
      }
      sizes: {
        Row: {
          active: boolean | null
          height: string | null
          id: number
          name: string | null
          sku_code: string | null
          sort: number | null
          webflow_id: string | null
          width: string | null
        }
        Insert: {
          active?: boolean | null
          height?: string | null
          id?: number
          name?: string | null
          sku_code?: string | null
          sort?: number | null
          webflow_id?: string | null
          width?: string | null
        }
        Update: {
          active?: boolean | null
          height?: string | null
          id?: number
          name?: string | null
          sku_code?: string | null
          sort?: number | null
          webflow_id?: string | null
          width?: string | null
        }
        Relationships: []
      }
      sku_code_order: {
        Row: {
          id: string
          order: number | null
          sku_code_item: string | null
        }
        Insert: {
          id: string
          order?: number | null
          sku_code_item?: string | null
        }
        Update: {
          id?: string
          order?: number | null
          sku_code_item?: string | null
        }
        Relationships: []
      }
      sku_generation_rules: {
        Row: {
          attribute_code: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          rule_order: number
          separator: string | null
          sku_segment_template: string | null
          updated_at: string | null
        }
        Insert: {
          attribute_code?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          rule_order: number
          separator?: string | null
          sku_segment_template?: string | null
          updated_at?: string | null
        }
        Update: {
          attribute_code?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          rule_order?: number
          separator?: string | null
          sku_segment_template?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sku_index: {
        Row: {
          accessory_id: number | null
          color_temperature_id: number | null
          created_at: string | null
          driver_id: number | null
          frame_color_id: number | null
          frame_thickness_id: number | null
          hanging_technique_id: number | null
          id: number
          light_direction_id: number | null
          light_output_id: number | null
          mirror_style_id: number | null
          mounting_option_id: number | null
          product_id: number
          product_line_id: number | null
          size_id: number | null
          sku_code: string
        }
        Insert: {
          accessory_id?: number | null
          color_temperature_id?: number | null
          created_at?: string | null
          driver_id?: number | null
          frame_color_id?: number | null
          frame_thickness_id?: number | null
          hanging_technique_id?: number | null
          id?: number
          light_direction_id?: number | null
          light_output_id?: number | null
          mirror_style_id?: number | null
          mounting_option_id?: number | null
          product_id: number
          product_line_id?: number | null
          size_id?: number | null
          sku_code: string
        }
        Update: {
          accessory_id?: number | null
          color_temperature_id?: number | null
          created_at?: string | null
          driver_id?: number | null
          frame_color_id?: number | null
          frame_thickness_id?: number | null
          hanging_technique_id?: number | null
          id?: number
          light_direction_id?: number | null
          light_output_id?: number | null
          mirror_style_id?: number | null
          mounting_option_id?: number | null
          product_id?: number
          product_line_id?: number | null
          size_id?: number | null
          sku_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_sku_index_accessory"
            columns: ["accessory_id"]
            isOneToOne: false
            referencedRelation: "accessories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sku_index_color_temperature"
            columns: ["color_temperature_id"]
            isOneToOne: false
            referencedRelation: "color_temperatures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sku_index_driver"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sku_index_frame_color"
            columns: ["frame_color_id"]
            isOneToOne: false
            referencedRelation: "frame_colors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sku_index_frame_thickness"
            columns: ["frame_thickness_id"]
            isOneToOne: false
            referencedRelation: "frame_thicknesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sku_index_hanging_technique"
            columns: ["hanging_technique_id"]
            isOneToOne: false
            referencedRelation: "hanging_techniques"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sku_index_light_direction"
            columns: ["light_direction_id"]
            isOneToOne: false
            referencedRelation: "light_directions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sku_index_light_output"
            columns: ["light_output_id"]
            isOneToOne: false
            referencedRelation: "light_outputs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sku_index_mirror_style"
            columns: ["mirror_style_id"]
            isOneToOne: false
            referencedRelation: "mirror_styles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sku_index_mounting_option"
            columns: ["mounting_option_id"]
            isOneToOne: false
            referencedRelation: "mounting_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sku_index_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "mv_product_option_matrix"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "fk_sku_index_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sku_index_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_product_configurator"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "fk_sku_index_product_line"
            columns: ["product_line_id"]
            isOneToOne: false
            referencedRelation: "product_line_option_matrix"
            referencedColumns: ["product_line_id"]
          },
          {
            foreignKeyName: "fk_sku_index_product_line"
            columns: ["product_line_id"]
            isOneToOne: false
            referencedRelation: "product_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sku_index_size"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "sizes"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      test_data: {
        Row: {
          created_at: string | null
          id: number
          name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      ultimate_test: {
        Row: {
          id: number | null
          message: string | null
        }
        Insert: {
          id?: number | null
          message?: string | null
        }
        Update: {
          id?: number | null
          message?: string | null
        }
        Relationships: []
      }
      working_diagnostics: {
        Row: {
          id: number
          recommendation: string | null
          result: string | null
          run_timestamp: string | null
          status: string | null
          test_name: string | null
        }
        Insert: {
          id?: number
          recommendation?: string | null
          result?: string | null
          run_timestamp?: string | null
          status?: string | null
          test_name?: string | null
        }
        Update: {
          id?: number
          recommendation?: string | null
          result?: string | null
          run_timestamp?: string | null
          status?: string | null
          test_name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown | null
          f_table_catalog: unknown | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown | null
          f_table_catalog: string | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      mv_product_option_matrix: {
        Row: {
          attribute_code: string | null
          attribute_name: string | null
          available_options: string[] | null
          option_count: number | null
          product_id: number | null
          product_name: string | null
        }
        Relationships: []
      }
      postgrest_diagnosis: {
        Row: {
          description: string | null
          diagnostic_type: string | null
          result: string | null
        }
        Relationships: []
      }
      product_line_option_matrix: {
        Row: {
          available_attributes: Json | null
          product_ids: number[] | null
          product_line_code: string | null
          product_line_id: number | null
          product_line_name: string | null
          total_products: number | null
        }
        Relationships: []
      }
      v_product_configurator: {
        Row: {
          attribute_codes: Json | null
          available_attributes: number | null
          product_active: boolean | null
          product_description: string | null
          product_id: number | null
          product_name: string | null
          required_attributes: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_scripts_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_bestsrid: {
        Args: { "": unknown }
        Returns: number
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_pointoutside: {
        Args: { "": unknown }
        Returns: unknown
      }
      _st_sortablehash: {
        Args: { geom: unknown }
        Returns: number
      }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      addauth: {
        Args: { "": string }
        Returns: boolean
      }
      addgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
          | {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
          | {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
        Returns: string
      }
      api_configurator_get_product: {
        Args: { p_product_id: number }
        Returns: Json
      }
      box: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box3d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3dtobox: {
        Args: { "": unknown }
        Returns: unknown
      }
      build_product_option_cache: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      bytea: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      calculate_configuration_price: {
        Args: { p_configuration: Json; p_product_id: number }
        Returns: Json
      }
      check_configuration_dependencies: {
        Args: { p_configuration: Json }
        Returns: Json
      }
      comprehensive_diagnostics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      debug_table_access: {
        Args: Record<PropertyKey, never>
        Returns: {
          current_role_name: string
          rls_enabled: boolean
          row_count: number
          sample_data: string
          table_name: string
        }[]
      }
      debug_visible_tables: {
        Args: Record<PropertyKey, never>
        Returns: {
          row_count: number
          table_name: string
        }[]
      }
      disablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      dmetaphone: {
        Args: { "": string }
        Returns: string
      }
      dmetaphone_alt: {
        Args: { "": string }
        Returns: string
      }
      dropgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
          | { column_name: string; schema_name: string; table_name: string }
          | { column_name: string; table_name: string }
        Returns: string
      }
      dropgeometrytable: {
        Args:
          | { catalog_name: string; schema_name: string; table_name: string }
          | { schema_name: string; table_name: string }
          | { table_name: string }
        Returns: string
      }
      enablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      find_product_from_selection: {
        Args: { p_product_line_id: number; p_selection: Json }
        Returns: Json
      }
      generate_dynamic_sku: {
        Args: { p_configuration: Json; p_product_id: number }
        Returns: string
      }
      generate_sku_index_for_line: {
        Args: { clear_existing?: boolean; pl_id: number }
        Returns: number
      }
      generate_sku_index_for_product: {
        Args: { clear_existing?: boolean; p_id: number }
        Returns: number
      }
      geography: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      geography_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geography_gist_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_gist_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_send: {
        Args: { "": unknown }
        Returns: string
      }
      geography_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geography_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry: {
        Args:
          | { "": string }
          | { "": string }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
        Returns: unknown
      }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_sortsupport_2d: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_hash: {
        Args: { "": unknown }
        Returns: number
      }
      geometry_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_recv: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_send: {
        Args: { "": unknown }
        Returns: string
      }
      geometry_sortsupport: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_spgist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_3d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geometry_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometrytype: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      get_active_product_lines: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_all_option_collections: {
        Args: Record<PropertyKey, never>
        Returns: {
          collection_name: string
          has_name: boolean
          has_sku_code: boolean
        }[]
      }
      get_all_sku_index: {
        Args: Record<PropertyKey, never>
        Returns: {
          accessory_id: number
          color_temperature_id: number
          created_at: string
          driver_id: number
          frame_color_id: number
          id: number
          light_output_id: number
          mounting_option_id: number
          product_id: number
          size_id: number
          sku_code: string
        }[]
      }
      get_available_options: {
        Args: { p_current_selection?: Json; p_product_line_id: number }
        Returns: Json
      }
      get_configuration_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_option_collections: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      get_postgrest_diagnostics: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          check_result: string
          check_status: string
          recommendation: string
        }[]
      }
      get_product_configuration: {
        Args: { p_product_id: number }
        Returns: Json
      }
      get_product_line_options: {
        Args: { p_product_line_id: number }
        Returns: Json
      }
      get_product_with_line: {
        Args: { product_id: number }
        Returns: {
          id: number
          name: string
          product_line_id: number
          product_line_name: string
          product_line_sku_code: string
          sku_code: string
        }[]
      }
      get_proj4_from_srid: {
        Args: { "": number }
        Returns: string
      }
      get_top_products_by_sku_count: {
        Args: { limit_count?: number }
        Returns: {
          product_id: number
          sku_count: number
        }[]
      }
      get_valid_product_combinations: {
        Args: { p_limit?: number; p_product_id: number }
        Returns: {
          configuration: Json
          is_valid: boolean
          sku_code: string
        }[]
      }
      gettransactionid: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      gidx_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gidx_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      json: {
        Args: { "": unknown }
        Returns: Json
      }
      jsonb: {
        Args: { "": unknown }
        Returns: Json
      }
      longtransactionsenabled: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      migrate_sku_batch: {
        Args: { p_batch_size?: number }
        Returns: Json
      }
      path: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_asflatgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_geometry_clusterintersecting_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_clusterwithin_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_collect_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_makeline_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_polygonize_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      point: {
        Args: { "": unknown }
        Returns: unknown
      }
      polygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      populate_geometry_columns: {
        Args:
          | { tbl_oid: unknown; use_typmod?: boolean }
          | { use_typmod?: boolean }
        Returns: string
      }
      populate_product_line_configurations: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      postgis_addbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_dropbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_extensions_upgrade: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_full_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_geos_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_geos_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_getbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_hasbbox: {
        Args: { "": unknown }
        Returns: boolean
      }
      postgis_index_supportfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_lib_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_revision: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libjson_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_liblwgeom_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libprotobuf_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libxml_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_proj_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_installed: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_released: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_svn_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_typmod_dims: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_srid: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_type: {
        Args: { "": number }
        Returns: string
      }
      postgis_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_wagyu_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      refresh_product_option_matrix: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      rest_diagnostics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      simple_diagnostic_rpc: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      soundex: {
        Args: { "": string }
        Returns: string
      }
      spheroid_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      spheroid_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlength: {
        Args: { "": unknown }
        Returns: number
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dperimeter: {
        Args: { "": unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle: {
        Args:
          | { line1: unknown; line2: unknown }
          | { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
        Returns: number
      }
      st_area: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_area2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_asbinary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_asewkt: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asgeojson: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; options?: number }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
          | {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
        Returns: string
      }
      st_asgml: {
        Args:
          | { "": string }
          | {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
          | {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
          | {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_ashexewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_askml: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
          | { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
        Returns: string
      }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: {
        Args: { format?: string; geom: unknown }
        Returns: string
      }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; rel?: number }
          | { geom: unknown; maxdecimaldigits?: number; rel?: number }
        Returns: string
      }
      st_astext: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_astwkb: {
        Args:
          | {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
          | {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
        Returns: string
      }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_boundary: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer: {
        Args:
          | { geom: unknown; options?: string; radius: number }
          | { geom: unknown; quadsegs: number; radius: number }
        Returns: unknown
      }
      st_buildarea: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_centroid: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      st_cleangeometry: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_clusterintersecting: {
        Args: { "": unknown[] }
        Returns: unknown[]
      }
      st_collect: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collectionextract: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_collectionhomogenize: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_convexhull: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_coorddim: {
        Args: { geometry: unknown }
        Returns: number
      }
      st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_dimension: {
        Args: { "": unknown }
        Returns: number
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance: {
        Args:
          | { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_distancesphere: {
        Args:
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; radius: number }
        Returns: number
      }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dump: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumppoints: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumprings: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumpsegments: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_endpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_envelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_expand: {
        Args:
          | { box: unknown; dx: number; dy: number }
          | { box: unknown; dx: number; dy: number; dz?: number }
          | { dm?: number; dx: number; dy: number; dz?: number; geom: unknown }
        Returns: unknown
      }
      st_exteriorring: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_flipcoordinates: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force3d: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_forcecollection: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcecurve: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygonccw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygoncw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcerhr: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcesfs: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_generatepoints: {
        Args:
          | { area: unknown; npoints: number }
          | { area: unknown; npoints: number; seed: number }
        Returns: unknown
      }
      st_geogfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geogfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geographyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geohash: {
        Args:
          | { geog: unknown; maxchars?: number }
          | { geom: unknown; maxchars?: number }
        Returns: string
      }
      st_geomcollfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomcollfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometrytype: {
        Args: { "": unknown }
        Returns: string
      }
      st_geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromgeojson: {
        Args: { "": Json } | { "": Json } | { "": string }
        Returns: unknown
      }
      st_geomfromgml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromkml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfrommarc21: {
        Args: { marc21xml: string }
        Returns: unknown
      }
      st_geomfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromtwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_gmltosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_hasarc: {
        Args: { geometry: unknown }
        Returns: boolean
      }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_isclosed: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_iscollection: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isempty: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygonccw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygoncw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isring: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_issimple: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvalid: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
      }
      st_isvalidreason: {
        Args: { "": unknown }
        Returns: string
      }
      st_isvalidtrajectory: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_length: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_length2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_letters: {
        Args: { font?: Json; letters: string }
        Returns: unknown
      }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefrommultipoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_linefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linemerge: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linestringfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linetocurve: {
        Args: { geometry: unknown }
        Returns: unknown
      }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_m: {
        Args: { "": unknown }
        Returns: number
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makepolygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { "": unknown } | { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_maximuminscribedcircle: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_memsize: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_minimumboundingradius: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_minimumclearance: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumclearanceline: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_mlinefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mlinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multi: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_multilinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multilinestringfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_ndims: {
        Args: { "": unknown }
        Returns: number
      }
      st_node: {
        Args: { g: unknown }
        Returns: unknown
      }
      st_normalize: {
        Args: { geom: unknown }
        Returns: unknown
      }
      st_npoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_nrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numgeometries: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorring: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpatches: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_orientedenvelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { "": unknown } | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_perimeter2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_pointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointonsurface: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_points: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonize: {
        Args: { "": unknown[] }
        Returns: unknown
      }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: string
      }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_reverse: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid: {
        Args: { geog: unknown; srid: number } | { geom: unknown; srid: number }
        Returns: unknown
      }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shiftlongitude: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid: {
        Args: { geog: unknown } | { geom: unknown }
        Returns: number
      }
      st_startpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_summary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_transform: {
        Args:
          | { from_proj: string; geom: unknown; to_proj: string }
          | { from_proj: string; geom: unknown; to_srid: number }
          | { geom: unknown; to_proj: string }
        Returns: unknown
      }
      st_triangulatepolygon: {
        Args: { g1: unknown }
        Returns: unknown
      }
      st_union: {
        Args:
          | { "": unknown[] }
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; gridsize: number }
        Returns: unknown
      }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_wkbtosql: {
        Args: { wkb: string }
        Returns: unknown
      }
      st_wkttosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      st_x: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmin: {
        Args: { "": unknown }
        Returns: number
      }
      st_y: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymax: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymin: {
        Args: { "": unknown }
        Returns: number
      }
      st_z: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmflag: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmin: {
        Args: { "": unknown }
        Returns: number
      }
      test_anon_access: {
        Args: Record<PropertyKey, never>
        Returns: {
          access_status: string
          row_count: number
          table_name: string
        }[]
      }
      test_rpc: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      test_sku_generation: {
        Args: { p_product_id: number }
        Returns: Json
      }
      text: {
        Args: { "": unknown }
        Returns: string
      }
      text_soundex: {
        Args: { "": string }
        Returns: string
      }
      ultimate_test_rpc: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      unlockrows: {
        Args: { "": string }
        Returns: number
      }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
      validate_product_configuration: {
        Args: { p_configuration: Json; p_product_id: number }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown | null
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown | null
      }
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
  graphql: {
    Enums: {},
  },
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
