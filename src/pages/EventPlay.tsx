import { useParams, Navigate, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useOlympics } from '@/engine/useOlympics'
import { getEventResults } from '@/engine/OlympicsEngine'
import { useAppStore } from '@/store/useAppStore'
import { getEvent, isValidEventType } from '@/events/registry'
import type { MatchResult } from '@/events/types'

export default function EventPlay() {
  const { id, idx } = useParams<{ id: string; idx: string }>()
  const navigate = useNavigate()
  const { user } = useAppStore()
  const {
    olympics,
    events,
    submitResult,
    isSubmitting,
    isLoading,
  } = useOlympics(id, { disableRealtime: true }) // Disable to reduce WebSocket connections during games

  const eventIndex = parseInt(idx ?? '0', 10)

  // Get the event from the URL index (NOT current_event_index)
  const dbEvent = events?.find((e) => e.event_index === eventIndex)

  // Query results specifically for THIS event by its ID
  const { data: thisEventResults } = useQuery({
    queryKey: ['eventResults', dbEvent?.id],
    queryFn: async () => {
      if (!dbEvent?.id) return null
      const { results } = await getEventResults(dbEvent.id)
      return results
    },
    enabled: !!dbEvent?.id,
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

  const event = getEvent(dbEvent.event_type)

  // Check if current user has already submitted to THIS specific event
  const hasSubmittedThisEvent = thisEventResults?.some(
    (r) => r.player_id === user.id
  )

  // Check if opponent has submitted (for showing their result in async)
  const opponentId =
    user.id === olympics.player1_id ? olympics.player2_id : olympics.player1_id
  const opponentResult = thisEventResults?.find(
    (r) => r.player_id === opponentId
  )

  const handleComplete = async (result: MatchResult) => {
    if (isSubmitting || hasSubmittedThisEvent) return
    // Pass the specific event ID from URL param
    await submitResult(result, dbEvent.id)
    navigate(`/olympics/${id}/event/${eventIndex}/result`)
  }

  // If already submitted to THIS event, redirect to result
  if (hasSubmittedThisEvent) {
    return <Navigate to={`/olympics/${id}/event/${eventIndex}/result`} replace />
  }

  // Get puzzle metadata from the event
  const puzzleMetadata = dbEvent.metadata as Record<string, unknown>

  const EventComponent = event.Component

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{event.icon}</span>
            <h1 className="font-display text-xl font-bold text-white">
              {event.name}
            </h1>
          </div>
          <div className="text-sm text-gray-400">
            Event {eventIndex + 1} of {olympics.event_sequence.length}
          </div>
        </div>

        {/* Game Component */}
        <EventComponent
          olympicsId={olympics.id}
          playerId={user.id}
          eventId={dbEvent.id}
          puzzleMetadata={puzzleMetadata}
          onComplete={handleComplete}
          opponentResult={
            opponentResult
              ? {
                  score: Number(opponentResult.score),
                  rawValue: Number(opponentResult.raw_value),
                  completedAt: opponentResult.completed_at,
                  metadata: opponentResult.metadata as Record<string, unknown>,
                }
              : undefined
          }
          isRealtime={olympics.mode === 'realtime'}
        />
      </div>
    </div>
  )
}
