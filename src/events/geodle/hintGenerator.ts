// Dynamic hint generator for Geodle
// Generates random demographic hints from country-json data

import capitalData from './data/country-by-capital-city.json'
import populationData from './data/country-by-population.json'
import languagesData from './data/country-by-languages.json'
import currencyData from './data/country-by-currency-name.json'
import surfaceAreaData from './data/country-by-surface-area.json'
import drivingSideData from './data/country-by-driving-side.json'
import landlockedData from './data/country-by-landlocked.json'
import callingCodeData from './data/country-by-calling-code.json'
import lifeExpectancyData from './data/country-by-life-expectancy.json'
import continentData from './data/country-by-continent.json'

// Type definitions for the JSON data
interface CapitalEntry { country: string; city: string }
interface PopulationEntry { country: string; population: number }
interface LanguagesEntry { country: string; languages: string[] }
interface CurrencyEntry { country: string; currency_name: string }
interface SurfaceAreaEntry { country: string; area: number }
interface DrivingSideEntry { country: string; side: string }
interface LandlockedEntry { country: string; landlocked: string }
interface CallingCodeEntry { country: string; calling_code: number }
interface LifeExpectancyEntry { country: string; expectancy: number }
interface ContinentEntry { country: string; continent: string }

// Build lookup maps
const capitalMap = new Map<string, string>()
const populationMap = new Map<string, number>()
const languagesMap = new Map<string, string[]>()
const currencyMap = new Map<string, string>()
const surfaceAreaMap = new Map<string, number>()
const drivingSideMap = new Map<string, string>()
const landlockedMap = new Map<string, boolean>()
const callingCodeMap = new Map<string, number>()
const lifeExpectancyMap = new Map<string, number>()
const continentMap = new Map<string, string>()

// Normalize country names for matching
function normalize(name: string): string {
  return name.toLowerCase().trim()
}

// Populate maps
;(capitalData as CapitalEntry[]).forEach(e => capitalMap.set(normalize(e.country), e.city))
;(populationData as PopulationEntry[]).forEach(e => populationMap.set(normalize(e.country), e.population))
;(languagesData as LanguagesEntry[]).forEach(e => languagesMap.set(normalize(e.country), e.languages))
;(currencyData as CurrencyEntry[]).forEach(e => currencyMap.set(normalize(e.country), e.currency_name))
;(surfaceAreaData as SurfaceAreaEntry[]).forEach(e => surfaceAreaMap.set(normalize(e.country), e.area))
;(drivingSideData as DrivingSideEntry[]).forEach(e => drivingSideMap.set(normalize(e.country), e.side))
;(landlockedData as LandlockedEntry[]).forEach(e => landlockedMap.set(normalize(e.country), e.landlocked === '1'))
;(callingCodeData as CallingCodeEntry[]).forEach(e => callingCodeMap.set(normalize(e.country), e.calling_code))
;(lifeExpectancyData as LifeExpectancyEntry[]).forEach(e => lifeExpectancyMap.set(normalize(e.country), e.expectancy))
;(continentData as ContinentEntry[]).forEach(e => continentMap.set(normalize(e.country), e.continent))

// Hint generator functions - each returns a hint string or null if data unavailable
type HintGenerator = (country: string) => string | null

const hintGenerators: { name: string; generator: HintGenerator; difficulty: number }[] = [
  {
    name: 'calling_code',
    difficulty: 1, // Hardest
    generator: (country: string) => {
      const code = callingCodeMap.get(normalize(country))
      return code ? `This country's international calling code is +${code}` : null
    },
  },
  {
    name: 'life_expectancy',
    difficulty: 2,
    generator: (country: string) => {
      const expectancy = lifeExpectancyMap.get(normalize(country))
      return expectancy ? `The average life expectancy here is ${expectancy.toFixed(1)} years` : null
    },
  },
  {
    name: 'driving_side',
    difficulty: 2,
    generator: (country: string) => {
      const side = drivingSideMap.get(normalize(country))
      return side ? `People drive on the ${side} side of the road here` : null
    },
  },
  {
    name: 'surface_area',
    difficulty: 3,
    generator: (country: string) => {
      const area = surfaceAreaMap.get(normalize(country))
      if (!area) return null
      const formatted = area >= 1000000
        ? `${(area / 1000000).toFixed(2)} million km²`
        : area >= 1000
        ? `${(area / 1000).toFixed(1)} thousand km²`
        : `${area.toFixed(0)} km²`
      return `This country has a surface area of approximately ${formatted}`
    },
  },
  {
    name: 'landlocked',
    difficulty: 3,
    generator: (country: string) => {
      const isLandlocked = landlockedMap.get(normalize(country))
      if (isLandlocked === undefined) return null
      return isLandlocked
        ? 'This is a landlocked country with no coastline'
        : 'This country has access to the sea'
    },
  },
  {
    name: 'currency',
    difficulty: 4,
    generator: (country: string) => {
      const currency = currencyMap.get(normalize(country))
      return currency ? `The currency used here is the ${currency}` : null
    },
  },
  {
    name: 'population',
    difficulty: 4,
    generator: (country: string) => {
      const pop = populationMap.get(normalize(country))
      if (!pop) return null
      const formatted = pop >= 1000000000
        ? `${(pop / 1000000000).toFixed(2)} billion`
        : pop >= 1000000
        ? `${(pop / 1000000).toFixed(1)} million`
        : pop >= 1000
        ? `${(pop / 1000).toFixed(0)} thousand`
        : pop.toString()
      return `This country has a population of approximately ${formatted} people`
    },
  },
  {
    name: 'languages',
    difficulty: 5,
    generator: (country: string) => {
      const languages = languagesMap.get(normalize(country))
      if (!languages || languages.length === 0) return null
      if (languages.length === 1) {
        return `${languages[0]} is the primary language spoken here`
      }
      const first = languages.slice(0, 3).join(', ')
      return `Languages spoken here include ${first}${languages.length > 3 ? ' and others' : ''}`
    },
  },
  {
    name: 'continent',
    difficulty: 5, // Easy hint
    generator: (country: string) => {
      const continent = continentMap.get(normalize(country))
      return continent ? `This country is located in ${continent}` : null
    },
  },
  {
    name: 'capital',
    difficulty: 6, // Easiest
    generator: (country: string) => {
      const capital = capitalMap.get(normalize(country))
      return capital ? `The capital city is ${capital}` : null
    },
  },
]

// Generate hints for a country
// If hintTypes are provided, use those specific hints (for fairness between players)
// Otherwise, randomly select hints
export function generateHints(country: string, count: number = 4, hintTypes?: string[]): string[] {
  // Get all available hints for this country
  const availableHints: { hint: string; difficulty: number; name: string }[] = []

  for (const { generator, difficulty, name } of hintGenerators) {
    const hint = generator(country)
    if (hint) {
      availableHints.push({ hint, difficulty, name })
    }
  }

  // If specific hint types provided, use those
  if (hintTypes && hintTypes.length > 0) {
    const selectedHints = hintTypes
      .map(type => availableHints.find(h => h.name === type))
      .filter((h): h is { hint: string; difficulty: number; name: string } => h !== undefined)

    // Sort by difficulty and return
    selectedHints.sort((a, b) => a.difficulty - b.difficulty)
    return selectedHints.map(h => h.hint)
  }

  // If we don't have enough hints, pad with what we have
  if (availableHints.length <= count) {
    // Sort by difficulty (hardest first)
    return availableHints
      .sort((a, b) => a.difficulty - b.difficulty)
      .map(h => h.hint)
  }

  // Shuffle available hints and pick `count`
  const shuffled = [...availableHints]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  // Take `count` hints and sort by difficulty (hardest first)
  const selected = shuffled.slice(0, count)
  selected.sort((a, b) => a.difficulty - b.difficulty)

  return selected.map(h => h.hint)
}

// Get random hint types for a country (used in puzzle generation)
export function getRandomHintTypes(country: string, count: number = 4): string[] {
  const availableTypes: string[] = []

  for (const { generator, name } of hintGenerators) {
    const hint = generator(country)
    if (hint) {
      availableTypes.push(name)
    }
  }

  if (availableTypes.length <= count) {
    return availableTypes
  }

  // Shuffle and take count
  const shuffled = [...availableTypes]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled.slice(0, count)
}

// Get specific hint types for a country (useful for testing)
export function getHintByType(country: string, hintType: string): string | null {
  const generator = hintGenerators.find(g => g.name === hintType)
  return generator ? generator.generator(country) : null
}

// Check if a country exists in our data
export function hasCountryData(country: string): boolean {
  return continentMap.has(normalize(country))
}
