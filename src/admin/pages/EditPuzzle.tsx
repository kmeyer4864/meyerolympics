import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AdminLayout } from '../AdminLayout'
import { CountrySelector } from '../components/CountrySelector'
import { HintEditor } from '../components/HintEditor'
import { PuzzlePreview } from '../components/PuzzlePreview'
import { usePuzzles } from '../hooks/usePuzzles'
import type { GeodleDailyPuzzle, GeodlePuzzleCountry } from '@/lib/database.types'

type Tab = 'edit' | 'preview'

export function EditPuzzle() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { fetchPuzzle, updatePuzzle, deletePuzzle, publishPuzzle, archivePuzzle, isLoading, error } = usePuzzles()

  const [puzzle, setPuzzle] = useState<GeodleDailyPuzzle | null>(null)
  const [loadingPuzzle, setLoadingPuzzle] = useState(true)
  const [tab, setTab] = useState<Tab>('edit')

  // Form state
  const [title, setTitle] = useState('')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [playDate, setPlayDate] = useState('')
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [puzzleCountries, setPuzzleCountries] = useState<GeodlePuzzleCountry[]>([])
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (id) {
      loadPuzzle(id)
    }
  }, [id])

  const loadPuzzle = async (puzzleId: string) => {
    setLoadingPuzzle(true)
    const data = await fetchPuzzle(puzzleId)
    setLoadingPuzzle(false)

    if (data) {
      setPuzzle(data)
      setTitle(data.title || '')
      setDifficulty(data.difficulty)
      setPlayDate(data.play_date || '')
      setSelectedCountries(data.countries.map((c) => c.name))
      setPuzzleCountries(data.countries)
    }
  }

  const handleCountriesChange = (countries: string[]) => {
    setSelectedCountries(countries)
    setHasChanges(true)
  }

  const handlePuzzleCountriesChange = (countries: GeodlePuzzleCountry[]) => {
    setPuzzleCountries(countries)
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!id) return

    const updated = await updatePuzzle({
      id,
      title: title || undefined,
      countries: puzzleCountries,
      difficulty,
      playDate: playDate || null,
      status: playDate ? 'scheduled' : puzzle?.status,
    })

    if (updated) {
      setPuzzle(updated)
      setHasChanges(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    if (!confirm('Are you sure you want to delete this puzzle? This cannot be undone.')) return

    const success = await deletePuzzle(id)
    if (success) {
      navigate('/admin')
    }
  }

  const handlePublish = async () => {
    if (!id) return
    const updated = await publishPuzzle(id)
    if (updated) {
      setPuzzle(updated)
    }
  }

  const handleArchive = async () => {
    if (!id) return
    const updated = await archivePuzzle(id)
    if (updated) {
      setPuzzle(updated)
    }
  }

  const isValid =
    selectedCountries.length === 5 &&
    puzzleCountries.every((c) => c.hints.every((h) => h.trim().length > 0))

  if (loadingPuzzle) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FFD700]" />
        </div>
      </AdminLayout>
    )
  }

  if (!puzzle) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-white mb-2">Puzzle Not Found</h2>
          <p className="text-gray-400 mb-4">The puzzle you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 bg-[#FFD700] text-[#0a1628] font-semibold rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </AdminLayout>
    )
  }

  const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-gray-600 text-gray-200',
    scheduled: 'bg-blue-600 text-blue-100',
    published: 'bg-green-600 text-green-100',
    archived: 'bg-gray-500 text-gray-300',
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin')}
              className="text-gray-400 hover:text-white transition"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-white">
              {puzzle.title || 'Untitled Puzzle'}
            </h1>
            <span className={`px-2 py-1 text-xs rounded ${STATUS_COLORS[puzzle.status]}`}>
              {puzzle.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {puzzle.status === 'draft' && (
              <>
                <button
                  onClick={handlePublish}
                  disabled={!isValid || isLoading}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-500 disabled:opacity-50 transition"
                >
                  Publish
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="px-3 py-1 text-sm text-red-400 hover:text-red-300 transition"
                >
                  Delete
                </button>
              </>
            )}
            {puzzle.status === 'published' && (
              <button
                onClick={handleArchive}
                disabled={isLoading}
                className="px-3 py-1 text-sm text-yellow-400 hover:text-yellow-300 transition"
              >
                Archive
              </button>
            )}
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-700">
          <button
            onClick={() => setTab('edit')}
            className={`px-4 py-2 text-sm font-medium transition border-b-2 -mb-px ${
              tab === 'edit'
                ? 'text-[#FFD700] border-[#FFD700]'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setTab('preview')}
            className={`px-4 py-2 text-sm font-medium transition border-b-2 -mb-px ${
              tab === 'preview'
                ? 'text-[#FFD700] border-[#FFD700]'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            Preview
          </button>
        </div>

        {/* Content */}
        <div className="bg-[#0d1d33] border border-gray-700 rounded-lg p-6">
          {tab === 'edit' && (
            <div className="space-y-8">
              {/* Basic info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Puzzle Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value)
                      setHasChanges(true)
                    }}
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
                    onChange={(e) => {
                      setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')
                      setHasChanges(true)
                    }}
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
                  Play Date
                </label>
                <input
                  type="date"
                  value={playDate}
                  onChange={(e) => {
                    setPlayDate(e.target.value)
                    setHasChanges(true)
                  }}
                  className="w-full max-w-xs px-3 py-2 bg-[#0a1628] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#FFD700]"
                />
              </div>

              {/* Countries */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Countries</h3>
                <CountrySelector
                  selectedCountries={selectedCountries}
                  onSelect={handleCountriesChange}
                  maxCountries={5}
                />
              </div>

              {/* Hints */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Hints</h3>
                <HintEditor
                  countries={selectedCountries}
                  puzzleCountries={puzzleCountries}
                  onChange={handlePuzzleCountriesChange}
                />
              </div>
            </div>
          )}

          {tab === 'preview' && (
            <PuzzlePreview
              countries={puzzleCountries}
              title={title}
              difficulty={difficulty}
            />
          )}
        </div>

        {/* Save button */}
        {hasChanges && tab === 'edit' && (
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={!isValid || isLoading}
              className="px-6 py-2 bg-[#FFD700] text-[#0a1628] font-semibold rounded-lg hover:bg-[#FFD700]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* Stats */}
        {puzzle.times_played > 0 && (
          <div className="bg-[#0d1d33] border border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Statistics</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-white">{puzzle.times_played}</p>
                <p className="text-sm text-gray-500">Times Played</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {puzzle.avg_guesses?.toFixed(1) || '-'}
                </p>
                <p className="text-sm text-gray-500">Avg Guesses</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {puzzle.completion_rate ? `${(puzzle.completion_rate * 100).toFixed(0)}%` : '-'}
                </p>
                <p className="text-sm text-gray-500">Completion Rate</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
