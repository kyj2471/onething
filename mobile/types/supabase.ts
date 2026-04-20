// Placeholder Database type. Replace with output of:
//   supabase gen types typescript --project-id <ref> > lib/supabase/types.ts
// once the migration is applied to the Supabase project.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          locale: string;
          timezone: string;
          subscription_status: "trial" | "active" | "cancelled" | "expired" | "free";
          trial_ends_at: string | null;
          lemon_squeezy_customer_id: string | null;
          reminder_time: string;
          theme: "light" | "dark" | "system";
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          start_date: string | null;
          end_date: string | null;
          status: "active" | "completed" | "archived";
          created_at: string;
          completed_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["goals"]["Row"]> & {
          user_id: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["goals"]["Row"]>;
        Relationships: [];
      };
      targets: {
        Row: {
          id: string;
          goal_id: string;
          title: string;
          target_value: number;
          current_value: number;
          unit: string | null;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["targets"]["Row"]> & {
          goal_id: string;
          title: string;
          target_value: number;
        };
        Update: Partial<Database["public"]["Tables"]["targets"]["Row"]>;
        Relationships: [];
      };
      actions: {
        Row: {
          id: string;
          target_id: string;
          title: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["actions"]["Row"]> & {
          target_id: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["actions"]["Row"]>;
        Relationships: [];
      };
      action_logs: {
        Row: {
          id: string;
          action_id: string;
          user_id: string;
          completed_date: string;
          completed_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["action_logs"]["Row"]> & {
          action_id: string;
          user_id: string;
          completed_date: string;
        };
        Update: Partial<Database["public"]["Tables"]["action_logs"]["Row"]>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          source: "web" | "ios" | "android";
          lemon_squeezy_subscription_id: string | null;
          plan: "monthly" | "annual" | null;
          status: "trialing" | "active" | "cancelled" | "expired" | "past_due" | null;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]> & {
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]>;
        Relationships: [];
      };
      deletion_requests: {
        Row: {
          id: string;
          user_id: string | null;
          email: string;
          status: "pending" | "processing" | "completed";
          requested_at: string;
          completed_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["deletion_requests"]["Row"]> & {
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["deletion_requests"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_heatmap_data: {
        Args: { p_user_id: string; p_days?: number };
        Returns: {
          completed_date: string;
          completed_count: number;
          total_actions: number;
          completion_rate: number;
        }[];
      };
      get_streak: {
        Args: { p_user_id: string };
        Returns: number;
      };
      get_goal_progress: {
        Args: { p_goal_id: string };
        Returns: number;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
