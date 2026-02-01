'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { GroupMatchWithTeams, PlayoffMatchWithTeams, Standing } from '@/lib/database.types'
import StandingsTable from '@/components/StandingsTable'
import GroupMatches from '@/components/GroupMatches'
import PlayoffBracket from '@/components/PlayoffBracket'

type ViewMode = 'tabelle' | 'spielplan' | 'playoffs'

export default function OberstufePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('tabelle')
  const [standingsA, setStandingsA] = useState<Standing[]>([])
  const [standingsB, setStandingsB] = useState<Standing[]>([])
  const [groupMatchesA, setGroupMatchesA] = useState<GroupMatchWithTeams[]>([])
  const [groupMatchesB, setGroupMatchesB] = useState<GroupMatchWithTeams[]>([])
  const [winnerPlayoffMatches, setWinnerPlayoffMatches] = useState<PlayoffMatchWithTeams[]>([])
  const [loserPlayoffMatches, setLoserPlayoffMatches] = useState<PlayoffMatchWithTeams[]>([])

  useEffect(() => {
    loadData()

    // Real-time Updates
    const groupMatchesSubscription = supabase
      .channel('oberstufe-group-matches-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'group_matches'
      }, () => {
        loadData()
      })
      .subscribe()

    const playoffMatchesSubscription = supabase
      .channel('oberstufe-playoff-matches-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'playoff_matches'
      }, () => {
        loadData()
      })
      .subscribe()

    return () => {
      groupMatchesSubscription.unsubscribe()
      playoffMatchesSubscription.unsubscribe()
    }
  }, [])

  async function loadData() {
    // Lade Tabelle Gruppe A
    const { data: standingsDataA } = await supabase
      .from('standings_oberstufe_a')
      .select('*')

    if (standingsDataA) setStandingsA(standingsDataA as Standing[])

    // Lade Tabelle Gruppe B
    const { data: standingsDataB } = await supabase
      .from('standings_oberstufe_b')
      .select('*')

    if (standingsDataB) setStandingsB(standingsDataB as Standing[])

    // Lade Gruppenphase Matches mit Teams
    const { data: groupMatchesData } = await supabase
      .from('group_matches')
      .select(`
        *,
        team1:teams!group_matches_team1_id_fkey(*),
        team2:teams!group_matches_team2_id_fkey(*)
      `)
      .order('match_day', { ascending: true })
      .order('match_number', { ascending: true })

    if (groupMatchesData) {
      // Filter nach Gruppe A (match_number 201-206)
      const matchesA = groupMatchesData.filter(
        (match: any) => match.team1?.category === 'oberstufe' && match.team1?.group_name === 'A'
      )
      setGroupMatchesA(matchesA as any)

      // Filter nach Gruppe B (match_number 211-216)
      const matchesB = groupMatchesData.filter(
        (match: any) => match.team1?.category === 'oberstufe' && match.team1?.group_name === 'B'
      )
      setGroupMatchesB(matchesB as any)
    }

    // Lade Playoff Matches mit Teams
    const { data: playoffMatchesData } = await supabase
      .from('playoff_matches')
      .select(`
        *,
        team1:teams!playoff_matches_team1_id_fkey(*),
        team2:teams!playoff_matches_team2_id_fkey(*),
        winner:teams!playoff_matches_winner_id_fkey(*)
      `)

    if (playoffMatchesData) {
      // Filter nach Oberstufe - Winner Bracket (match_number < 300)
      const winnerMatches = playoffMatchesData.filter(
        (match: any) =>
          (!match.team1 || match.team1?.category === 'oberstufe') &&
          match.match_number < 300
      )
      setWinnerPlayoffMatches(winnerMatches as any)

      // Filter nach Oberstufe - Loser Bracket (match_number >= 300)
      const loserMatches = playoffMatchesData.filter(
        (match: any) =>
          (!match.team1 || match.team1?.category === 'oberstufe') &&
          match.match_number >= 300
      )
      setLoserPlayoffMatches(loserMatches as any)
    }
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-wider animate-[fadeInDown_1s_ease-out]">
            SV SUPERBALLTURNIER
          </h1>
          <div className="text-white text-lg md:text-2xl mb-2 animate-[fadeInDown_1.2s_ease-out]">
            <span className="font-bold">OBERSTUFE</span>
            <span className="mx-2 md:mx-4">MEISTERSCHAFT</span>
          </div>
          <div className="text-tournament-yellow text-4xl md:text-6xl font-bold animate-[fadeInUp_1.4s_ease-out] animate-pulse">
            2026
          </div>
        </header>

        {/* Ansichts-Auswahl */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 mb-6 md:mb-8 animate-[fadeIn_1.6s_ease-out]">
          <button
            onClick={() => setViewMode('tabelle')}
            className={`px-8 py-3 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-110 hover:shadow-2xl ${
              viewMode === 'tabelle'
                ? 'bg-tournament-yellow text-tournament-purple shadow-lg scale-105'
                : 'bg-tournament-purple-dark text-white hover:bg-tournament-purple'
            }`}
          >
            TABELLE
          </button>
          <button
            onClick={() => setViewMode('spielplan')}
            className={`px-8 py-3 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-110 hover:shadow-2xl ${
              viewMode === 'spielplan'
                ? 'bg-tournament-yellow text-tournament-purple shadow-lg scale-105'
                : 'bg-tournament-purple-dark text-white hover:bg-tournament-purple'
            }`}
          >
            SPIELPLAN
          </button>
          <button
            onClick={() => setViewMode('playoffs')}
            className={`px-8 py-3 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-110 hover:shadow-2xl ${
              viewMode === 'playoffs'
                ? 'bg-tournament-yellow text-tournament-purple shadow-lg scale-105'
                : 'bg-tournament-purple-dark text-white hover:bg-tournament-purple'
            }`}
          >
            PLAYOFFS
          </button>
        </div>

        {/* Ansicht */}
        <div className="animate-[fadeInUp_1.8s_ease-out]">
          {viewMode === 'tabelle' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-3xl font-bold text-tournament-yellow mb-4 text-center">
                  GRUPPE A
                </h2>
                <StandingsTable standings={standingsA} />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-tournament-yellow mb-4 text-center">
                  GRUPPE B
                </h2>
                <StandingsTable standings={standingsB} />
              </div>
            </div>
          )}

          {viewMode === 'spielplan' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-3xl font-bold text-tournament-yellow mb-4 text-center">
                  GRUPPE A
                </h2>
                <GroupMatches matches={groupMatchesA} />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-tournament-yellow mb-4 text-center">
                  GRUPPE B
                </h2>
                <GroupMatches matches={groupMatchesB} />
              </div>
            </div>
          )}

          {viewMode === 'playoffs' && (
            <div className="space-y-12">
              <div>
                <h2 className="text-4xl font-bold text-tournament-yellow mb-6 text-center">
                  WINNER BRACKET (Platz 1-4)
                </h2>
                <PlayoffBracket matches={winnerPlayoffMatches} />
              </div>
              <hr className="border-tournament-yellow/30" />
              <div>
                <h2 className="text-4xl font-bold text-white/70 mb-6 text-center">
                  LOSER BRACKET (Platz 5-8)
                </h2>
                <PlayoffBracket matches={loserPlayoffMatches} />
              </div>
            </div>
          )}
        </div>

        {/* Admin Login Link */}
        <div className="text-center mt-12 animate-[fadeIn_2s_ease-out]">
          <a
            href="/admin"
            className="text-white hover:text-tournament-yellow transition-all duration-300 text-sm hover:scale-110 inline-block"
          >
            Admin Login
          </a>
        </div>
      </div>
    </main>
  )
}
