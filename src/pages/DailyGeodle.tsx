import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getTodaysPuzzle } from '@/events/geodle/dailyPuzzle'
import { getRandomGameCountries } from '@/events/geodle/countryData'
import { getVariedHintTypesForCountries, generateHints } from '@/events/geodle/hintGenerator'
import { getProximity } from '@/events/geodle/countryRelations'
import CountryMap, { type GuessResult } from '@/events/geodle/CountryMap'
import { ElapsedTimer } from '@/components/shared/CountdownTimer'
import type { GeodleCountry } from '@/events/geodle/countryData'

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

export default function DailyGeodle() {
  const [rounds, setRounds] = useState<CountryRound[]>([])
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [showingTransition, setShowingTransition] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)
  const [puzzleTitle, setPuzzleTitle] = useState<string | null>(null)
  const [isDaily, setIsDaily] = useState(false)

  // Load puzzle on mount
  useEffect(() => {
    loadPuzzle()
  }, [])

  const loadPuzzle = async () => {
    setIsLoading(true)

    // Try to get today's curated puzzle
    const { puzzle, countries: curatedCountries } = await getTodaysPuzzle()

    let loadedRounds: CountryRound[] = []

    if (puzzle && curatedCountries.length === TOTAL_COUNTRIES) {
      // Use curated daily puzzle
      setPuzzleTitle(puzzle.title)
      setIsDaily(true)
      loadedRounds = curatedCountries.map((country) => ({
        country,
        guessHistory: [],
        guessCount: 0,
        completed: false,
        failed: false,
      }))
    } else {
      // Fall back to random puzzle
      setIsDaily(false)
      const randomCountries = getRandomGameCountries(TOTAL_COUNTRIES)
      const hintTypes = getVariedHintTypesForCountries(
        randomCountries.map((c) => c.name),
        HINTS_PER_COUNTRY
      )

      loadedRounds = randomCountries.map((country, idx) => {
        const hints = generateHints(country.name, HINTS_PER_COUNTRY, hintTypes[idx]?.hintTypes)
        return {
          country: { ...country, hints },
          guessHistory: [],
          guessCount: 0,
          completed: false,
          failed: false,
        }
      })
    }

    setRounds(loadedRounds)
    setStartTime(new Date())
    setIsLoading(false)
  }

  const currentRound = rounds[currentRoundIndex]
  const targetCountry = currentRound?.country

  const totalGuesses = rounds.reduce((sum, round) => sum + round.guessCount, 0)

  const handleCountrySelect = useCallback(
    (guessedCountryId: string, guessedCountryName: string) => {
      if (!targetCountry || showingTransition || gameComplete) return

      const proximity = getProximity(guessedCountryName, targetCountry.name)
      const isCorrect = proximity === 'correct'

      const guessResult: GuessResult = {
        countryId: guessedCountryId,
        countryName: guessedCountryName,
        proximity,
      }

      setRounds((prevRounds) => {
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

      if (isCorrect || rounds[currentRoundIndex].guessCount + 1 >= MAX_GUESSES_PER_COUNTRY) {
        setShowingTransition(true)

        setTimeout(() => {
          if (currentRoundIndex + 1 >= TOTAL_COUNTRIES) {
            setGameComplete(true)
          } else {
            setCurrentRoundIndex((prev) => prev + 1)
            setShowingTransition(false)
          }
        }, 2000)
      }
    },
    [targetCountry, showingTransition, gameComplete, currentRoundIndex, rounds]
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFD700]" />
      </div>
    )
  }

  const successfulRounds = rounds.filter((r) => !r.failed).length

  return (
    <div className="min-h-screen bg-[#0a1628]">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-800">
        <Link to="/" className="text-gray-400 hover:text-white transition">
          &larr; Home
        </Link>
        <div className="text-center">
          <h1 className="text-xl font-bold text-[#FFD700]">
            {isDaily ? 'Daily Geodle' : 'Practice Geodle'}
          </h1>
          {puzzleTitle && <p className="text-sm text-gray-400">{puzzleTitle}</p>}
        </div>
        <div className="w-16" /> {/* Spacer for centering */}
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Game complete */}
        {gameComplete ? (
          <div className="p-8 rounded-xl border bg-[#0d1d33] border-gray-700 animate-fade-in">
            <div className="text-center">
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-[#FFD700] mb-4">
                {isDaily ? 'Daily Challenge Complete!' : 'Game Complete!'}
              </h3>
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-6">
                <div className="bg-[#0a1628] rounded-lg p-4">
                  <div className="text-3xl font-bold text-[#FFD700]">{totalGuesses}</div>
                  <div className="text-gray-400 text-sm">Total Guesses</div>
                </div>
                <div className="bg-[#0a1628] rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-400">
                    {successfulRounds}/{TOTAL_COUNTRIES}
                  </div>
                  <div className="text-gray-400 text-sm">Countries Found</div>
                </div>
              </div>
              <div className="space-y-2 mb-6">
                {rounds.map((round, idx) => (
                  <div
                    key={idx}
                    className={`flex justify-between items-center p-2 rounded ${
                      round.failed ? 'bg-red-900/30' : 'bg-green-900/30'
                    }`}
                  >
                    <span className="text-gray-300">{round.country.name}</span>
                    <span className={round.failed ? 'text-red-400' : 'text-green-400'}>
                      {round.failed
                        ? 'Failed'
                        : `${round.guessCount} guess${round.guessCount !== 1 ? 'es' : ''}`}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                to="/"
                className="inline-block px-6 py-3 bg-[#FFD700] text-[#0a1628] font-bold rounded-lg hover:bg-[#FFD700]/90 transition"
              >
                Back to Home
              </Link>
            </div>
          </div>
        ) : showingTransition && currentRound ? (
          /* Transition screen */
          <div
            className={`p-8 rounded-xl border animate-fade-in ${
              currentRound.guessHistory.some((g) => g.proximity === 'correct')
                ? 'bg-green-900/30 border-green-600'
                : 'bg-red-900/30 border-red-600'
            }`}
          >
            <div className="text-center">
              <div className="text-5xl mb-4">
                {currentRound.guessHistory.some((g) => g.proximity === 'correct') ? '🎉' : '😔'}
              </div>
              <h3
                className={`text-2xl font-bold mb-2 ${
                  currentRound.guessHistory.some((g) => g.proximity === 'correct')
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}
              >
                {currentRound.guessHistory.some((g) => g.proximity === 'correct')
                  ? 'Correct!'
                  : 'Out of Guesses'}
              </h3>
              <p className="text-gray-300 mb-2">
                The country was{' '}
                <span className="text-[#FFD700] font-bold">{targetCountry?.name}</span>
              </p>
              <div className="mt-4 text-gray-500">
                <p>
                  Moving to country {currentRoundIndex + 2} of {TOTAL_COUNTRIES}...
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Main game UI */
          <>
            {/* Stats bar */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Country {currentRoundIndex + 1} of {TOTAL_COUNTRIES}
                </h2>
                <p className="text-gray-400 text-sm">
                  Guess {(currentRound?.guessCount || 0) + 1} of {MAX_GUESSES_PER_COUNTRY}
                </p>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Total Guesses</div>
                <div className="text-2xl font-bold text-[#FFD700]">{totalGuesses}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Time</div>
                {startTime && <ElapsedTimer startTime={startTime} className="text-xl" />}
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
                      ? 'bg-[#FFD700] text-[#0a1628] ring-2 ring-[#FFD700] ring-offset-2 ring-offset-[#0a1628]'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {round.completed ? (round.failed ? '✗' : '✓') : idx + 1}
                </div>
              ))}
            </div>

            {/* Hints */}
            {targetCountry && (
              <div className="mb-4 p-4 bg-[#0d1d33] rounded-xl border border-gray-700">
                <h3 className="text-[#FFD700] font-semibold mb-3 flex items-center gap-2">
                  <span className="text-lg">💡</span>
                  Hints
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {targetCountry.hints.slice(0, HINTS_PER_COUNTRY).map((hint, index) => (
                    <div key={index} className="p-3 rounded-lg bg-[#0a1628]">
                      <div className="flex items-start gap-2">
                        <span className="text-[#FFD700] font-bold text-sm">#{index + 1}</span>
                        <p className="text-gray-200 text-sm">{hint}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            <CountryMap
              onCountrySelect={handleCountrySelect}
              guessHistory={currentRound?.guessHistory || []}
              correctCountry={currentRound?.completed ? targetCountry?.id || null : null}
              disabled={currentRound?.completed || false}
            />
            <p className="mt-2 text-sm text-gray-500 text-center">
              Click on a country to guess
            </p>

            {/* Guess history */}
            {currentRound && currentRound.guessHistory.length > 0 && (
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
          </>
        )}
      </main>
    </div>
  )
}
