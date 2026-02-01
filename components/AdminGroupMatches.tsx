'use client'

import { useState } from 'react'
import { GroupMatchWithTeams } from '@/lib/database.types'
import { supabase } from '@/lib/supabase'

interface AdminGroupMatchesProps {
  matches: GroupMatchWithTeams[]
  onUpdate: () => void
}

export default function AdminGroupMatches({ matches, onUpdate }: AdminGroupMatchesProps) {
  const [editingMatch, setEditingMatch] = useState<string | null>(null)
  const [team1Score, setTeam1Score] = useState<number>(0)
  const [team2Score, setTeam2Score] = useState<number>(0)
  const [saving, setSaving] = useState(false)

  // Gruppiere Matches nach Spieltag
  const matchesByDay = matches.reduce((acc, match) => {
    if (!acc[match.match_day]) {
      acc[match.match_day] = []
    }
    acc[match.match_day].push(match)
    return acc
  }, {} as Record<number, GroupMatchWithTeams[]>)

  const sortedDays = Object.keys(matchesByDay)
    .map(Number)
    .sort((a, b) => a - b)

  const handleEditMatch = (match: GroupMatchWithTeams) => {
    setEditingMatch(match.id)
    setTeam1Score(match.team1_score ?? 0)
    setTeam2Score(match.team2_score ?? 0)
  }

  const handleSaveMatch = async (matchId: string) => {
    console.log('Speichere Match:', matchId, 'Scores:', team1Score, team2Score)

    // Debug: Prüfe aktuellen User
    const { data: { user } } = await supabase.auth.getUser()
    console.log('Aktueller User:', user?.email, 'ID:', user?.id)

    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('group_matches')
        .update({
          team1_score: team1Score,
          team2_score: team2Score,
          status: 'completed'
        })
        .eq('id', matchId)
        .select()

      console.log('Speichern Resultat:', { data, error })

      if (error) throw error

      console.log('Erfolgreich gespeichert, lade Daten neu...')
      setEditingMatch(null)
      onUpdate()
    } catch (error) {
      console.error('Fehler beim Speichern:', error)
      alert('Fehler beim Speichern des Ergebnisses: ' + (error as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingMatch(null)
    setTeam1Score(0)
    setTeam2Score(0)
  }

  return (
    <div className="space-y-8">
      {sortedDays.map((day) => (
        <div key={day} className="bg-white/5 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-tournament-yellow mb-4">
            {day}. Spieltag
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matchesByDay[day]
              .sort((a, b) => a.match_number - b.match_number)
              .map((match) => {
                const isEditing = editingMatch === match.id
                const hasResult =
                  match.team1_score !== null && match.team2_score !== null

                return (
                  <div
                    key={match.id}
                    className="bg-tournament-purple-dark rounded-lg p-4 border-2 border-tournament-purple"
                  >
                    <div className="text-white/60 text-sm mb-2 font-bold">
                      Spiel {match.match_number}
                    </div>

                    {isEditing ? (
                      // Edit Mode
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
                      // View Mode
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

                        {/* Edit Button */}
                        <button
                          onClick={() => handleEditMatch(match)}
                          className="w-full bg-tournament-yellow hover:bg-tournament-yellow/80 text-tournament-purple py-2 rounded font-bold transition-all"
                        >
                          {hasResult ? '✎ Ergebnis ändern' : '+ Ergebnis eintragen'}
                        </button>
                      </>
                    )}
                  </div>
                )
              })}
          </div>
        </div>
      ))}
    </div>
  )
}
