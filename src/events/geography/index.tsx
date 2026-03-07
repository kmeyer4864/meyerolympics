import type { OlympicsEvent, MatchResult, EventComponentProps } from '../types'
import { tieBreakByTime } from '../types'

// Placeholder component - to be implemented in Phase 2
function GeographyGame(_props: EventComponentProps) {
  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400">Geography game coming soon...</p>
    </div>
  )
}

export const geographyEvent: OlympicsEvent = {
  id: 'geography',
  name: 'Geography',
  description: 'Guess locations on a world map. Closest guesses win!',
  icon: '🌍',
  estimatedMinutes: 5,
  supportsAsync: true,
  supportsRealtime: false,
  winCondition: 'highest_score',
  rules: [
    'You will see 5 mystery locations',
    'Click on the map where you think each location is',
    'Score = 5000 - (average distance in km × 0.5)',
    'Maximum score is 5000 (perfect guesses)',
    'Both players guess the same 5 locations',
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
    // Select 5 random location IDs from the pool
    // In real implementation, this would pick from locations.ts
    const locationIds = Array.from({ length: 5 }, (_, i) => i)
    return {
      locationIds,
    }
  },

  Component: GeographyGame,
}
