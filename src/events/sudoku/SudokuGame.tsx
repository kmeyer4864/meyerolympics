import { useState, useEffect, useCallback, useMemo } from 'react'
import type { EventComponentProps, MatchResult } from '../types'
import { getPuzzleById, isValidMove, isGridComplete, validateGrid } from './puzzles'
import { ElapsedTimer, useElapsedTime } from '@/components/shared/CountdownTimer'

interface CellProps {
  value: number
  isOriginal: boolean
  isSelected: boolean
  isHighlighted: boolean
  isError: boolean
  isSameValue: boolean
  onClick: () => void
}

function Cell({
  value,
  isOriginal,
  isSelected,
  isHighlighted,
  isError,
  isSameValue,
  onClick,
}: CellProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-lg md:text-xl font-semibold
        border border-navy-600 transition-all
        ${isSelected
          ? 'bg-gold/30 border-gold'
          : isHighlighted
            ? 'bg-navy-700'
            : 'bg-navy-900'
        }
        ${isError ? 'text-red-400' : isOriginal ? 'text-white' : 'text-gold'}
        ${isSameValue && !isSelected ? 'bg-gold/10' : ''}
        hover:bg-navy-700
      `}
    >
      {value !== 0 ? value : ''}
    </button>
  )
}

export default function SudokuGame({
  puzzleMetadata,
  onComplete,
}: EventComponentProps) {
  // Get puzzle from metadata
  const puzzleId = puzzleMetadata?.puzzleId as string | undefined
  const puzzle = useMemo(() => {
    if (!puzzleId) return null
    return getPuzzleById(puzzleId)
  }, [puzzleId])

  // Game state
  const [grid, setGrid] = useState<number[][]>([])
  const [originalCells, setOriginalCells] = useState<boolean[][]>([])
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null)
  const [startTime] = useState<Date>(new Date())
  const [isComplete, setIsComplete] = useState(false)
  const [errors, setErrors] = useState<Set<string>>(new Set())

  const elapsedMs = useElapsedTime(startTime)

  // Initialize grid from puzzle
  useEffect(() => {
    if (puzzle) {
      const newGrid = puzzle.grid.map(row => [...row])
      setGrid(newGrid)
      setOriginalCells(puzzle.grid.map(row => row.map(cell => cell !== 0)))
    }
  }, [puzzle])

  // Check for errors in the current grid
  const updateErrors = useCallback((currentGrid: number[][]) => {
    const newErrors = new Set<string>()

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const value = currentGrid[row][col]
        if (value !== 0) {
          // Temporarily set to 0 to check if it's valid
          currentGrid[row][col] = 0
          if (!isValidMove(currentGrid, row, col, value)) {
            newErrors.add(`${row}-${col}`)
          }
          currentGrid[row][col] = value
        }
      }
    }

    setErrors(newErrors)
  }, [])

  // Handle cell selection
  const handleCellClick = (row: number, col: number) => {
    if (isComplete) return
    setSelectedCell([row, col])
  }

  // Handle number input
  const handleNumberInput = useCallback((num: number) => {
    if (isComplete || !selectedCell) return
    const [row, col] = selectedCell

    // Can't modify original cells
    if (originalCells[row][col]) return

    const newGrid = grid.map(r => [...r])
    newGrid[row][col] = num
    setGrid(newGrid)
    updateErrors(newGrid)

    // Check if complete
    if (isGridComplete(newGrid) && puzzle && validateGrid(newGrid, puzzle.solution)) {
      setIsComplete(true)

      const completedAt = new Date().toISOString()
      const timeMs = Date.now() - startTime.getTime()

      const result: MatchResult = {
        score: Math.max(0, 100 - Math.floor(timeMs / 60000)), // Lose 1 point per minute
        rawValue: timeMs,
        completedAt,
        metadata: {
          puzzleId,
          moveCount: 0, // Could track this
        },
      }

      onComplete(result)
    }
  }, [grid, selectedCell, originalCells, isComplete, puzzle, puzzleId, startTime, onComplete, updateErrors])

  // Handle clear
  const handleClear = useCallback(() => {
    if (isComplete || !selectedCell) return
    const [row, col] = selectedCell

    if (originalCells[row][col]) return

    const newGrid = grid.map(r => [...r])
    newGrid[row][col] = 0
    setGrid(newGrid)
    updateErrors(newGrid)
  }, [grid, selectedCell, originalCells, isComplete, updateErrors])

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '9') {
        handleNumberInput(parseInt(e.key))
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        handleClear()
      } else if (e.key === 'ArrowUp' && selectedCell) {
        setSelectedCell([Math.max(0, selectedCell[0] - 1), selectedCell[1]])
      } else if (e.key === 'ArrowDown' && selectedCell) {
        setSelectedCell([Math.min(8, selectedCell[0] + 1), selectedCell[1]])
      } else if (e.key === 'ArrowLeft' && selectedCell) {
        setSelectedCell([selectedCell[0], Math.max(0, selectedCell[1] - 1)])
      } else if (e.key === 'ArrowRight' && selectedCell) {
        setSelectedCell([selectedCell[0], Math.min(8, selectedCell[1] + 1)])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNumberInput, handleClear, selectedCell])

  // Loading state
  if (!puzzle || grid.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    )
  }

  const selectedValue = selectedCell ? grid[selectedCell[0]][selectedCell[1]] : null

  return (
    <div className="flex flex-col items-center">
      {/* Timer */}
      <div className="mb-6 text-center">
        <div className="text-sm text-gray-400 mb-1">Time</div>
        <ElapsedTimer startTime={startTime} className="text-3xl" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-9 gap-0 border-2 border-gold rounded-lg overflow-hidden">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isSelected =
              selectedCell?.[0] === rowIndex && selectedCell?.[1] === colIndex
            const isHighlighted =
              selectedCell !== null &&
              (selectedCell[0] === rowIndex ||
                selectedCell[1] === colIndex ||
                (Math.floor(selectedCell[0] / 3) === Math.floor(rowIndex / 3) &&
                  Math.floor(selectedCell[1] / 3) === Math.floor(colIndex / 3)))
            const isSameValue =
              selectedValue !== null && selectedValue !== 0 && cell === selectedValue
            const isError = errors.has(`${rowIndex}-${colIndex}`)

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`
                  ${colIndex === 2 || colIndex === 5 ? 'border-r-2 border-gold' : ''}
                  ${rowIndex === 2 || rowIndex === 5 ? 'border-b-2 border-gold' : ''}
                `}
              >
                <Cell
                  value={cell}
                  isOriginal={originalCells[rowIndex][colIndex]}
                  isSelected={isSelected}
                  isHighlighted={isHighlighted && !isSelected}
                  isError={isError}
                  isSameValue={isSameValue}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                />
              </div>
            )
          })
        )}
      </div>

      {/* Number pad */}
      <div className="mt-6 grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            onClick={() => handleNumberInput(num)}
            disabled={isComplete}
            className="w-12 h-12 bg-navy-800 text-white font-bold text-xl rounded-lg hover:bg-navy-700 disabled:opacity-50 transition-colors"
          >
            {num}
          </button>
        ))}
        <button
          onClick={handleClear}
          disabled={isComplete}
          className="w-12 h-12 bg-navy-800 text-red-400 font-bold text-xl rounded-lg hover:bg-navy-700 disabled:opacity-50 transition-colors"
        >
          X
        </button>
      </div>

      {/* Instructions */}
      <p className="mt-6 text-sm text-gray-500 text-center max-w-sm">
        Click a cell and enter a number. Use arrow keys to navigate.
        Press Backspace or 0 to clear a cell.
      </p>

      {/* Complete message */}
      {isComplete && (
        <div className="mt-6 p-4 bg-green-900/50 text-green-300 rounded-lg text-center animate-fade-in">
          <div className="text-2xl mb-2">Puzzle Complete!</div>
          <div className="text-lg">
            Time: {Math.floor(elapsedMs / 60000)}:
            {String(Math.floor((elapsedMs % 60000) / 1000)).padStart(2, '0')}
          </div>
        </div>
      )}
    </div>
  )
}
