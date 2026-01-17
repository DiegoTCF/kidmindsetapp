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
          day_of_week: string | null
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
          day_of_week?: string | null
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
          day_of_week?: string | null
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
      admin_config: {
        Row: {
          config_key: string
          config_value: string
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          config_key: string
          config_value: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          config_key?: string
          config_value?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
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
      best_self_reflections: {
        Row: {
          ball_with_me: string | null
          ball_without_me: string | null
          behaviour: string | null
          body_language: string | null
          created_at: string
          id: string
          noticed_by_others: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ball_with_me?: string | null
          ball_without_me?: string | null
          behaviour?: string | null
          body_language?: string | null
          created_at?: string
          id?: string
          noticed_by_others?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ball_with_me?: string | null
          ball_without_me?: string | null
          behaviour?: string | null
          body_language?: string | null
          created_at?: string
          id?: string
          noticed_by_others?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      best_self_scores: {
        Row: {
          activity_id: string | null
          created_at: string
          id: string
          score: number
          user_id: string
        }
        Insert: {
          activity_id?: string | null
          created_at?: string
          id?: string
          score: number
          user_id: string
        }
        Update: {
          activity_id?: string | null
          created_at?: string
          id?: string
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      child_goals: {
        Row: {
          child_id: string
          created_at: string
          goal_text: string
          goal_type: string
          id: string
          updated_at: string
        }
        Insert: {
          child_id: string
          created_at?: string
          goal_text: string
          goal_type: string
          id?: string
          updated_at?: string
        }
        Update: {
          child_id?: string
          created_at?: string
          goal_text?: string
          goal_type?: string
          id?: string
          updated_at?: string
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
      coaching_plans: {
        Row: {
          billing_type: string
          created_at: string
          default_duration_weeks: number | null
          default_sessions_per_period: number | null
          id: string
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          billing_type: string
          created_at?: string
          default_duration_weeks?: number | null
          default_sessions_per_period?: number | null
          id?: string
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          billing_type?: string
          created_at?: string
          default_duration_weeks?: number | null
          default_sessions_per_period?: number | null
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      coaching_session_logs: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          logged_by: string | null
          session_date: string
          subscription_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          logged_by?: string | null
          session_date?: string
          subscription_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          logged_by?: string | null
          session_date?: string
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coaching_session_logs_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "coaching_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      coaching_subscriptions: {
        Row: {
          admin_notes: string | null
          child_id: string
          created_at: string
          current_period_end: string
          current_period_start: string
          end_date: string | null
          id: string
          last_session_date: string | null
          period_type: string
          plan_id: string
          sessions_per_period: number
          sessions_used_in_period: number
          start_date: string
          status: string
          total_sessions_used: number
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          child_id: string
          created_at?: string
          current_period_end: string
          current_period_start: string
          end_date?: string | null
          id?: string
          last_session_date?: string | null
          period_type?: string
          plan_id: string
          sessions_per_period?: number
          sessions_used_in_period?: number
          start_date: string
          status?: string
          total_sessions_used?: number
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          child_id?: string
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          end_date?: string | null
          id?: string
          last_session_date?: string | null
          period_type?: string
          plan_id?: string
          sessions_per_period?: number
          sessions_used_in_period?: number
          start_date?: string
          status?: string
          total_sessions_used?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coaching_subscriptions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaching_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "coaching_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      core_skill_evaluations: {
        Row: {
          admin_id: string
          beating_mind_level: number | null
          child_id: string
          coach_notes: string | null
          created_at: string
          dealing_failure_level: number | null
          evaluation_date: string
          focus_behaviours_level: number | null
          goals_planning_level: number | null
          id: string
          preparation_autonomy_level: number | null
          self_worth_level: number | null
          updated_at: string
        }
        Insert: {
          admin_id: string
          beating_mind_level?: number | null
          child_id: string
          coach_notes?: string | null
          created_at?: string
          dealing_failure_level?: number | null
          evaluation_date?: string
          focus_behaviours_level?: number | null
          goals_planning_level?: number | null
          id?: string
          preparation_autonomy_level?: number | null
          self_worth_level?: number | null
          updated_at?: string
        }
        Update: {
          admin_id?: string
          beating_mind_level?: number | null
          child_id?: string
          coach_notes?: string | null
          created_at?: string
          dealing_failure_level?: number | null
          evaluation_date?: string
          focus_behaviours_level?: number | null
          goals_planning_level?: number | null
          id?: string
          preparation_autonomy_level?: number | null
          self_worth_level?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      core_skills_assessments: {
        Row: {
          admin_id: string
          assessment_date: string
          child_id: string
          created_at: string
          id: string
          raw_answers: Json
          skill_1_score: number
          skill_2_score: number
          skill_3_score: number
          skill_4_score: number
          skill_5_score: number
          skill_6_score: number
          updated_at: string
        }
        Insert: {
          admin_id: string
          assessment_date?: string
          child_id: string
          created_at?: string
          id?: string
          raw_answers: Json
          skill_1_score: number
          skill_2_score: number
          skill_3_score: number
          skill_4_score: number
          skill_5_score: number
          skill_6_score: number
          updated_at?: string
        }
        Update: {
          admin_id?: string
          assessment_date?: string
          child_id?: string
          created_at?: string
          id?: string
          raw_answers?: Json
          skill_1_score?: number
          skill_2_score?: number
          skill_3_score?: number
          skill_4_score?: number
          skill_5_score?: number
          skill_6_score?: number
          updated_at?: string
        }
        Relationships: []
      }
      core_skills_results: {
        Row: {
          beating_mind_score: number
          created_at: string
          dealing_with_failure_score: number
          focus_behaviours_score: number
          id: string
          know_who_you_are_score: number
          overall_score: number
          preparation_score: number
          raw_answers: Json
          set_goals_score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          beating_mind_score: number
          created_at?: string
          dealing_with_failure_score: number
          focus_behaviours_score: number
          id?: string
          know_who_you_are_score: number
          overall_score: number
          preparation_score: number
          raw_answers: Json
          set_goals_score: number
          updated_at?: string
          user_id: string
        }
        Update: {
          beating_mind_score?: number
          created_at?: string
          dealing_with_failure_score?: number
          focus_behaviours_score?: number
          id?: string
          know_who_you_are_score?: number
          overall_score?: number
          preparation_score?: number
          raw_answers?: Json
          set_goals_score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      course_content: {
        Row: {
          bucket_name: string
          category: string | null
          created_at: string
          description: string | null
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bucket_name: string
          category?: string | null
          created_at?: string
          description?: string | null
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bucket_name?: string
          category?: string | null
          created_at?: string
          description?: string | null
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      mindset_reflections_test: {
        Row: {
          child_id: string
          created_at: string
          id: string
          question_key: string
          selected_option: string
        }
        Insert: {
          child_id: string
          created_at?: string
          id?: string
          question_key: string
          selected_option: string
        }
        Update: {
          child_id?: string
          created_at?: string
          id?: string
          question_key?: string
          selected_option?: string
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
      player_identities: {
        Row: {
          avatar_url: string | null
          helps_team: string[] | null
          main_weapon: string | null
          motto: string | null
          role_main: string | null
          role_type: string | null
          strengths: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          helps_team?: string[] | null
          main_weapon?: string | null
          motto?: string | null
          role_main?: string | null
          role_type?: string | null
          strengths?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          helps_team?: string[] | null
          main_weapon?: string | null
          motto?: string | null
          role_main?: string | null
          role_type?: string | null
          strengths?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      player_identity: {
        Row: {
          core_values: string[] | null
          created_at: string
          id: string
          interests_hobbies: string | null
          life_goals: string | null
          personality_traits: string[] | null
          playing_characteristics: string | null
          playing_style: string | null
          primary_position: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          core_values?: string[] | null
          created_at?: string
          id?: string
          interests_hobbies?: string | null
          life_goals?: string | null
          personality_traits?: string[] | null
          playing_characteristics?: string | null
          playing_style?: string | null
          primary_position?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          core_values?: string[] | null
          created_at?: string
          id?: string
          interests_hobbies?: string | null
          life_goals?: string | null
          personality_traits?: string[] | null
          playing_characteristics?: string | null
          playing_style?: string | null
          primary_position?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      player_identity_hats: {
        Row: {
          created_at: string
          id: string
          q1: string | null
          q2: string | null
          q3: string | null
          q4: string | null
          q5: string | null
          q6: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          q1?: string | null
          q2?: string | null
          q3?: string | null
          q4?: string | null
          q5?: string | null
          q6?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          q1?: string | null
          q2?: string | null
          q3?: string | null
          q4?: string | null
          q5?: string | null
          q6?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      player_tasks: {
        Row: {
          child_id: string
          completed_at: string | null
          content_text: string | null
          content_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          file_path: string | null
          id: string
          order_index: number | null
          seen_at: string | null
          status: string
          task_type: string
          title: string
        }
        Insert: {
          child_id: string
          completed_at?: string | null
          content_text?: string | null
          content_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          file_path?: string | null
          id?: string
          order_index?: number | null
          seen_at?: string | null
          status?: string
          task_type: string
          title: string
        }
        Update: {
          child_id?: string
          completed_at?: string | null
          content_text?: string | null
          content_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          file_path?: string | null
          id?: string
          order_index?: number | null
          seen_at?: string | null
          status?: string
          task_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_tasks_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          help_team: string[] | null
          id: string
          role: string | null
          strengths: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          help_team?: string[] | null
          id?: string
          role?: string | null
          strengths?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          help_team?: string[] | null
          id?: string
          role?: string | null
          strengths?: string[] | null
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
      schedule_overrides: {
        Row: {
          child_id: string
          created_at: string
          id: string
          new_activity_type: string | null
          note: string | null
          override_date: string
          override_type: string
        }
        Insert: {
          child_id: string
          created_at?: string
          id?: string
          new_activity_type?: string | null
          note?: string | null
          override_date: string
          override_type: string
        }
        Update: {
          child_id?: string
          created_at?: string
          id?: string
          new_activity_type?: string | null
          note?: string | null
          override_date?: string
          override_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_overrides_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      session_notes: {
        Row: {
          admin_id: string
          alternative_thought: string | null
          automatic_thought: string | null
          child_id: string
          cognitive_distortion: string | null
          created_at: string
          free_notes: string | null
          id: string
          session_date: string
          trigger_situation: string | null
          updated_at: string
        }
        Insert: {
          admin_id: string
          alternative_thought?: string | null
          automatic_thought?: string | null
          child_id: string
          cognitive_distortion?: string | null
          created_at?: string
          free_notes?: string | null
          id?: string
          session_date?: string
          trigger_situation?: string | null
          updated_at?: string
        }
        Update: {
          admin_id?: string
          alternative_thought?: string | null
          automatic_thought?: string | null
          child_id?: string
          cognitive_distortion?: string | null
          created_at?: string
          free_notes?: string | null
          id?: string
          session_date?: string
          trigger_situation?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      session_tracking: {
        Row: {
          activity_id: string | null
          activity_name: string | null
          activity_type: string | null
          child_id: string
          created_at: string
          day_of_week: string
          id: string
          post_form_completed: boolean | null
          pre_form_completed: boolean | null
          session_date: string
          session_status: string
          updated_at: string
        }
        Insert: {
          activity_id?: string | null
          activity_name?: string | null
          activity_type?: string | null
          child_id: string
          created_at?: string
          day_of_week: string
          id?: string
          post_form_completed?: boolean | null
          pre_form_completed?: boolean | null
          session_date?: string
          session_status?: string
          updated_at?: string
        }
        Update: {
          activity_id?: string | null
          activity_name?: string | null
          activity_type?: string | null
          child_id?: string
          created_at?: string
          day_of_week?: string
          id?: string
          post_form_completed?: boolean | null
          pre_form_completed?: boolean | null
          session_date?: string
          session_status?: string
          updated_at?: string
        }
        Relationships: []
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
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
          page_location?: string | null
          session_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_ants: {
        Row: {
          automatic_thoughts: string[]
          coping_mechanisms: string[]
          core_beliefs: string[]
          created_at: string | null
          id: string
          triggers: string[]
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          automatic_thoughts?: string[]
          coping_mechanisms?: string[]
          core_beliefs?: string[]
          created_at?: string | null
          id?: string
          triggers?: string[]
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          automatic_thoughts?: string[]
          coping_mechanisms?: string[]
          core_beliefs?: string[]
          created_at?: string | null
          id?: string
          triggers?: string[]
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          created_at: string | null
          goal_text: string
          goal_type: string
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          goal_text: string
          goal_type: string
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          goal_text?: string
          goal_type?: string
          id?: string
          updated_at?: string | null
          user_id?: string | null
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
          message_param: string
          notification_type_param: string
          related_activity_name_param?: string
          related_child_name_param?: string
          related_user_email_param?: string
          related_user_id_param?: string
          title_param: string
        }
        Returns: string
      }
      admin_delete_notification: {
        Args: { notification_id: string }
        Returns: Json
      }
      admin_delete_user: { Args: { target_user_id: string }; Returns: Json }
      admin_get_all_users: {
        Args: never
        Returns: {
          created_at: string
          email: string
          id: string
        }[]
      }
      auth_or_anon: { Args: never; Returns: boolean }
      auto_reset_expired_periods: { Args: never; Returns: number }
      get_current_user_child_data: {
        Args: never
        Returns: {
          child_id: string
          child_level: number
          child_name: string
          child_points: number
          weekly_mood_avg: number
        }[]
      }
      get_current_user_child_id: { Args: never; Returns: string }
      get_superadmin_email: { Args: never; Returns: string }
      get_user_child_ids: {
        Args: never
        Returns: {
          child_id: string
        }[]
      }
      is_admin: { Args: { check_user_id?: string }; Returns: boolean }
      is_authenticated: { Args: never; Returns: boolean }
      is_superadmin_simple: {
        Args: { check_user_id?: string }
        Returns: boolean
      }
      is_user_admin: { Args: { check_user_id?: string }; Returns: boolean }
      log_coaching_session: {
        Args: { p_notes?: string; p_subscription_id: string }
        Returns: Json
      }
      log_session_status: {
        Args: {
          p_activity_name?: string
          p_activity_type?: string
          p_child_id: string
          p_day_of_week?: string
          p_session_date: string
          p_status: string
        }
        Returns: string
      }
      log_user_action: {
        Args: {
          action_details_param?: Json
          action_type_param: string
          child_id_param?: string
          page_location_param?: string
        }
        Returns: string
      }
      reset_subscription_period: {
        Args: { p_subscription_id: string }
        Returns: Json
      }
      reset_user_progress: { Args: { target_user_id?: string }; Returns: Json }
      sync_child_points: {
        Args: { target_child_id?: string }
        Returns: undefined
      }
      test_admin_access: { Args: never; Returns: Json }
      update_task_points: { Args: never; Returns: undefined }
      user_owns_child: {
        Args: { check_child_id: string; check_user_id?: string }
        Returns: boolean
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
