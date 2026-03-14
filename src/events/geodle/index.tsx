import type { OlympicsEvent, MatchResult } from '../types'
import GeodleGame from './GeodleGame'
import { getRandomGameCountries } from './countryData'
import { getVariedHintTypesForCountries } from './hintGenerator'
import { tieBreakByTime } from '../types'

const TOTAL_COUNTRIES = 5
const HINTS_PER_COUNTRY = 4

export const geodleEvent: OlympicsEvent = {
  id: 'geodle',
  name: 'Geodle',
  description: 'Guess 5 countries from hints and map feedback. Fewer total guesses wins!',
  icon: '🌍',
  estimatedMinutes: 5,
  supportsAsync: true,
  supportsRealtime: false,
  winCondition: 'lowest_score',
  rules: [
    `Identify ${TOTAL_COUNTRIES} countries in a row`,
    'Each country starts with 4 demographic hints',
    'Click on the map to guess which country it is',
    'Colors show how close your guess is:',
    '  🔴 Red = Wrong continent',
    '  🟠 Orange = Same continent',
    '  🟡 Yellow = Neighboring country',
    '  🟢 Green = Correct!',
    'You have 10 guesses per country',
    'Lowest total guesses across all 5 countries wins',
    'Ties are broken by time',
  ],

  compareResults(r1: MatchResult, r2: MatchResult): 'p1' | 'p2' | 'tie' {
    const guesses1 = r1.rawValue as number
    const guesses2 = r2.rawValue as number

    // Lower total guesses wins
    if (guesses1 < guesses2) return 'p1'
    if (guesses2 < guesses1) return 'p2'

    // Tiebreaker: faster time wins
    return tieBreakByTime(r1, r2)
  },

  formatScore(result: MatchResult): string {
    const totalGuesses = result.metadata.totalGuesses as number
    const countriesGuessed = result.metadata.countriesGuessed as number
    const elapsedMs = result.metadata.elapsedMs as number
    const seconds = Math.floor(elapsedMs / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    if (countriesGuessed === TOTAL_COUNTRIES) {
      return `${totalGuesses} guesses (${minutes}:${String(remainingSeconds).padStart(2, '0')})`
    }
    return `${countriesGuessed}/${TOTAL_COUNTRIES} found, ${totalGuesses} guesses`
  },

  generatePuzzleMetadata(_options?: Record<string, string>): Record<string, unknown> {
    // Select 5 random countries (excludes small/obscure countries)
    const countries = getRandomGameCountries(TOTAL_COUNTRIES)

    // Generate varied hint types for each country
    // This ensures: 1) different hint types across countries for variety
    //               2) hints that reveal country name are filtered out
    //               3) both players get identical hints
    const countryHintTypes = getVariedHintTypesForCountries(
      countries.map(c => c.name),
      HINTS_PER_COUNTRY
    )

    return {
      countries: countryHintTypes,
    }
  },

  Component: GeodleGame,
}
