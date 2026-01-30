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
      agent_stats: {
        Row: {
          agent_id: string
          avg_response_time_seconds: number | null
          conversations_closed: number | null
          conversations_started: number | null
          date: string
          id: string
          messages_received: number | null
          messages_sent: number | null
        }
        Insert: {
          agent_id: string
          avg_response_time_seconds?: number | null
          conversations_closed?: number | null
          conversations_started?: number | null
          date?: string
          id?: string
          messages_received?: number | null
          messages_sent?: number | null
        }
        Update: {
          agent_id?: string
          avg_response_time_seconds?: number | null
          conversations_closed?: number | null
          conversations_started?: number | null
          date?: string
          id?: string
          messages_received?: number | null
          messages_sent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_stats_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          ai_model: string | null
          ai_provider: Database["public"]["Enums"]["ai_provider"]
          avatar_url: string | null
          created_at: string
          description: string | null
          id: string
          language: string | null
          max_tokens: number | null
          name: string
          personality: string | null
          status: Database["public"]["Enums"]["agent_status"]
          system_prompt: string | null
          temperature: number | null
          type: Database["public"]["Enums"]["agent_type"]
          updated_at: string
          user_id: string
          welcome_message: string | null
        }
        Insert: {
          ai_model?: string | null
          ai_provider?: Database["public"]["Enums"]["ai_provider"]
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          language?: string | null
          max_tokens?: number | null
          name: string
          personality?: string | null
          status?: Database["public"]["Enums"]["agent_status"]
          system_prompt?: string | null
          temperature?: number | null
          type?: Database["public"]["Enums"]["agent_type"]
          updated_at?: string
          user_id: string
          welcome_message?: string | null
        }
        Update: {
          ai_model?: string | null
          ai_provider?: Database["public"]["Enums"]["ai_provider"]
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          language?: string | null
          max_tokens?: number | null
          name?: string
          personality?: string | null
          status?: Database["public"]["Enums"]["agent_status"]
          system_prompt?: string | null
          temperature?: number | null
          type?: Database["public"]["Enums"]["agent_type"]
          updated_at?: string
          user_id?: string
          welcome_message?: string | null
        }
        Relationships: []
      }
      automation_flows: {
        Row: {
          actions: Json | null
          agent_id: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          trigger_config: Json | null
          trigger_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actions?: Json | null
          agent_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          trigger_config?: Json | null
          trigger_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actions?: Json | null
          agent_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_flows_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          agent_id: string
          contact_name: string | null
          contact_phone: string
          created_at: string
          id: string
          last_message_at: string | null
          metadata: Json | null
          status: Database["public"]["Enums"]["conversation_status"]
          user_id: string
        }
        Insert: {
          agent_id: string
          contact_name?: string | null
          contact_phone: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          metadata?: Json | null
          status?: Database["public"]["Enums"]["conversation_status"]
          user_id: string
        }
        Update: {
          agent_id?: string
          contact_name?: string | null
          contact_phone?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          metadata?: Json | null
          status?: Database["public"]["Enums"]["conversation_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean | null
          metadata: Json | null
          sender_type: Database["public"]["Enums"]["sender_type"]
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          sender_type: Database["public"]["Enums"]["sender_type"]
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          sender_type?: Database["public"]["Enums"]["sender_type"]
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_connections: {
        Row: {
          created_at: string
          id: string
          is_connected: boolean | null
          last_connected_at: string | null
          phone_number: string
          session_data: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_connected?: boolean | null
          last_connected_at?: string | null
          phone_number: string
          session_data?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_connected?: boolean | null
          last_connected_at?: string | null
          phone_number?: string
          session_data?: Json | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      agent_status: "active" | "inactive" | "paused"
      agent_type: "sales" | "support" | "services" | "marketing" | "custom"
      ai_provider: "groq" | "ollama" | "lovable_ai" | "openai"
      conversation_status: "open" | "closed" | "pending"
      sender_type: "user" | "agent" | "system"
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
      agent_status: ["active", "inactive", "paused"],
      agent_type: ["sales", "support", "services", "marketing", "custom"],
      ai_provider: ["groq", "ollama", "lovable_ai", "openai"],
      conversation_status: ["open", "closed", "pending"],
      sender_type: ["user", "agent", "system"],
    },
  },
} as const
