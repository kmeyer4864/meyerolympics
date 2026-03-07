import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useOlympics } from '@/engine/useOlympics'

export default function JoinOlympicsForm() {
  const navigate = useNavigate()
  const { inviteCode: paramCode } = useParams<{ inviteCode?: string }>()
  const { join, isJoining } = useOlympics()
  const [inviteCode, setInviteCode] = useState(paramCode ?? '')
  const [error, setError] = useState<string | null>(null)

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inviteCode.trim()) {
      setError('Please enter an invite code')
      return
    }

    setError(null)
    try {
      const olympics = await join(inviteCode.trim().toUpperCase())
      if (olympics) {
        navigate(`/olympics/${olympics.id}/lobby`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join Olympics')
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="font-display text-3xl font-bold text-gold text-center mb-2">
        Join Olympics
      </h1>
      <p className="text-gray-400 text-center mb-8">
        Enter the invite code from your opponent
      </p>

      <form onSubmit={handleJoin} className="space-y-6">
        <div>
          <label
            htmlFor="inviteCode"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Invite Code
          </label>
          <input
            id="inviteCode"
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            placeholder="e.g. X7K9M2PQ"
            maxLength={8}
            className="w-full px-4 py-4 bg-navy-900 border border-navy-600 rounded-lg text-white text-center text-2xl font-mono tracking-widest placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-900/50 text-red-300 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isJoining || !inviteCode.trim()}
          className="w-full py-4 bg-gold text-navy-950 font-bold text-lg rounded-lg hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isJoining ? 'Joining...' : 'Join Olympics'}
        </button>
      </form>
    </div>
  )
}
