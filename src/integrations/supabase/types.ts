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
          updated_at?: string
          worry_answers?: Json | null
          worry_reason?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_child_id: {
        Args: Record<PropertyKey, never>
        Returns: string
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
