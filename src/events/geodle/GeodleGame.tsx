import { useState, useCallback, useMemo, useEffect } from 'react'
import type { EventComponentProps, MatchResult } from '../types'
import { getCountryByName, type GeodleCountry } from './countryData'
import { getProximity } from './countryRelations'
import CountryMap, { type GuessResult } from './CountryMap'
import { ElapsedTimer } from '@/components/shared/CountdownTimer'

const TOTAL_COUNTRIES = 5
const MAX_GUESSES_PER_COUNTRY = 10
const HINTS_PER_COUNTRY = 4

interface CountryRound {
  country: GeodleCountry
  guessHistory: GuessResult[]
  guessCount: number
  completed: boolean
  failed: boolean
}

// Type for puzzle metadata countries
// Supports both dynamic hints (via hintTypes) and curated hints (direct hints array)
interface PuzzleCountry {
  name: string
  hintTypes?: string[]  // For dynamic hint generation
  hints?: string[]      // For curated puzzles with pre-defined hints
}

export default function GeodleGame({
  puzzleMetadata,
  onComplete,
}: EventComponentProps) {
  // Extract countries with their hint types from puzzle metadata
  const puzzleCountries = puzzleMetadata?.countries as PuzzleCountry[] | undefined

  // Initialize rounds state
  const [rounds, setRounds] = useState<CountryRound[]>([])
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [startTime] = useState<Date>(new Date())
  const [showingTransition, setShowingTransition] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)
  const [shouldSubmitResults, setShouldSubmitResults] = useState(false)

  // Initialize countries from puzzle metadata
  useEffect(() => {
    if (!puzzleCountries || puzzleCountries.length !== TOTAL_COUNTRIES) {
      console.error('[Geodle] Invalid puzzle metadata:', puzzleCountries)
      setIsLoading(false)
      return
    }

    // Load country data for all 5 countries
    // Support both curated hints (direct hints array) and dynamic hints (via hintTypes)
    const loadedRounds: CountryRound[] = []
    for (const puzzleCountry of puzzleCountries) {
      const { name, hintTypes, hints } = puzzleCountry

      if (hints && hints.length > 0) {
        // Curated puzzle: use provided hints directly
        const country = getCountryByName(name)
        if (country) {
          loadedRounds.push({
            country: {
              ...country,
              hints: hints, // Override with curated hints
            },
            guessHistory: [],
            guessCount: 0,
            completed: false,
            failed: false,
          })
        } else {
          console.warn(`[Geodle] Could not load curated country: ${name}`)
        }
      } else {
        // Dynamic puzzle: generate hints from hintTypes
        const country = getCountryByName(name, hintTypes)
        if (country) {
          loadedRounds.push({
            country,
            guessHistory: [],
            guessCount: 0,
            completed: false,
            failed: false,
          })
        } else {
          console.warn(`[Geodle] Could not load country: ${name}`)
        }
      }
    }

    if (loadedRounds.length === TOTAL_COUNTRIES) {
      setRounds(loadedRounds)
    } else {
      console.error('[Geodle] Failed to load all countries')
    }
    setIsLoading(false)
  }, [puzzleCountries])

  // Current round data
  const currentRound = rounds[currentRoundIndex]
  const targetCountry = currentRound?.country

  // Total guesses across all rounds
  const totalGuesses = useMemo(() => {
    return rounds.reduce((sum, round) => sum + round.guessCount, 0)
  }, [rounds])

  // Handle country selection
  const handleCountrySelect = useCallback((guessedCountryId: string, guessedCountryName: string) => {
    if (!targetCountry || showingTransition || gameComplete) return

    // Calculate proximity
    const proximity = getProximity(guessedCountryName, targetCountry.name)
    const isCorrect = proximity === 'correct'

    // Create guess result
    const guessResult: GuessResult = {
      countryId: guessedCountryId,
      countryName: guessedCountryName,
      proximity,
    }

    // Update current round
    setRounds(prevRounds => {
      const newRounds = [...prevRounds]
      const round = { ...newRounds[currentRoundIndex] }
      round.guessHistory = [...round.guessHistory, guessResult]
      round.guessCount = round.guessCount + 1

      if (isCorrect) {
        round.completed = true
      } else if (round.guessCount >= MAX_GUESSES_PER_COUNTRY) {
        round.failed = true
        round.completed = true
      }

      newRounds[currentRoundIndex] = round
      return newRounds
    })

    // Handle correct guess or max guesses reached
    if (isCorrect || rounds[currentRoundIndex].guessCount + 1 >= MAX_GUESSES_PER_COUNTRY) {
      // Show transition screen
      setShowingTransition(true)

      setTimeout(() => {
        if (currentRoundIndex + 1 >= TOTAL_COUNTRIES) {
          // Game complete - trigger result submission via effect
          setGameComplete(true)
          setShouldSubmitResults(true)
        } else {
          // Move to next country
          setCurrentRoundIndex(prev => prev + 1)
          setShowingTransition(false)
        }
      }, 2000) // 2 second transition
    }
  }, [targetCountry, showingTransition, gameComplete, currentRoundIndex, rounds])

  // Submit results when game is complete (via useEffect to ensure state is updated)
  useEffect(() => {
    if (!shouldSubmitResults) return

    const elapsedMs = Date.now() - startTime.getTime()
    const totalGuesses = rounds.reduce((sum, r) => sum + r.guessCount, 0)
    const failedCount = rounds.filter(r => r.failed).length

    // Score: lower is better. Add penalty for failed countries
    const rawScore = totalGuesses + (failedCount * MAX_GUESSES_PER_COUNTRY)

    // Normalize to 0-100: perfect = 5 guesses (one per country), worst = 50 + penalties
    const maxPossibleScore = TOTAL_COUNTRIES * MAX_GUESSES_PER_COUNTRY
    const normalizedScore = Math.max(0, Math.round(100 * (1 - rawScore / maxPossibleScore)))

    const result: MatchResult = {
      score: normalizedScore,
      rawValue: rawScore,
      completedAt: new Date().toISOString(),
      metadata: {
        totalGuesses,
        countriesGuessed: TOTAL_COUNTRIES - failedCount,
        failedCountries: failedCount,
        elapsedMs,
        rounds: rounds.map(r => ({
          country: r.country.name,
          guesses: r.guessCount,
          failed: r.failed,
        })),
      },
    }

    onComplete(result)
  }, [shouldSubmitResults, rounds, startTime, onComplete])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    )
  }

  // Error state
  if (!targetCountry || rounds.length !== TOTAL_COUNTRIES) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-400">Failed to load game. Please try again.</div>
      </div>
    )
  }

  // Transition screen between countries
  if (showingTransition) {
    const wasCorrect = currentRound.guessHistory.some(g => g.proximity === 'correct')
    return (
      <div className="max-w-4xl mx-auto">
        <div className={`p-8 rounded-xl border animate-fade-in ${
          wasCorrect
            ? 'bg-green-900/30 border-green-600'
            : 'bg-red-900/30 border-red-600'
        }`}>
          <div className="text-center">
            <div className="text-5xl mb-4">{wasCorrect ? '🎉' : '😔'}</div>
            <h3 className={`text-2xl font-bold mb-2 ${
              wasCorrect ? 'text-green-400' : 'text-red-400'
            }`}>
              {wasCorrect ? 'Correct!' : 'Out of Guesses'}
            </h3>
            <p className="text-gray-300 mb-2">
              The country was <span className="text-gold font-bold">{targetCountry.name}</span>
            </p>
            {wasCorrect && (
              <p className="text-gray-400">
                Found in <span className="text-gold font-bold">{currentRound.guessHistory.length}</span> guess{currentRound.guessHistory.length !== 1 ? 'es' : ''}
              </p>
            )}
            <div className="mt-4 text-gray-500">
              {currentRoundIndex + 1 < TOTAL_COUNTRIES ? (
                <p>Moving to country {currentRoundIndex + 2} of {TOTAL_COUNTRIES}...</p>
              ) : (
                <p>Calculating final score...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Game complete screen
  if (gameComplete) {
    const successfulRounds = rounds.filter(r => !r.failed).length
    return (
      <div className="max-w-4xl mx-auto">
        <div className="p-8 rounded-xl border bg-navy-800 border-navy-600 animate-fade-in">
          <div className="text-center">
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold text-gold mb-4">Game Complete!</h3>
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-6">
              <div className="bg-navy-700 rounded-lg p-4">
                <div className="text-3xl font-bold text-gold">{totalGuesses}</div>
                <div className="text-gray-400 text-sm">Total Guesses</div>
              </div>
              <div className="bg-navy-700 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-400">{successfulRounds}/{TOTAL_COUNTRIES}</div>
                <div className="text-gray-400 text-sm">Countries Found</div>
              </div>
            </div>
            <div className="space-y-2">
              {rounds.map((round, idx) => (
                <div key={idx} className={`flex justify-between items-center p-2 rounded ${
                  round.failed ? 'bg-red-900/30' : 'bg-green-900/30'
                }`}>
                  <span className="text-gray-300">{round.country.name}</span>
                  <span className={round.failed ? 'text-red-400' : 'text-green-400'}>
                    {round.failed ? 'Failed' : `${round.guessCount} guess${round.guessCount !== 1 ? 'es' : ''}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main game UI
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">
            Country {currentRoundIndex + 1} of {TOTAL_COUNTRIES}
          </h2>
          <p className="text-gray-400 text-sm">
            Guess {currentRound.guessCount + 1} of {MAX_GUESSES_PER_COUNTRY}
          </p>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Total Guesses</div>
          <div className="text-2xl font-bold text-gold">{totalGuesses}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Time</div>
          <ElapsedTimer startTime={startTime} className="text-xl" />
        </div>
      </div>

      {/* Progress indicators */}
      <div className="flex gap-2 mb-4 justify-center">
        {rounds.map((round, idx) => (
          <div
            key={idx}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              round.completed && !round.failed
                ? 'bg-green-500 text-white'
                : round.failed
                ? 'bg-red-500 text-white'
                : idx === currentRoundIndex
                ? 'bg-gold text-navy-900 ring-2 ring-gold ring-offset-2 ring-offset-navy-900'
                : 'bg-navy-700 text-gray-400'
            }`}
          >
            {round.completed ? (round.failed ? '✗' : '✓') : idx + 1}
          </div>
        ))}
      </div>

      {/* Hints section */}
      <div className="mb-4 p-4 bg-navy-800 rounded-xl border border-navy-600">
        <h3 className="text-gold font-semibold mb-3 flex items-center gap-2">
          <span className="text-lg">💡</span>
          Hints
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {targetCountry.hints.slice(0, HINTS_PER_COUNTRY).map((hint, index) => (
            <div
              key={index}
              className="p-3 rounded-lg bg-navy-700/50"
            >
              <div className="flex items-start gap-2">
                <span className="text-gold font-bold text-sm">#{index + 1}</span>
                <p className="text-gray-200 text-sm">{hint}</p>
              </div>
            </div>
          ))}
        </div>
        {currentRound.guessCount >= HINTS_PER_COUNTRY && (
          <p className="text-gray-500 text-xs mt-3 text-center">
            Use the colored feedback on the map to narrow down your search!
          </p>
        )}
      </div>

      {/* Interactive Map */}
      <CountryMap
        onCountrySelect={handleCountrySelect}
        guessHistory={currentRound.guessHistory}
        correctCountry={currentRound.completed ? targetCountry.id : null}
        disabled={currentRound.completed}
      />
      <p className="mt-2 text-sm text-gray-500 text-center">
        Click on a country to guess • Colors show how close you are
      </p>

      {/* Guess history for current country */}
      {currentRound.guessHistory.length > 0 && (
        <div className="mt-4">
          <p className="text-gray-500 text-sm mb-2">Your guesses:</p>
          <div className="flex flex-wrap gap-2">
            {currentRound.guessHistory.map((guess, idx) => (
              <span
                key={idx}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  guess.proximity === 'correct'
                    ? 'bg-green-500/30 text-green-400 border border-green-500'
                    : guess.proximity === 'neighbor'
                    ? 'bg-yellow-500/30 text-yellow-400 border border-yellow-500'
                    : guess.proximity === 'same_continent'
                    ? 'bg-orange-500/30 text-orange-400 border border-orange-500'
                    : 'bg-red-500/30 text-red-400 border border-red-500'
                }`}
              >
                {guess.countryName}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
