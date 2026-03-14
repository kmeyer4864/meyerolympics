import { useState, useEffect } from 'react'
import { generateHints, getHintByType } from '@/events/geodle/hintGenerator'
import type { GeodlePuzzleCountry } from '@/lib/database.types'
import { AiHintSuggestions } from './AiHintSuggestions'

interface HintEditorProps {
  countries: string[]
  puzzleCountries: GeodlePuzzleCountry[]
  onChange: (countries: GeodlePuzzleCountry[]) => void
}

// Available hint types
const HINT_TYPES = [
  { id: 'calling_code', label: 'Calling Code', difficulty: 'hard' },
  { id: 'life_expectancy', label: 'Life Expectancy', difficulty: 'hard' },
  { id: 'driving_side', label: 'Driving Side', difficulty: 'hard' },
  { id: 'surface_area', label: 'Surface Area', difficulty: 'medium' },
  { id: 'landlocked', label: 'Landlocked', difficulty: 'medium' },
  { id: 'currency', label: 'Currency', difficulty: 'medium' },
  { id: 'population', label: 'Population', difficulty: 'medium' },
  { id: 'languages', label: 'Languages', difficulty: 'easy' },
  { id: 'continent', label: 'Continent', difficulty: 'easy' },
  { id: 'capital', label: 'Capital', difficulty: 'easy' },
]

export function HintEditor({ countries, puzzleCountries, onChange }: HintEditorProps) {
  const [activeCountry, setActiveCountry] = useState<string | null>(
    countries.length > 0 ? countries[0] : null
  )

  // Initialize hints for any new countries
  useEffect(() => {
    const existingNames = new Set(puzzleCountries.map((c) => c.name))
    const newCountries = countries.filter((name) => !existingNames.has(name))

    if (newCountries.length > 0) {
      const updatedCountries = [...puzzleCountries]

      for (const name of newCountries) {
        const hints = generateHints(name, 4)
        updatedCountries.push({
          name,
          hints: [hints[0] || '', hints[1] || '', hints[2] || '', hints[3] || ''],
        })
      }

      // Remove countries that are no longer selected
      const filtered = updatedCountries.filter((c) => countries.includes(c.name))

      // Sort to match selected order
      filtered.sort((a, b) => countries.indexOf(a.name) - countries.indexOf(b.name))

      onChange(filtered)
    } else {
      // Just filter out removed countries and reorder
      const filtered = puzzleCountries
        .filter((c) => countries.includes(c.name))
        .sort((a, b) => countries.indexOf(a.name) - countries.indexOf(b.name))

      if (
        filtered.length !== puzzleCountries.length ||
        !filtered.every((c, i) => puzzleCountries[i]?.name === c.name)
      ) {
        onChange(filtered)
      }
    }

    // Update active country if needed
    if (activeCountry && !countries.includes(activeCountry)) {
      setActiveCountry(countries[0] || null)
    }
  }, [countries])

  const handleHintChange = (countryName: string, hintIndex: number, value: string) => {
    const updated = puzzleCountries.map((c) => {
      if (c.name !== countryName) return c
      const newHints = [...c.hints] as [string, string, string, string]
      newHints[hintIndex] = value
      return { ...c, hints: newHints }
    })
    onChange(updated)
  }

  const handleAutoGenerate = (countryName: string, hintIndex: number, hintType: string) => {
    const hint = getHintByType(countryName, hintType)
    if (hint) {
      handleHintChange(countryName, hintIndex, hint)
    }
  }

  const handleAutoGenerateAll = (countryName: string) => {
    const hints = generateHints(countryName, 4)
    const updated = puzzleCountries.map((c) => {
      if (c.name !== countryName) return c
      return {
        ...c,
        hints: [hints[0] || '', hints[1] || '', hints[2] || '', hints[3] || ''] as [
          string,
          string,
          string,
          string,
        ],
      }
    })
    onChange(updated)
  }

  const handleApplyAiHints = (countryName: string, hints: [string, string, string, string]) => {
    const updated = puzzleCountries.map((c) => {
      if (c.name !== countryName) return c
      return { ...c, hints }
    })
    onChange(updated)
  }

  const activeCountryData = puzzleCountries.find((c) => c.name === activeCountry)

  if (countries.length === 0) {
    return (
      <div className="p-4 border border-dashed border-gray-600 rounded-lg text-center text-gray-500">
        Select countries first to edit their hints
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Country tabs */}
      <div className="flex flex-wrap gap-2">
        {countries.map((name, index) => {
          const countryData = puzzleCountries.find((c) => c.name === name)
          const hasAllHints = countryData?.hints.every((h) => h.trim().length > 0)

          return (
            <button
              key={name}
              onClick={() => setActiveCountry(name)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                activeCountry === name
                  ? 'bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]'
                  : 'bg-[#0a1628] text-gray-300 border border-gray-700 hover:border-gray-500'
              }`}
            >
              <span className="font-bold">{index + 1}.</span>
              <span>{name}</span>
              {hasAllHints ? (
                <span className="text-green-400">✓</span>
              ) : (
                <span className="text-yellow-400">!</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Hint editor for active country */}
      {activeCountry && activeCountryData && (
        <div className="bg-[#0a1628] border border-gray-700 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">{activeCountry}</h3>
            <button
              onClick={() => handleAutoGenerateAll(activeCountry)}
              className="px-3 py-1 text-sm bg-[#FFD700]/10 text-[#FFD700] rounded hover:bg-[#FFD700]/20 transition"
            >
              Auto-Generate All
            </button>
          </div>

          <p className="text-sm text-gray-400">
            Hints are revealed one at a time, from hardest (1) to easiest (4).
          </p>

          <div className="space-y-4">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">
                    Hint {index + 1}{' '}
                    <span className="text-gray-500">
                      ({index === 0 ? 'hardest' : index === 3 ? 'easiest' : 'medium'})
                    </span>
                  </label>
                  <div className="flex gap-1">
                    {HINT_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => handleAutoGenerate(activeCountry, index, type.id)}
                        title={type.label}
                        className={`px-2 py-1 text-xs rounded transition ${
                          type.difficulty === 'hard'
                            ? 'bg-red-900/30 text-red-300 hover:bg-red-900/50'
                            : type.difficulty === 'easy'
                            ? 'bg-green-900/30 text-green-300 hover:bg-green-900/50'
                            : 'bg-yellow-900/30 text-yellow-300 hover:bg-yellow-900/50'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={activeCountryData.hints[index]}
                  onChange={(e) => handleHintChange(activeCountry, index, e.target.value)}
                  placeholder={`Enter hint ${index + 1}...`}
                  rows={2}
                  className="w-full px-3 py-2 bg-[#0d1d33] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700] resize-none"
                />
              </div>
            ))}
          </div>

          {/* AI Hint Suggestions */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <AiHintSuggestions
              countryName={activeCountry}
              onApplyHints={(hints) => handleApplyAiHints(activeCountry, hints)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
