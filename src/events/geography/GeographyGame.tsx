import { useState, useMemo, useCallback } from 'react'
import type { EventComponentProps, MatchResult } from '../types'
import { getLocationsByIds, calculateDistance, formatDistance, type Location } from './locations'
import WorldMap from './WorldMap'
import { ElapsedTimer } from '@/components/shared/CountdownTimer'

interface GuessResult {
  location: Location
  guess: { lat: number; lng: number }
  distance: number
}

export default function GeographyGame({
  puzzleMetadata,
  onComplete,
}: EventComponentProps) {
  const locationIds = puzzleMetadata?.locationIds as string[] | undefined
  const locations = useMemo(() => {
    if (!locationIds) return []
    return getLocationsByIds(locationIds)
  }, [locationIds])

  // Game state
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [guessResults, setGuessResults] = useState<GuessResult[]>([])
  const [showingResult, setShowingResult] = useState(false)
  const [startTime] = useState<Date>(new Date())
  const [isComplete, setIsComplete] = useState(false)

  const currentLocation = locations[currentIndex]
  const totalLocations = locations.length

  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    if (showingResult || isComplete) return
    setSelectedLocation({ lat, lng })
  }, [showingResult, isComplete])

  const handleConfirmGuess = useCallback(() => {
    if (!selectedLocation || !currentLocation || showingResult) return

    const distance = calculateDistance(
      selectedLocation.lat,
      selectedLocation.lng,
      currentLocation.lat,
      currentLocation.lng
    )

    const result: GuessResult = {
      location: currentLocation,
      guess: selectedLocation,
      distance,
    }

    setGuessResults(prev => [...prev, result])
    setShowingResult(true)
  }, [selectedLocation, currentLocation, showingResult])

  const handleNextLocation = useCallback(() => {
    const nextIndex = currentIndex + 1

    if (nextIndex >= totalLocations) {
      // Game complete
      setIsComplete(true)

      const totalDistance = guessResults.reduce((sum, r) => sum + r.distance, 0) +
        (guessResults.length < totalLocations ? 0 : 0) // already includes all
      const avgDistance = totalDistance / totalLocations
      const rawValue = Math.max(0, 5000 - avgDistance * 0.5)
      const score = Math.round((rawValue / 5000) * 100)

      const finalResult: MatchResult = {
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

      onComplete(finalResult)
    } else {
      setCurrentIndex(nextIndex)
      setSelectedLocation(null)
      setShowingResult(false)
    }
  }, [currentIndex, totalLocations, guessResults, locationIds, onComplete])

  // Loading state
  if (locations.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    )
  }

  // Calculate running stats
  const totalSoFar = guessResults.reduce((sum, r) => sum + r.distance, 0)
  const avgSoFar = guessResults.length > 0 ? totalSoFar / guessResults.length : 0

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-gray-400 text-sm">
            Location {currentIndex + 1} of {totalLocations}
          </p>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Time</div>
          <ElapsedTimer startTime={startTime} className="text-xl" />
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
        selectedLocation={selectedLocation}
        correctLocation={showingResult ? { lat: currentLocation.lat, lng: currentLocation.lng } : null}
        showCorrect={showingResult}
        disabled={showingResult || isComplete}
      />

      {/* Result feedback */}
      {showingResult && !isComplete && guessResults.length > 0 && (
        <div className="mt-4 p-4 bg-navy-800 rounded-xl border border-navy-600 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Distance from {currentLocation.name}:</p>
              <p className={`text-2xl font-bold ${
                guessResults[guessResults.length - 1].distance < 500 ? 'text-green-400' :
                guessResults[guessResults.length - 1].distance < 2000 ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {formatDistance(guessResults[guessResults.length - 1].distance)}
              </p>
            </div>
            <button
              onClick={handleNextLocation}
              className="px-6 py-3 bg-gold text-navy-900 font-bold rounded-lg hover:bg-gold/90 transition-colors"
            >
              {currentIndex + 1 >= totalLocations ? 'See Results' : 'Next Location'}
            </button>
          </div>
        </div>
      )}

      {/* Confirm button */}
      {!showingResult && !isComplete && (
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
      {guessResults.length > 0 && !isComplete && (
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
            {guessResults.map((result, index) => (
              <div
                key={result.location.id}
                className="flex items-center justify-between p-3 bg-navy-800/50 rounded-lg"
              >
                <div>
                  <span className="text-gray-500 mr-2">{index + 1}.</span>
                  <span className="text-white">{result.location.name}</span>
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
      {!showingResult && !isComplete && (
        <p className="mt-6 text-sm text-gray-500 text-center">
          Click on the map to place your guess, then confirm.
        </p>
      )}
    </div>
  )
}
