import { useState, useMemo, useCallback } from 'react'
import type { EventComponentProps, MatchResult } from '../types'
import { getPuzzleById, type TimelineEvent } from './puzzleData'
import { ElapsedTimer, useElapsedTime } from '@/components/shared/CountdownTimer'

interface TimelineSlotProps {
  position: number
  onClick: () => void
  isHovered: boolean
  onHover: (pos: number | null) => void
}

function TimelineSlot({ position, onClick, isHovered, onHover }: TimelineSlotProps) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => onHover(position)}
      onMouseLeave={() => onHover(null)}
      className={`
        w-full py-3 my-1 border-2 border-dashed rounded-lg transition-all
        ${isHovered
          ? 'border-gold bg-gold/20 text-gold'
          : 'border-navy-600 hover:border-gold/50 text-gray-500 hover:text-gold/70'
        }
      `}
    >
      <span className="text-sm font-medium">Place here</span>
    </button>
  )
}

interface TimelineCardProps {
  event: TimelineEvent
  showYear: boolean
  isNew?: boolean
  isWrong?: boolean
}

function TimelineCard({ event, showYear, isNew, isWrong }: TimelineCardProps) {
  return (
    <div
      className={`
        p-4 rounded-lg border-2 transition-all
        ${isNew ? 'animate-slide-in border-green-500 bg-green-900/20' : ''}
        ${isWrong ? 'animate-shake border-red-500 bg-red-900/20' : ''}
        ${!isNew && !isWrong ? 'border-navy-600 bg-navy-800' : ''}
      `}
    >
      <div className="flex items-center gap-4">
        <div className={`
          w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-lg font-bold text-xl
          ${showYear ? 'bg-gold/20 text-gold' : 'bg-navy-700 text-gray-500'}
        `}>
          {showYear ? event.year : '????'}
        </div>
        <p className="text-white text-lg">{event.description}</p>
      </div>
    </div>
  )
}

function StrikeIndicator({ strikes, maxStrikes }: { strikes: number; maxStrikes: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: maxStrikes }).map((_, i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-full ${
            i < strikes ? 'bg-red-500' : 'bg-navy-700'
          }`}
        />
      ))}
    </div>
  )
}

export default function FlashbackGame({
  puzzleMetadata,
  onComplete,
}: EventComponentProps) {
  const puzzleId = puzzleMetadata?.puzzleId as string | undefined
  const puzzle = useMemo(() => {
    if (!puzzleId) return null
    return getPuzzleById(puzzleId)
  }, [puzzleId])

  // Shuffle events once for this game instance (but keep them deterministic based on puzzleId)
  const shuffledOrder = useMemo(() => {
    if (!puzzle) return []
    // Use a seeded shuffle based on puzzleId for consistency
    const indices = puzzle.events.map((_, i) => i)
    // Simple deterministic shuffle - for async games both players get same order
    const seed = puzzleId ? puzzleId.split('').reduce((a, c) => a + c.charCodeAt(0), 0) : 0
    for (let i = indices.length - 1; i > 0; i--) {
      const j = (seed * (i + 1) + i) % (i + 1)
      ;[indices[i], indices[j]] = [indices[j], indices[i]]
    }
    return indices
  }, [puzzle, puzzleId])

  // Game state
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [currentEventIndex, setCurrentEventIndex] = useState(1) // Start at 1 since 0 is starter
  const [strikes, setStrikes] = useState(0)
  const [startTime] = useState<Date>(new Date())
  const [isComplete, setIsComplete] = useState(false)
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null)
  const [lastPlacedIndex, setLastPlacedIndex] = useState<number | null>(null)
  const [wasWrong, setWasWrong] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const elapsedMs = useElapsedTime(startTime)
  const maxStrikes = 8

  // Initialize timeline with first event
  useMemo(() => {
    if (puzzle && shuffledOrder.length > 0 && timeline.length === 0) {
      const starterEvent = puzzle.events[shuffledOrder[0]]
      setTimeline([starterEvent])
    }
  }, [puzzle, shuffledOrder, timeline.length])

  const currentEvent = useMemo(() => {
    if (!puzzle || currentEventIndex >= shuffledOrder.length) return null
    return puzzle.events[shuffledOrder[currentEventIndex]]
  }, [puzzle, shuffledOrder, currentEventIndex])

  // Find the correct position for an event in the timeline
  const findCorrectPosition = useCallback((event: TimelineEvent, currentTimeline: TimelineEvent[]): number => {
    for (let i = 0; i < currentTimeline.length; i++) {
      if (event.year < currentTimeline[i].year) {
        return i
      }
    }
    return currentTimeline.length
  }, [])

  // Handle placing an event
  const handlePlace = useCallback((position: number) => {
    if (!currentEvent || isComplete || isAnimating) return

    setIsAnimating(true)
    const correctPosition = findCorrectPosition(currentEvent, timeline)
    const isCorrect = position === correctPosition

    if (!isCorrect) {
      setStrikes(s => s + 1)
      setWasWrong(true)
    } else {
      setWasWrong(false)
    }

    // Insert at the correct position (not the clicked position if wrong)
    const insertPosition = isCorrect ? position : correctPosition
    const newTimeline = [...timeline]
    newTimeline.splice(insertPosition, 0, currentEvent)
    setTimeline(newTimeline)
    setLastPlacedIndex(insertPosition)

    // After animation, move to next event
    setTimeout(() => {
      setLastPlacedIndex(null)
      setWasWrong(false)
      setIsAnimating(false)

      const nextIndex = currentEventIndex + 1
      if (nextIndex >= shuffledOrder.length) {
        // Game complete
        setIsComplete(true)
        const finalStrikes = isCorrect ? strikes : strikes + 1
        const timeMs = Date.now() - startTime.getTime()

        // Scoring: accuracy first (fewer strikes = better), speed as tiebreaker
        const rawValue = (8 - finalStrikes) * 1000 - (timeMs / 1000) * 0.1
        const score = Math.round(((8 - finalStrikes) / 8) * 100)

        const result: MatchResult = {
          score: Math.max(0, score),
          rawValue: Math.max(0, rawValue),
          completedAt: new Date().toISOString(),
          metadata: {
            puzzleId,
            strikes: finalStrikes,
            elapsedMs: timeMs,
          },
        }

        onComplete(result)
      } else {
        setCurrentEventIndex(nextIndex)
      }
    }, 1000)
  }, [currentEvent, timeline, isComplete, isAnimating, findCorrectPosition, currentEventIndex, shuffledOrder.length, strikes, startTime, puzzleId, onComplete])

  // Loading state
  if (!puzzle || timeline.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gold">{puzzle.theme}</h2>
          <p className="text-gray-400 text-sm">
            Event {currentEventIndex} of {shuffledOrder.length - 1}
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Strikes</div>
            <StrikeIndicator strikes={strikes} maxStrikes={maxStrikes} />
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Time</div>
            <ElapsedTimer startTime={startTime} className="text-xl" />
          </div>
        </div>
      </div>

      {/* Current event to place */}
      {currentEvent && !isComplete && (
        <div className="mb-8 p-6 bg-navy-800/50 rounded-xl border-2 border-gold/30">
          <p className="text-sm text-gold mb-3 font-medium">Place this event on the timeline:</p>
          <div className="p-4 bg-navy-900 rounded-lg border border-navy-600">
            <p className="text-white text-xl text-center">{currentEvent.description}</p>
          </div>
          {wasWrong && (
            <p className="text-red-400 text-sm mt-3 text-center animate-fade-in">
              Wrong! The correct year was {currentEvent.year}
            </p>
          )}
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-navy-600" />

        {/* Slot before first event */}
        {!isComplete && !isAnimating && (
          <div className="ml-12 mb-2">
            <TimelineSlot
              position={0}
              onClick={() => handlePlace(0)}
              isHovered={hoveredSlot === 0}
              onHover={setHoveredSlot}
            />
          </div>
        )}

        {/* Timeline events */}
        {timeline.map((event, index) => (
          <div key={event.id}>
            <div className="flex items-start gap-4 mb-2">
              <div className="w-4 h-4 rounded-full bg-gold mt-6 flex-shrink-0 relative z-10" />
              <div className="flex-1">
                <TimelineCard
                  event={event}
                  showYear={true}
                  isNew={lastPlacedIndex === index}
                  isWrong={wasWrong && lastPlacedIndex === index}
                />
              </div>
            </div>

            {/* Slot after this event */}
            {!isComplete && !isAnimating && (
              <div className="ml-12 mb-2">
                <TimelineSlot
                  position={index + 1}
                  onClick={() => handlePlace(index + 1)}
                  isHovered={hoveredSlot === index + 1}
                  onHover={setHoveredSlot}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Complete message */}
      {isComplete && (
        <div className="mt-8 p-6 bg-green-900/30 border border-green-600 rounded-xl text-center animate-fade-in">
          <div className="text-3xl mb-2">Timeline Complete!</div>
          <div className="text-lg text-gray-300">
            {strikes === 0 ? (
              <span className="text-gold">Perfect! No strikes!</span>
            ) : (
              <span>{strikes} strike{strikes !== 1 ? 's' : ''}</span>
            )}
          </div>
          <div className="text-gray-400 mt-2">
            Time: {Math.floor(elapsedMs / 60000)}:
            {String(Math.floor((elapsedMs % 60000) / 1000)).padStart(2, '0')}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!isComplete && (
        <p className="mt-6 text-sm text-gray-500 text-center">
          Click where the event belongs on the timeline. Earlier events go higher.
        </p>
      )}
    </div>
  )
}
