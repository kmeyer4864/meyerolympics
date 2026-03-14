import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '../AdminLayout'
import { CountrySelector } from '../components/CountrySelector'
import { HintEditor } from '../components/HintEditor'
import { PuzzlePreview } from '../components/PuzzlePreview'
import { usePuzzles } from '../hooks/usePuzzles'
import type { GeodlePuzzleCountry } from '@/lib/database.types'

type Step = 'countries' | 'hints' | 'preview'

export function CreatePuzzle() {
  const navigate = useNavigate()
  const { createPuzzle, isLoading, error } = usePuzzles()

  const [step, setStep] = useState<Step>('countries')
  const [title, setTitle] = useState('')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [playDate, setPlayDate] = useState('')
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [puzzleCountries, setPuzzleCountries] = useState<GeodlePuzzleCountry[]>([])

  const isCountriesValid = selectedCountries.length === 5
  const isHintsValid = puzzleCountries.every(
    (c) => c.hints.every((h) => h.trim().length > 0)
  )

  const handleNext = () => {
    if (step === 'countries' && isCountriesValid) {
      setStep('hints')
    } else if (step === 'hints' && isHintsValid) {
      setStep('preview')
    }
  }

  const handleBack = () => {
    if (step === 'hints') {
      setStep('countries')
    } else if (step === 'preview') {
      setStep('hints')
    }
  }

  const handleSaveDraft = async () => {
    const puzzle = await createPuzzle({
      title: title || undefined,
      countries: puzzleCountries,
      difficulty,
    })

    if (puzzle) {
      navigate(`/admin/puzzle/${puzzle.id}`)
    }
  }

  const handleSchedule = async () => {
    if (!playDate) return

    const puzzle = await createPuzzle({
      title: title || undefined,
      countries: puzzleCountries,
      difficulty,
      playDate,
    })

    if (puzzle) {
      navigate('/admin')
    }
  }

  const steps: { id: Step; label: string; number: number }[] = [
    { id: 'countries', label: 'Select Countries', number: 1 },
    { id: 'hints', label: 'Edit Hints', number: 2 },
    { id: 'preview', label: 'Review & Save', number: 3 },
  ]

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Create New Puzzle</h1>
          <button
            onClick={() => navigate('/admin')}
            className="text-gray-400 hover:text-white transition"
          >
            Cancel
          </button>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-4">
          {steps.map((s, index) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition ${
                  step === s.id
                    ? 'bg-[#FFD700] text-[#0a1628]'
                    : steps.findIndex((x) => x.id === step) > index
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {steps.findIndex((x) => x.id === step) > index ? '✓' : s.number}
              </div>
              <span
                className={`text-sm ${
                  step === s.id ? 'text-white font-medium' : 'text-gray-500'
                }`}
              >
                {s.label}
              </span>
              {index < steps.length - 1 && (
                <div className="w-8 h-px bg-gray-700 ml-2" />
              )}
            </div>
          ))}
        </div>

        {/* Error display */}
        {error && (
          <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Step content */}
        <div className="bg-[#0d1d33] border border-gray-700 rounded-lg p-6">
          {step === 'countries' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">
                  Select 5 Countries
                </h2>
                <p className="text-gray-400 text-sm">
                  Choose 5 countries for this puzzle. The order determines the sequence
                  players will guess them.
                </p>
              </div>

              <CountrySelector
                selectedCountries={selectedCountries}
                onSelect={setSelectedCountries}
                maxCountries={5}
              />
            </div>
          )}

          {step === 'hints' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">Edit Hints</h2>
                <p className="text-gray-400 text-sm">
                  Each country needs 4 hints. Click the buttons to auto-generate hints
                  from data, or write your own.
                </p>
              </div>

              <HintEditor
                countries={selectedCountries}
                puzzleCountries={puzzleCountries}
                onChange={setPuzzleCountries}
              />
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">
                  Review & Save
                </h2>
                <p className="text-gray-400 text-sm">
                  Preview the puzzle as players will see it, then save as draft or
                  schedule for a specific date.
                </p>
              </div>

              {/* Puzzle details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Puzzle Title (optional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., European Capitals"
                    className="w-full px-3 py-2 bg-[#0a1628] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) =>
                      setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')
                    }
                    className="w-full px-3 py-2 bg-[#0a1628] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#FFD700]"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Schedule for Date (optional)
                </label>
                <input
                  type="date"
                  value={playDate}
                  onChange={(e) => setPlayDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 bg-[#0a1628] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#FFD700]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to save as draft
                </p>
              </div>

              {/* Preview */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Preview</h3>
                <PuzzlePreview
                  countries={puzzleCountries}
                  title={title}
                  difficulty={difficulty}
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <div>
            {step !== 'countries' && (
              <button
                onClick={handleBack}
                className="px-4 py-2 text-gray-400 hover:text-white transition"
              >
                ← Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {step === 'preview' && (
              <>
                <button
                  onClick={handleSaveDraft}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save as Draft'}
                </button>
                <button
                  onClick={handleSchedule}
                  disabled={isLoading || !playDate}
                  className="px-4 py-2 bg-[#FFD700] text-[#0a1628] font-semibold rounded-lg hover:bg-[#FFD700]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving...' : 'Schedule Puzzle'}
                </button>
              </>
            )}

            {step !== 'preview' && (
              <button
                onClick={handleNext}
                disabled={
                  (step === 'countries' && !isCountriesValid) ||
                  (step === 'hints' && !isHintsValid)
                }
                className="px-6 py-2 bg-[#FFD700] text-[#0a1628] font-semibold rounded-lg hover:bg-[#FFD700]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
