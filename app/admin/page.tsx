'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { GroupMatchWithTeams, PlayoffMatchWithTeams, Standing, Team } from '@/lib/database.types'
import StandingsTable from '@/components/StandingsTable'
import AdminGroupMatches from '@/components/AdminGroupMatches'
import AdminPlayoffMatches from '@/components/AdminPlayoffMatches'
import TeamManager from '@/components/TeamManager'

type ViewMode = 'tabelle' | 'spielplan' | 'playoffs' | 'teams'
type Category = 'unterstufe' | 'mittelstufe' | 'oberstufe'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('spielplan')
  const [category, setCategory] = useState<Category>('mittelstufe')

  const [standings, setStandings] = useState<Standing[]>([])
  const [standingsA, setStandingsA] = useState<Standing[]>([])
  const [standingsB, setStandingsB] = useState<Standing[]>([])
  const [groupMatches, setGroupMatches] = useState<GroupMatchWithTeams[]>([])
  const [groupMatchesA, setGroupMatchesA] = useState<GroupMatchWithTeams[]>([])
  const [groupMatchesB, setGroupMatchesB] = useState<GroupMatchWithTeams[]>([])
  const [playoffMatches, setPlayoffMatches] = useState<PlayoffMatchWithTeams[]>([])
  const [teams, setTeams] = useState<Team[]>([])

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated, category])

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

  async function handleResetResults() {
    const categoryName = category === 'unterstufe' ? 'Unterstufe' : category === 'mittelstufe' ? 'Mittelstufe' : 'Oberstufe'

    if (!confirm(`⚠️ ACHTUNG!\n\nAlle Ergebnisse der ${categoryName} werden zurückgesetzt!\n\nDies kann nicht rückgängig gemacht werden.\n\nFortfahren?`)) {
      return
    }

    // Hole alle Team-IDs dieser Kategorie
    const { data: categoryTeams } = await supabase
      .from('teams')
      .select('id')
      .eq('category', category)

    if (!categoryTeams || categoryTeams.length === 0) {
      alert('Keine Teams in dieser Kategorie gefunden.')
      return
    }

    const teamIds = categoryTeams.map(t => t.id)

    // Reset Gruppenphase-Ergebnisse
    for (const teamId of teamIds) {
      await supabase
        .from('group_matches')
        .update({ team1_score: null, team2_score: null, status: 'pending' } as never)
        .eq('team1_id', teamId)

      await supabase
        .from('group_matches')
        .update({ team1_score: null, team2_score: null, status: 'pending' } as never)
        .eq('team2_id', teamId)
    }

    // Reset Playoff-Ergebnisse (falls vorhanden)
    for (const teamId of teamIds) {
      await supabase
        .from('playoff_matches')
        .update({ team1_score: null, team2_score: null, winner_id: null, status: 'pending' } as never)
        .eq('team1_id', teamId)

      await supabase
        .from('playoff_matches')
        .update({ team1_score: null, team2_score: null, winner_id: null, status: 'pending' } as never)
        .eq('team2_id', teamId)
    }

    alert(`✅ Alle ${categoryName}-Ergebnisse wurden zurückgesetzt!`)
    loadData()
  }

  async function loadData() {
    // Lade Teams (je nach Kategorie)
    const { data: teamsData } = await supabase
      .from('teams')
      .select('*')
      .eq('category', category)

    if (teamsData) setTeams(teamsData)

    if (category === 'unterstufe') {
      // Unterstufe: Eine Tabelle (Round Robin)
      const { data: standingsData } = await supabase
        .from('standings_unterstufe')
        .select('*')

      if (standingsData) setStandings(standingsData as Standing[])

      // Lade Gruppenphase Matches
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
        const filteredMatches = groupMatchesData.filter(
          (match: any) => match.team1?.category === 'unterstufe'
        )
        setGroupMatches(filteredMatches as any)
      }
    } else if (category === 'mittelstufe') {
      // Mittelstufe: Eine Tabelle
      const { data: standingsData } = await supabase
        .from('standings')
        .select('*')

      if (standingsData) setStandings(standingsData as Standing[])

      // Lade Gruppenphase Matches
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
        const filteredMatches = groupMatchesData.filter(
          (match: any) => match.team1?.category === 'mittelstufe'
        )
        setGroupMatches(filteredMatches as any)
      }
    } else {
      // Oberstufe: Zwei Gruppen (A und B)
      const { data: standingsDataA } = await supabase
        .from('standings_oberstufe_a')
        .select('*')

      if (standingsDataA) setStandingsA(standingsDataA as Standing[])

      const { data: standingsDataB } = await supabase
        .from('standings_oberstufe_b')
        .select('*')

      if (standingsDataB) setStandingsB(standingsDataB as Standing[])

      // Lade Gruppenphase Matches
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
        const matchesA = groupMatchesData.filter(
          (match: any) => match.team1?.category === 'oberstufe' && match.team1?.group_name === 'A'
        )
        setGroupMatchesA(matchesA as any)

        const matchesB = groupMatchesData.filter(
          (match: any) => match.team1?.category === 'oberstufe' && match.team1?.group_name === 'B'
        )
        setGroupMatchesB(matchesB as any)
      }
    }

    // Lade Playoff Matches mit Teams (je nach Kategorie)
    const { data: playoffMatchesData } = await supabase
      .from('playoff_matches')
      .select(`
        *,
        team1:teams!playoff_matches_team1_id_fkey(*),
        team2:teams!playoff_matches_team2_id_fkey(*),
        winner:teams!playoff_matches_winner_id_fkey(*)
      `)

    if (playoffMatchesData) {
      const filteredMatches = playoffMatchesData.filter(
        (match: any) =>
          (!match.team1 || match.team1?.category === category) &&
          (!match.team2 || match.team2?.category === category)
      )
      setPlayoffMatches(filteredMatches as any)
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
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-tournament-purple mb-6 text-center">
            Admin Login
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-Mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tournament-purple focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passwort
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tournament-purple focus:border-transparent"
                required
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            <button
              type="submit"
              className="w-full bg-tournament-purple text-white py-2 rounded-lg hover:bg-tournament-purple-dark transition-all font-bold"
            >
              Anmelden
            </button>
          </form>
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-tournament-purple hover:text-tournament-purple-dark text-sm"
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
        <header className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
                Admin Dashboard
              </h1>
              <p className="text-white/70 text-sm md:text-base">
                Verwalte Turnierergebnisse - {category === 'unterstufe' ? 'Unterstufe' : category === 'mittelstufe' ? 'Mittelstufe' : 'Oberstufe'} Meisterschaft 2026
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
              <a
                href={category === 'unterstufe' ? '/unterstufe' : category === 'mittelstufe' ? '/' : '/oberstufe'}
                className="px-4 md:px-6 py-2 text-sm md:text-base bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all text-center"
              >
                🏠 Zur Hauptseite
              </a>
              <button
                onClick={handleResetResults}
                className="px-4 md:px-6 py-2 text-sm md:text-base bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all"
              >
                🔄 Reset
              </button>
              <button
                onClick={handleLogout}
                className="px-4 md:px-6 py-2 text-sm md:text-base bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
              >
                ❌ Abmelden
              </button>
            </div>
          </div>
        </header>

        {/* Kategorie-Auswahl */}
        <div className="flex gap-3 md:gap-4 mb-6 md:mb-8">
          <button
            onClick={() => setCategory('unterstufe')}
            className={`flex-1 px-4 py-3 rounded-lg font-bold text-base md:text-lg transition-all ${
              category === 'unterstufe'
                ? 'bg-tournament-yellow text-tournament-purple shadow-lg scale-105'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            🎒 UNTERSTUFE
          </button>
          <button
            onClick={() => setCategory('mittelstufe')}
            className={`flex-1 px-4 py-3 rounded-lg font-bold text-base md:text-lg transition-all ${
              category === 'mittelstufe'
                ? 'bg-tournament-yellow text-tournament-purple shadow-lg scale-105'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            📚 MITTELSTUFE
          </button>
          <button
            onClick={() => setCategory('oberstufe')}
            className={`flex-1 px-4 py-3 rounded-lg font-bold text-base md:text-lg transition-all ${
              category === 'oberstufe'
                ? 'bg-tournament-yellow text-tournament-purple shadow-lg scale-105'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            🎓 OBERSTUFE
          </button>
        </div>

        {/* Ansichts-Auswahl */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <button
            onClick={() => setViewMode('tabelle')}
            className={`px-8 py-3 rounded-lg font-bold text-lg transition-all ${
              viewMode === 'tabelle'
                ? 'bg-tournament-yellow text-tournament-purple shadow-lg scale-105'
                : 'bg-tournament-purple-dark text-white hover:bg-tournament-purple'
            }`}
          >
            📊 TABELLE
          </button>
          <button
            onClick={() => setViewMode('spielplan')}
            className={`px-8 py-3 rounded-lg font-bold text-lg transition-all ${
              viewMode === 'spielplan'
                ? 'bg-tournament-yellow text-tournament-purple shadow-lg scale-105'
                : 'bg-tournament-purple-dark text-white hover:bg-tournament-purple'
            }`}
          >
            📋 SPIELPLAN
          </button>
          <button
            onClick={() => setViewMode('playoffs')}
            className={`px-8 py-3 rounded-lg font-bold text-lg transition-all ${
              viewMode === 'playoffs'
                ? 'bg-tournament-yellow text-tournament-purple shadow-lg scale-105'
                : 'bg-tournament-purple-dark text-white hover:bg-tournament-purple'
            }`}
          >
            🏆 PLAYOFFS
          </button>
          <button
            onClick={() => setViewMode('teams')}
            className={`px-8 py-3 rounded-lg font-bold text-lg transition-all ${
              viewMode === 'teams'
                ? 'bg-tournament-yellow text-tournament-purple shadow-lg scale-105'
                : 'bg-tournament-purple-dark text-white hover:bg-tournament-purple'
            }`}
          >
            👥 TEAMS
          </button>
        </div>

        {/* Ansicht */}
        <div>
          {viewMode === 'tabelle' && category === 'unterstufe' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Gesamttabelle - Jeder gegen Jeden</h2>
              <StandingsTable standings={standings} />
            </div>
          )}
          {viewMode === 'tabelle' && category === 'mittelstufe' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Aktuelle Tabelle</h2>
              <StandingsTable standings={standings} />
            </div>
          )}
          {viewMode === 'tabelle' && category === 'oberstufe' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold text-tournament-yellow mb-4 text-center">GRUPPE A</h2>
                <StandingsTable standings={standingsA} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-tournament-yellow mb-4 text-center">GRUPPE B</h2>
                <StandingsTable standings={standingsB} />
              </div>
            </div>
          )}
          {viewMode === 'spielplan' && category === 'unterstufe' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Spielplan - Ergebnisse eintragen</h2>
              <AdminGroupMatches matches={groupMatches} onUpdate={loadData} />
            </div>
          )}
          {viewMode === 'spielplan' && category === 'mittelstufe' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Gruppenphase - Ergebnisse eintragen</h2>
              <AdminGroupMatches matches={groupMatches} onUpdate={loadData} />
            </div>
          )}
          {viewMode === 'spielplan' && category === 'oberstufe' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold text-tournament-yellow mb-4 text-center">GRUPPE A - Ergebnisse eintragen</h2>
                <AdminGroupMatches matches={groupMatchesA} onUpdate={loadData} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-tournament-yellow mb-4 text-center">GRUPPE B - Ergebnisse eintragen</h2>
                <AdminGroupMatches matches={groupMatchesB} onUpdate={loadData} />
              </div>
            </div>
          )}
          {viewMode === 'playoffs' && category === 'unterstufe' && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-white mb-4">Keine Playoffs</h2>
              <p className="text-white/70">Die Unterstufe spielt nur Jeder gegen Jeden - der Beste in der Tabelle gewinnt!</p>
            </div>
          )}
          {viewMode === 'playoffs' && category !== 'unterstufe' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Playoffs - K.O.-Phase</h2>
              <AdminPlayoffMatches
                matches={playoffMatches}
                standings={category === 'mittelstufe' ? standings : [...standingsA, ...standingsB]}
                teams={teams}
                onUpdate={loadData}
              />
            </div>
          )}
          {viewMode === 'teams' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Team-Verwaltung</h2>
              <TeamManager teams={teams} category={category} onUpdate={loadData} />
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
