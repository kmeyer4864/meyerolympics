import { useEffect, useState } from 'react'
import type { Profile } from '@/lib/database.types'
import type { MatchResult, EventType } from '@/events/types'
import { getEvent, isValidEventType } from '@/events/registry'
import PlayerAvatar from '../shared/PlayerAvatar'
import MedalBadge from '../shared/MedalBadge'

interface PodiumRevealProps {
  eventType: EventType
  player1Profile: Profile | null
  player2Profile: Profile | null
  player1Result: MatchResult | null
  player2Result: MatchResult | null
  goldWinnerId: string | null
  player1Id: string
  onContinue: () => void
  className?: string
}

type RevealStage = 'waiting' | 'scores' | 'medal' | 'complete'

export default function PodiumReveal({
  eventType,
  player1Profile,
  player2Profile,
  player1Result,
  player2Result,
  goldWinnerId,
  player1Id,
  onContinue,
  className = '',
}: PodiumRevealProps) {
  const [stage, setStage] = useState<RevealStage>('waiting')

  const event = isValidEventType(eventType) ? getEvent(eventType) : null
  const isP1Gold = goldWinnerId === player1Id
  const isTie = goldWinnerId === null

  // Staged reveal animation
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    timers.push(setTimeout(() => setStage('scores'), 500))
    timers.push(setTimeout(() => setStage('medal'), 1500))
    timers.push(setTimeout(() => setStage('complete'), 2500))

    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className={`text-center ${className}`}>
      {/* Event name */}
      <div className="mb-8">
        <span className="text-5xl">{event?.icon}</span>
        <h2 className="mt-4 font-display text-3xl font-bold text-white">
          {event?.name ?? 'Event'} Complete!
        </h2>
      </div>

      {/* Players and scores */}
      <div className="flex items-start justify-center gap-8 md:gap-16">
        {/* Player 1 */}
        <div
          className={`flex flex-col items-center transition-all duration-500 ${
            stage === 'waiting' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
          }`}
        >
          <div className="relative">
            <PlayerAvatar profile={player1Profile} size="xl" />
            {stage === 'medal' || stage === 'complete' ? (
              <div
                className={`absolute -top-2 -right-2 transition-all duration-500 ${
                  stage === 'complete' ? 'scale-100' : 'scale-0'
                }`}
              >
                <MedalBadge
                  type={isTie ? 'gold' : isP1Gold ? 'gold' : 'silver'}
                  size="md"
                />
              </div>
            ) : null}
          </div>
          <span className="mt-3 font-medium text-white">
            {player1Profile?.display_name ?? 'Player 1'}
          </span>
          {stage !== 'waiting' && player1Result && event && (
            <span
              className={`mt-2 text-2xl font-display font-bold transition-all duration-300 ${
                isP1Gold || isTie ? 'text-gold' : 'text-silver'
              }`}
            >
              {event.formatScore(player1Result)}
            </span>
          )}
        </div>

        {/* VS */}
        <div className="flex items-center h-32">
          <span className="text-gray-600 font-display text-2xl">vs</span>
        </div>

        {/* Player 2 */}
        <div
          className={`flex flex-col items-center transition-all duration-500 delay-150 ${
            stage === 'waiting' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
          }`}
        >
          <div className="relative">
            <PlayerAvatar profile={player2Profile} size="xl" />
            {stage === 'medal' || stage === 'complete' ? (
              <div
                className={`absolute -top-2 -right-2 transition-all duration-500 ${
                  stage === 'complete' ? 'scale-100' : 'scale-0'
                }`}
              >
                <MedalBadge
                  type={isTie ? 'gold' : !isP1Gold ? 'gold' : 'silver'}
                  size="md"
                />
              </div>
            ) : null}
          </div>
          <span className="mt-3 font-medium text-white">
            {player2Profile?.display_name ?? 'Player 2'}
          </span>
          {stage !== 'waiting' && player2Result && event && (
            <span
              className={`mt-2 text-2xl font-display font-bold transition-all duration-300 ${
                !isP1Gold || isTie ? 'text-gold' : 'text-silver'
              }`}
            >
              {event.formatScore(player2Result)}
            </span>
          )}
        </div>
      </div>

      {/* Winner announcement */}
      {stage === 'complete' && (
        <div className="mt-8 animate-fade-in">
          <p className="text-xl text-gray-300">
            {isTie ? (
              <>It's a tie! Both players earn gold.</>
            ) : (
              <>
                <span className="text-gold font-bold">
                  {isP1Gold
                    ? player1Profile?.display_name
                    : player2Profile?.display_name}
                </span>{' '}
                wins the gold!
              </>
            )}
          </p>

          <button
            onClick={onContinue}
            className="mt-8 px-8 py-3 bg-gold text-navy-950 font-semibold rounded-lg hover:bg-gold-400 transition-colors"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  )
}
