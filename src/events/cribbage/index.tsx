import type { OlympicsEvent, MatchResult, EventComponentProps } from '../types'
import { tieBreakByTime } from '../types'

// Placeholder component - to be implemented in Phase 3
function CribbageGame(_props: EventComponentProps) {
  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400">Cribbage coming soon...</p>
      <p className="text-gray-500 text-sm mt-2">Requires realtime mode</p>
    </div>
  )
}

export const cribbageEvent: OlympicsEvent = {
  id: 'cribbage',
  name: 'Cribbage',
  description: 'Classic card game! First to 121 points wins.',
  icon: '♠️',
  estimatedMinutes: 20,
  supportsAsync: false,
  supportsRealtime: true,
  winCondition: 'highest_score',
  rules: [
    'Traditional 2-player cribbage',
    'First player to reach 121 points wins',
    'Deal, discard to crib, cut, play (pegging), then show',
    'Winner scores 121, loser scores their final count',
    'Requires both players online simultaneously',
  ],

  compareResults(r1: MatchResult, r2: MatchResult): 'p1' | 'p2' | 'tie' {
    // Higher score wins (winner gets 121)
    if (r1.rawValue > r2.rawValue) return 'p1'
    if (r2.rawValue > r1.rawValue) return 'p2'
    return tieBreakByTime(r1, r2)
  },

  formatScore(result: MatchResult): string {
    return `${Math.round(result.rawValue)} pts`
  },

  generatePuzzleMetadata(): Record<string, unknown> {
    // Generate a seed for card shuffles
    const deckSeed = Math.floor(Math.random() * 1000000)
    return {
      deckSeed,
    }
  },

  Component: CribbageGame,
}
