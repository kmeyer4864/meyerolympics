import { useParams, Navigate, useNavigate } from 'react-router-dom'
import { useOlympics } from '@/engine/useOlympics'
import { useAppStore } from '@/store/useAppStore'
import { getEvent, isValidEventType } from '@/events/registry'
import MedalStandings from '@/components/scoreboard/MedalStandings'

export default function EventIntro() {
  const { id, idx } = useParams<{ id: string; idx: string }>()
  const navigate = useNavigate()
  const { user } = useAppStore()
  const {
    olympics,
    events,
    player1Profile,
    player2Profile,
    beginEvent,
    isLoading,
  } = useOlympics(id)

  const eventIndex = parseInt(idx ?? '0', 10)

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

  const dbEvent = events.find((e) => e.event_index === eventIndex)
  if (!dbEvent || !isValidEventType(dbEvent.event_type)) {
    return <Navigate to={`/olympics/${id}/summary`} replace />
  }

  const event = getEvent(dbEvent.event_type)

  const handleStart = async () => {
    // Pass the specific event ID from URL param, not relying on current_event_index
    await beginEvent(dbEvent.id)
    navigate(`/olympics/${id}/event/${eventIndex}/play`)
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        {/* Medal Standings */}
        <MedalStandings
          olympics={olympics}
          player1Profile={player1Profile}
          player2Profile={player2Profile}
          className="mb-8"
        />

        {/* Event Card */}
        <div className="bg-navy-800 rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">{event.icon}</div>
          <h1 className="font-display text-4xl font-bold text-white mb-2">
            {event.name}
          </h1>
          <p className="text-gray-400 text-lg mb-6">{event.description}</p>

          {/* Event Number */}
          <div className="inline-block px-4 py-1 bg-navy-700 rounded-full text-sm text-gold mb-6">
            Event {eventIndex + 1} of {olympics.event_sequence.length}
          </div>

          {/* Rules */}
          <div className="text-left bg-navy-900 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-white mb-3">Rules</h3>
            <ul className="space-y-2">
              {event.rules.map((rule, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-300">
                  <span className="text-gold mt-1">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            className="w-full py-4 bg-gold text-navy-950 font-bold text-lg rounded-lg hover:bg-gold-400 transition-colors"
          >
            Start Event
          </button>
        </div>
      </div>
    </div>
  )
}
