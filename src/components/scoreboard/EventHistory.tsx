import type { OlympicsEvent as DBEvent, Olympics } from '@/lib/database.types'
import { getEvent, isValidEventType } from '@/events/registry'
import MedalBadge from '../shared/MedalBadge'

interface EventHistoryProps {
  events: DBEvent[]
  olympics: Olympics
  className?: string
}

export default function EventHistory({
  events,
  olympics,
  className = '',
}: EventHistoryProps) {
  const completedEvents = events.filter((e) => e.status === 'complete')

  if (completedEvents.length === 0) {
    return (
      <div className={`bg-navy-900 rounded-xl p-6 ${className}`}>
        <h3 className="font-display text-lg font-semibold text-white mb-4">
          Event History
        </h3>
        <p className="text-gray-500 text-sm text-center py-4">
          No events completed yet
        </p>
      </div>
    )
  }

  return (
    <div className={`bg-navy-900 rounded-xl p-6 ${className}`}>
      <h3 className="font-display text-lg font-semibold text-white mb-4">
        Event History
      </h3>

      <div className="space-y-3">
        {completedEvents.map((dbEvent) => {
          if (!isValidEventType(dbEvent.event_type)) return null
          const event = getEvent(dbEvent.event_type)
          const goldWinnerIsP1 = dbEvent.gold_winner_id === olympics.player1_id

          return (
            <div
              key={dbEvent.id}
              className="flex items-center gap-3 p-3 bg-navy-800 rounded-lg"
            >
              <span className="text-2xl">{event.icon}</span>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-white">{event.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {goldWinnerIsP1 ? 'P1' : 'P2'} wins
                </span>
                <MedalBadge type="gold" size="sm" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
