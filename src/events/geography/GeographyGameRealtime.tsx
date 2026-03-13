import { useState, useMemo, useCallback } from 'react'
import type { EventComponentProps, MatchResult } from '../types'
import { getLocationsByIds, formatDistance } from './locations'
import { useGeographyRealtime, type GuessResult as RealtimeGuessResult } from './useGeographyRealtime'
import WorldMap from './WorldMap'
import GuessComparison from '@/components/geography/GuessComparison'
import { ElapsedTimer } from '@/components/shared/CountdownTimer'

export default function GeographyGameRealtime({
  eventId,
  playerId,
  puzzleMetadata,
  onComplete,
}: EventComponentProps) {
  const locationIds = puzzleMetadata?.locationIds as string[] | undefined
  const locations = useMemo(() => {
    if (!locationIds) return []
    return getLocationsByIds(locationIds)
  }, [locationIds])

  const [startTime] = useState<Date>(new Date())
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [hasConfirmed, setHasConfirmed] = useState(false)

  const handleGameComplete = useCallback((guessResults: RealtimeGuessResult[]) => {
    const totalDistance = guessResults.reduce((sum, r) => sum + r.distance, 0)
    const avgDistance = totalDistance / locations.length
    const rawValue = Math.max(0, 5000 - avgDistance * 0.5)
    const score = Math.round((rawValue / 5000) * 100)

    const result: MatchResult = {
      score: Math.max(0, score),
      rawValue: Math.max(0, rawValue),
      completedAt: new Date().toISOString(),
      metadata: {
        locationIds,
        distances: guessResults.map(r => r.distance),
        totalDistance,
        avgDistance,
      },
    }

    onComplete(result)
  }, [locations.length, locationIds, onComplete])

  const {
    currentLocationIndex,
    isConnected,
    opponentConnected,
    bothReady,
    myGuess,
    opponentGuess,
    waitingForOpponent,
    allMyGuesses,
    submitGuess,
    advanceToNextLocation,
    setReady,
    isComplete,
  } = useGeographyRealtime({
    eventId,
    playerId,
    locations,
    onGameComplete: handleGameComplete,
  })

  const currentLocation = locations[currentLocationIndex]
  const totalLocations = locations.length
  const bothGuessed = myGuess !== null && opponentGuess !== null

  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    if (hasConfirmed || isComplete) return
    setSelectedLocation({ lat, lng })
  }, [hasConfirmed, isComplete])

  const handleConfirmGuess = useCallback(() => {
    if (!selectedLocation || hasConfirmed) return
    submitGuess(selectedLocation.lat, selectedLocation.lng)
    setHasConfirmed(true)
  }, [selectedLocation, hasConfirmed, submitGuess])

  const handleNextLocation = useCallback(() => {
    advanceToNextLocation()
    setSelectedLocation(null)
    setHasConfirmed(false)
  }, [advanceToNextLocation])

  // Loading state
  if (locations.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    )
  }

  // Connection state
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold mb-4"></div>
        <p className="text-gray-400">Connecting...</p>
      </div>
    )
  }

  // Waiting for opponent to connect
  if (!opponentConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-5xl mb-4">🌍</div>
        <h2 className="text-2xl font-bold text-white mb-2">Waiting for Opponent</h2>
        <p className="text-gray-400 mb-4">Your opponent needs to connect...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold"></div>
      </div>
    )
  }

  // Ready check
  if (!bothReady) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-5xl mb-4">🌍</div>
        <h2 className="text-2xl font-bold text-white mb-2">Geography</h2>
        <p className="text-gray-400 mb-6">
          Guess {totalLocations} locations on the map. Closest guesses win!
        </p>
        <button
          onClick={setReady}
          className="px-8 py-4 bg-gold text-navy-900 font-bold text-lg rounded-lg hover:bg-gold/90 transition-colors"
        >
          Ready to Play
        </button>
        <p className="text-gray-500 text-sm mt-4">
          {opponentConnected ? 'Opponent is connected' : 'Waiting for opponent...'}
        </p>
      </div>
    )
  }

  // Calculate running stats
  const totalSoFar = allMyGuesses.reduce((sum, r) => sum + r.distance, 0)
  const avgSoFar = allMyGuesses.length > 0 ? totalSoFar / allMyGuesses.length : 0

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-gray-400 text-sm">
            Location {currentLocationIndex + 1} of {totalLocations}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Connection indicator */}
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${opponentConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-gray-500">
              {opponentConnected ? 'Opponent online' : 'Opponent offline'}
            </span>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Time</div>
            <ElapsedTimer startTime={startTime} className="text-xl" />
          </div>
        </div>
      </div>

      {/* Current location clue */}
      {currentLocation && !isComplete && (
        <div className="mb-4 p-4 bg-navy-800 rounded-xl border border-navy-600">
          <p className="text-gold text-lg font-semibold mb-1">{currentLocation.name}</p>
          <p className="text-gray-300">{currentLocation.clue}</p>
        </div>
      )}

      {/* World Map */}
      <WorldMap
        onLocationSelect={handleLocationSelect}
        selectedLocation={myGuess?.guess ?? selectedLocation}
        correctLocation={bothGuessed ? { lat: currentLocation.lat, lng: currentLocation.lng } : null}
        opponentGuess={bothGuessed ? opponentGuess?.guess : null}
        showCorrect={bothGuessed}
        showOpponent={bothGuessed}
        disabled={hasConfirmed || isComplete}
      />

      {/* Waiting for opponent */}
      {waitingForOpponent && !bothGuessed && (
        <div className="mt-4 p-4 bg-navy-800 rounded-xl border border-navy-600 animate-fade-in">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gold"></div>
            <p className="text-gray-400">Waiting for opponent's guess...</p>
          </div>
        </div>
      )}

      {/* Guess comparison when both have guessed */}
      {bothGuessed && currentLocation && (
        <GuessComparison
          myDistance={myGuess.distance}
          opponentDistance={opponentGuess.distance}
          locationName={currentLocation.name}
          isLastLocation={currentLocationIndex + 1 >= totalLocations}
          onNextLocation={handleNextLocation}
        />
      )}

      {/* Confirm button */}
      {!hasConfirmed && !isComplete && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleConfirmGuess}
            disabled={!selectedLocation}
            className={`
              px-8 py-3 font-bold rounded-lg transition-colors
              ${selectedLocation
                ? 'bg-gold text-navy-900 hover:bg-gold/90'
                : 'bg-navy-700 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            Confirm Guess
          </button>
        </div>
      )}

      {/* Running score */}
      {allMyGuesses.length > 0 && !isComplete && (
        <div className="mt-4 flex justify-center gap-8 text-sm text-gray-400">
          <div>
            <span className="text-gray-500">Total distance:</span>{' '}
            <span className="text-white">{formatDistance(totalSoFar)}</span>
          </div>
          <div>
            <span className="text-gray-500">Average:</span>{' '}
            <span className="text-white">{formatDistance(avgSoFar)}</span>
          </div>
        </div>
      )}

      {/* Final results */}
      {isComplete && (
        <div className="mt-6 p-6 bg-green-900/30 border border-green-600 rounded-xl animate-fade-in">
          <div className="text-center mb-6">
            <div className="text-3xl font-bold mb-2">Geography Complete!</div>
            <div className="text-lg text-gray-300">
              Average distance: <span className="text-gold font-semibold">{formatDistance(avgSoFar)}</span>
            </div>
            <div className="text-gray-400">
              Final score: {Math.round(Math.max(0, 5000 - avgSoFar * 0.5)).toLocaleString()} pts
            </div>
          </div>

          {/* Results breakdown */}
          <div className="space-y-2">
            {allMyGuesses.map((result, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-navy-800/50 rounded-lg"
              >
                <div>
                  <span className="text-gray-500 mr-2">{index + 1}.</span>
                  <span className="text-white">{locations[result.locationIndex]?.name}</span>
                </div>
                <span className={`font-semibold ${
                  result.distance < 500 ? 'text-green-400' :
                  result.distance < 2000 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {formatDistance(result.distance)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!hasConfirmed && !isComplete && (
        <p className="mt-6 text-sm text-gray-500 text-center">
          Click on the map to place your guess, then confirm. Your opponent is also guessing!
        </p>
      )}
    </div>
  )
}
