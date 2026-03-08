import { useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useOlympics } from '@/engine/useOlympics'
import { useAppStore } from '@/store/useAppStore'
import WaitingRoom from '@/components/lobby/WaitingRoom'

export default function OlympicsLobby() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAppStore()
  const {
    olympics,
    events,
    player1Profile,
    player2Profile,
    isLoading,
    start,
    isStarting,
    error,
  } = useOlympics(id)

  // Debug logging
  useEffect(() => {
    console.log('[OlympicsLobby] Olympics state changed:', {
      status: olympics?.status,
      player1_id: olympics?.player1_id,
      player2_id: olympics?.player2_id,
    })
  }, [olympics?.status, olympics?.player1_id, olympics?.player2_id])

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

  if (error || !olympics || !events) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-400 mb-2">
            {error?.message ?? 'Olympics not found'}
          </h2>
          <a href="/" className="text-gold hover:underline">
            Go Home
          </a>
        </div>
      </div>
    )
  }

  // If Olympics is already active, redirect to current event
  if (olympics.status === 'active') {
    return (
      <Navigate
        to={`/olympics/${olympics.id}/event/${olympics.current_event_index}/intro`}
        replace
      />
    )
  }

  // If Olympics is complete, redirect to summary
  if (olympics.status === 'complete') {
    return <Navigate to={`/olympics/${olympics.id}/summary`} replace />
  }

  return (
    <div className="min-h-screen p-6">
      <WaitingRoom
        olympics={olympics}
        events={events}
        player1Profile={player1Profile}
        player2Profile={player2Profile}
        currentUserId={user.id}
        onStart={start}
        isStarting={isStarting}
      />
    </div>
  )
}
