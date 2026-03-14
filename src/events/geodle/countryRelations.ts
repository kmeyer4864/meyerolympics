// Country relations data for proximity feedback in Geodle
// Data sourced from country-json and restcountries.com

import continentData from './data/country-by-continent.json'
import bordersData from './data/country-by-borders.json'

// Type definitions
interface ContinentEntry {
  country: string
  continent: string
}

interface BordersEntry {
  country: string
  borders: string[]
}

// Build lookup maps for efficient access
const continentMap = new Map<string, string>()
const bordersMap = new Map<string, string[]>()

// Normalize country names for matching (handles variations)
// Converts to lowercase, hyphenated format for consistent matching
export function normalizeCountryName(name: string): string {
  const normalized = name.toLowerCase().trim()

  // Handle common variations between data sources
  const mappings: Record<string, string> = {
    'united states of america': 'united-states',
    'united states': 'united-states',
    'russian federation': 'russia',
    'republic of korea': 'south-korea',
    'south korea': 'south-korea',
    "korea, democratic people's republic of": 'north-korea',
    'north korea': 'north-korea',
    'viet nam': 'vietnam',
    'vietnam': 'vietnam',
    'new zealand': 'new-zealand',
    'south africa': 'south-africa',
    'united kingdom': 'united-kingdom',
    'great britain': 'united-kingdom',
    "côte d'ivoire": 'ivory-coast',
    'ivory coast': 'ivory-coast',
    'czechia': 'czech-republic',
    'czech republic': 'czech-republic',
    'democratic republic of the congo': 'dr-congo',
    'congo, democratic republic of the': 'dr-congo',
  }

  return mappings[normalized] || normalized.replace(/['']/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

// Build continent lookup
;(continentData as ContinentEntry[]).forEach(entry => {
  continentMap.set(normalizeCountryName(entry.country), entry.continent)
})

// Build borders lookup (bidirectional)
;(bordersData as BordersEntry[]).forEach(entry => {
  const normalized = normalizeCountryName(entry.country)
  bordersMap.set(normalized, entry.borders.map(normalizeCountryName))
})

// Get continent for a country
export function getContinent(country: string): string | undefined {
  return continentMap.get(normalizeCountryName(country))
}

// Get neighboring countries
export function getNeighbors(country: string): string[] {
  return bordersMap.get(normalizeCountryName(country)) || []
}

// Check if two countries are on the same continent
export function isSameContinent(country1: string, country2: string): boolean {
  const c1 = getContinent(country1)
  const c2 = getContinent(country2)
  return c1 !== undefined && c2 !== undefined && c1 === c2
}

// Check if two countries are neighbors (share a border)
export function isNeighbor(country1: string, country2: string): boolean {
  const neighbors = getNeighbors(country1)
  const normalizedCountry2 = normalizeCountryName(country2)
  return neighbors.some(n => n === normalizedCountry2)
}

// Determine proximity category for feedback colors
export type ProximityLevel = 'correct' | 'neighbor' | 'same_continent' | 'wrong_continent'

export function getProximity(guessedCountry: string, targetCountry: string): ProximityLevel {
  const normalizedGuess = normalizeCountryName(guessedCountry)
  const normalizedTarget = normalizeCountryName(targetCountry)

  // Exact match
  if (normalizedGuess === normalizedTarget) {
    return 'correct'
  }

  // Check if neighbor
  if (isNeighbor(guessedCountry, targetCountry)) {
    return 'neighbor'
  }

  // Check if same continent
  if (isSameContinent(guessedCountry, targetCountry)) {
    return 'same_continent'
  }

  // Different continent
  return 'wrong_continent'
}

// Get all available country names (from continent data as it's most complete)
export function getAllCountryNames(): string[] {
  return (continentData as ContinentEntry[]).map(entry => entry.country)
}

// Get a random selection of countries
export function getRandomCountries(count: number, exclude: string[] = []): string[] {
  const normalizedExclude = exclude.map(normalizeCountryName)
  const available = getAllCountryNames().filter(
    name => !normalizedExclude.includes(normalizeCountryName(name))
  )

  // Fisher-Yates shuffle and take first `count`
  const shuffled = [...available]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled.slice(0, count)
}

// Export continent list for reference
export const CONTINENTS = [
  'Africa',
  'Antarctica',
  'Asia',
  'Europe',
  'North America',
  'Oceania',
  'South America',
]
