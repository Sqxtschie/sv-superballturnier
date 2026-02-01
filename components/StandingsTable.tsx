'use client'

import { Standing } from '@/lib/database.types'

interface StandingsTableProps {
  standings: Standing[]
}

export default function StandingsTable({ standings }: StandingsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-tournament-purple text-white">
            <th className="p-3 text-left font-bold">Platz</th>
            <th className="p-3 text-left font-bold">Team</th>
            <th className="p-3 text-center font-bold">Sp.</th>
            <th className="p-3 text-center font-bold">S</th>
            <th className="p-3 text-center font-bold">U</th>
            <th className="p-3 text-center font-bold">N</th>
            <th className="p-3 text-center font-bold">Tore</th>
            <th className="p-3 text-center font-bold">Diff.</th>
            <th className="p-3 text-center font-bold">Pkt.</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((standing, index) => {
            const isTop4 = index < 4
            return (
              <tr
                key={standing.team_id}
                className={`border-b border-tournament-purple-dark transition-all ${
                  isTop4
                    ? 'bg-tournament-yellow/20 hover:bg-tournament-yellow/30'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <td className="p-3 font-bold text-white">
                  {index + 1}
                  {isTop4 && (
                    <span className="ml-2 text-tournament-yellow">★</span>
                  )}
                </td>
                <td className="p-3 font-bold text-white text-lg">
                  {standing.team_name}
                </td>
                <td className="p-3 text-center text-white">
                  {standing.played}
                </td>
                <td className="p-3 text-center text-green-400">
                  {standing.won}
                </td>
                <td className="p-3 text-center text-yellow-400">
                  {standing.drawn}
                </td>
                <td className="p-3 text-center text-red-400">
                  {standing.lost}
                </td>
                <td className="p-3 text-center text-white">
                  {standing.goals_for}:{standing.goals_against}
                </td>
                <td className={`p-3 text-center font-bold ${
                  standing.goal_difference > 0 ? 'text-green-400' :
                  standing.goal_difference < 0 ? 'text-red-400' :
                  'text-white'
                }`}>
                  {standing.goal_difference > 0 ? '+' : ''}{standing.goal_difference}
                </td>
                <td className="p-3 text-center font-bold text-xl text-tournament-yellow">
                  {standing.points}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {standings.length > 0 && standings.some((_, i) => i < 4) && (
        <div className="mt-4 text-center text-white/70 text-sm">
          <span className="text-tournament-yellow">★</span> Die ersten 4 Teams qualifizieren sich für die Playoffs
        </div>
      )}
    </div>
  )
}
