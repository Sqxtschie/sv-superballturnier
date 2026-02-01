'use client'

import { useState } from 'react'
import { PlayoffMatchWithTeams, Standing, Team } from '@/lib/database.types'
import { supabase } from '@/lib/supabase'

interface AdminPlayoffMatchesProps {
  matches: PlayoffMatchWithTeams[]
  standings: Standing[]
  teams: Team[]
  onUpdate: () => void
}

export default function AdminPlayoffMatches({
  matches,
  standings,
  teams,
  onUpdate
}: AdminPlayoffMatchesProps) {
  const [editingMatch, setEditingMatch] = useState<string | null>(null)
  const [team1Score, setTeam1Score] = useState<number>(0)
  const [team2Score, setTeam2Score] = useState<number>(0)
  const [saving, setSaving] = useState(false)

  const halbfinale1 = matches.find(
    (m) => m.round === 'halbfinale' && m.match_number === 1
  )
  const halbfinale2 = matches.find(
    (m) => m.round === 'halbfinale' && m.match_number === 2
  )
  const finale = matches.find((m) => m.round === 'finale')
  const kleinesFinale = matches.find((m) => m.round === 'kleines_finale')

  const handleEditMatch = (match: PlayoffMatchWithTeams) => {
    setEditingMatch(match.id)
    setTeam1Score(match.team1_score ?? 0)
    setTeam2Score(match.team2_score ?? 0)
  }

  const handleSaveMatch = async (matchId: string) => {
    if (team1Score === team2Score) {
      alert('Unentschieden ist in den Playoffs nicht möglich! Bitte ein eindeutiges Ergebnis eingeben.')
      return
    }

    setSaving(true)
    try {
      const currentMatch = matches.find(m => m.id === matchId)
      const winnerId = team1Score > team2Score
        ? currentMatch?.team1_id
        : currentMatch?.team2_id
      const loserId = team1Score > team2Score
        ? currentMatch?.team2_id
        : currentMatch?.team1_id

      const { error } = await supabase
        .from('playoff_matches')
        .update({
          team1_score: team1Score,
          team2_score: team2Score,
          winner_id: winnerId,
          status: 'completed'
        })
        .eq('id', matchId)

      if (error) throw error

      // Wenn es ein Halbfinale ist, aktualisiere Finale und kleines Finale
      if (currentMatch?.round === 'halbfinale') {
        // Hole aktualisierte Halbfinale-Daten
        const { data: updatedSemis } = await supabase
          .from('playoff_matches')
          .select('*')
          .eq('round', 'halbfinale')

        if (updatedSemis && updatedSemis.length === 2) {
          const semi1 = updatedSemis.find(m => m.match_number === 1)
          const semi2 = updatedSemis.find(m => m.match_number === 2)

          // Wenn beide Halbfinals abgeschlossen sind
          if (semi1?.winner_id && semi2?.winner_id) {
            // Ermittle die Verlierer
            const loser1 = semi1.team1_score > semi1.team2_score ? semi1.team2_id : semi1.team1_id
            const loser2 = semi2.team1_score > semi2.team2_score ? semi2.team2_id : semi2.team1_id

            // Update Finale mit den Siegern
            await supabase
              .from('playoff_matches')
              .update({ team1_id: semi1.winner_id, team2_id: semi2.winner_id })
              .eq('round', 'finale')

            // Update kleines Finale mit den Verlierern
            await supabase
              .from('playoff_matches')
              .update({ team1_id: loser1, team2_id: loser2 })
              .eq('round', 'kleines_finale')
          } else if (currentMatch.match_number === 1 && winnerId) {
            // Nur Halbfinale 1 fertig - setze Team 1 im Finale
            await supabase
              .from('playoff_matches')
              .update({ team1_id: winnerId })
              .eq('round', 'finale')
            await supabase
              .from('playoff_matches')
              .update({ team1_id: loserId })
              .eq('round', 'kleines_finale')
          } else if (currentMatch.match_number === 2 && winnerId) {
            // Nur Halbfinale 2 fertig - setze Team 2 im Finale
            await supabase
              .from('playoff_matches')
              .update({ team2_id: winnerId })
              .eq('round', 'finale')
            await supabase
              .from('playoff_matches')
              .update({ team2_id: loserId })
              .eq('round', 'kleines_finale')
          }
        }
      }

      setEditingMatch(null)
      onUpdate()
    } catch (error) {
      console.error('Fehler beim Speichern:', error)
      alert('Fehler beim Speichern des Ergebnisses')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingMatch(null)
    setTeam1Score(0)
    setTeam2Score(0)
  }

  const handleInitializePlayoffs = async () => {
    if (standings.length < 4) {
      alert('Es müssen mindestens 4 Teams in der Tabelle sein, um Playoffs zu initialisieren.')
      return
    }

    if (!confirm('Playoffs initialisieren? Dies erstellt Halbfinale, Finale und kleines Finale basierend auf der aktuellen Tabelle.')) {
      return
    }

    setSaving(true)
    try {
      // Lösche alte Playoff-Matches
      await supabase.from('playoff_matches').delete().neq('id', '00000000-0000-0000-0000-000000000000')

      // Erstelle Halbfinale 1: 1. vs 4.
      const team1 = teams.find(t => t.id === standings[0].team_id)
      const team4 = teams.find(t => t.id === standings[3].team_id)

      await supabase.from('playoff_matches').insert({
        round: 'halbfinale',
        match_number: 1,
        team1_id: team1?.id,
        team2_id: team4?.id
      })

      // Erstelle Halbfinale 2: 2. vs 3.
      const team2 = teams.find(t => t.id === standings[1].team_id)
      const team3 = teams.find(t => t.id === standings[2].team_id)

      await supabase.from('playoff_matches').insert({
        round: 'halbfinale',
        match_number: 2,
        team1_id: team2?.id,
        team2_id: team3?.id
      })

      // Erstelle leere Finale und kleines Finale
      await supabase.from('playoff_matches').insert([
        { round: 'finale', match_number: 1 },
        { round: 'kleines_finale', match_number: 1 }
      ])

      alert('Playoffs wurden erfolgreich initialisiert!')
      onUpdate()
    } catch (error) {
      console.error('Fehler beim Initialisieren:', error)
      alert('Fehler beim Initialisieren der Playoffs')
    } finally {
      setSaving(false)
    }
  }

  const renderMatchCard = (
    match: PlayoffMatchWithTeams | undefined,
    title: string
  ) => {
    if (!match) {
      return (
        <div className="bg-white/5 rounded-lg p-4 text-center text-white/40">
          {title} - Noch nicht erstellt
        </div>
      )
    }

    const isEditing = editingMatch === match.id
    const hasResult = match.team1_score !== null && match.team2_score !== null

    return (
      <div className="bg-tournament-purple-dark rounded-lg p-4 border-2 border-tournament-purple">
        <div className="text-center font-bold text-xl text-white mb-4">
          {title}
        </div>

        {isEditing ? (
          <>
            {/* Team 1 mit Input */}
            <div className="flex justify-between items-center p-3 rounded-lg mb-2 bg-white/10">
              <span className="font-bold text-white text-lg">
                {match.team1 ? `${match.team1.name} (${match.team1.class_name})` : 'TBD'}
              </span>
              <input
                type="number"
                min="0"
                value={team1Score}
                onChange={(e) => setTeam1Score(parseInt(e.target.value) || 0)}
                className="w-16 px-2 py-1 bg-tournament-purple text-white text-center text-xl font-bold rounded border-2 border-tournament-yellow"
              />
            </div>

            <div className="text-center text-white/40 font-bold mb-2">VS</div>

            {/* Team 2 mit Input */}
            <div className="flex justify-between items-center p-3 rounded-lg mb-3 bg-white/10">
              <span className="font-bold text-white text-lg">
                {match.team2 ? `${match.team2.name} (${match.team2.class_name})` : 'TBD'}
              </span>
              <input
                type="number"
                min="0"
                value={team2Score}
                onChange={(e) => setTeam2Score(parseInt(e.target.value) || 0)}
                className="w-16 px-2 py-1 bg-tournament-purple text-white text-center text-xl font-bold rounded border-2 border-tournament-yellow"
              />
            </div>

            {/* Save/Cancel Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleSaveMatch(match.id)}
                disabled={saving}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-bold transition-all disabled:opacity-50"
              >
                {saving ? '...' : '✓ Speichern'}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={saving}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded font-bold transition-all disabled:opacity-50"
              >
                ✗ Abbrechen
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Team 1 */}
            <div className="flex justify-between items-center p-3 rounded-lg mb-2 bg-white/10">
              <span className="font-bold text-white text-lg">
                {match.team1 ? `${match.team1.name} (${match.team1.class_name})` : 'TBD'}
              </span>
              {hasResult && (
                <span className="font-bold text-2xl text-white">
                  {match.team1_score}
                </span>
              )}
            </div>

            <div className="text-center text-white/40 font-bold mb-2">VS</div>

            {/* Team 2 */}
            <div className="flex justify-between items-center p-3 rounded-lg mb-3 bg-white/10">
              <span className="font-bold text-white text-lg">
                {match.team2 ? `${match.team2.name} (${match.team2.class_name})` : 'TBD'}
              </span>
              {hasResult && (
                <span className="font-bold text-2xl text-white">
                  {match.team2_score}
                </span>
              )}
            </div>

            {hasResult && match.winner && (
              <div className="mb-3 text-center bg-green-600/30 border-2 border-green-500 rounded p-2">
                <div className="text-tournament-yellow font-bold text-sm">Sieger</div>
                <div className="text-white font-bold text-lg">{match.winner.name} ({match.winner.class_name})</div>
              </div>
            )}

            {/* Edit Button */}
            <button
              onClick={() => handleEditMatch(match)}
              disabled={!match.team1_id || !match.team2_id}
              className="w-full bg-tournament-yellow hover:bg-tournament-yellow/80 text-tournament-purple py-2 rounded font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {hasResult ? '✎ Ergebnis ändern' : '+ Ergebnis eintragen'}
            </button>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Initialize Button */}
      {matches.length === 0 && (
        <div className="text-center">
          <button
            onClick={handleInitializePlayoffs}
            disabled={saving || standings.length < 4}
            className="px-8 py-4 bg-tournament-yellow hover:bg-tournament-yellow/80 text-tournament-purple rounded-lg font-bold text-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🏆 Playoffs initialisieren
          </button>
          {standings.length < 4 && (
            <p className="text-white/60 mt-4">
              Es müssen mindestens 4 Teams gespielt haben, um Playoffs zu starten.
            </p>
          )}
        </div>
      )}

      {/* Halbfinale */}
      {(halbfinale1 || halbfinale2) && (
        <div>
          <h2 className="text-3xl font-bold text-tournament-yellow mb-6 text-center">
            HALBFINALE
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderMatchCard(halbfinale1, '1. Platz vs 4. Platz')}
            {renderMatchCard(halbfinale2, '2. Platz vs 3. Platz')}
          </div>
        </div>
      )}

      {/* Finale */}
      {finale && (
        <div>
          <h2 className="text-4xl font-bold text-tournament-yellow mb-6 text-center">
            FINALE
          </h2>
          <div className="max-w-2xl mx-auto">
            {renderMatchCard(finale, 'FINALE')}
          </div>
        </div>
      )}

      {/* Kleines Finale */}
      {kleinesFinale && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            SPIEL UM PLATZ 3
          </h2>
          <div className="max-w-xl mx-auto">
            {renderMatchCard(kleinesFinale, 'Kleines Finale')}
          </div>
        </div>
      )}
    </div>
  )
}
