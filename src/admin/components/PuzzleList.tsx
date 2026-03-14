import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePuzzles } from '../hooks/usePuzzles'
import type { GeodleDailyPuzzle } from '@/lib/database.types'

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-600 text-gray-200',
  scheduled: 'bg-blue-600 text-blue-100',
  published: 'bg-green-600 text-green-100',
  archived: 'bg-gray-500 text-gray-300',
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  published: 'Published',
  archived: 'Archived',
}

export function PuzzleList() {
  const [puzzles, setPuzzles] = useState<GeodleDailyPuzzle[]>([])
  const [filter, setFilter] = useState<string>('all')
  const { fetchPuzzles, deletePuzzle, publishPuzzle, archivePuzzle, duplicatePuzzle, isLoading, error } = usePuzzles()

  useEffect(() => {
    loadPuzzles()
  }, [])

  const loadPuzzles = async () => {
    const data = await fetchPuzzles()
    setPuzzles(data)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this puzzle?')) return
    const success = await deletePuzzle(id)
    if (success) {
      setPuzzles((prev) => prev.filter((p) => p.id !== id))
    }
  }

  const handlePublish = async (id: string) => {
    const updated = await publishPuzzle(id)
    if (updated) {
      setPuzzles((prev) => prev.map((p) => (p.id === id ? updated : p)))
    }
  }

  const handleArchive = async (id: string) => {
    const updated = await archivePuzzle(id)
    if (updated) {
      setPuzzles((prev) => prev.map((p) => (p.id === id ? updated : p)))
    }
  }

  const handleDuplicate = async (id: string) => {
    const newPuzzle = await duplicatePuzzle(id)
    if (newPuzzle) {
      setPuzzles((prev) => [newPuzzle, ...prev])
    }
  }

  const filteredPuzzles = puzzles.filter((p) => {
    if (filter === 'all') return true
    return p.status === filter
  })

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="bg-[#0d1d33] rounded-lg border border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-white">Puzzles</h2>
          <div className="flex gap-1">
            {['all', 'draft', 'scheduled', 'published', 'archived'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 text-sm rounded-lg transition ${
                  filter === status
                    ? 'bg-[#FFD700]/20 text-[#FFD700]'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {status === 'all' ? 'All' : STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>
        <Link
          to="/admin/puzzle/new"
          className="px-4 py-2 bg-[#FFD700] text-[#0a1628] font-semibold rounded-lg hover:bg-[#FFD700]/90 transition"
        >
          + New Puzzle
        </Link>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-900/50 text-red-200 border-b border-red-700">
          {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading && puzzles.length === 0 ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FFD700] mx-auto" />
        </div>
      ) : filteredPuzzles.length === 0 ? (
        <div className="p-8 text-center text-gray-400">
          {filter === 'all'
            ? 'No puzzles yet. Create your first puzzle to get started.'
            : `No ${STATUS_LABELS[filter] || filter} puzzles.`}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0a1628]">
              <tr className="text-left text-gray-400 text-sm">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Countries</th>
                <th className="px-4 py-3 font-medium">Difficulty</th>
                <th className="px-4 py-3 font-medium">Play Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Stats</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredPuzzles.map((puzzle) => (
                <tr key={puzzle.id} className="hover:bg-[#0a1628]/50">
                  <td className="px-4 py-3">
                    <Link
                      to={`/admin/puzzle/${puzzle.id}`}
                      className="text-white hover:text-[#FFD700] transition font-medium"
                    >
                      {puzzle.title || 'Untitled'}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    <div className="flex flex-wrap gap-1">
                      {puzzle.countries.slice(0, 3).map((country, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-gray-700 rounded text-xs"
                        >
                          {country.name}
                        </span>
                      ))}
                      {puzzle.countries.length > 3 && (
                        <span className="text-gray-500 text-xs">
                          +{puzzle.countries.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs capitalize ${
                        puzzle.difficulty === 'easy'
                          ? 'bg-green-900/50 text-green-300'
                          : puzzle.difficulty === 'hard'
                          ? 'bg-red-900/50 text-red-300'
                          : 'bg-yellow-900/50 text-yellow-300'
                      }`}
                    >
                      {puzzle.difficulty}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {formatDate(puzzle.play_date)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${STATUS_COLORS[puzzle.status]}`}
                    >
                      {STATUS_LABELS[puzzle.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm">
                    {puzzle.times_played > 0 ? (
                      <span>
                        {puzzle.times_played} plays
                        {puzzle.avg_guesses && ` · ${puzzle.avg_guesses.toFixed(1)} avg`}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/admin/puzzle/${puzzle.id}`}
                        className="px-2 py-1 text-xs text-gray-400 hover:text-white transition"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDuplicate(puzzle.id)}
                        className="px-2 py-1 text-xs text-gray-400 hover:text-white transition"
                      >
                        Duplicate
                      </button>
                      {puzzle.status === 'draft' && (
                        <button
                          onClick={() => handlePublish(puzzle.id)}
                          className="px-2 py-1 text-xs text-green-400 hover:text-green-300 transition"
                        >
                          Publish
                        </button>
                      )}
                      {puzzle.status === 'published' && (
                        <button
                          onClick={() => handleArchive(puzzle.id)}
                          className="px-2 py-1 text-xs text-yellow-400 hover:text-yellow-300 transition"
                        >
                          Archive
                        </button>
                      )}
                      {puzzle.status === 'draft' && (
                        <button
                          onClick={() => handleDelete(puzzle.id)}
                          className="px-2 py-1 text-xs text-red-400 hover:text-red-300 transition"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
