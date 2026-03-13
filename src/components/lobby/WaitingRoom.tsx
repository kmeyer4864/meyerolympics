import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Olympics, OlympicsEvent as DBEvent, Profile } from '@/lib/database.types'
import { getEvent, isValidEventType } from '@/events/registry'
import PlayerAvatar from '../shared/PlayerAvatar'
import EventCard from '../shared/EventCard'
import ShareOlympics from '../shared/ShareOlympics'

interface WaitingRoomProps {
  olympics: Olympics
  events: DBEvent[]
  player1Profile: Profile | null
  player2Profile: Profile | null
  currentUserId: string
  onStart: () => Promise<boolean>
  isStarting: boolean
}

export default function WaitingRoom({
  olympics,
  events,
  player1Profile,
  player2Profile,
  currentUserId,
  onStart,
  isStarting,
}: WaitingRoomProps) {
  const navigate = useNavigate()

  const isPlayer1 = currentUserId === olympics.player1_id
  const hasPlayer2 = !!olympics.player2_id
  const isAsync = olympics.mode === 'async'
  // For async mode, P1 can start without P2. For realtime, need both players.
  const canStart = isPlayer1 && (isAsync || hasPlayer2)

  // Navigate when Olympics starts
  useEffect(() => {
    if (olympics.status === 'active') {
      navigate(`/olympics/${olympics.id}/event/0/intro`)
    }
  }, [olympics.status, olympics.id, navigate])

  const handleStart = async () => {
    const success = await onStart()
    if (success) {
      navigate(`/olympics/${olympics.id}/event/0/intro`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display text-3xl font-bold text-gold text-center mb-8">
        Waiting Room
      </h1>

      {/* Async Mode Info */}
      {isAsync && !hasPlayer2 && isPlayer1 && (
        <ShareOlympics
          inviteCode={olympics.invite_code}
          title="Share after playing"
          variant="compact"
          className="mb-8"
        />
      )}

      {/* Realtime Mode - Waiting for Player 2 */}
      {!isAsync && !hasPlayer2 && (
        <ShareOlympics
          inviteCode={olympics.invite_code}
          title="Share with opponent"
          variant="compact"
          className="mb-8"
        />
      )}

      {/* Players */}
      <div className="bg-navy-900 rounded-xl p-6 mb-8">
        <h2 className="font-display text-lg font-semibold text-white mb-6 text-center">
          Players
        </h2>
        <div className="flex items-center justify-around">
          {/* Player 1 */}
          <div className="flex flex-col items-center">
            <PlayerAvatar profile={player1Profile} size="lg" />
            <span className="mt-2 font-medium text-white">
              {player1Profile?.display_name ?? 'Player 1'}
            </span>
            <span className="text-xs text-green-400 mt-1">Ready</span>
          </div>

          <div className="text-2xl font-display text-gray-600">VS</div>

          {/* Player 2 */}
          <div className="flex flex-col items-center">
            {hasPlayer2 ? (
              <>
                <PlayerAvatar profile={player2Profile} size="lg" />
                <span className="mt-2 font-medium text-white">
                  {player2Profile?.display_name ?? 'Player 2'}
                </span>
                <span className="text-xs text-green-400 mt-1">Ready</span>
              </>
            ) : isAsync ? (
              <>
                <div className="w-16 h-16 rounded-full bg-navy-700 flex items-center justify-center">
                  <span className="text-2xl">?</span>
                </div>
                <span className="mt-2 text-gray-500">TBD</span>
                <span className="text-xs text-gray-600">Invite after playing</span>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-navy-700 flex items-center justify-center animate-pulse">
                  <span className="text-2xl">?</span>
                </div>
                <span className="mt-2 text-gray-500">Waiting...</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Event Lineup */}
      <div className="mb-8">
        <h2 className="font-display text-lg font-semibold text-white mb-4">
          Event Lineup ({events.length} events)
        </h2>
        <div className="space-y-3">
          {events.map((dbEvent, index) => {
            if (!isValidEventType(dbEvent.event_type)) return null
            const event = getEvent(dbEvent.event_type)
            return (
              <div key={dbEvent.id} className="flex items-center gap-3">
                <span className="w-8 h-8 flex items-center justify-center bg-navy-800 rounded-full text-gold font-bold">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <EventCard event={event} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Start Button */}
      {canStart && (
        <button
          onClick={handleStart}
          disabled={isStarting}
          className="w-full py-4 bg-gold text-navy-950 font-bold text-lg rounded-lg hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isStarting ? 'Starting...' : 'Start Olympics'}
        </button>
      )}

      {hasPlayer2 && !isPlayer1 && (
        <div className="text-center text-gray-400">
          Waiting for {player1Profile?.display_name ?? 'Player 1'} to start...
        </div>
      )}
    </div>
  )
}
