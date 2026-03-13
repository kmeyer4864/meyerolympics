import type { FC } from 'react'

export type EventType = 'flashback' | 'geography' | 'geodle'

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

// Event configuration options (e.g., difficulty)
export interface EventOption {
  id: string
  label: string
  description?: string
}

export interface EventConfig {
  optionId: string        // e.g., 'difficulty'
  optionLabel: string     // e.g., 'Difficulty'
  options: EventOption[]  // e.g., [{id: 'easy', label: 'Easy'}, ...]
  defaultValue: string    // e.g., 'medium'
}

// Event options selected by user during setup
export type EventOptions = Record<EventType, Record<string, string>>

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

  // Optional configurable options for this event (e.g., difficulty)
  configOptions?: EventConfig[]

  // Core scoring methods
  compareResults(r1: MatchResult, r2: MatchResult): 'p1' | 'p2' | 'tie'
  formatScore(result: MatchResult): string // human-readable: "4:23", "847 pts"

  // Generate puzzle metadata when event starts (receives user-selected options)
  generatePuzzleMetadata(options?: Record<string, string>): Record<string, unknown>

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
