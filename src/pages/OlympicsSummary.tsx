import { useState } from 'react'
import { useParams, Navigate, useNavigate } from 'react-router-dom'
import { useOlympics } from '@/engine/useOlympics'
import { useAppStore } from '@/store/useAppStore'
import FinalCeremony from '@/components/podium/FinalCeremony'
import MedalBadge from '@/components/shared/MedalBadge'

export default function OlympicsSummary() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAppStore()
  const { olympics, player1Profile, player2Profile, isLoading, create } =
    useOlympics(id)
  const [copied, setCopied] = useState(false)

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
    // Create a new Olympics with the same events
    const eventSequence = olympics.event_sequence as string[]
    const newOlympics = await create(
      eventSequence as Parameters<typeof create>[0],
      olympics.mode
    )
    if (newOlympics) {
      navigate(`/olympics/${newOlympics.id}/lobby`)
    }
  }

  const handleHome = () => {
    navigate('/')
  }

  const copyInviteCode = () => {
    navigator.clipboard.writeText(olympics.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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

          {/* Invite Code */}
          <div className="bg-navy-900 rounded-xl p-6 mb-8">
            <p className="text-gray-400 mb-3">Share this code to challenge someone:</p>
            <div className="flex items-center justify-center gap-3">
              <code className="text-4xl font-mono font-bold text-gold tracking-widest">
                {olympics.invite_code}
              </code>
              <button
                onClick={copyInviteCode}
                className="p-3 bg-navy-700 rounded-lg hover:bg-navy-600 transition-colors"
              >
                {copied ? (
                  <svg
                    className="w-6 h-6 text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              They'll play the exact same games for a fair competition!
            </p>
          </div>

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
        onRematch={handleRematch}
        onHome={handleHome}
      />
    </div>
  )
}
