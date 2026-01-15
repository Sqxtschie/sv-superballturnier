'use client'

import { Match, Team, CategoryType } from '@/lib/database.types'

interface TournamentBracketProps {
  matches: Match[]
  teams: Team[]
  category: CategoryType
}

export default function TournamentBracket({ matches, teams, category }: TournamentBracketProps) {
  const winnerMatches = matches.filter(m => m.bracket === 'winner')
  const loserMatches = matches.filter(m => m.bracket === 'loser')

  const getTeamName = (teamId: string | null) => {
    if (!teamId) return 'TBD'
    const team = teams.find(t => t.id === teamId)
    return team?.nickname || team?.name || 'TBD'
  }

  const groupByRound = (matchList: Match[]) => {
    const rounds: { [key: number]: Match[] } = {}
    matchList.forEach(match => {
      if (!rounds[match.round]) {
        rounds[match.round] = []
      }
      rounds[match.round].push(match)
    })
    return rounds
  }

  const winnerRounds = groupByRound(winnerMatches)
  const loserRounds = groupByRound(loserMatches)

  const renderMatch = (match: Match, isAdmin = false) => {
    const team1Name = getTeamName(match.team1_id)
    const team2Name = getTeamName(match.team2_id)
    const isTeam1Winner = match.winner_id === match.team1_id
    const isTeam2Winner = match.winner_id === match.team2_id

    return (
      <div
        key={match.id}
        className="bg-tournament-purple-dark rounded-lg p-2 md:p-3 mb-3 md:mb-4 min-w-[140px] md:min-w-[160px] shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-tournament-purple"
      >
        <div className="text-[10px] md:text-xs text-tournament-yellow mb-1.5 md:mb-2 font-bold animate-pulse">
          {match.bracket === 'winner' ? 'WINNER' : 'LOSER'} R{match.round}
        </div>

        <div className={`flex items-center justify-between p-1.5 md:p-2 rounded mb-1 transition-all duration-300 ${
          isTeam1Winner ? 'bg-tournament-yellow text-tournament-purple font-bold animate-[slideInLeft_0.5s_ease-out]' : 'bg-white/10 text-white hover:bg-white/20'
        }`}>
          <span className="text-xs md:text-sm truncate pr-1">{team1Name}</span>
          {match.status === 'completed' && isTeam1Winner && (
            <span className="text-xs animate-bounce flex-shrink-0">✓</span>
          )}
        </div>

        <div className="text-white/50 text-[10px] md:text-xs text-center my-0.5 md:my-1 animate-pulse">vs</div>

        <div className={`flex items-center justify-between p-1.5 md:p-2 rounded transition-all duration-300 ${
          isTeam2Winner ? 'bg-tournament-yellow text-tournament-purple font-bold animate-[slideInRight_0.5s_ease-out]' : 'bg-white/10 text-white hover:bg-white/20'
        }`}>
          <span className="text-xs md:text-sm truncate pr-1">{team2Name}</span>
          {match.status === 'completed' && isTeam2Winner && (
            <span className="text-xs animate-bounce flex-shrink-0">✓</span>
          )}
        </div>

        {match.status === 'pending' && match.team1_id && match.team2_id && (
          <div className="mt-1.5 md:mt-2 text-center text-[10px] md:text-xs text-white/70 animate-pulse">
            Ausstehend
          </div>
        )}
      </div>
    )
  }

  const renderBracket = (rounds: { [key: number]: Match[] }, title: string) => {
    const roundNumbers = Object.keys(rounds).map(Number).sort((a, b) => a - b)

    if (roundNumbers.length === 0) {
      return (
        <div className="text-white/50 text-center p-8 animate-pulse">
          Noch keine Spiele geplant
        </div>
      )
    }

    return (
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-tournament-yellow mb-4 md:mb-6 text-center animate-[fadeInDown_0.8s_ease-out]">
          {title}
        </h2>
        {/* Scroll Hint für Mobile */}
        <div className="md:hidden text-white/50 text-xs text-center mb-2 animate-pulse">
          ← Wische zum Scrollen →
        </div>
        <div className="flex gap-4 md:gap-8 overflow-x-auto pb-4 snap-x snap-mandatory touch-pan-x scrollbar-thin scrollbar-thumb-tournament-yellow/50 scrollbar-track-tournament-purple-dark/30">
          {roundNumbers.map((roundNum, index) => (
            <div
              key={roundNum}
              className="flex flex-col min-w-[160px] md:min-w-[200px] snap-start animate-[fadeInUp_1s_ease-out] flex-shrink-0"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <h3 className="text-white font-bold mb-3 md:mb-4 text-center text-sm md:text-base transition-all duration-300 hover:text-tournament-yellow hover:scale-110">
                {roundNum === roundNumbers[roundNumbers.length - 1] && title === 'WINNER BRACKET'
                  ? '🏆 FINALE 🏆'
                  : `Runde ${roundNum}`}
              </h3>
              <div className="flex flex-col justify-around flex-1 gap-2">
                {rounds[roundNum].map(match => renderMatch(match))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Winner Bracket */}
      {renderBracket(winnerRounds, 'WINNER BRACKET')}

      {/* Loser Bracket */}
      {loserMatches.length > 0 && (
        <div className="border-t-4 border-tournament-yellow/30 pt-8">
          {renderBracket(loserRounds, 'LOSER BRACKET')}
        </div>
      )}

      {/* Platzierungen */}
      {matches.length > 0 && (
        <div className="mt-8 md:mt-12 bg-tournament-purple-dark/50 rounded-lg p-4 md:p-6 animate-[fadeInUp_1.5s_ease-out]">
          <h2 className="text-xl md:text-2xl font-bold text-tournament-yellow mb-3 md:mb-4 text-center animate-pulse">
            PLATZIERUNGEN
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 max-w-2xl mx-auto">
            <div className="bg-tournament-yellow text-tournament-purple p-3 md:p-4 rounded-lg text-center transform transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:rotate-2 animate-[bounceIn_1s_ease-out]">
              <div className="text-xs md:text-sm font-bold mb-1">PLATZ 1</div>
              <div className="text-2xl md:text-3xl animate-bounce">🏆</div>
            </div>
            <div className="bg-white/20 text-white p-3 md:p-4 rounded-lg text-center transform transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:-rotate-2 animate-[bounceIn_1.2s_ease-out]">
              <div className="text-xs md:text-sm font-bold mb-1">PLATZ 2</div>
              <div className="text-2xl md:text-3xl animate-bounce" style={{ animationDelay: '0.2s' }}>🥈</div>
            </div>
            <div className="bg-white/10 text-white p-3 md:p-4 rounded-lg text-center transform transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:rotate-2 animate-[bounceIn_1.4s_ease-out]">
              <div className="text-xs md:text-sm font-bold mb-1">PLATZ 3</div>
              <div className="text-2xl md:text-3xl animate-bounce" style={{ animationDelay: '0.4s' }}>🥉</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
