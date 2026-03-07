import type { OlympicsEvent, MatchResult } from '../types'
import GeographyGame from './GeographyGame'
import { getRandomLocationIds } from './locations'

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
    'You will see 5 mystery locations with clues',
    'Click on the map where you think each location is',
    'Score = 5000 - (average distance in km x 0.5)',
    'Maximum score is 5000 (perfect guesses)',
    'Both players guess the same 5 locations',
  ],

  compareResults(r1: MatchResult, r2: MatchResult): 'p1' | 'p2' | 'tie' {
    // Higher score wins (lower average distance)
    if (r1.rawValue > r2.rawValue) return 'p1'
    if (r2.rawValue > r1.rawValue) return 'p2'

    // Tie-breaker: lower total distance wins
    const total1 = r1.metadata.totalDistance as number
    const total2 = r2.metadata.totalDistance as number
    if (total1 < total2) return 'p1'
    if (total2 < total1) return 'p2'

    return 'tie'
  },

  formatScore(result: MatchResult): string {
    const avgDistance = result.metadata.avgDistance as number
    if (avgDistance < 1) {
      return `${Math.round(avgDistance * 1000)} m avg`
    } else if (avgDistance < 100) {
      return `${avgDistance.toFixed(1)} km avg`
    } else {
      return `${Math.round(avgDistance).toLocaleString()} km avg`
    }
  },

  generatePuzzleMetadata(): Record<string, unknown> {
    const locationIds = getRandomLocationIds(5)
    return {
      locationIds,
    }
  },

  Component: GeographyGame,
}
