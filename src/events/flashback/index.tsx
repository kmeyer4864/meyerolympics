import type { OlympicsEvent, MatchResult } from '../types'
import FlashbackGame from './FlashbackGame'
import { getRandomPuzzle } from './puzzleData'

export const flashbackEvent: OlympicsEvent = {
  id: 'flashback',
  name: 'Flashback',
  description: 'Place historical events in the correct order on a timeline!',
  icon: '📅',
  estimatedMinutes: 5,
  supportsAsync: true,
  supportsRealtime: false,
  winCondition: 'highest_score',
  rules: [
    'One event starts on the timeline with its year shown',
    '8 more events appear one at a time - place each in order',
    'Wrong placements earn a strike (event moves to correct spot)',
    'Fewer strikes = better score. Speed breaks ties.',
    'Both players receive the same puzzle',
  ],

  compareResults(r1: MatchResult, r2: MatchResult): 'p1' | 'p2' | 'tie' {
    const strikes1 = r1.metadata.strikes as number
    const strikes2 = r2.metadata.strikes as number

    // Fewer strikes wins
    if (strikes1 < strikes2) return 'p1'
    if (strikes2 < strikes1) return 'p2'

    // Tie on strikes - faster time wins
    const elapsed1 = r1.metadata.elapsedMs as number
    const elapsed2 = r2.metadata.elapsedMs as number

    if (elapsed1 < elapsed2) return 'p1'
    if (elapsed2 < elapsed1) return 'p2'
    return 'tie'
  },

  formatScore(result: MatchResult): string {
    const strikes = result.metadata.strikes as number
    const elapsedMs = result.metadata.elapsedMs as number
    const minutes = Math.floor(elapsedMs / 60000)
    const seconds = Math.floor((elapsedMs % 60000) / 1000)
    return `${strikes} strike${strikes !== 1 ? 's' : ''} (${minutes}:${seconds.toString().padStart(2, '0')})`
  },

  generatePuzzleMetadata(): Record<string, unknown> {
    const puzzle = getRandomPuzzle()
    return {
      puzzleId: puzzle.id,
    }
  },

  Component: FlashbackGame,
}
