import type { FC } from 'react'

export type EventType = 'sudoku' | 'flashback' | 'holdem' | 'cribbage' | 'geography'

export type WinCondition = 'highest_score' | 'lowest_score' | 'fastest_time'

export interface MatchResult {
  score: number           // normalized 0-100 for display purposes
  rawValue: number        // actual game metric (time in ms, chips, points, etc.)
  completedAt: string     // ISO timestamp
  metadata: Record<string, unknown> // game-specific extra data
}

export interface EventComponentProps {
  olympicsId: string
  playerId: string
  eventId: string
  puzzleMetadata?: Record<string, unknown>  // puzzle data assigned when event starts
  onComplete: (result: MatchResult) => void
  opponentResult?: MatchResult // only available in async mode after opponent finishes
  isRealtime?: boolean
}

export interface OlympicsEvent {
  id: EventType
  name: string
  description: string
  icon: string             // emoji
  estimatedMinutes: number
  supportsAsync: boolean
  supportsRealtime: boolean
  winCondition: WinCondition
  rules: string[]          // bullet points shown on event intro card

  // Core scoring methods
  compareResults(r1: MatchResult, r2: MatchResult): 'p1' | 'p2' | 'tie'
  formatScore(result: MatchResult): string // human-readable: "4:23", "847 pts"

  // Generate puzzle metadata when event starts
  generatePuzzleMetadata(): Record<string, unknown>

  // The React component that runs the actual game
  Component: FC<EventComponentProps>
}

// Helper type for event status
export type EventStatus = 'pending' | 'p1_active' | 'p2_active' | 'p1_complete' | 'p2_complete' | 'complete'

// Compare helper for tie-breaking by completion time
export function tieBreakByTime(r1: MatchResult, r2: MatchResult): 'p1' | 'p2' | 'tie' {
  const t1 = new Date(r1.completedAt).getTime()
  const t2 = new Date(r2.completedAt).getTime()
  if (t1 < t2) return 'p1'
  if (t2 < t1) return 'p2'
  return 'tie'
}
