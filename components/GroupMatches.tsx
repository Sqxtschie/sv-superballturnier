'use client'

import { GroupMatchWithTeams } from '@/lib/database.types'

interface GroupMatchesProps {
  matches: GroupMatchWithTeams[]
}

export default function GroupMatches({ matches }: GroupMatchesProps) {
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
                const hasResult =
                  match.team1_score !== null && match.team2_score !== null
                const team1Won =
                  hasResult && match.team1_score! > match.team2_score!
                const team2Won =
                  hasResult && match.team2_score! > match.team1_score!
                const isDraw =
                  hasResult && match.team1_score === match.team2_score

                return (
                  <div
                    key={match.id}
                    className="bg-tournament-purple-dark rounded-lg p-4 border-2 border-tournament-purple hover:border-tournament-yellow transition-all"
                  >
                    <div className="text-white/60 text-sm mb-2 font-bold">
                      Spiel {match.match_number}
                    </div>

                    {/* Team 1 */}
                    <div
                      className={`flex justify-between items-center p-3 rounded-lg mb-2 transition-all ${
                        team1Won
                          ? 'bg-green-600/30 border-2 border-green-500'
                          : isDraw
                          ? 'bg-yellow-600/20 border-2 border-yellow-500'
                          : hasResult
                          ? 'bg-white/5 opacity-70'
                          : 'bg-white/10'
                      }`}
                    >
                      <span className="font-bold text-white text-lg">
                        {match.team1 ? `${match.team1.name} (${match.team1.class_name})` : 'TBD'}
                      </span>
                      {hasResult && (
                        <span className="font-bold text-2xl text-white">
                          {match.team1_score}
                        </span>
                      )}
                    </div>

                    {/* VS Divider */}
                    <div className="text-center text-white/40 font-bold mb-2">
                      VS
                    </div>

                    {/* Team 2 */}
                    <div
                      className={`flex justify-between items-center p-3 rounded-lg transition-all ${
                        team2Won
                          ? 'bg-green-600/30 border-2 border-green-500'
                          : isDraw
                          ? 'bg-yellow-600/20 border-2 border-yellow-500'
                          : hasResult
                          ? 'bg-white/5 opacity-70'
                          : 'bg-white/10'
                      }`}
                    >
                      <span className="font-bold text-white text-lg">
                        {match.team2 ? `${match.team2.name} (${match.team2.class_name})` : 'TBD'}
                      </span>
                      {hasResult && (
                        <span className="font-bold text-2xl text-white">
                          {match.team2_score}
                        </span>
                      )}
                    </div>

                    {!hasResult && (
                      <div className="mt-3 text-center text-white/40 text-sm">
                        Noch nicht gespielt
                      </div>
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
