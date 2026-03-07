import type { MatchResult } from '@/events/types'
import { getEvent, isValidEventType } from '@/events/registry'

export type MedalType = 'gold' | 'silver' | null

export interface MedalResult {
  player1Medal: MedalType
  player2Medal: MedalType
  isTie: boolean
}

// Determine medals for two players based on their results
export function determineMedals(
  eventType: string,
  player1Result: MatchResult,
  player2Result: MatchResult
): MedalResult {
  if (!isValidEventType(eventType)) {
    throw new Error(`Invalid event type: ${eventType}`)
  }

  const event = getEvent(eventType)
  const winner = event.compareResults(player1Result, player2Result)

  if (winner === 'tie') {
    return {
      player1Medal: 'gold', // Both get gold in a tie
      player2Medal: 'gold',
      isTie: true,
    }
  }

  return {
    player1Medal: winner === 'p1' ? 'gold' : 'silver',
    player2Medal: winner === 'p2' ? 'gold' : 'silver',
    isTie: false,
  }
}

// Format a result for display using the event's formatter
export function formatResult(eventType: string, result: MatchResult): string {
  if (!isValidEventType(eventType)) {
    return `${result.score} pts`
  }

  const event = getEvent(eventType)
  return event.formatScore(result)
}

// Get medal emoji
export function getMedalEmoji(medal: MedalType): string {
  switch (medal) {
    case 'gold':
      return '🥇'
    case 'silver':
      return '🥈'
    default:
      return ''
  }
}

// Calculate normalized score (0-100) from raw value
export function calculateNormalizedScore(
  eventType: string,
  rawValue: number,
  _metadata?: Record<string, unknown>
): number {
  if (!isValidEventType(eventType)) {
    return 50
  }

  const event = getEvent(eventType)

  switch (event.winCondition) {
    case 'fastest_time':
      // For time-based events, faster is better
      // Normalize: 100 for < 1 min, 0 for > 30 min
      const timeMs = rawValue
      const minTime = 60 * 1000 // 1 minute
      const maxTime = 30 * 60 * 1000 // 30 minutes
      const normalized = 100 - ((timeMs - minTime) / (maxTime - minTime)) * 100
      return Math.max(0, Math.min(100, normalized))

    case 'highest_score':
      // For score-based events, higher is better
      // Already normalized in most cases
      return Math.max(0, Math.min(100, rawValue))

    case 'lowest_score':
      // For lowest-score events (like golf), lower is better
      // Invert the score
      return Math.max(0, Math.min(100, 100 - rawValue))

    default:
      return 50
  }
}
