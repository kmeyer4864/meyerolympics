import type { OlympicsEvent, MatchResult } from '../types'
import { tieBreakByTime } from '../types'
import HoldemGame from './HoldemGame'
import { WIN_THRESHOLD } from './types'

export const holdemEvent: OlympicsEvent = {
  id: 'holdem',
  name: "Texas Hold'em",
  description: `Heads-up poker! First to ${WIN_THRESHOLD} chips (80%) wins.`,
  icon: '🃏',
  estimatedMinutes: 15,
  supportsAsync: false,
  supportsRealtime: true,
  winCondition: 'highest_score',
  rules: [
    'Heads-up Texas Hold\'em poker',
    'Each player starts with 1000 chips',
    'Small blind 10, big blind 20',
    `First player to reach ${WIN_THRESHOLD} chips (80% of total) wins`,
    'If a player runs out of chips, they lose',
    'Realtime only - both players must be online',
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

  generatePuzzleMetadata(_options?: Record<string, string>): Record<string, unknown> {
    // Generate a seed for the deck shuffles
    const deckSeed = Math.floor(Math.random() * 1000000)
    return {
      deckSeed,
    }
  },

  Component: HoldemGame,
}
