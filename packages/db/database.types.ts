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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      case_results: {
        Row: {
          answers: Json
          attempt_number: number
          best_score: number
          case_id: string
          created_at: string
          feedback: Json
          guest_session_id: string | null
          id: string
          score: number
          score_breakdown: Json
          session_id: string
          stars: number
          user_id: string | null
          xp_awarded: number
        }
        Insert: {
          answers?: Json
          attempt_number?: number
          best_score?: number
          case_id: string
          created_at?: string
          feedback?: Json
          guest_session_id?: string | null
          id?: string
          score: number
          score_breakdown?: Json
          session_id: string
          stars?: number
          user_id?: string | null
          xp_awarded?: number
        }
        Update: {
          answers?: Json
          attempt_number?: number
          best_score?: number
          case_id?: string
          created_at?: string
          feedback?: Json
          guest_session_id?: string | null
          id?: string
          score?: number
          score_breakdown?: Json
          session_id?: string
          stars?: number
          user_id?: string | null
          xp_awarded?: number
        }
        Relationships: [
          {
            foreignKeyName: "case_results_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_results_guest_session_id_fkey"
            columns: ["guest_session_id"]
            isOneToOne: false
            referencedRelation: "guest_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_results_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "case_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      case_sessions: {
        Row: {
          case_id: string
          completed_at: string | null
          ended_at: string | null
          guest_session_id: string | null
          id: string
          remaining_seconds: number
          result_id: string | null
          session_state: Json
          started_at: string
          status: string
          used_extension: boolean
          user_id: string | null
        }
        Insert: {
          case_id: string
          completed_at?: string | null
          ended_at?: string | null
          guest_session_id?: string | null
          id?: string
          remaining_seconds?: number
          result_id?: string | null
          session_state?: Json
          started_at?: string
          status?: string
          used_extension?: boolean
          user_id?: string | null
        }
        Update: {
          case_id?: string
          completed_at?: string | null
          ended_at?: string | null
          guest_session_id?: string | null
          id?: string
          remaining_seconds?: number
          result_id?: string | null
          session_state?: Json
          started_at?: string
          status?: string
          used_extension?: boolean
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_sessions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_sessions_guest_session_id_fkey"
            columns: ["guest_session_id"]
            isOneToOne: false
            referencedRelation: "guest_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          case_data: Json
          chief_complaint: string
          condition_badge: string
          created_at: string
          difficulty: string
          estimated_duration_minutes: number
          id: string
          is_demo: boolean
          patient_age: number
          patient_gender: string
          patient_name: string
          specialist_id: string
          status: string
          triage_note: string
          updated_at: string
        }
        Insert: {
          case_data?: Json
          chief_complaint: string
          condition_badge: string
          created_at?: string
          difficulty: string
          estimated_duration_minutes: number
          id: string
          is_demo?: boolean
          patient_age: number
          patient_gender: string
          patient_name: string
          specialist_id: string
          status?: string
          triage_note: string
          updated_at?: string
        }
        Update: {
          case_data?: Json
          chief_complaint?: string
          condition_badge?: string
          created_at?: string
          difficulty?: string
          estimated_duration_minutes?: number
          id?: string
          is_demo?: boolean
          patient_age?: number
          patient_gender?: string
          patient_name?: string
          specialist_id?: string
          status?: string
          triage_note?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_specialist_id_fkey"
            columns: ["specialist_id"]
            isOneToOne: false
            referencedRelation: "specialists"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "case_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      examination_events: {
        Row: {
          category: string
          created_at: string
          delay_seconds: number
          examination_id: string
          examination_type: string
          id: string
          label: string
          requested_at: string
          result: Json
          resulted_at: string
          score_key: string | null
          session_id: string
        }
        Insert: {
          category: string
          created_at?: string
          delay_seconds?: number
          examination_id: string
          examination_type: string
          id?: string
          label: string
          requested_at?: string
          result?: Json
          resulted_at?: string
          score_key?: string | null
          session_id: string
        }
        Update: {
          category?: string
          created_at?: string
          delay_seconds?: number
          examination_id?: string
          examination_type?: string
          id?: string
          label?: string
          requested_at?: string
          result?: Json
          resulted_at?: string
          score_key?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "examination_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "case_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_sessions: {
        Row: {
          claimed_at: string | null
          claimed_by: string | null
          created_at: string
          id: string
        }
        Insert: {
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string
          id: string
        }
        Update: {
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_sessions_claimed_by_fkey"
            columns: ["claimed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboard_entries: {
        Row: {
          display_name: string
          id: string
          period: string
          rank: number | null
          score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          display_name: string
          id?: string
          period?: string
          rank?: number | null
          score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          display_name?: string
          id?: string
          period?: string
          rank?: number | null
          score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          onboarding_completed: boolean
          updated_at: string
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          onboarding_completed?: boolean
          updated_at?: string
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          onboarding_completed?: boolean
          updated_at?: string
          xp?: number
        }
        Relationships: []
      }
      quiz_submissions: {
        Row: {
          answers: Json
          id: string
          score_breakdown: Json
          session_id: string
          submitted_at: string
        }
        Insert: {
          answers?: Json
          id?: string
          score_breakdown?: Json
          session_id: string
          submitted_at?: string
        }
        Update: {
          answers?: Json
          id?: string
          score_breakdown?: Json
          session_id?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_submissions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "case_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      specialists: {
        Row: {
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          sort_order: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          icon?: string
          id: string
          name: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_case_stats: {
        Row: {
          attempts: number
          best_score: number | null
          case_id: string
          last_attempt_at: string | null
          user_id: string
        }
        Insert: {
          attempts?: number
          best_score?: number | null
          case_id: string
          last_attempt_at?: string | null
          user_id: string
        }
        Update: {
          attempts?: number
          best_score?: number | null
          case_id?: string
          last_attempt_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_case_stats_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_case_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
