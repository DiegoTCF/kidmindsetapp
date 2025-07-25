export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          activity_date: string
          activity_name: string
          activity_type: string
          assists_made: number | null
          child_id: string
          created_at: string
          final_score: string | null
          goals_scored: number | null
          id: string
          points_awarded: number
          post_activity_completed: boolean
          post_activity_data: Json | null
          pre_activity_completed: boolean
          pre_activity_data: Json | null
          pre_confidence_believe_well: number | null
          pre_confidence_body_ready: number | null
          pre_confidence_excited: number | null
          pre_confidence_nervous: number | null
          updated_at: string
          worry_answers: Json | null
          worry_reason: string | null
        }
        Insert: {
          activity_date?: string
          activity_name: string
          activity_type: string
          assists_made?: number | null
          child_id: string
          created_at?: string
          final_score?: string | null
          goals_scored?: number | null
          id?: string
          points_awarded?: number
          post_activity_completed?: boolean
          post_activity_data?: Json | null
          pre_activity_completed?: boolean
          pre_activity_data?: Json | null
          pre_confidence_believe_well?: number | null
          pre_confidence_body_ready?: number | null
          pre_confidence_excited?: number | null
          pre_confidence_nervous?: number | null
          updated_at?: string
          worry_answers?: Json | null
          worry_reason?: string | null
        }
        Update: {
          activity_date?: string
          activity_name?: string
          activity_type?: string
          assists_made?: number | null
          child_id?: string
          created_at?: string
          final_score?: string | null
          goals_scored?: number | null
          id?: string
          points_awarded?: number
          post_activity_completed?: boolean
          post_activity_data?: Json | null
          pre_activity_completed?: boolean
          pre_activity_data?: Json | null
          pre_confidence_believe_well?: number | null
          pre_confidence_body_ready?: number | null
          pre_confidence_excited?: number | null
          pre_confidence_nervous?: number | null
          updated_at?: string
          worry_answers?: Json | null
          worry_reason?: string | null
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          notification_type: string
          related_activity_name: string | null
          related_child_name: string | null
          related_user_email: string | null
          related_user_id: string | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          notification_type: string
          related_activity_name?: string | null
          related_child_name?: string | null
          related_user_email?: string | null
          related_user_id?: string | null
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          notification_type?: string
          related_activity_name?: string | null
          related_child_name?: string | null
          related_user_email?: string | null
          related_user_id?: string | null
          title?: string
        }
        Relationships: []
      }
      children: {
        Row: {
          age: number
          created_at: string
          id: string
          level: number | null
          name: string
          parent_id: string
          points: number | null
          updated_at: string
          weekly_schedule: string | null
        }
        Insert: {
          age: number
          created_at?: string
          id?: string
          level?: number | null
          name: string
          parent_id: string
          points?: number | null
          updated_at?: string
          weekly_schedule?: string | null
        }
        Update: {
          age?: number
          created_at?: string
          id?: string
          level?: number | null
          name?: string
          parent_id?: string
          points?: number | null
          updated_at?: string
          weekly_schedule?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "children_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_tasks: {
        Row: {
          active: boolean
          created_at: string
          id: string
          label: string
          order: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          label: string
          order: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          label?: string
          order?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      goals: {
        Row: {
          completed_process_goals: number[]
          created_at: string
          id: string
          outcome_goal: string
          process_goals: Json
          progress: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_process_goals?: number[]
          created_at?: string
          id?: string
          outcome_goal: string
          process_goals?: Json
          progress?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_process_goals?: number[]
          created_at?: string
          id?: string
          outcome_goal?: string
          process_goals?: Json
          progress?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      parents: {
        Row: {
          created_at: string
          id: string
          name: string
          payment_status: string | null
          phone: string | null
          pin: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          payment_status?: string | null
          phone?: string | null
          pin?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          payment_status?: string | null
          phone?: string | null
          pin?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      progress_entries: {
        Row: {
          activity_id: string | null
          child_id: string
          created_at: string
          entry_date: string
          entry_type: string
          entry_value: Json
          id: string
          points_earned: number
        }
        Insert: {
          activity_id?: string | null
          child_id: string
          created_at?: string
          entry_date?: string
          entry_type: string
          entry_value: Json
          id?: string
          points_earned?: number
        }
        Update: {
          activity_id?: string | null
          child_id?: string
          created_at?: string
          entry_date?: string
          entry_type?: string
          entry_value?: Json
          id?: string
          points_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "progress_entries_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      super_behaviour_ratings: {
        Row: {
          activity_id: string | null
          average_score: number | null
          behaviour_type: string
          child_id: string
          created_at: string
          id: string
          question_1_rating: number | null
          question_2_rating: number | null
          question_3_rating: number | null
          question_4_rating: number | null
          updated_at: string
        }
        Insert: {
          activity_id?: string | null
          average_score?: number | null
          behaviour_type: string
          child_id: string
          created_at?: string
          id?: string
          question_1_rating?: number | null
          question_2_rating?: number | null
          question_3_rating?: number | null
          question_4_rating?: number | null
          updated_at?: string
        }
        Update: {
          activity_id?: string | null
          average_score?: number | null
          behaviour_type?: string
          child_id?: string
          created_at?: string
          id?: string
          question_1_rating?: number | null
          question_2_rating?: number | null
          question_3_rating?: number | null
          question_4_rating?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "super_behaviour_ratings_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_action_logs: {
        Row: {
          action_details: Json
          action_type: string
          child_id: string | null
          created_at: string
          id: string
          ip_address: unknown | null
          page_location: string | null
          session_id: string | null
          timestamp: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action_details?: Json
          action_type: string
          child_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          page_location?: string | null
          session_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action_details?: Json
          action_type?: string
          child_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          page_location?: string | null
          session_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_admin_notification: {
        Args: {
          notification_type_param: string
          title_param: string
          message_param: string
          related_user_id_param?: string
          related_user_email_param?: string
          related_child_name_param?: string
          related_activity_name_param?: string
        }
        Returns: string
      }
      admin_delete_notification: {
        Args: { notification_id: string }
        Returns: Json
      }
      admin_delete_user: {
        Args: { target_user_id: string }
        Returns: Json
      }
      auth_or_anon: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_current_user_child_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          child_id: string
          child_name: string
          child_level: number
          child_points: number
          weekly_mood_avg: number
        }[]
      }
      get_current_user_child_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_child_ids: {
        Args: Record<PropertyKey, never>
        Returns: {
          child_id: string
        }[]
      }
      is_admin: {
        Args: { check_user_id?: string }
        Returns: boolean
      }
      is_authenticated: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_user_action: {
        Args: {
          action_type_param: string
          action_details_param?: Json
          page_location_param?: string
          child_id_param?: string
        }
        Returns: string
      }
      sync_child_points: {
        Args: { target_child_id?: string }
        Returns: undefined
      }
      test_admin_access: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      update_task_points: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
