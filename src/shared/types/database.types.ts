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
      achievements: {
        Row: {
          condition_key: string
          condition_value: number
          created_at: string
          description: string | null
          gold_reward: number
          icon: string | null
          id: string
          rarity: Database["public"]["Enums"]["achievement_rarity"]
          scope: Database["public"]["Enums"]["achievement_scope"]
          title: string
          xp_reward: number
        }
        Insert: {
          condition_key: string
          condition_value: number
          created_at?: string
          description?: string | null
          gold_reward?: number
          icon?: string | null
          id?: string
          rarity?: Database["public"]["Enums"]["achievement_rarity"]
          scope?: Database["public"]["Enums"]["achievement_scope"]
          title: string
          xp_reward?: number
        }
        Update: {
          condition_key?: string
          condition_value?: number
          created_at?: string
          description?: string | null
          gold_reward?: number
          icon?: string | null
          id?: string
          rarity?: Database["public"]["Enums"]["achievement_rarity"]
          scope?: Database["public"]["Enums"]["achievement_scope"]
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      attributes: {
        Row: {
          attribute_type: Database["public"]["Enums"]["attribute_type"]
          created_at: string
          id: string
          level: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          attribute_type: Database["public"]["Enums"]["attribute_type"]
          created_at?: string
          id?: string
          level?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          attribute_type?: Database["public"]["Enums"]["attribute_type"]
          created_at?: string
          id?: string
          level?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      contact_notes: {
        Row: {
          contact_id: string
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_id: string
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_id?: string
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_notes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          birthday: string | null
          city: string | null
          created_at: string
          gender: string | null
          groups: string[] | null
          id: string
          name: string
          notes: string | null
          occupation: string | null
          personality: string | null
          photo_url: string | null
          social_links: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          birthday?: string | null
          city?: string | null
          created_at?: string
          gender?: string | null
          groups?: string[] | null
          id?: string
          name: string
          notes?: string | null
          occupation?: string | null
          personality?: string | null
          photo_url?: string | null
          social_links?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          birthday?: string | null
          city?: string | null
          created_at?: string
          gender?: string | null
          groups?: string[] | null
          id?: string
          name?: string
          notes?: string | null
          occupation?: string | null
          personality?: string | null
          photo_url?: string | null
          social_links?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      debts: {
        Row: {
          amount: number
          contact_id: string
          created_at: string
          currency: string
          description: string | null
          direction: Database["public"]["Enums"]["debt_direction"]
          id: string
          is_settled: boolean
          settled_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          contact_id: string
          created_at?: string
          currency?: string
          description?: string | null
          direction: Database["public"]["Enums"]["debt_direction"]
          id?: string
          is_settled?: boolean
          settled_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          contact_id?: string
          created_at?: string
          currency?: string
          description?: string | null
          direction?: Database["public"]["Enums"]["debt_direction"]
          id?: string
          is_settled?: boolean
          settled_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "debts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          category: string | null
          contact_id: string | null
          created_at: string
          description: string | null
          event_date: string
          id: string
          is_recurring: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          contact_id?: string | null
          created_at?: string
          description?: string | null
          event_date: string
          id?: string
          is_recurring?: boolean
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          contact_id?: string | null
          created_at?: string
          description?: string | null
          event_date?: string
          id?: string
          is_recurring?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_accounts: {
        Row: {
          balance: number
          color: string | null
          created_at: string
          currency: string
          icon: string | null
          id: string
          name: string
          type: Database["public"]["Enums"]["finance_account_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          color?: string | null
          created_at?: string
          currency?: string
          icon?: string | null
          id?: string
          name: string
          type?: Database["public"]["Enums"]["finance_account_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          color?: string | null
          created_at?: string
          currency?: string
          icon?: string | null
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["finance_account_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      finance_categories: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
          type: Database["public"]["Enums"]["finance_transaction_type"]
          user_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          type: Database["public"]["Enums"]["finance_transaction_type"]
          user_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["finance_transaction_type"]
          user_id?: string | null
        }
        Relationships: []
      }
      finance_transactions: {
        Row: {
          account_id: string
          amount: number
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          to_account_id: string | null
          transaction_date: string
          type: Database["public"]["Enums"]["finance_transaction_type"]
          user_id: string
        }
        Insert: {
          account_id: string
          amount: number
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          to_account_id?: string | null
          transaction_date?: string
          type: Database["public"]["Enums"]["finance_transaction_type"]
          user_id: string
        }
        Update: {
          account_id?: string
          amount?: number
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          to_account_id?: string | null
          transaction_date?: string
          type?: Database["public"]["Enums"]["finance_transaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "finance_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "finance_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_transactions_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "finance_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_logs: {
        Row: {
          completed: boolean
          created_at: string
          date: string
          habit_id: string
          id: string
          logged_at: string
          status: Database["public"]["Enums"]["habit_log_status"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          date: string
          habit_id: string
          id?: string
          logged_at?: string
          status?: Database["public"]["Enums"]["habit_log_status"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          date?: string
          habit_id?: string
          id?: string
          logged_at?: string
          status?: Database["public"]["Enums"]["habit_log_status"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          attribute_ids: Database["public"]["Enums"]["attribute_type"][] | null
          best_streak: number
          created_at: string
          current_streak: number
          frequency: Database["public"]["Enums"]["habit_frequency"]
          id: string
          is_active: boolean
          schedule_dates: string[] | null
          schedule_days: number[] | null
          title: string
          type: Database["public"]["Enums"]["habit_type"]
          updated_at: string
          user_id: string
          xp_reward: number
        }
        Insert: {
          attribute_ids?: Database["public"]["Enums"]["attribute_type"][] | null
          best_streak?: number
          created_at?: string
          current_streak?: number
          frequency?: Database["public"]["Enums"]["habit_frequency"]
          id?: string
          is_active?: boolean
          schedule_dates?: string[] | null
          schedule_days?: number[] | null
          title: string
          type?: Database["public"]["Enums"]["habit_type"]
          updated_at?: string
          user_id: string
          xp_reward?: number
        }
        Update: {
          attribute_ids?: Database["public"]["Enums"]["attribute_type"][] | null
          best_streak?: number
          created_at?: string
          current_streak?: number
          frequency?: Database["public"]["Enums"]["habit_frequency"]
          id?: string
          is_active?: boolean
          schedule_dates?: string[] | null
          schedule_days?: number[] | null
          title?: string
          type?: Database["public"]["Enums"]["habit_type"]
          updated_at?: string
          user_id?: string
          xp_reward?: number
        }
        Relationships: []
      }
      inventory: {
        Row: {
          created_at: string
          id: string
          item_category: Database["public"]["Enums"]["item_category"]
          item_key: string
          item_name: string
          purchased_at: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_category: Database["public"]["Enums"]["item_category"]
          item_key: string
          item_name: string
          purchased_at?: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_category?: Database["public"]["Enums"]["item_category"]
          item_key?: string
          item_name?: string
          purchased_at?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      journals: {
        Row: {
          answers: Json | null
          created_at: string
          entry_date: string
          id: string
          mood: Database["public"]["Enums"]["mood_type"] | null
          productivity_stats: Json | null
          stress_level: number | null
          unlocked_by_powerup: boolean
          updated_at: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          answers?: Json | null
          created_at?: string
          entry_date?: string
          id?: string
          mood?: Database["public"]["Enums"]["mood_type"] | null
          productivity_stats?: Json | null
          stress_level?: number | null
          unlocked_by_powerup?: boolean
          updated_at?: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          answers?: Json | null
          created_at?: string
          entry_date?: string
          id?: string
          mood?: Database["public"]["Enums"]["mood_type"] | null
          productivity_stats?: Json | null
          stress_level?: number | null
          unlocked_by_powerup?: boolean
          updated_at?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          class: string | null
          created_at: string
          current_hp: number
          current_xp: number
          display_name: string | null
          gold: number
          id: string
          level: number
          max_hp: number
          rank: Database["public"]["Enums"]["player_rank"]
          streak_shields: number | null
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          class?: string | null
          created_at?: string
          current_hp?: number
          current_xp?: number
          display_name?: string | null
          gold?: number
          id?: string
          level?: number
          max_hp?: number
          rank?: Database["public"]["Enums"]["player_rank"]
          streak_shields?: number | null
          timezone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          class?: string | null
          created_at?: string
          current_hp?: number
          current_xp?: number
          display_name?: string | null
          gold?: number
          id?: string
          level?: number
          max_hp?: number
          rank?: Database["public"]["Enums"]["player_rank"]
          streak_shields?: number | null
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quests: {
        Row: {
          attribute_ids: Database["public"]["Enums"]["attribute_type"][] | null
          completed_at: string | null
          created_at: string
          deadline: string | null
          description: string | null
          gold_reward: number
          id: string
          priority: number | null
          resources: string | null
          status: Database["public"]["Enums"]["quest_status"]
          title: string
          updated_at: string
          user_id: string
          xp_reward: number
        }
        Insert: {
          attribute_ids?: Database["public"]["Enums"]["attribute_type"][] | null
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          gold_reward?: number
          id?: string
          priority?: number | null
          resources?: string | null
          status?: Database["public"]["Enums"]["quest_status"]
          title: string
          updated_at?: string
          user_id: string
          xp_reward?: number
        }
        Update: {
          attribute_ids?: Database["public"]["Enums"]["attribute_type"][] | null
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          gold_reward?: number
          id?: string
          priority?: number | null
          resources?: string | null
          status?: Database["public"]["Enums"]["quest_status"]
          title?: string
          updated_at?: string
          user_id?: string
          xp_reward?: number
        }
        Relationships: []
      }
      shared_habits: {
        Row: {
          contact_id: string
          created_at: string
          frequency: Database["public"]["Enums"]["habit_frequency"]
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          frequency?: Database["public"]["Enums"]["habit_frequency"]
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          frequency?: Database["public"]["Enums"]["habit_frequency"]
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_habits_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          attribute_ids: Database["public"]["Enums"]["attribute_type"][] | null
          completed_at: string | null
          created_at: string
          deadline: string | null
          gold_reward: number
          id: string
          quest_id: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
          user_id: string
          xp_reward: number
        }
        Insert: {
          attribute_ids?: Database["public"]["Enums"]["attribute_type"][] | null
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          gold_reward?: number
          id?: string
          quest_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
          user_id: string
          xp_reward?: number
        }
        Update: {
          attribute_ids?: Database["public"]["Enums"]["attribute_type"][] | null
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          gold_reward?: number
          id?: string
          quest_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
          user_id?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "tasks_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          created_at: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_statistics: {
        Row: {
          created_at: string
          id: string
          max_streak: number
          total_achievements_unlocked: number
          total_contacts_added: number
          total_debts_settled: number
          total_gold_earned: number
          total_gold_spent: number
          total_habits_checked: number
          total_items_purchased: number
          total_journals_written: number
          total_quests_completed: number
          total_tasks_completed: number
          total_xp_earned: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_streak?: number
          total_achievements_unlocked?: number
          total_contacts_added?: number
          total_debts_settled?: number
          total_gold_earned?: number
          total_gold_spent?: number
          total_habits_checked?: number
          total_items_purchased?: number
          total_journals_written?: number
          total_quests_completed?: number
          total_tasks_completed?: number
          total_xp_earned?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          max_streak?: number
          total_achievements_unlocked?: number
          total_contacts_added?: number
          total_debts_settled?: number
          total_gold_earned?: number
          total_gold_spent?: number
          total_habits_checked?: number
          total_items_purchased?: number
          total_journals_written?: number
          total_quests_completed?: number
          total_tasks_completed?: number
          total_xp_earned?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_streak_shield: { Args: { p_user_id: string }; Returns: Json }
      award_gold: { Args: { p_gold: number; p_user_id: string }; Returns: Json }
      award_xp: {
        Args: {
          p_attribute_types?: Database["public"]["Enums"]["attribute_type"][]
          p_user_id: string
          p_xp: number
        }
        Returns: Json
      }
      calculate_xp_for_level: { Args: { p_level: number }; Returns: number }
      complete_quest: { Args: { p_quest_id: string }; Returns: Json }
      complete_task: { Args: { p_task_id: string }; Returns: Json }
      deal_hp_damage: {
        Args: { p_damage: number; p_user_id: string }
        Returns: Json
      }
      get_rank_for_level: {
        Args: { p_level: number }
        Returns: Database["public"]["Enums"]["player_rank"]
      }
      heal_hp: { Args: { p_amount: number; p_user_id: string }; Returns: Json }
      increment_stat: {
        Args: { p_stat_key: string; p_user_id: string }
        Returns: undefined
      }
      purchase_item: {
        Args: {
          p_item_category: Database["public"]["Enums"]["item_category"]
          p_item_key: string
          p_item_name: string
          p_price: number
          p_user_id: string
        }
        Returns: Json
      }
      spend_gold: { Args: { p_gold: number; p_user_id: string }; Returns: Json }
      unlock_journal_entry: {
        Args: { p_journal_id: string; p_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      achievement_rarity:
        | "common"
        | "uncommon"
        | "rare"
        | "epic"
        | "legendary"
        | "divine"
      achievement_scope:
        | "global"
        | "quests"
        | "habits"
        | "journal"
        | "social"
        | "economy"
      attribute_type:
        | "health"
        | "friends"
        | "family"
        | "money"
        | "career"
        | "spirituality"
        | "development"
        | "brightness"
      debt_direction: "i_owe" | "they_owe"
      finance_account_type: "cash" | "card" | "bank" | "savings" | "other"
      finance_transaction_type: "income" | "expense" | "transfer"
      habit_frequency: "daily" | "weekly" | "custom" | "occasional"
      habit_log_status: "completed" | "failed" | "empty"
      habit_type: "good" | "bad"
      item_category: "potion" | "consumable"
      mood_type:
        | "happy"
        | "sad"
        | "angry"
        | "anxious"
        | "neutral"
        | "excited"
        | "tired"
        | "grateful"
      player_rank: "F" | "E" | "D" | "C" | "B" | "A" | "S" | "SS" | "SSS" | "L"
      quest_status: "active" | "completed" | "failed" | "archived"
      task_status: "pending" | "in_progress" | "completed"
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
      achievement_rarity: [
        "common",
        "uncommon",
        "rare",
        "epic",
        "legendary",
        "divine",
      ],
      achievement_scope: [
        "global",
        "quests",
        "habits",
        "journal",
        "social",
        "economy",
      ],
      attribute_type: [
        "health",
        "friends",
        "family",
        "money",
        "career",
        "spirituality",
        "development",
        "brightness",
      ],
      debt_direction: ["i_owe", "they_owe"],
      finance_account_type: ["cash", "card", "bank", "savings", "other"],
      finance_transaction_type: ["income", "expense", "transfer"],
      habit_frequency: ["daily", "weekly", "custom", "occasional"],
      habit_log_status: ["completed", "failed", "empty"],
      habit_type: ["good", "bad"],
      item_category: ["potion", "consumable"],
      mood_type: [
        "happy",
        "sad",
        "angry",
        "anxious",
        "neutral",
        "excited",
        "tired",
        "grateful",
      ],
      player_rank: ["F", "E", "D", "C", "B", "A", "S", "SS", "SSS", "L"],
      quest_status: ["active", "completed", "failed", "archived"],
      task_status: ["pending", "in_progress", "completed"],
    },
  },
} as const

