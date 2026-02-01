export type CategoryType = 'unterstufe' | 'mittelstufe' | 'oberstufe'
export type MatchStatus = 'pending' | 'in_progress' | 'completed'
export type PlayoffRound = 'halbfinale' | 'finale' | 'kleines_finale'

export interface Team {
  id: string
  name: string
  class_name: string
  nickname?: string | null
  category: CategoryType
  group_name?: string | null
  created_at: string
}

export interface GroupMatch {
  id: string
  match_day: number
  match_number: number
  team1_id: string | null
  team2_id: string | null
  team1_score: number | null
  team2_score: number | null
  status: MatchStatus
  created_at: string
  updated_at: string
}

export interface PlayoffMatch {
  id: string
  round: PlayoffRound
  match_number: number
  team1_id: string | null
  team2_id: string | null
  team1_score: number | null
  team2_score: number | null
  winner_id: string | null
  status: MatchStatus
  created_at: string
  updated_at: string
}

export interface GroupMatchWithTeams extends GroupMatch {
  team1?: Team | null
  team2?: Team | null
}

export interface PlayoffMatchWithTeams extends PlayoffMatch {
  team1?: Team | null
  team2?: Team | null
  winner?: Team | null
}

export interface Standing {
  team_id: string
  team_name: string
  group_name?: string | null
  played: number
  won: number
  drawn: number
  lost: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
}

export interface Database {
  public: {
    Tables: {
      teams: {
        Row: Team
        Insert: {
          id?: string
          name: string
          class_name: string
          nickname?: string | null
          category: CategoryType
          group_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          class_name?: string
          nickname?: string | null
          category?: CategoryType
          group_name?: string | null
          created_at?: string
        }
        Relationships: []
      }
      group_matches: {
        Row: GroupMatch
        Insert: {
          id?: string
          match_day: number
          match_number: number
          team1_id?: string | null
          team2_id?: string | null
          team1_score?: number | null
          team2_score?: number | null
          status?: MatchStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          match_day?: number
          match_number?: number
          team1_id?: string | null
          team2_id?: string | null
          team1_score?: number | null
          team2_score?: number | null
          status?: MatchStatus
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      playoff_matches: {
        Row: PlayoffMatch
        Insert: {
          id?: string
          round: PlayoffRound
          match_number: number
          team1_id?: string | null
          team2_id?: string | null
          team1_score?: number | null
          team2_score?: number | null
          winner_id?: string | null
          status?: MatchStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          round?: PlayoffRound
          match_number?: number
          team1_id?: string | null
          team2_id?: string | null
          team1_score?: number | null
          team2_score?: number | null
          winner_id?: string | null
          status?: MatchStatus
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      standings: {
        Row: Standing
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      category_type: CategoryType
      match_status: MatchStatus
      playoff_round: PlayoffRound
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
