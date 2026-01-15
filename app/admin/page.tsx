'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { CategoryType, Match, Team } from '@/lib/database.types'
import { updateMatchResult, initializeTournaments } from '@/lib/tournament'
import AdminBracket from '@/components/AdminBracket'
import TeamManager from '@/components/TeamManager'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('unterstufe')
  const [teams, setTeams] = useState<Team[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated, selectedCategory])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    setIsAuthenticated(!!session)
    setLoading(false)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Login fehlgeschlagen: ' + error.message)
    } else {
      setIsAuthenticated(true)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setIsAuthenticated(false)
  }

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

  async function handleMatchUpdate(matchId: string, winnerId: string) {
    await updateMatchResult(matchId, winnerId)
    await loadData()
  }

  async function handleInitializeTournaments() {
    if (confirm('Möchten Sie wirklich alle Turnierbäume neu initialisieren? Dies löscht alle bestehenden Spiele!')) {
      try {
        // Lösche alle bestehenden Matches
        const { error: deleteError } = await supabase.from('matches').delete().neq('id', '00000000-0000-0000-0000-000000000000')

        if (deleteError) {
          console.error('Fehler beim Löschen der Matches:', deleteError)
          alert('Fehler beim Löschen der alten Matches: ' + deleteError.message)
          return
        }

        // Initialisiere neue Turnierbäume
        await initializeTournaments()

        alert('Turnierbäume wurden erfolgreich initialisiert!')
        await loadData()
      } catch (error) {
        console.error('Fehler bei der Initialisierung:', error)
        alert('Fehler bei der Initialisierung: ' + (error as Error).message)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Laden...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md animate-[bounceIn_1s_ease-out]">
          <h1 className="text-3xl font-bold text-tournament-purple mb-6 text-center animate-[fadeInDown_1s_ease-out]">
            Admin Login
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="animate-[fadeInUp_1.2s_ease-out]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-Mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tournament-purple focus:border-transparent transition-all duration-300 hover:shadow-lg"
                required
              />
            </div>
            <div className="animate-[fadeInUp_1.4s_ease-out]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passwort
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tournament-purple focus:border-transparent transition-all duration-300 hover:shadow-lg"
                required
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm animate-[slideInLeft_0.5s_ease-out]">{error}</div>
            )}
            <button
              type="submit"
              className="w-full bg-tournament-purple text-white py-2 rounded-lg hover:bg-tournament-purple-dark transition-all duration-300 font-bold transform hover:scale-105 hover:shadow-xl animate-[fadeInUp_1.6s_ease-out]"
            >
              Anmelden
            </button>
          </form>
          <div className="mt-6 text-center animate-[fadeIn_1.8s_ease-out]">
            <a
              href="/"
              className="text-tournament-purple hover:text-tournament-purple-dark text-sm transition-all duration-300 hover:scale-110 inline-block"
            >
              Zurück zur Hauptseite
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <header className="mb-6 md:mb-8 animate-[fadeInDown_0.8s_ease-out]">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
                Admin Dashboard
              </h1>
              <p className="text-white/70 text-sm md:text-base">Verwalte Turnierergebnisse</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
              <button
                onClick={handleInitializeTournaments}
                className="px-4 md:px-6 py-2 text-sm md:text-base bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 font-bold transform hover:scale-105 hover:shadow-xl"
              >
                🔄 Turnierbäume initialisieren
              </button>
              <button
                onClick={handleLogout}
                className="px-4 md:px-6 py-2 text-sm md:text-base bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-300 transform hover:scale-105"
              >
                ❌ Abmelden
              </button>
            </div>
          </div>
        </header>

        {/* Kategorie-Auswahl */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 md:mb-8 animate-[fadeIn_1s_ease-out]">
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

        {/* Team Manager */}
        <div className="animate-[fadeIn_1s_ease-out]">
          <TeamManager
            teams={teams}
            category={selectedCategory}
            onUpdate={loadData}
          />
        </div>

        {/* Admin Bracket */}
        <div className="animate-[fadeInUp_1.2s_ease-out]">
          <AdminBracket
            matches={matches}
            teams={teams}
            category={selectedCategory}
            onMatchUpdate={handleMatchUpdate}
          />
        </div>
      </div>
    </main>
  )
}
