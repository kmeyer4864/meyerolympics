import type { GameSession } from '@/lib/database.types'

interface SessionBadgeProps {
  session: GameSession | null
  className?: string
}

export default function SessionBadge({ session, className = '' }: SessionBadgeProps) {
  if (!session) return null

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-navy-800 rounded-full ${className}`}>
      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      <span className="text-sm text-gray-300">
        Session Active
      </span>
      {session.games_played > 0 && (
        <span className="text-xs text-gray-500">
          ({session.games_played} {session.games_played === 1 ? 'game' : 'games'} played)
        </span>
      )}
    </div>
  )
}
