import type { OlympicsEvent } from '@/events/types'
import type { OlympicsEvent as DBEvent } from '@/lib/database.types'
import MedalBadge from './MedalBadge'

interface EventCardProps {
  event: OlympicsEvent
  dbEvent?: DBEvent | null
  isActive?: boolean
  isCompleted?: boolean
  goldWinnerIsPlayer1?: boolean
  onClick?: () => void
  className?: string
}

export default function EventCard({
  event,
  dbEvent,
  isActive = false,
  isCompleted = false,
  goldWinnerIsPlayer1,
  onClick,
  className = '',
}: EventCardProps) {
  const status = dbEvent?.status ?? 'pending'

  return (
    <div
      onClick={onClick}
      className={`
        relative p-4 rounded-xl border transition-all cursor-pointer
        ${isActive
          ? 'bg-navy-800 border-gold shadow-lg shadow-gold/20'
          : isCompleted
            ? 'bg-navy-900 border-navy-600'
            : 'bg-navy-900/50 border-navy-700 hover:border-navy-500'
        }
        ${className}
      `}
    >
      {/* Status indicator */}
      {isActive && (
        <div className="absolute top-2 right-2">
          <span className="flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-gold"></span>
          </span>
        </div>
      )}

      {isCompleted && goldWinnerIsPlayer1 !== undefined && (
        <div className="absolute top-2 right-2">
          <MedalBadge
            type={goldWinnerIsPlayer1 ? 'gold' : 'silver'}
            size="sm"
          />
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="text-3xl">{event.icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-white truncate">
            {event.name}
          </h3>
          <p className="text-sm text-gray-400 mt-0.5 line-clamp-2">
            {event.description}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span>~{event.estimatedMinutes} min</span>
            {event.supportsAsync && <span className="text-green-500">Async</span>}
            {event.supportsRealtime && <span className="text-blue-500">Realtime</span>}
          </div>
        </div>
      </div>

      {/* Status badge */}
      {status !== 'pending' && !isCompleted && (
        <div className="mt-3 pt-3 border-t border-navy-700">
          <StatusBadge status={status} />
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: DBEvent['status'] }) {
  const statusConfig = {
    pending: { label: 'Pending', color: 'text-gray-500' },
    p1_active: { label: 'P1 Playing', color: 'text-blue-400' },
    p2_active: { label: 'P2 Playing', color: 'text-blue-400' },
    p1_complete: { label: 'P1 Done', color: 'text-yellow-400' },
    p2_complete: { label: 'P2 Done', color: 'text-yellow-400' },
    complete: { label: 'Complete', color: 'text-green-400' },
  }

  const config = statusConfig[status]

  return (
    <span className={`text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  )
}
