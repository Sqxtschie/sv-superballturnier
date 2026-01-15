'use client'

import { Match, Team, CategoryType } from '@/lib/database.types'

interface AdminBracketProps {
  matches: Match[]
  teams: Team[]
  category: CategoryType
  onMatchUpdate: (matchId: string, winnerId: string) => Promise<void>
}

export default function AdminBracket({ matches, teams, category, onMatchUpdate }: AdminBracketProps) {
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

  const handleWinnerClick = async (matchId: string, winnerId: string) => {
    if (confirm(`Möchten Sie ${getTeamName(winnerId)} als Gewinner markieren?`)) {
      await onMatchUpdate(matchId, winnerId)
    }
  }

  const renderMatch = (match: Match) => {
    const team1Name = getTeamName(match.team1_id)
    const team2Name = getTeamName(match.team2_id)
    const isTeam1Winner = match.winner_id === match.team1_id
    const isTeam2Winner = match.winner_id === match.team2_id
    const canSelectWinner = match.team1_id && match.team2_id && match.status !== 'completed'

    return (
      <div
        key={match.id}
        className="bg-tournament-purple-dark rounded-lg p-4 mb-4 min-w-[200px] shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-tournament-purple"
      >
        <div className="text-xs text-tournament-yellow mb-3 font-bold flex justify-between items-center animate-pulse">
          <span>{match.bracket === 'winner' ? 'WINNER' : 'LOSER'} R{match.round}</span>
          <span className={`px-2 py-1 rounded text-xs transition-all duration-300 ${
            match.status === 'completed' ? 'bg-green-600 animate-pulse' :
            match.status === 'in_progress' ? 'bg-yellow-600 animate-pulse' :
            'bg-gray-600'
          }`}>
            {match.status === 'completed' ? 'Abgeschlossen' :
             match.status === 'in_progress' ? 'Läuft' :
             'Ausstehend'}
          </span>
        </div>

        {/* Team 1 */}
        <button
          onClick={() => canSelectWinner && match.team1_id && handleWinnerClick(match.id, match.team1_id)}
          disabled={!canSelectWinner || !match.team1_id}
          className={`w-full flex items-center justify-between p-3 rounded mb-2 transition-all duration-300 transform ${
            isTeam1Winner
              ? 'bg-tournament-yellow text-tournament-purple font-bold animate-[slideInLeft_0.5s_ease-out] scale-105'
              : canSelectWinner
              ? 'bg-white/10 text-white hover:bg-white/20 hover:scale-105 cursor-pointer active:scale-95'
              : 'bg-white/10 text-white cursor-not-allowed'
          }`}
        >
          <span className="text-sm">{team1Name}</span>
          {isTeam1Winner && <span className="text-lg animate-bounce">✓</span>}
        </button>

        <div className="text-white/50 text-xs text-center my-2 animate-pulse">vs</div>

        {/* Team 2 */}
        <button
          onClick={() => canSelectWinner && match.team2_id && handleWinnerClick(match.id, match.team2_id)}
          disabled={!canSelectWinner || !match.team2_id}
          className={`w-full flex items-center justify-between p-3 rounded transition-all duration-300 transform ${
            isTeam2Winner
              ? 'bg-tournament-yellow text-tournament-purple font-bold animate-[slideInRight_0.5s_ease-out] scale-105'
              : canSelectWinner
              ? 'bg-white/10 text-white hover:bg-white/20 hover:scale-105 cursor-pointer active:scale-95'
              : 'bg-white/10 text-white cursor-not-allowed'
          }`}
        >
          <span className="text-sm">{team2Name}</span>
          {isTeam2Winner && <span className="text-lg animate-bounce">✓</span>}
        </button>

        {canSelectWinner && (
          <div className="mt-3 text-center text-xs text-white/70 animate-pulse">
            Klicken Sie auf ein Team, um den Gewinner zu wählen
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
          Noch keine Spiele geplant. Klicken Sie auf "Turnierbäume neu initialisieren".
        </div>
      )
    }

    return (
      <div>
        <h2 className="text-2xl font-bold text-tournament-yellow mb-6 text-center animate-[fadeInDown_0.8s_ease-out]">
          {title}
        </h2>
        <div className="flex gap-8 overflow-x-auto pb-4">
          {roundNumbers.map((roundNum, index) => (
            <div
              key={roundNum}
              className="flex flex-col min-w-[220px] animate-[fadeInUp_1s_ease-out]"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <h3 className="text-white font-bold mb-4 text-center transition-all duration-300 hover:text-tournament-yellow hover:scale-110">
                {roundNum === roundNumbers[roundNumbers.length - 1] && title === 'WINNER BRACKET'
                  ? '🏆 FINALE 🏆'
                  : `Runde ${roundNum}`}
              </h3>
              <div className="flex flex-col justify-around flex-1">
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

      {/* Statistiken */}
      <div className="mt-12 bg-tournament-purple-dark/50 rounded-lg p-6 animate-[fadeInUp_1.5s_ease-out]">
        <h2 className="text-2xl font-bold text-tournament-yellow mb-4 text-center animate-pulse">
          STATISTIKEN
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="bg-white/10 text-white p-4 rounded-lg text-center transform transition-all duration-300 hover:scale-110 hover:bg-white/20 hover:shadow-2xl animate-[bounceIn_1s_ease-out]">
            <div className="text-3xl font-bold mb-2 animate-pulse">
              {matches.filter(m => m.status === 'completed').length}
            </div>
            <div className="text-sm">Abgeschlossene Spiele</div>
          </div>
          <div className="bg-white/10 text-white p-4 rounded-lg text-center transform transition-all duration-300 hover:scale-110 hover:bg-white/20 hover:shadow-2xl animate-[bounceIn_1.2s_ease-out]">
            <div className="text-3xl font-bold mb-2 animate-pulse" style={{ animationDelay: '0.2s' }}>
              {matches.filter(m => m.status === 'pending' && m.team1_id && m.team2_id).length}
            </div>
            <div className="text-sm">Ausstehende Spiele</div>
          </div>
          <div className="bg-white/10 text-white p-4 rounded-lg text-center transform transition-all duration-300 hover:scale-110 hover:bg-white/20 hover:shadow-2xl animate-[bounceIn_1.4s_ease-out]">
            <div className="text-3xl font-bold mb-2 animate-pulse" style={{ animationDelay: '0.4s' }}>
              {teams.length}
            </div>
            <div className="text-sm">Teams</div>
          </div>
        </div>
      </div>
    </div>
  )
}
