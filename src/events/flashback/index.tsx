import type { OlympicsEvent, MatchResult, EventComponentProps } from '../types'
import { tieBreakByTime } from '../types'

// Placeholder component - to be implemented in Phase 2
function FlashbackGame(_props: EventComponentProps) {
  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400">Flashback game coming soon...</p>
    </div>
  )
}

export const flashbackEvent: OlympicsEvent = {
  id: 'flashback',
  name: 'Flashback',
  description: 'Group 16 words into 4 categories of 4. Like NYT Connections!',
  icon: '🔗',
  estimatedMinutes: 5,
  supportsAsync: true,
  supportsRealtime: false,
  winCondition: 'highest_score',
  rules: [
    'Find 4 groups of 4 related words',
    'Select 4 words and submit to check if they form a group',
    '4 mistakes allowed before game over',
    'Score = 1000 - (mistakes × 150) - (time × 0.5)',
    'Both players receive the same puzzle',
  ],

  compareResults(r1: MatchResult, r2: MatchResult): 'p1' | 'p2' | 'tie' {
    // Higher score wins
    if (r1.rawValue > r2.rawValue) return 'p1'
    if (r2.rawValue > r1.rawValue) return 'p2'
    return tieBreakByTime(r1, r2)
  },

  formatScore(result: MatchResult): string {
    return `${Math.round(result.rawValue)} pts`
  },

  generatePuzzleMetadata(): Record<string, unknown> {
    // Pick a random puzzle set ID (0-9 for now, expand later)
    const puzzleSetId = Math.floor(Math.random() * 10)
    return {
      puzzleSetId,
    }
  },

  Component: FlashbackGame,
}
