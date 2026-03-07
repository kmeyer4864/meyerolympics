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

  // Difficulty selection
  configOptions: [
    {
      optionId: 'difficulty',
      optionLabel: 'Difficulty',
      options: [
        { id: 'easy', label: 'Easy', description: '45 clues - great for beginners' },
        { id: 'medium', label: 'Medium', description: '40 clues - balanced challenge' },
        { id: 'hard', label: 'Hard', description: '35 clues - for experts' },
      ],
      defaultValue: 'medium',
    },
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

  generatePuzzleMetadata(options?: Record<string, string>): Record<string, unknown> {
    const difficulty: Difficulty = (options?.difficulty as Difficulty) || 'medium'
    const puzzle = getRandomPuzzle(difficulty)
    return {
      puzzleId: puzzle.id,
      difficulty,
    }
  },

  Component: SudokuGame,
}
