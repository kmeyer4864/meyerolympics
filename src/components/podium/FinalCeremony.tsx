import { useEffect, useState } from 'react'
import type { Olympics, Profile } from '@/lib/database.types'
import PlayerAvatar from '../shared/PlayerAvatar'
import MedalBadge, { MedalCount } from '../shared/MedalBadge'

interface FinalCeremonyProps {
  olympics: Olympics
  player1Profile: Profile | null
  player2Profile: Profile | null
  onRematch?: () => void
  onHome?: () => void
  className?: string
}

type CeremonyStage = 'intro' | 'standings' | 'champion' | 'complete'

export default function FinalCeremony({
  olympics,
  player1Profile,
  player2Profile,
  onRematch,
  onHome,
  className = '',
}: FinalCeremonyProps) {
  const [stage, setStage] = useState<CeremonyStage>('intro')

  const isP1Winner = olympics.winner_id === olympics.player1_id
  const isTie = olympics.winner_id === null
  const winnerProfile = isP1Winner ? player1Profile : player2Profile
  const totalEvents = olympics.event_sequence.length

  // Staged reveal animation
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    timers.push(setTimeout(() => setStage('standings'), 1000))
    timers.push(setTimeout(() => setStage('champion'), 2500))
    timers.push(setTimeout(() => setStage('complete'), 4000))

    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className={`text-center ${className}`}>
      {/* Trophy animation */}
      <div
        className={`text-8xl mb-4 transition-all duration-1000 ${
          stage === 'intro' ? 'scale-0 rotate-180' : 'scale-100 rotate-0'
        }`}
      >
        🏆
      </div>

      <h1 className="font-display text-4xl md:text-5xl font-bold text-gold animate-fade-in">
        Olympics Complete!
      </h1>

      {/* Final Standings */}
      {(stage === 'standings' || stage === 'champion' || stage === 'complete') && (
        <div className="mt-12 animate-slide-up">
          <h2 className="font-display text-xl text-gray-400 mb-6">
            Final Standings
          </h2>

          <div className="flex items-start justify-center gap-8 md:gap-16">
            {/* Player 1 */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <PlayerAvatar profile={player1Profile} size="xl" />
                {isP1Winner || isTie ? (
                  <div className="absolute -top-3 -right-3">
                    <MedalBadge type="gold" size="md" />
                  </div>
                ) : (
                  <div className="absolute -top-3 -right-3">
                    <MedalBadge type="silver" size="md" />
                  </div>
                )}
              </div>
              <span className="mt-3 font-medium text-white">
                {player1Profile?.display_name ?? 'Player 1'}
              </span>
              <MedalCount
                golds={olympics.player1_gold_count}
                silvers={totalEvents - olympics.player1_gold_count}
                className="mt-2"
              />
            </div>

            {/* VS */}
            <div className="flex items-center h-32">
              <span className="text-gray-600 font-display text-xl">vs</span>
            </div>

            {/* Player 2 */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <PlayerAvatar profile={player2Profile} size="xl" />
                {!isP1Winner || isTie ? (
                  <div className="absolute -top-3 -right-3">
                    <MedalBadge type="gold" size="md" />
                  </div>
                ) : (
                  <div className="absolute -top-3 -right-3">
                    <MedalBadge type="silver" size="md" />
                  </div>
                )}
              </div>
              <span className="mt-3 font-medium text-white">
                {player2Profile?.display_name ?? 'Player 2'}
              </span>
              <MedalCount
                golds={olympics.player2_gold_count}
                silvers={totalEvents - olympics.player2_gold_count}
                className="mt-2"
              />
            </div>
          </div>
        </div>
      )}

      {/* Champion announcement */}
      {(stage === 'champion' || stage === 'complete') && (
        <div className="mt-12 animate-fade-in">
          {isTie ? (
            <div className="bg-gradient-to-r from-gold/20 via-gold/30 to-gold/20 rounded-2xl p-8">
              <h2 className="font-display text-3xl font-bold text-gold">
                It's a Tie!
              </h2>
              <p className="mt-2 text-gray-300">
                Both champions share the glory equally!
              </p>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-gold/20 via-gold/30 to-gold/20 rounded-2xl p-8">
              <h2 className="font-display text-3xl font-bold text-gold">
                Champion
              </h2>
              <div className="mt-4 flex justify-center">
                <PlayerAvatar profile={winnerProfile} size="xl" showName />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {stage === 'complete' && (
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
          {onRematch && (
            <button
              onClick={onRematch}
              className="px-8 py-3 bg-gold text-navy-950 font-semibold rounded-lg hover:bg-gold-400 transition-colors"
            >
              Rematch
            </button>
          )}
          {onHome && (
            <button
              onClick={onHome}
              className="px-8 py-3 bg-navy-700 text-white font-semibold rounded-lg hover:bg-navy-600 transition-colors"
            >
              Back to Home
            </button>
          )}
        </div>
      )}
    </div>
  )
}
