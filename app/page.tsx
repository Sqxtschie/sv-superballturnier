'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { CategoryType, Match, Team } from '@/lib/database.types'
import TournamentBracket from '@/components/TournamentBracket'

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('unterstufe')
  const [teams, setTeams] = useState<Team[]>([])
  const [matches, setMatches] = useState<Match[]>([])

  useEffect(() => {
    loadData()

    // Real-time Updates
    const matchesSubscription = supabase
      .channel('matches-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'matches',
        filter: `category=eq.${selectedCategory}`
      }, () => {
        loadData()
      })
      .subscribe()

    return () => {
      matchesSubscription.unsubscribe()
    }
  }, [selectedCategory])

  async function loadData() {
    // Lade Teams
    const { data: teamsData } = await supabase
      .from('teams')
      .select('*')
      .eq('category', selectedCategory)

    if (teamsData) setTeams(teamsData)

    // Lade Matches
    const { data: matchesData } = await supabase
      .from('matches')
      .select('*')
      .eq('category', selectedCategory)
      .order('bracket', { ascending: true })
      .order('round', { ascending: true })
      .order('position_in_round', { ascending: true })

    if (matchesData) setMatches(matchesData)
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-wider animate-[fadeInDown_1s_ease-out]">
            TURNIERBAUM
          </h1>
          <div className="text-white text-lg md:text-2xl mb-2 animate-[fadeInDown_1.2s_ease-out]">
            <span className="font-bold">EVENT NAME</span>
            <span className="mx-2 md:mx-4">TURNIER</span>
          </div>
          <div className="text-tournament-yellow text-4xl md:text-6xl font-bold animate-[fadeInUp_1.4s_ease-out] animate-pulse">
            2026
          </div>
        </header>

        {/* Kategorie-Auswahl */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 mb-6 md:mb-8 animate-[fadeIn_1.6s_ease-out]">
          <button
            onClick={() => setSelectedCategory('unterstufe')}
            className={`px-8 py-3 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-110 hover:shadow-2xl ${
              selectedCategory === 'unterstufe'
                ? 'bg-tournament-yellow text-tournament-purple shadow-lg scale-105'
                : 'bg-tournament-purple-dark text-white hover:bg-tournament-purple'
            }`}
          >
            UNTERSTUFE
          </button>
          <button
            onClick={() => setSelectedCategory('mittelstufe')}
            className={`px-8 py-3 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-110 hover:shadow-2xl ${
              selectedCategory === 'mittelstufe'
                ? 'bg-tournament-yellow text-tournament-purple shadow-lg scale-105'
                : 'bg-tournament-purple-dark text-white hover:bg-tournament-purple'
            }`}
          >
            MITTELSTUFE
          </button>
          <button
            onClick={() => setSelectedCategory('oberstufe')}
            className={`px-8 py-3 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-110 hover:shadow-2xl ${
              selectedCategory === 'oberstufe'
                ? 'bg-tournament-yellow text-tournament-purple shadow-lg scale-105'
                : 'bg-tournament-purple-dark text-white hover:bg-tournament-purple'
            }`}
          >
            OBERSTUFE
          </button>
        </div>

        {/* Turnierbaum */}
        <div className="animate-[fadeInUp_1.8s_ease-out]">
          <TournamentBracket
            matches={matches}
            teams={teams}
            category={selectedCategory}
          />
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
