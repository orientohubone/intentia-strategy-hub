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
      tenant_settings: {
        Row: {
          id: string
          user_id: string
          company_name: string
          plan: "starter" | "professional" | "enterprise"
          monthly_analyses_limit: number
          analyses_used: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          plan?: "starter" | "professional" | "enterprise"
          monthly_analyses_limit?: number
          analyses_used?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          plan?: "starter" | "professional" | "enterprise"
          monthly_analyses_limit?: number
          analyses_used?: number
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          niche: string
          url: string
          score: number
          status: "pending" | "analyzing" | "completed"
          last_update: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["projects"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>
      }
      project_channel_scores: {
        Row: {
          id: string
          project_id: string
          user_id: string
          channel: "google" | "meta" | "linkedin" | "tiktok"
          score: number
          objective: string | null
          funnel_role: string | null
          is_recommended: boolean
          risks: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["project_channel_scores"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["project_channel_scores"]["Insert"]>
      }
      insights: {
        Row: {
          id: string
          project_id: string
          user_id: string
          type: "warning" | "opportunity" | "improvement"
          title: string
          description: string
          action: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["insights"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["insights"]["Insert"]>
      }
      audiences: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string
          industry: string | null
          company_size: "startup" | "small" | "medium" | "large" | "enterprise" | null
          location: string | null
          keywords: string[]
          project_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["audiences"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["audiences"]["Insert"]>
      }
      benchmarks: {
        Row: {
          id: string
          user_id: string
          project_id: string
          competitor_name: string
          competitor_url: string
          competitor_niche: string
          overall_score: number
          value_proposition_score: number
          offer_clarity_score: number
          user_journey_score: number
          value_proposition_analysis: string | null
          offer_clarity_analysis: string | null
          user_journey_analysis: string | null
          channel_presence: Json
          channel_effectiveness: Json
          strengths: string[]
          weaknesses: string[]
          opportunities: string[]
          threats: string[]
          strategic_insights: string | null
          recommendations: string | null
          analysis_date: string
          last_update: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["benchmarks"]["Row"], "id" | "created_at" | "updated_at" | "analysis_date">
        Update: Partial<Database["public"]["Tables"]["benchmarks"]["Insert"]>
      }
      user_api_keys: {
        Row: {
          id: string
          user_id: string
          provider: "google_gemini" | "anthropic_claude"
          api_key_encrypted: string
          preferred_model: string
          is_active: boolean
          last_validated_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: "google_gemini" | "anthropic_claude"
          api_key_encrypted: string
          preferred_model: string
          is_active?: boolean
          last_validated_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: "google_gemini" | "anthropic_claude"
          api_key_encrypted?: string
          preferred_model?: string
          is_active?: boolean
          last_validated_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      v_project_summary: {
        Row: {
          id: string
          user_id: string
          name: string
          niche: string
          url: string
          score: number
          status: "pending" | "analyzing" | "completed"
          last_update: string | null
          created_at: string
          updated_at: string
          channel_scores: Json
        }
        Insert: never
        Update: never
      }
      v_dashboard_stats: {
        Row: {
          user_id: string
          total_projects: number
          completed_projects: number
          analyzing_projects: number
          pending_projects: number
          average_score: number
          last_project_update: string | null
        }
        Insert: never
        Update: never
      }
      v_benchmark_summary: {
        Row: {
          id: string
          user_id: string
          project_id: string
          project_name: string
          competitor_name: string
          competitor_url: string
          competitor_niche: string
          overall_score: number
          value_proposition_score: number
          offer_clarity_score: number
          user_journey_score: number
          channel_presence: Json
          strengths: string[]
          weaknesses: string[]
          analysis_date: string
          created_at: string
          updated_at: string
          score_gap: number
        }
        Insert: never
        Update: never
      }
      v_benchmark_stats: {
        Row: {
          user_id: string
          project_id: string
          total_competitors: number
          avg_competitor_score: number
          max_competitor_score: number
          min_competitor_score: number
          score_range: number
          top_competitors: string[]
        }
        Insert: never
        Update: never
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
