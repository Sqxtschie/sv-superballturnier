'use client'

import { PlayoffMatchWithTeams } from '@/lib/database.types'

interface PlayoffBracketProps {
  matches: PlayoffMatchWithTeams[]
}

export default function PlayoffBracket({ matches }: PlayoffBracketProps) {
  const halbfinale1 = matches.find(
    (m) => m.round === 'halbfinale' && m.match_number === 1
  )
  const halbfinale2 = matches.find(
    (m) => m.round === 'halbfinale' && m.match_number === 2
  )
  const finale = matches.find((m) => m.round === 'finale')
  const kleinesFinale = matches.find((m) => m.round === 'kleines_finale')

  const renderMatch = (
    match: PlayoffMatchWithTeams | undefined,
    title: string,
    size: 'normal' | 'large' = 'normal'
  ) => {
    if (!match) {
      return (
        <div className="bg-white/5 rounded-lg p-4 text-center text-white/40">
          {title} - Noch nicht verfügbar
        </div>
      )
    }

    const hasResult =
      match.team1_score !== null && match.team2_score !== null
    const team1Won = hasResult && match.team1_score! > match.team2_score!
    const team2Won = hasResult && match.team2_score! > match.team1_score!

    return (
      <div
        className={`bg-tournament-purple-dark rounded-lg border-2 border-tournament-purple ${
          size === 'large' ? 'p-6' : 'p-4'
        }`}
      >
        <div
          className={`text-center font-bold mb-4 ${
            size === 'large'
              ? 'text-3xl text-tournament-yellow'
              : 'text-xl text-white'
          }`}
        >
          {title}
        </div>

        {/* Team 1 */}
        <div
          className={`flex justify-between items-center p-4 rounded-lg mb-2 transition-all ${
            team1Won
              ? 'bg-green-600/30 border-2 border-green-500'
              : hasResult
              ? 'bg-white/5 opacity-70'
              : 'bg-white/10'
          }`}
        >
          <span
            className={`font-bold text-white ${
              size === 'large' ? 'text-2xl' : 'text-lg'
            }`}
          >
            {match.team1 ? `${match.team1.name} (${match.team1.class_name})` : 'TBD'}
          </span>
          {hasResult && (
            <span
              className={`font-bold text-white ${
                size === 'large' ? 'text-3xl' : 'text-2xl'
              }`}
            >
              {match.team1_score}
            </span>
          )}
        </div>

        {/* VS Divider */}
        <div className="text-center text-white/40 font-bold mb-2">VS</div>

        {/* Team 2 */}
        <div
          className={`flex justify-between items-center p-4 rounded-lg transition-all ${
            team2Won
              ? 'bg-green-600/30 border-2 border-green-500'
              : hasResult
              ? 'bg-white/5 opacity-70'
              : 'bg-white/10'
          }`}
        >
          <span
            className={`font-bold text-white ${
              size === 'large' ? 'text-2xl' : 'text-lg'
            }`}
          >
            {match.team2 ? `${match.team2.name} (${match.team2.class_name})` : 'TBD'}
          </span>
          {hasResult && (
            <span
              className={`font-bold text-white ${
                size === 'large' ? 'text-3xl' : 'text-2xl'
              }`}
            >
              {match.team2_score}
            </span>
          )}
        </div>

        {hasResult && match.winner && (
          <div className="mt-4 text-center">
            <div className="text-tournament-yellow font-bold text-sm mb-1">
              {size === 'large' ? '🏆 MEISTER 🏆' : 'Sieger'}
            </div>
            <div className="text-white font-bold text-xl">
              {match.winner.name} ({match.winner.class_name})
            </div>
          </div>
        )}

        {!hasResult && (
          <div className="mt-3 text-center text-white/40 text-sm">
            Noch nicht gespielt
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Halbfinale */}
      <div>
        <h2 className="text-3xl font-bold text-tournament-yellow mb-6 text-center">
          HALBFINALE
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderMatch(halbfinale1, '1. Platz vs 4. Platz')}
          {renderMatch(halbfinale2, '2. Platz vs 3. Platz')}
        </div>
      </div>

      {/* Finale */}
      <div>
        <h2 className="text-4xl font-bold text-tournament-yellow mb-6 text-center animate-pulse">
          FINALE
        </h2>
        <div className="max-w-2xl mx-auto">
          {renderMatch(finale, 'FINALE', 'large')}
        </div>
      </div>

      {/* Kleines Finale */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          SPIEL UM PLATZ 3
        </h2>
        <div className="max-w-xl mx-auto">
          {renderMatch(kleinesFinale, 'Kleines Finale')}
        </div>
      </div>
    </div>
  )
}
