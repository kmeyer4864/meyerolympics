import { useState } from 'react'
import type { GeodlePuzzleCountry } from '@/lib/database.types'

interface PuzzlePreviewProps {
  countries: GeodlePuzzleCountry[]
  title?: string
  difficulty?: string
}

export function PuzzlePreview({ countries, title, difficulty }: PuzzlePreviewProps) {
  const [currentCountryIndex, setCurrentCountryIndex] = useState(0)
  const [revealedHints, setRevealedHints] = useState(1)

  const currentCountry = countries[currentCountryIndex]

  const handleRevealNext = () => {
    if (revealedHints < 4) {
      setRevealedHints(revealedHints + 1)
    }
  }

  const handleNextCountry = () => {
    if (currentCountryIndex < countries.length - 1) {
      setCurrentCountryIndex(currentCountryIndex + 1)
      setRevealedHints(1)
    }
  }

  const handlePrevCountry = () => {
    if (currentCountryIndex > 0) {
      setCurrentCountryIndex(currentCountryIndex - 1)
      setRevealedHints(1)
    }
  }

  const handleReset = () => {
    setCurrentCountryIndex(0)
    setRevealedHints(1)
  }

  if (countries.length === 0) {
    return (
      <div className="p-8 border border-dashed border-gray-600 rounded-lg text-center text-gray-500">
        Select countries and add hints to preview the puzzle
      </div>
    )
  }

  return (
    <div className="bg-[#0a1628] border border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-[#0d1d33] border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold">
            {title || 'Puzzle Preview'}
          </h3>
          <p className="text-sm text-gray-400">
            {difficulty && <span className="capitalize">{difficulty}</span>}
            {difficulty && ' · '}
            {countries.length} countries
          </p>
        </div>
        <button
          onClick={handleReset}
          className="px-3 py-1 text-sm text-gray-400 hover:text-white border border-gray-600 rounded hover:border-gray-500 transition"
        >
          Reset
        </button>
      </div>

      {/* Country indicator */}
      <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {countries.map((_, index) => (
            <div
              key={index}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
                index === currentCountryIndex
                  ? 'bg-[#FFD700] text-[#0a1628]'
                  : index < currentCountryIndex
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              {index + 1}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevCountry}
            disabled={currentCountryIndex === 0}
            className="p-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ←
          </button>
          <button
            onClick={handleNextCountry}
            disabled={currentCountryIndex === countries.length - 1}
            className="p-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            →
          </button>
        </div>
      </div>

      {/* Hints display */}
      {currentCountry && (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">
              Hint {revealedHints} of 4
            </span>
            {revealedHints < 4 && (
              <button
                onClick={handleRevealNext}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-500 transition"
              >
                Reveal Next Hint
              </button>
            )}
          </div>

          <div className="space-y-3">
            {[0, 1, 2, 3].map((index) => {
              const isRevealed = index < revealedHints
              const hint = currentCountry.hints[index]

              return (
                <div
                  key={index}
                  className={`p-3 rounded-lg border transition ${
                    isRevealed
                      ? 'bg-[#0d1d33] border-gray-600 text-white'
                      : 'bg-gray-800/50 border-gray-700 text-gray-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`text-sm font-bold ${
                        isRevealed ? 'text-[#FFD700]' : 'text-gray-600'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <p className={isRevealed ? '' : 'blur-sm select-none'}>
                      {hint || <span className="italic text-gray-500">No hint provided</span>}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Answer reveal */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <details className="group">
              <summary className="cursor-pointer text-gray-400 hover:text-white transition">
                Show Answer
              </summary>
              <div className="mt-2 p-3 bg-green-900/30 border border-green-700 rounded-lg">
                <p className="text-green-300 font-semibold">{currentCountry.name}</p>
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  )
}
