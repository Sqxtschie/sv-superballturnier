export type CategoryType = 'unterstufe' | 'mittelstufe' | 'oberstufe'
export type BracketType = 'winner' | 'loser'
export type MatchStatus = 'pending' | 'in_progress' | 'completed'

export interface Team {
  id: string
  name: string
  nickname?: string | null
  category: CategoryType
  created_at: string
}

export interface Match {
  id: string
  category: CategoryType
  bracket: BracketType
  round: number
  match_number: number
  team1_id: string | null
  team2_id: string | null
  winner_id: string | null
  status: MatchStatus
  position_in_round: number
  next_match_id: string | null
  next_match_position: number | null
  loser_next_match_id: string | null
  loser_next_match_position: number | null
  created_at: string
  updated_at: string
}

export interface MatchWithTeams extends Match {
  team1?: Team | null
  team2?: Team | null
  winner?: Team | null
}

export interface Database {
  public: {
    Tables: {
      teams: {
        Row: Team
        Insert: {
          id?: string
          name: string
          nickname?: string | null
          category: CategoryType
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          nickname?: string | null
          category?: CategoryType
          created_at?: string
        }
        Relationships: []
      }
      matches: {
        Row: Match
        Insert: {
          id?: string
          category: CategoryType
          bracket: BracketType
          round: number
          match_number: number
          team1_id?: string | null
          team2_id?: string | null
          winner_id?: string | null
          status?: MatchStatus
          position_in_round: number
          next_match_id?: string | null
          next_match_position?: number | null
          loser_next_match_id?: string | null
          loser_next_match_position?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category?: CategoryType
          bracket?: BracketType
          round?: number
          match_number?: number
          team1_id?: string | null
          team2_id?: string | null
          winner_id?: string | null
          status?: MatchStatus
          position_in_round?: number
          next_match_id?: string | null
          next_match_position?: number | null
          loser_next_match_id?: string | null
          loser_next_match_position?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    },
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      category_type: CategoryType
      bracket_type: BracketType
      match_status: MatchStatus
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
