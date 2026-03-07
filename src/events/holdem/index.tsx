import type { OlympicsEvent, MatchResult, EventComponentProps } from '../types'
import { tieBreakByTime } from '../types'

// Placeholder component - to be implemented in Phase 3
function HoldemGame(_props: EventComponentProps) {
  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400">Texas Hold'em coming soon...</p>
      <p className="text-gray-500 text-sm mt-2">Requires realtime mode</p>
    </div>
  )
}

export const holdemEvent: OlympicsEvent = {
  id: 'holdem',
  name: "Texas Hold'em",
  description: 'Heads-up poker! 20 hands or until someone busts.',
  icon: '🃏',
  estimatedMinutes: 15,
  supportsAsync: false,
  supportsRealtime: true,
  winCondition: 'highest_score',
  rules: [
    'Heads-up Texas Hold\'em poker',
    'Each player starts with 1000 chips',
    'Small blind 10, big blind 20',
    'Play 20 hands or until one player is eliminated',
    'Player with most chips at the end wins',
  ],

  compareResults(r1: MatchResult, r2: MatchResult): 'p1' | 'p2' | 'tie' {
    // Higher chip count wins
    if (r1.rawValue > r2.rawValue) return 'p1'
    if (r2.rawValue > r1.rawValue) return 'p2'
    return tieBreakByTime(r1, r2)
  },

  formatScore(result: MatchResult): string {
    return `${Math.round(result.rawValue)} chips`
  },

  generatePuzzleMetadata(): Record<string, unknown> {
    // Generate a seed for the deck shuffles
    const deckSeed = Math.floor(Math.random() * 1000000)
    return {
      deckSeed,
    }
  },

  Component: HoldemGame,
}
