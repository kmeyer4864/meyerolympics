import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllEvents, getAsyncEvents } from '@/events/registry'
import type { EventType } from '@/events/types'
import { useOlympics } from '@/engine/useOlympics'
import EventCard from '../shared/EventCard'

export default function CreateOlympicsForm() {
  const navigate = useNavigate()
  const { create, isCreating } = useOlympics()
  const [selectedEvents, setSelectedEvents] = useState<EventType[]>([])
  const [mode, setMode] = useState<'async' | 'realtime'>('async')
  const [error, setError] = useState<string | null>(null)

  // Filter events based on mode
  const availableEvents = mode === 'async' ? getAsyncEvents() : getAllEvents()

  const toggleEvent = (eventId: EventType) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId)
        ? prev.filter((e) => e !== eventId)
        : [...prev, eventId]
    )
  }

  const handleCreate = async () => {
    console.log('handleCreate called', { selectedEvents, mode })

    if (selectedEvents.length === 0) {
      setError('Please select at least one event')
      return
    }

    setError(null)
    try {
      console.log('Calling create...')
      const olympics = await create(selectedEvents, mode)
      console.log('Create returned:', olympics)
      if (olympics) {
        navigate(`/olympics/${olympics.id}/lobby`)
      } else {
        setError('Failed to create Olympics - no data returned')
      }
    } catch (err) {
      console.error('Create error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create Olympics')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display text-3xl font-bold text-gold text-center mb-2">
        Create Olympics
      </h1>
      <p className="text-gray-400 text-center mb-8">
        Choose your events and challenge a friend
      </p>

      {/* Mode Selection */}
      <div className="mb-8">
        <h2 className="font-display text-lg font-semibold text-white mb-3">
          Game Mode
        </h2>
        <div className="flex gap-4">
          <button
            onClick={() => {
              setMode('async')
              setSelectedEvents([])
            }}
            className={`flex-1 p-4 rounded-lg border transition-all ${
              mode === 'async'
                ? 'bg-navy-800 border-gold text-white'
                : 'bg-navy-900 border-navy-700 text-gray-400 hover:border-navy-500'
            }`}
          >
            <div className="font-semibold">Async</div>
            <div className="text-sm mt-1 opacity-75">
              Play at your own pace
            </div>
          </button>
          <button
            onClick={() => {
              setMode('realtime')
              setSelectedEvents([])
            }}
            className={`flex-1 p-4 rounded-lg border transition-all ${
              mode === 'realtime'
                ? 'bg-navy-800 border-gold text-white'
                : 'bg-navy-900 border-navy-700 text-gray-400 hover:border-navy-500'
            }`}
          >
            <div className="font-semibold">Realtime</div>
            <div className="text-sm mt-1 opacity-75">
              Play together live
            </div>
          </button>
        </div>
      </div>

      {/* Event Selection */}
      <div className="mb-8">
        <h2 className="font-display text-lg font-semibold text-white mb-3">
          Select Events ({selectedEvents.length} selected)
        </h2>
        <div className="grid gap-3">
          {availableEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => toggleEvent(event.id)}
              className={`cursor-pointer transition-all ${
                selectedEvents.includes(event.id)
                  ? 'ring-2 ring-gold'
                  : ''
              }`}
            >
              <EventCard
                event={event}
                isActive={selectedEvents.includes(event.id)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Selected Order */}
      {selectedEvents.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display text-lg font-semibold text-white mb-3">
            Event Order
          </h2>
          <div className="flex flex-wrap gap-2">
            {selectedEvents.map((eventId, index) => {
              const event = availableEvents.find((e) => e.id === eventId)
              return (
                <div
                  key={eventId}
                  className="flex items-center gap-2 px-3 py-1.5 bg-navy-800 rounded-lg"
                >
                  <span className="text-gold font-bold">{index + 1}</span>
                  <span className="text-sm">{event?.icon}</span>
                  <span className="text-white">{event?.name}</span>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Click events above to change the order
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 p-3 bg-red-900/50 text-red-300 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Create Button */}
      <button
        onClick={handleCreate}
        disabled={isCreating || selectedEvents.length === 0}
        className="w-full py-4 bg-gold text-navy-950 font-bold text-lg rounded-lg hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isCreating ? 'Creating...' : 'Create Olympics'}
      </button>
    </div>
  )
}
