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
          competitor_urls: string[] | null
          solution_context: string | null
          missing_features: string | null
          heuristic_analysis: Json | null
          heuristic_completed_at: string | null
          ai_analysis: Json | null
          ai_completed_at: string | null
          html_snapshot: string | null
          structured_data: Json | null
          html_snapshot_at: string | null
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
          structured_data: Json | null
          html_snapshot: string | null
          html_snapshot_at: string | null
        }
        Insert: Omit<Database["public"]["Tables"]["benchmarks"]["Row"], "id" | "created_at" | "updated_at" | "analysis_date">
        Update: Partial<Database["public"]["Tables"]["benchmarks"]["Insert"]>
      }
      tactical_plans: {
        Row: {
          id: string
          project_id: string
          user_id: string
          status: "draft" | "in_progress" | "completed"
          overall_tactical_score: number
          strategic_coherence_score: number
          structure_clarity_score: number
          segmentation_quality_score: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          status?: "draft" | "in_progress" | "completed"
          overall_tactical_score?: number
          strategic_coherence_score?: number
          structure_clarity_score?: number
          segmentation_quality_score?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          status?: "draft" | "in_progress" | "completed"
          overall_tactical_score?: number
          strategic_coherence_score?: number
          structure_clarity_score?: number
          segmentation_quality_score?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tactical_channel_plans: {
        Row: {
          id: string
          tactical_plan_id: string
          user_id: string
          channel: "google" | "meta" | "linkedin" | "tiktok"
          campaign_type: string | null
          campaign_structure: Json
          funnel_role: string | null
          funnel_stage: "awareness" | "consideration" | "conversion" | "retention" | null
          ad_group_structure: Json
          bidding_strategy: string | null
          extensions_plan: Json
          quality_score_factors: Json
          segmentation: Json
          key_metrics: Json
          testing_plan: Json
          tactical_score: number
          coherence_score: number
          clarity_score: number
          segmentation_score: number
          alerts: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tactical_plan_id: string
          user_id: string
          channel: "google" | "meta" | "linkedin" | "tiktok"
          campaign_type?: string | null
          campaign_structure?: Json
          funnel_role?: string | null
          funnel_stage?: "awareness" | "consideration" | "conversion" | "retention" | null
          ad_group_structure?: Json
          bidding_strategy?: string | null
          extensions_plan?: Json
          quality_score_factors?: Json
          segmentation?: Json
          key_metrics?: Json
          testing_plan?: Json
          tactical_score?: number
          coherence_score?: number
          clarity_score?: number
          segmentation_score?: number
          alerts?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tactical_plan_id?: string
          user_id?: string
          channel?: "google" | "meta" | "linkedin" | "tiktok"
          campaign_type?: string | null
          campaign_structure?: Json
          funnel_role?: string | null
          funnel_stage?: "awareness" | "consideration" | "conversion" | "retention" | null
          ad_group_structure?: Json
          bidding_strategy?: string | null
          extensions_plan?: Json
          quality_score_factors?: Json
          segmentation?: Json
          key_metrics?: Json
          testing_plan?: Json
          tactical_score?: number
          coherence_score?: number
          clarity_score?: number
          segmentation_score?: number
          alerts?: Json
          created_at?: string
          updated_at?: string
        }
      }
      copy_frameworks: {
        Row: {
          id: string
          tactical_plan_id: string
          user_id: string
          channel: "google" | "meta" | "linkedin" | "tiktok"
          framework_type: "pain_solution_proof_cta" | "comparison" | "authority" | "custom"
          framework_name: string
          structure: Json
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tactical_plan_id: string
          user_id: string
          channel: "google" | "meta" | "linkedin" | "tiktok"
          framework_type: "pain_solution_proof_cta" | "comparison" | "authority" | "custom"
          framework_name: string
          structure?: Json
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tactical_plan_id?: string
          user_id?: string
          channel?: "google" | "meta" | "linkedin" | "tiktok"
          framework_type?: "pain_solution_proof_cta" | "comparison" | "authority" | "custom"
          framework_name?: string
          structure?: Json
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      segmentation_plans: {
        Row: {
          id: string
          tactical_plan_id: string
          user_id: string
          audience_id: string | null
          channel: "google" | "meta" | "linkedin" | "tiktok"
          audience_name: string
          targeting_criteria: Json
          message_angle: string | null
          priority: "high" | "medium" | "low" | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tactical_plan_id: string
          user_id: string
          audience_id?: string | null
          channel: "google" | "meta" | "linkedin" | "tiktok"
          audience_name: string
          targeting_criteria?: Json
          message_angle?: string | null
          priority?: "high" | "medium" | "low" | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tactical_plan_id?: string
          user_id?: string
          audience_id?: string | null
          channel?: "google" | "meta" | "linkedin" | "tiktok"
          audience_name?: string
          targeting_criteria?: Json
          message_angle?: string | null
          priority?: "high" | "medium" | "low" | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      testing_plans: {
        Row: {
          id: string
          tactical_plan_id: string
          user_id: string
          channel: "google" | "meta" | "linkedin" | "tiktok"
          test_name: string
          hypothesis: string
          what_to_test: string
          success_criteria: string
          priority: "high" | "medium" | "low" | null
          status: "planned" | "running" | "completed"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tactical_plan_id: string
          user_id: string
          channel: "google" | "meta" | "linkedin" | "tiktok"
          test_name: string
          hypothesis: string
          what_to_test: string
          success_criteria: string
          priority?: "high" | "medium" | "low" | null
          status?: "planned" | "running" | "completed"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tactical_plan_id?: string
          user_id?: string
          channel?: "google" | "meta" | "linkedin" | "tiktok"
          test_name?: string
          hypothesis?: string
          what_to_test?: string
          success_criteria?: string
          priority?: "high" | "medium" | "low" | null
          status?: "planned" | "running" | "completed"
          created_at?: string
          updated_at?: string
        }
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
      user_data_backups: {
        Row: {
          id: string
          user_id: string
          backup_type: "auto" | "manual" | "pre_delete"
          backup_data: Json
          tables_included: string[]
          record_counts: Json
          size_bytes: number | null
          checksum: string | null
          notes: string | null
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          user_id: string
          backup_type: "auto" | "manual" | "pre_delete"
          backup_data: Json
          tables_included: string[]
          record_counts: Json
          size_bytes?: number | null
          checksum?: string | null
          notes?: string | null
          created_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          backup_type?: "auto" | "manual" | "pre_delete"
          backup_data?: Json
          tables_included?: string[]
          record_counts?: Json
          size_bytes?: number | null
          checksum?: string | null
          notes?: string | null
          created_at?: string
          expires_at?: string
        }
      }
      audit_log: {
        Row: {
          id: string
          user_id: string | null
          table_name: string
          record_id: string | null
          operation: "INSERT" | "UPDATE" | "DELETE"
          old_data: Json | null
          new_data: Json | null
          changed_fields: string[] | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          table_name: string
          record_id?: string | null
          operation: "INSERT" | "UPDATE" | "DELETE"
          old_data?: Json | null
          new_data?: Json | null
          changed_fields?: string[] | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          table_name?: string
          record_id?: string | null
          operation?: "INSERT" | "UPDATE" | "DELETE"
          old_data?: Json | null
          new_data?: Json | null
          changed_fields?: string[] | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      rate_limits: {
        Row: {
          id: string
          user_id: string
          action_type: string
          window_start: string
          request_count: number
        }
        Insert: {
          id?: string
          user_id: string
          action_type: string
          window_start?: string
          request_count?: number
        }
        Update: {
          id?: string
          user_id?: string
          action_type?: string
          window_start?: string
          request_count?: number
        }
      }
      campaigns: {
        Row: {
          id: string
          user_id: string
          project_id: string
          tactical_plan_id: string | null
          tactical_channel_plan_id: string | null
          name: string
          channel: "google" | "meta" | "linkedin" | "tiktok"
          status: "draft" | "active" | "paused" | "completed" | "archived"
          objective: string | null
          notes: string | null
          budget_total: number
          budget_spent: number
          start_date: string | null
          end_date: string | null
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id: string
          tactical_plan_id?: string | null
          tactical_channel_plan_id?: string | null
          name: string
          channel: "google" | "meta" | "linkedin" | "tiktok"
          status?: "draft" | "active" | "paused" | "completed" | "archived"
          objective?: string | null
          notes?: string | null
          budget_total?: number
          budget_spent?: number
          start_date?: string | null
          end_date?: string | null
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string
          tactical_plan_id?: string | null
          tactical_channel_plan_id?: string | null
          name?: string
          channel?: "google" | "meta" | "linkedin" | "tiktok"
          status?: "draft" | "active" | "paused" | "completed" | "archived"
          objective?: string | null
          notes?: string | null
          budget_total?: number
          budget_spent?: number
          start_date?: string | null
          end_date?: string | null
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      campaign_metrics: {
        Row: {
          id: string
          campaign_id: string
          user_id: string
          period_start: string
          period_end: string
          impressions: number
          clicks: number
          ctr: number
          cpc: number
          cpm: number
          conversions: number
          cpa: number
          roas: number
          cost: number
          reach: number
          frequency: number
          video_views: number
          vtr: number
          leads: number
          cpl: number
          quality_score: number
          avg_position: number
          search_impression_share: number
          engagement_rate: number
          revenue: number
          sessions: number
          first_visits: number
          leads_month: number
          mql_rate: number
          sql_rate: number
          clients_web: number
          revenue_web: number
          avg_ticket: number
          google_ads_cost: number
          cac_month: number
          cost_per_conversion: number
          ltv: number
          cac_ltv_ratio: number
          cac_ltv_benchmark: number
          roi_accumulated: number
          roi_period_months: number
          notes: string
          source: "manual" | "api" | "import"
          custom_metrics: Json
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          user_id: string
          period_start: string
          period_end: string
          impressions?: number
          clicks?: number
          ctr?: number
          cpc?: number
          cpm?: number
          conversions?: number
          cpa?: number
          roas?: number
          cost?: number
          reach?: number
          frequency?: number
          video_views?: number
          vtr?: number
          leads?: number
          cpl?: number
          quality_score?: number
          avg_position?: number
          search_impression_share?: number
          engagement_rate?: number
          revenue?: number
          sessions?: number
          first_visits?: number
          leads_month?: number
          mql_rate?: number
          sql_rate?: number
          clients_web?: number
          revenue_web?: number
          avg_ticket?: number
          google_ads_cost?: number
          cac_month?: number
          cost_per_conversion?: number
          ltv?: number
          cac_ltv_ratio?: number
          cac_ltv_benchmark?: number
          roi_accumulated?: number
          roi_period_months?: number
          notes?: string
          source?: "manual" | "api" | "import"
          custom_metrics?: Json
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          user_id?: string
          period_start?: string
          period_end?: string
          impressions?: number
          clicks?: number
          ctr?: number
          cpc?: number
          cpm?: number
          conversions?: number
          cpa?: number
          roas?: number
          cost?: number
          reach?: number
          frequency?: number
          video_views?: number
          vtr?: number
          leads?: number
          cpl?: number
          quality_score?: number
          avg_position?: number
          search_impression_share?: number
          engagement_rate?: number
          revenue?: number
          sessions?: number
          first_visits?: number
          leads_month?: number
          mql_rate?: number
          sql_rate?: number
          clients_web?: number
          revenue_web?: number
          avg_ticket?: number
          google_ads_cost?: number
          cac_month?: number
          cost_per_conversion?: number
          ltv?: number
          cac_ltv_ratio?: number
          cac_ltv_benchmark?: number
          roi_accumulated?: number
          roi_period_months?: number
          notes?: string
          source?: "manual" | "api" | "import"
          custom_metrics?: Json
          created_at?: string
        }
      }
      budget_allocations: {
        Row: {
          id: string
          user_id: string
          project_id: string
          channel: "google" | "meta" | "linkedin" | "tiktok"
          month: number
          year: number
          planned_budget: number
          actual_spent: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id: string
          channel: "google" | "meta" | "linkedin" | "tiktok"
          month: number
          year: number
          planned_budget?: number
          actual_spent?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string
          channel?: "google" | "meta" | "linkedin" | "tiktok"
          month?: number
          year?: number
          planned_budget?: number
          actual_spent?: number
          created_at?: string
          updated_at?: string
        }
      }
      ad_integrations: {
        Row: {
          id: string
          user_id: string
          provider: "google_ads" | "meta_ads" | "linkedin_ads" | "tiktok_ads"
          status: "connected" | "disconnected" | "error" | "expired" | "syncing"
          access_token: string | null
          refresh_token: string | null
          token_expires_at: string | null
          account_id: string | null
          account_name: string | null
          account_currency: string
          sync_enabled: boolean
          sync_frequency: "hourly" | "daily" | "weekly" | "manual"
          last_sync_at: string | null
          next_sync_at: string | null
          project_mappings: Json
          scopes: string[]
          metadata: Json
          error_message: string | null
          error_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: "google_ads" | "meta_ads" | "linkedin_ads" | "tiktok_ads"
          status?: "connected" | "disconnected" | "error" | "expired" | "syncing"
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          account_id?: string | null
          account_name?: string | null
          account_currency?: string
          sync_enabled?: boolean
          sync_frequency?: "hourly" | "daily" | "weekly" | "manual"
          last_sync_at?: string | null
          next_sync_at?: string | null
          project_mappings?: Json
          scopes?: string[]
          metadata?: Json
          error_message?: string | null
          error_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: "google_ads" | "meta_ads" | "linkedin_ads" | "tiktok_ads"
          status?: "connected" | "disconnected" | "error" | "expired" | "syncing"
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          account_id?: string | null
          account_name?: string | null
          account_currency?: string
          sync_enabled?: boolean
          sync_frequency?: "hourly" | "daily" | "weekly" | "manual"
          last_sync_at?: string | null
          next_sync_at?: string | null
          project_mappings?: Json
          scopes?: string[]
          metadata?: Json
          error_message?: string | null
          error_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      integration_sync_logs: {
        Row: {
          id: string
          user_id: string
          integration_id: string
          provider: "google_ads" | "meta_ads" | "linkedin_ads" | "tiktok_ads"
          status: "pending" | "running" | "completed" | "failed" | "partial"
          sync_type: "full" | "incremental" | "manual"
          started_at: string
          completed_at: string | null
          duration_ms: number | null
          records_fetched: number
          records_created: number
          records_updated: number
          records_failed: number
          period_start: string | null
          period_end: string | null
          error_message: string | null
          error_details: Json | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          integration_id: string
          provider: "google_ads" | "meta_ads" | "linkedin_ads" | "tiktok_ads"
          status?: "pending" | "running" | "completed" | "failed" | "partial"
          sync_type?: "full" | "incremental" | "manual"
          started_at?: string
          completed_at?: string | null
          duration_ms?: number | null
          records_fetched?: number
          records_created?: number
          records_updated?: number
          records_failed?: number
          period_start?: string | null
          period_end?: string | null
          error_message?: string | null
          error_details?: Json | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          integration_id?: string
          provider?: "google_ads" | "meta_ads" | "linkedin_ads" | "tiktok_ads"
          status?: "pending" | "running" | "completed" | "failed" | "partial"
          sync_type?: "full" | "incremental" | "manual"
          started_at?: string
          completed_at?: string | null
          duration_ms?: number | null
          records_fetched?: number
          records_created?: number
          records_updated?: number
          records_failed?: number
          period_start?: string | null
          period_end?: string | null
          error_message?: string | null
          error_details?: Json | null
          metadata?: Json
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: "info" | "success" | "warning" | "error"
          action_url: string | null
          action_text: string | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: "info" | "success" | "warning" | "error"
          action_url?: string | null
          action_text?: string | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: "info" | "success" | "warning" | "error"
          action_url?: string | null
          action_text?: string | null
          read?: boolean
          created_at?: string
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
      v_campaign_metrics_summary: {
        Row: {
          campaign_id: string
          user_id: string
          campaign_name: string
          channel: "google" | "meta" | "linkedin" | "tiktok"
          project_id: string
          total_entries: number
          total_impressions: number
          total_clicks: number
          total_conversions: number
          total_leads: number
          total_cost: number
          total_revenue: number
          total_sessions: number
          total_first_visits: number
          total_leads_month: number
          total_clients_web: number
          total_revenue_web: number
          total_google_ads_cost: number
          avg_ctr: number
          avg_cpc: number
          avg_cpa: number
          avg_cpl: number
          calc_roas: number
          avg_mql_rate: number
          avg_sql_rate: number
          avg_ticket: number
          calc_cac: number
          avg_ltv: number
          avg_cac_ltv_ratio: number
          avg_roi_accumulated: number
          max_roi_period_months: number
          first_period: string
          last_period: string
        }
        Insert: never
        Update: never
      }
      v_campaign_summary: {
        Row: {
          id: string
          user_id: string
          project_id: string
          project_name: string
          campaign_name: string
          channel: "google" | "meta" | "linkedin" | "tiktok"
          status: "draft" | "active" | "paused" | "completed" | "archived"
          objective: string | null
          budget_total: number
          budget_spent: number
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
          budget_pacing: number
          total_impressions: number
          total_clicks: number
          total_conversions: number
          total_cost: number
        }
        Insert: never
        Update: never
      }
      v_operational_stats: {
        Row: {
          user_id: string
          total_campaigns: number
          active_campaigns: number
          paused_campaigns: number
          completed_campaigns: number
          draft_campaigns: number
          total_budget: number
          total_spent: number
        }
        Insert: never
        Update: never
      }
      v_budget_summary: {
        Row: {
          id: string
          user_id: string
          project_id: string
          project_name: string
          channel: "google" | "meta" | "linkedin" | "tiktok"
          month: number
          year: number
          planned_budget: number
          actual_spent: number
          pacing_percent: number
          remaining: number
          created_at: string
          updated_at: string
        }
        Insert: never
        Update: never
      }
      v_budget_project_pacing: {
        Row: {
          user_id: string
          project_id: string
          project_name: string
          month: number
          year: number
          channels_allocated: number
          total_planned: number
          total_spent: number
          total_remaining: number
          overall_pacing: number
          projected_spend: number
          projected_pacing: number
        }
        Insert: never
        Update: never
      }
      v_campaign_calendar: {
        Row: {
          id: string
          user_id: string
          project_id: string
          project_name: string
          campaign_name: string
          channel: "google" | "meta" | "linkedin" | "tiktok"
          status: "draft" | "active" | "paused" | "completed" | "archived"
          objective: string | null
          budget_total: number
          budget_spent: number
          start_date: string | null
          end_date: string | null
          duration_days: number | null
          days_remaining: number | null
          days_elapsed: number | null
          budget_pacing: number
          ending_soon: boolean
          total_impressions: number
          total_clicks: number
          total_conversions: number
          total_cost: number
          total_revenue: number
          metrics_entries: number
          created_at: string
          updated_at: string
        }
        Insert: never
        Update: never
      }
      v_campaign_timeline: {
        Row: {
          campaign_id: string
          user_id: string
          project_id: string
          project_name: string
          campaign_name: string
          channel: "google" | "meta" | "linkedin" | "tiktok"
          status: "draft" | "active" | "paused" | "completed" | "archived"
          start_date: string | null
          end_date: string | null
          budget_total: number
          budget_spent: number
          effective_start: string
          effective_end: string
          start_day_of_month: number
          end_day_of_month: number
          start_month: number
          start_year: number
          overlap_count: number
        }
        Insert: never
        Update: never
      }
      v_integration_summary: {
        Row: {
          id: string
          user_id: string
          provider: "google_ads" | "meta_ads" | "linkedin_ads" | "tiktok_ads"
          status: "connected" | "disconnected" | "error" | "expired" | "syncing"
          account_id: string | null
          account_name: string | null
          account_currency: string
          sync_enabled: boolean
          sync_frequency: "hourly" | "daily" | "weekly" | "manual"
          last_sync_at: string | null
          next_sync_at: string | null
          error_message: string | null
          error_count: number
          scopes: string[]
          project_mappings: Json
          created_at: string
          updated_at: string
          total_syncs: number
          successful_syncs: number
          failed_syncs: number
          total_records_fetched: number
          last_sync_status: string | null
          last_sync_duration_ms: number | null
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
