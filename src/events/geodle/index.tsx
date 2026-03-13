import type { OlympicsEvent, MatchResult } from '../types'
import GeodleGame from './GeodleGame'
import { countries } from './countryData'
import { availableCountryIds } from './CountrySelectMap'
import { selectUnseenRandom, markAsSeen } from '@/lib/seenContentTracker'
import { tieBreakByTime } from '../types'

export const geodleEvent: OlympicsEvent = {
  id: 'geodle',
  name: 'Geodle',
  description: 'Guess the country from progressive hints. Fewer guesses wins!',
  icon: '🌐',
  estimatedMinutes: 3,
  supportsAsync: true,
  supportsRealtime: false,
  winCondition: 'lowest_score',
  rules: [
    'You will receive hints about a mystery country',
    'Hints start difficult and get easier with each wrong guess',
    'Click on the map to guess which country it is',
    'You have 6 guesses maximum',
    'Fewer guesses = better score',
    'Ties are broken by time',
  ],

  compareResults(r1: MatchResult, r2: MatchResult): 'p1' | 'p2' | 'tie' {
    const rounds1 = r1.metadata.rounds as number
    const rounds2 = r2.metadata.rounds as number

    // Lower rounds wins
    if (rounds1 < rounds2) return 'p1'
    if (rounds2 < rounds1) return 'p2'

    // Tiebreaker: faster time wins
    return tieBreakByTime(r1, r2)
  },

  formatScore(result: MatchResult): string {
    const rounds = result.metadata.rounds as number
    const failed = result.metadata.failed as boolean

    if (failed) {
      return 'Failed'
    }

    const elapsedMs = result.metadata.elapsedMs as number
    const seconds = Math.floor(elapsedMs / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    if (rounds === 1) {
      return `1 guess (${minutes}:${String(remainingSeconds).padStart(2, '0')})`
    }
    return `${rounds} guesses (${minutes}:${String(remainingSeconds).padStart(2, '0')})`
  },

  generatePuzzleMetadata(options?: Record<string, string>): Record<string, unknown> {
    const userId = options?.userId

    // Get countries that are both in our data AND available on the map
    const validCountryIds = countries
      .filter(c => availableCountryIds.includes(c.id))
      .map(c => c.id)

    // If we have a userId, use seen content tracking to avoid repeats
    let countryId: string
    if (userId) {
      countryId = selectUnseenRandom('geodle', userId, validCountryIds)
      markAsSeen('geodle', userId, countryId)
    } else {
      countryId = validCountryIds[Math.floor(Math.random() * validCountryIds.length)]
    }

    return {
      countryId,
    }
  },

  Component: GeodleGame,
}
