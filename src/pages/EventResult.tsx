import { useParams, Navigate, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useOlympics } from '@/engine/useOlympics'
import { getEventResults } from '@/engine/OlympicsEngine'
import { useAppStore } from '@/store/useAppStore'
import { isValidEventType, getEvent } from '@/events/registry'
import type { EventType, MatchResult } from '@/events/types'
import PodiumReveal from '@/components/podium/PodiumReveal'
import FlashbackSummary from '@/components/flashback/FlashbackSummary'

export default function EventResult() {
  const { id, idx } = useParams<{ id: string; idx: string }>()
  const navigate = useNavigate()
  const { user } = useAppStore()
  const {
    olympics,
    events,
    player1Profile,
    player2Profile,
    isLoading,
  } = useOlympics(id)

  const eventIndex = parseInt(idx ?? '0', 10)

  // Get the event from the URL index (NOT current_event_index)
  const dbEvent = events?.find((e) => e.event_index === eventIndex)

  // Query results specifically for THIS event by its ID
  // Poll every 2 seconds while waiting for opponent's result
  const { data: thisEventResults } = useQuery({
    queryKey: ['eventResults', dbEvent?.id],
    queryFn: async () => {
      if (!dbEvent?.id) return null
      const { results } = await getEventResults(dbEvent.id)
      console.log('[EventResult] Fetched results:', results?.length, 'for event:', dbEvent?.id)
      return results
    },
    enabled: !!dbEvent?.id,
    refetchInterval: (query) => {
      const results = query.state.data
      // Keep polling until we have 2 results (both players finished)
      if (!results || results.length < 2) {
        return 2000
      }
      return false
    },
  })

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    )
  }

  if (!olympics || !events) {
    return <Navigate to="/" replace />
  }

  if (!dbEvent || !isValidEventType(dbEvent.event_type)) {
    return <Navigate to={`/olympics/${id}/summary`} replace />
  }

  const isAsync = olympics.mode === 'async'
  const hasPlayer2 = !!olympics.player2_id
  const isPlayer1 = user.id === olympics.player1_id
  const isLastEvent = eventIndex + 1 >= olympics.event_sequence.length

  // Check if both results are in for THIS event
  const bothComplete = dbEvent.status === 'complete' || thisEventResults?.length === 2

  // Get results for THIS event
  const p1Result = thisEventResults?.find(
    (r) => r.player_id === olympics.player1_id
  )
  const p2Result = thisEventResults?.find(
    (r) => r.player_id === olympics.player2_id
  )

  // For async mode with no P2, P1 can continue after submitting
  const canContinueSolo = isAsync && !hasPlayer2 && isPlayer1 && p1Result

  const handleContinue = () => {
    if (isLastEvent) {
      navigate(`/olympics/${id}/summary`)
    } else {
      navigate(`/olympics/${id}/event/${eventIndex + 1}/intro`)
    }
  }

  // For async solo play, show their result and continue
  if (canContinueSolo) {
    const myResult = p1Result
    const eventDef = getEvent(dbEvent.event_type as EventType)
    const formattedScore = eventDef.formatScore({
      score: Number(myResult.score),
      rawValue: Number(myResult.raw_value),
      completedAt: myResult.completed_at,
      metadata: myResult.metadata as Record<string, unknown>,
    })

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">{eventDef.icon}</div>
          <h1 className="font-display text-3xl font-bold text-gold mb-4">
            {eventDef.name} Complete!
          </h1>
          <p className="text-xl text-white mb-2">Your Score</p>
          <p className="text-4xl font-display font-bold text-gold mb-6">
            {formattedScore}
          </p>
          <p className="text-gray-400 mb-8">
            {!isLastEvent
              ? 'Continue to the next event!'
              : 'You\'ve completed all events!'}
          </p>
          <button
            onClick={handleContinue}
            className="w-full px-8 py-4 bg-gold text-navy-950 font-bold text-lg rounded-lg hover:bg-gold-400 transition-colors flex items-center justify-center gap-2"
          >
            {!isLastEvent ? 'Next Event' : 'View Final Results'}
            <span className="text-xl">{!isLastEvent ? '→' : '🏆'}</span>
          </button>
        </div>
      </div>
    )
  }

  // Waiting for opponent (realtime or async with P2 who hasn't finished)
  if (!bothComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-6xl mb-6">⏳</div>
        <h1 className="font-display text-3xl font-bold text-white mb-4">
          Waiting for Opponent
        </h1>
        <p className="text-gray-400 text-center max-w-md">
          You've completed this event! Waiting for your opponent to finish
          before revealing the results.
        </p>
        <div className="mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold"></div>
        </div>
      </div>
    )
  }

  // Convert DB results to MatchResults
  const player1MatchResult: MatchResult | null = p1Result
    ? {
        score: Number(p1Result.score),
        rawValue: Number(p1Result.raw_value),
        completedAt: p1Result.completed_at,
        metadata: p1Result.metadata as Record<string, unknown>,
      }
    : null

  const player2MatchResult: MatchResult | null = p2Result
    ? {
        score: Number(p2Result.score),
        rawValue: Number(p2Result.raw_value),
        completedAt: p2Result.completed_at,
        metadata: p2Result.metadata as Record<string, unknown>,
      }
    : null

  // Debug logging for flashback
  console.log('[EventResult] thisEventResults:', thisEventResults)
  console.log('[EventResult] p1Result:', p1Result)
  console.log('[EventResult] p2Result:', p2Result)
  console.log('[EventResult] player1MatchResult:', player1MatchResult)
  console.log('[EventResult] player2MatchResult:', player2MatchResult)

  // Use FlashbackSummary for flashback events
  const isFlashback = dbEvent.event_type === 'flashback'

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {isFlashback ? (
        <FlashbackSummary
          player1Profile={player1Profile}
          player2Profile={player2Profile}
          player1Result={player1MatchResult}
          player2Result={player2MatchResult}
          goldWinnerId={dbEvent.gold_winner_id}
          player1Id={olympics.player1_id}
          onContinue={handleContinue}
          isLastEvent={isLastEvent}
        />
      ) : (
        <PodiumReveal
          eventType={dbEvent.event_type as EventType}
          player1Profile={player1Profile}
          player2Profile={player2Profile}
          player1Result={player1MatchResult}
          player2Result={player2MatchResult}
          goldWinnerId={dbEvent.gold_winner_id}
          player1Id={olympics.player1_id}
          onContinue={handleContinue}
          isLastEvent={isLastEvent}
        />
      )}
    </div>
  )
}
