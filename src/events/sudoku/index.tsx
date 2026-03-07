import type { OlympicsEvent, MatchResult } from '../types'
import { tieBreakByTime } from '../types'
import SudokuGame from './SudokuGame'
import { getRandomPuzzle, type Difficulty } from './puzzles'

export const sudokuEvent: OlympicsEvent = {
  id: 'sudoku',
  name: 'Sudoku',
  description: 'Race to complete a Sudoku puzzle. Fastest time wins!',
  icon: '9️⃣',
  estimatedMinutes: 10,
  supportsAsync: true,
  supportsRealtime: true,
  winCondition: 'fastest_time',
  rules: [
    'Complete the 9x9 Sudoku grid',
    'Each row, column, and 3x3 box must contain digits 1-9',
    'No repeating numbers in any row, column, or box',
    'Fastest correct completion wins the gold medal',
    'Both players receive the same puzzle',
  ],

  compareResults(r1: MatchResult, r2: MatchResult): 'p1' | 'p2' | 'tie' {
    // For fastest_time, lower rawValue (time in ms) is better
    if (r1.rawValue < r2.rawValue) return 'p1'
    if (r2.rawValue < r1.rawValue) return 'p2'
    // If same time, tie-break by who completed first
    return tieBreakByTime(r1, r2)
  },

  formatScore(result: MatchResult): string {
    const totalSeconds = Math.floor(result.rawValue / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  },

  generatePuzzleMetadata(): Record<string, unknown> {
    // Default to medium difficulty, but could be configurable
    const difficulty: Difficulty = 'medium'
    const puzzle = getRandomPuzzle(difficulty)
    return {
      puzzleId: puzzle.id,
      difficulty,
    }
  },

  Component: SudokuGame,
}
