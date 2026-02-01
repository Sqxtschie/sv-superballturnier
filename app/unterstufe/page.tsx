'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { GroupMatchWithTeams, Standing } from '@/lib/database.types'
import StandingsTable from '@/components/StandingsTable'
import GroupMatches from '@/components/GroupMatches'

type ViewMode = 'tabelle' | 'spielplan'

export default function UnterstufePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('tabelle')
  const [standings, setStandings] = useState<Standing[]>([])
  const [groupMatches, setGroupMatches] = useState<GroupMatchWithTeams[]>([])

  useEffect(() => {
    loadData()

    // Real-time Updates
    const groupMatchesSubscription = supabase
      .channel('unterstufe-group-matches-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'group_matches'
      }, () => {
        loadData()
      })
      .subscribe()

    return () => {
      groupMatchesSubscription.unsubscribe()
    }
  }, [])

  async function loadData() {
    // Lade Tabelle/Standings
    const { data: standingsData } = await supabase
      .from('standings_unterstufe')
      .select('*')

    if (standingsData) setStandings(standingsData as Standing[])

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
      // Nur Unterstufe-Spiele anzeigen
      const filteredMatches = groupMatchesData.filter(
        (match: any) => match.team1?.category === 'unterstufe'
      )
      setGroupMatches(filteredMatches as any)
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
            <span className="font-bold">UNTERSTUFE</span>
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
        </div>

        {/* Info-Box */}
        <div className="text-center mb-6 animate-[fadeIn_1.6s_ease-out]">
          <div className="inline-block bg-white/10 rounded-lg px-6 py-3">
            <span className="text-white/80 text-sm md:text-base">
              Jeder gegen Jeden - 5 Runden - Der Beste gewinnt!
            </span>
          </div>
        </div>

        {/* Ansicht */}
        <div className="animate-[fadeInUp_1.8s_ease-out]">
          {viewMode === 'tabelle' && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-tournament-yellow mb-4 text-center">
                GESAMTTABELLE
              </h2>
              <StandingsTable standings={standings} />
            </div>
          )}

          {viewMode === 'spielplan' && (
            <div className="max-w-4xl mx-auto">
              <GroupMatches matches={groupMatches} />
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
