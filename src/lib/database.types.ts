export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string
          avatar_url: string | null
          total_golds: number
          total_silvers: number
          total_olympics: number
          created_at: string
        }
        Insert: {
          id: string
          username: string
          display_name: string
          avatar_url?: string | null
          total_golds?: number
          total_silvers?: number
          total_olympics?: number
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string
          avatar_url?: string | null
          total_golds?: number
          total_silvers?: number
          total_olympics?: number
          created_at?: string
        }
      }
      geodle_countries: {
        Row: {
          id: string
          name: string
          hints: string[]
          enabled: boolean
          created_at: string
        }
        Insert: {
          id: string
          name: string
          hints: string[]
          enabled?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          hints?: string[]
          enabled?: boolean
          created_at?: string
        }
      }
      game_sessions: {
        Row: {
          id: string
          session_code: string
          player1_id: string
          player2_id: string | null
          mode: 'async' | 'realtime'
          games_played: number
          created_at: string
          last_active_at: string
        }
        Insert: {
          id?: string
          session_code: string
          player1_id: string
          player2_id?: string | null
          mode?: 'async' | 'realtime'
          games_played?: number
          created_at?: string
          last_active_at?: string
        }
        Update: {
          id?: string
          session_code?: string
          player1_id?: string
          player2_id?: string | null
          mode?: 'async' | 'realtime'
          games_played?: number
          created_at?: string
          last_active_at?: string
        }
      }
      olympics: {
        Row: {
          id: string
          invite_code: string
          player1_id: string
          player2_id: string | null
          status: 'lobby' | 'active' | 'complete'
          event_sequence: string[]
          current_event_index: number
          player1_gold_count: number
          player2_gold_count: number
          winner_id: string | null
          mode: 'async' | 'realtime'
          player1_forfeited_at: string | null
          player2_forfeited_at: string | null
          timeout_hours: number
          session_id: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          invite_code: string
          player1_id: string
          player2_id?: string | null
          status?: 'lobby' | 'active' | 'complete'
          event_sequence: string[]
          current_event_index?: number
          player1_gold_count?: number
          player2_gold_count?: number
          winner_id?: string | null
          mode?: 'async' | 'realtime'
          player1_forfeited_at?: string | null
          player2_forfeited_at?: string | null
          timeout_hours?: number
          session_id?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          invite_code?: string
          player1_id?: string
          player2_id?: string | null
          status?: 'lobby' | 'active' | 'complete'
          event_sequence?: string[]
          current_event_index?: number
          player1_gold_count?: number
          player2_gold_count?: number
          winner_id?: string | null
          mode?: 'async' | 'realtime'
          player1_forfeited_at?: string | null
          player2_forfeited_at?: string | null
          timeout_hours?: number
          session_id?: string | null
          created_at?: string
          completed_at?: string | null
        }
      }
      olympics_events: {
        Row: {
          id: string
          olympics_id: string
          event_index: number
          event_type: string
          status: 'pending' | 'p1_active' | 'p2_active' | 'p1_complete' | 'p2_complete' | 'complete'
          gold_winner_id: string | null
          config: Json  // Event configuration (e.g., difficulty)
          metadata: Json
          started_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          olympics_id: string
          event_index: number
          event_type: string
          status?: 'pending' | 'p1_active' | 'p2_active' | 'p1_complete' | 'p2_complete' | 'complete'
          gold_winner_id?: string | null
          config?: Json
          metadata?: Json
          started_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          olympics_id?: string
          event_index?: number
          event_type?: string
          status?: 'pending' | 'p1_active' | 'p2_active' | 'p1_complete' | 'p2_complete' | 'complete'
          gold_winner_id?: string | null
          config?: Json
          metadata?: Json
          started_at?: string | null
          created_at?: string
        }
      }
      event_results: {
        Row: {
          id: string
          olympics_event_id: string
          player_id: string
          score: number
          raw_value: number
          metadata: Json
          completed_at: string
        }
        Insert: {
          id?: string
          olympics_event_id: string
          player_id: string
          score: number
          raw_value: number
          metadata?: Json
          completed_at?: string
        }
        Update: {
          id?: string
          olympics_event_id?: string
          player_id?: string
          score?: number
          raw_value?: number
          metadata?: Json
          completed_at?: string
        }
      }
      geodle_daily_puzzles: {
        Row: {
          id: string
          play_date: string | null
          status: 'draft' | 'scheduled' | 'published' | 'archived'
          countries: GeodlePuzzleCountry[]
          title: string | null
          difficulty: 'easy' | 'medium' | 'hard'
          created_by: string | null
          created_at: string
          updated_at: string
          times_played: number
          avg_guesses: number | null
          completion_rate: number | null
        }
        Insert: {
          id?: string
          play_date?: string | null
          status?: 'draft' | 'scheduled' | 'published' | 'archived'
          countries: GeodlePuzzleCountry[]
          title?: string | null
          difficulty?: 'easy' | 'medium' | 'hard'
          created_by?: string | null
          created_at?: string
          updated_at?: string
          times_played?: number
          avg_guesses?: number | null
          completion_rate?: number | null
        }
        Update: {
          id?: string
          play_date?: string | null
          status?: 'draft' | 'scheduled' | 'published' | 'archived'
          countries?: GeodlePuzzleCountry[]
          title?: string | null
          difficulty?: 'easy' | 'medium' | 'hard'
          created_by?: string | null
          created_at?: string
          updated_at?: string
          times_played?: number
          avg_guesses?: number | null
          completion_rate?: number | null
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type GameSession = Database['public']['Tables']['game_sessions']['Row']
export type Olympics = Database['public']['Tables']['olympics']['Row']
export type OlympicsEvent = Database['public']['Tables']['olympics_events']['Row']
export type EventResult = Database['public']['Tables']['event_results']['Row']
export type GeodleDailyPuzzle = Database['public']['Tables']['geodle_daily_puzzles']['Row']

// Geodle puzzle country with hints
export interface GeodlePuzzleCountry {
  name: string
  hints: [string, string, string, string]
}
