import type { Olympics, Profile } from '@/lib/database.types'
import PlayerAvatar from '../shared/PlayerAvatar'
import { MedalCount } from '../shared/MedalBadge'

interface MedalStandingsProps {
  olympics: Olympics
  player1Profile: Profile | null
  player2Profile: Profile | null
  className?: string
}

export default function MedalStandings({
  olympics,
  player1Profile,
  player2Profile,
  className = '',
}: MedalStandingsProps) {
  const totalEvents = olympics.event_sequence.length
  const p1Golds = olympics.player1_gold_count
  const p2Golds = olympics.player2_gold_count
  const p1Silvers = totalEvents - p1Golds - (totalEvents - p1Golds - p2Golds)
  const p2Silvers = totalEvents - p2Golds - (totalEvents - p1Golds - p2Golds)

  const p1Leading = p1Golds > p2Golds
  const p2Leading = p2Golds > p1Golds

  return (
    <div className={`bg-navy-900 rounded-xl p-6 ${className}`}>
      <h3 className="font-display text-lg font-semibold text-white text-center mb-6">
        Medal Standings
      </h3>

      <div className="flex items-center justify-between gap-4">
        {/* Player 1 */}
        <div
          className={`flex-1 flex flex-col items-center p-4 rounded-lg ${
            p1Leading ? 'bg-gold/10 ring-1 ring-gold/30' : ''
          }`}
        >
          <PlayerAvatar profile={player1Profile} size="lg" />
          <span className="mt-2 font-medium text-white truncate max-w-full">
            {player1Profile?.display_name ?? 'Player 1'}
          </span>
          <MedalCount golds={p1Golds} silvers={p1Silvers} className="mt-3" />
        </div>

        {/* VS */}
        <div className="flex flex-col items-center">
          <span className="text-2xl font-display font-bold text-gray-500">VS</span>
        </div>

        {/* Player 2 */}
        <div
          className={`flex-1 flex flex-col items-center p-4 rounded-lg ${
            p2Leading ? 'bg-gold/10 ring-1 ring-gold/30' : ''
          }`}
        >
          <PlayerAvatar profile={player2Profile} size="lg" />
          <span className="mt-2 font-medium text-white truncate max-w-full">
            {player2Profile?.display_name ?? 'Player 2'}
          </span>
          <MedalCount golds={p2Golds} silvers={p2Silvers} className="mt-3" />
        </div>
      </div>

      {/* Progress */}
      <div className="mt-6">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Progress</span>
          <span>
            {olympics.current_event_index + 1} / {totalEvents} events
          </span>
        </div>
        <div className="h-2 bg-navy-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold-600 to-gold transition-all duration-500"
            style={{
              width: `${((olympics.current_event_index + 1) / totalEvents) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
