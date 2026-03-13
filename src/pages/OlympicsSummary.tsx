import { useState } from 'react'
import { useParams, Navigate, useNavigate } from 'react-router-dom'
import { useOlympics } from '@/engine/useOlympics'
import { useAppStore } from '@/store/useAppStore'
import FinalCeremony from '@/components/podium/FinalCeremony'
import MedalBadge from '@/components/shared/MedalBadge'
import ShareOlympics from '@/components/shared/ShareOlympics'

export default function OlympicsSummary() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAppStore()
  const { olympics, player1Profile, player2Profile, session, isLoading, rematch, isRematching } =
    useOlympics(id)
  const [rematchError, setRematchError] = useState<string | null>(null)

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

  if (!olympics) {
    return <Navigate to="/" replace />
  }

  // If Olympics is not complete, redirect appropriately
  if (olympics.status === 'lobby') {
    return <Navigate to={`/olympics/${id}/lobby`} replace />
  }

  if (olympics.status === 'active') {
    return (
      <Navigate
        to={`/olympics/${id}/event/${olympics.current_event_index}/intro`}
        replace
      />
    )
  }

  const handleRematch = async () => {
    setRematchError(null)
    try {
      // Create a session-aware rematch with the same events and opponent
      const newOlympics = await rematch()
      if (newOlympics) {
        navigate(`/olympics/${newOlympics.id}/lobby`)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create rematch'
      setRematchError(message)
      // Clear error after 5 seconds
      setTimeout(() => setRematchError(null), 5000)
    }
  }

  const handleHome = () => {
    navigate('/')
  }

  // Check if this is async mode and P2 hasn't joined/played yet
  const isAsync = olympics.mode === 'async'
  const hasPlayer2 = !!olympics.player2_id
  const isPlayer1 = user.id === olympics.player1_id
  const waitingForChallenger = isAsync && !hasPlayer2 && isPlayer1

  // If P1 finished but P2 hasn't joined yet, show invite screen
  if (waitingForChallenger) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center">
          <div className="text-6xl mb-6">🏆</div>
          <h1 className="font-display text-4xl font-bold text-gold mb-4">
            Great Job!
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            You've completed all {olympics.event_sequence.length} events.
            Now challenge someone to beat your scores!
          </p>

          {/* Player's scores summary */}
          <div className="bg-navy-800 rounded-xl p-6 mb-8">
            <h2 className="font-display text-lg font-semibold text-white mb-4">
              Your Results
            </h2>
            <div className="flex justify-center gap-4">
              <div className="flex items-center gap-2">
                <MedalBadge type="gold" size="md" />
                <span className="text-2xl font-bold text-gold">
                  {olympics.player1_gold_count}
                </span>
              </div>
            </div>
          </div>

          {/* Share Challenge */}
          <ShareOlympics
            inviteCode={olympics.invite_code}
            title="Challenge a Friend"
            className="mb-8"
          />

          <button
            onClick={handleHome}
            className="px-8 py-3 bg-navy-700 text-white font-semibold rounded-lg hover:bg-navy-600 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <FinalCeremony
        olympics={olympics}
        player1Profile={player1Profile}
        player2Profile={player2Profile}
        session={session}
        onRematch={handleRematch}
        onHome={handleHome}
        isRematching={isRematching}
        rematchError={rematchError}
      />
    </div>
  )
}
