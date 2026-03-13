import { useState, useCallback, useMemo } from 'react'
import type { EventComponentProps, MatchResult } from '../types'
import { getCountryById } from './countryData'
import CountryMap from './CountryMap'
import { ElapsedTimer } from '@/components/shared/CountdownTimer'

// Note: CountryMap uses normalizeCountryName internally to convert GeoJSON country names
// to our country IDs (e.g., "United States of America" -> "usa")

const MAX_GUESSES = 6

export default function GeodleGame({
  puzzleMetadata,
  onComplete,
}: EventComponentProps) {
  const countryId = puzzleMetadata?.countryId as string | undefined

  const targetCountry = useMemo(() => {
    if (!countryId) return null
    return getCountryById(countryId)
  }, [countryId])

  const [wrongGuesses, setWrongGuesses] = useState<string[]>([])
  const [correctCountry, setCorrectCountry] = useState<string | null>(null)
  const [startTime] = useState<Date>(new Date())
  const [isComplete, setIsComplete] = useState(false)

  // Current hint index (0 = first hint shown, up to 5)
  const currentHintIndex = wrongGuesses.length

  // Revealed hints (all hints up to and including current)
  const revealedHints = useMemo(() => {
    if (!targetCountry) return []
    return targetCountry.hints.slice(0, currentHintIndex + 1)
  }, [targetCountry, currentHintIndex])

  const handleCountrySelect = useCallback((selectedCountryId: string, _countryName: string) => {
    if (isComplete || !targetCountry) return
    if (wrongGuesses.includes(selectedCountryId)) return

    if (selectedCountryId === targetCountry.id) {
      // Correct guess!
      setCorrectCountry(selectedCountryId)
      setIsComplete(true)

      const elapsedMs = Date.now() - startTime.getTime()
      const roundsTaken = wrongGuesses.length + 1 // +1 for the correct guess

      const result: MatchResult = {
        score: Math.round(((MAX_GUESSES - roundsTaken + 1) / MAX_GUESSES) * 100),
        rawValue: roundsTaken, // Lower is better
        completedAt: new Date().toISOString(),
        metadata: {
          countryId: targetCountry.id,
          countryName: targetCountry.name,
          rounds: roundsTaken,
          elapsedMs,
          wrongGuesses,
        },
      }

      onComplete(result)
    } else {
      // Wrong guess
      const newWrongGuesses = [...wrongGuesses, selectedCountryId]
      setWrongGuesses(newWrongGuesses)

      // Check if out of guesses
      if (newWrongGuesses.length >= MAX_GUESSES) {
        setIsComplete(true)

        const elapsedMs = Date.now() - startTime.getTime()

        const result: MatchResult = {
          score: 0, // Failed to guess
          rawValue: MAX_GUESSES + 1, // Worse than any successful guess
          completedAt: new Date().toISOString(),
          metadata: {
            countryId: targetCountry.id,
            countryName: targetCountry.name,
            rounds: MAX_GUESSES + 1, // Indicates failure
            elapsedMs,
            wrongGuesses: newWrongGuesses,
            failed: true,
          },
        }

        onComplete(result)
      }
    }
  }, [isComplete, targetCountry, wrongGuesses, startTime, onComplete])

  // Loading state
  if (!targetCountry) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">Guess the Country</h2>
          <p className="text-gray-400 text-sm">
            Guess {wrongGuesses.length + 1} of {MAX_GUESSES}
          </p>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Time</div>
          <ElapsedTimer startTime={startTime} className="text-xl" />
        </div>
      </div>

      {/* Round indicators */}
      <div className="flex gap-2 mb-4 justify-center">
        {[...Array(MAX_GUESSES)].map((_, i) => (
          <div
            key={i}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              i < wrongGuesses.length
                ? 'bg-red-500 text-white'
                : correctCountry && i === wrongGuesses.length
                ? 'bg-green-500 text-white'
                : i === wrongGuesses.length
                ? 'bg-gold text-navy-900'
                : 'bg-navy-700 text-gray-400'
            }`}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Hints section */}
      <div className="mb-6 p-4 bg-navy-800 rounded-xl border border-navy-600">
        <h3 className="text-gold font-semibold mb-3 flex items-center gap-2">
          <span className="text-lg">💡</span>
          Hints
        </h3>
        <div className="space-y-2">
          {revealedHints.map((hint, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                index === revealedHints.length - 1
                  ? 'bg-gold/20 border border-gold/30'
                  : 'bg-navy-700/50'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-gold font-bold text-sm">#{index + 1}</span>
                <p className="text-gray-200 text-sm">{hint}</p>
              </div>
            </div>
          ))}
        </div>
        {!isComplete && wrongGuesses.length < MAX_GUESSES - 1 && (
          <p className="text-gray-500 text-xs mt-3 text-center">
            {MAX_GUESSES - wrongGuesses.length - 1} more hint{MAX_GUESSES - wrongGuesses.length - 1 !== 1 ? 's' : ''} available if you guess wrong
          </p>
        )}
      </div>

      {/* Interactive Map */}
      {!isComplete && (
        <>
          <CountryMap
            onCountrySelect={handleCountrySelect}
            wrongGuesses={wrongGuesses}
            correctCountry={correctCountry}
            disabled={isComplete}
          />
          <p className="mt-4 text-sm text-gray-500 text-center">
            Click on a country to make your guess
          </p>
        </>
      )}

      {/* Wrong guesses list */}
      {wrongGuesses.length > 0 && !isComplete && (
        <div className="mt-4">
          <p className="text-gray-500 text-sm mb-2">Wrong guesses:</p>
          <div className="flex flex-wrap gap-2">
            {wrongGuesses.map((id) => (
              <span
                key={id}
                className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm"
              >
                {id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Game complete */}
      {isComplete && (
        <div className={`mt-6 p-6 rounded-xl border animate-fade-in ${
          correctCountry
            ? 'bg-green-900/30 border-green-600'
            : 'bg-red-900/30 border-red-600'
        }`}>
          <div className="text-center">
            {correctCountry ? (
              <>
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-green-400 mb-2">
                  Correct!
                </h3>
                <p className="text-gray-300 mb-4">
                  You guessed <span className="text-gold font-bold">{targetCountry.name}</span> in{' '}
                  <span className="text-gold font-bold">{wrongGuesses.length + 1}</span> round{wrongGuesses.length + 1 !== 1 ? 's' : ''}!
                </p>
              </>
            ) : (
              <>
                <div className="text-5xl mb-4">😔</div>
                <h3 className="text-2xl font-bold text-red-400 mb-2">
                  Out of Guesses
                </h3>
                <p className="text-gray-300 mb-4">
                  The answer was <span className="text-gold font-bold">{targetCountry.name}</span>
                </p>
              </>
            )}

            {/* Show the map with result */}
            <div className="mt-4">
              <CountryMap
                onCountrySelect={() => {}}
                wrongGuesses={wrongGuesses}
                correctCountry={targetCountry.id}
                disabled={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
