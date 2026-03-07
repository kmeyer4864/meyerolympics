import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllEvents, getAsyncEvents, getEvent } from '@/events/registry'
import type { EventType, EventOptions } from '@/events/types'
import { useOlympics } from '@/engine/useOlympics'
import EventCard from '../shared/EventCard'

export default function CreateOlympicsForm() {
  const navigate = useNavigate()
  const { create, isCreating } = useOlympics()
  const [selectedEvents, setSelectedEvents] = useState<EventType[]>([])
  const [mode, setMode] = useState<'async' | 'realtime'>('async')
  const [error, setError] = useState<string | null>(null)
  const [eventOptions, setEventOptions] = useState<EventOptions>({} as EventOptions)

  // Filter events based on mode
  const availableEvents = mode === 'async' ? getAsyncEvents() : getAllEvents()

  const toggleEvent = (eventId: EventType) => {
    setSelectedEvents((prev) => {
      if (prev.includes(eventId)) {
        // Remove event and its options
        const newOptions = { ...eventOptions }
        delete newOptions[eventId]
        setEventOptions(newOptions as EventOptions)
        return prev.filter((e) => e !== eventId)
      } else {
        // Add event with default options
        const event = getEvent(eventId)
        if (event.configOptions) {
          const defaults: Record<string, string> = {}
          event.configOptions.forEach((config) => {
            defaults[config.optionId] = config.defaultValue
          })
          setEventOptions((prev) => ({ ...prev, [eventId]: defaults }))
        }
        return [...prev, eventId]
      }
    })
  }

  const setEventOption = (eventId: EventType, optionId: string, value: string) => {
    setEventOptions((prev) => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        [optionId]: value,
      },
    }))
  }

  const handleCreate = async () => {
    console.log('handleCreate called', { selectedEvents, mode, eventOptions })

    if (selectedEvents.length === 0) {
      setError('Please select at least one event')
      return
    }

    setError(null)
    try {
      console.log('Calling create...')
      const olympics = await create(selectedEvents, mode, eventOptions)
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

      {/* Selected Events with Options */}
      {selectedEvents.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display text-lg font-semibold text-white mb-3">
            Event Order & Settings
          </h2>
          <div className="space-y-3">
            {selectedEvents.map((eventId, index) => {
              const event = getEvent(eventId)
              return (
                <div
                  key={eventId}
                  className="p-4 bg-navy-800 rounded-lg"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-gold font-bold text-lg">{index + 1}</span>
                    <span className="text-xl">{event.icon}</span>
                    <span className="text-white font-semibold">{event.name}</span>
                  </div>

                  {/* Event Options (e.g., difficulty) */}
                  {event.configOptions?.map((config) => (
                    <div key={config.optionId} className="mt-3">
                      <label className="text-sm text-gray-400 mb-2 block">
                        {config.optionLabel}
                      </label>
                      <div className="flex gap-2">
                        {config.options.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => setEventOption(eventId, config.optionId, option.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              eventOptions[eventId]?.[config.optionId] === option.id
                                ? 'bg-gold text-navy-900'
                                : 'bg-navy-700 text-gray-300 hover:bg-navy-600'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                      {eventOptions[eventId]?.[config.optionId] && (
                        <p className="text-xs text-gray-500 mt-1">
                          {config.options.find(o => o.id === eventOptions[eventId]?.[config.optionId])?.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Click events above to remove them
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
