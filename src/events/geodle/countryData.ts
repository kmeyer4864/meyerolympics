// Country data for Geodle game
// Uses local country-json data instead of Supabase

import { generateHints, hasCountryData } from './hintGenerator'
import { getContinent, getAllCountryNames, getRandomCountries } from './countryRelations'

export interface GeodleCountry {
  id: string           // Normalized country name (lowercase, hyphenated)
  name: string         // Display name
  continent: string    // For proximity feedback
  hints: string[]      // Dynamically generated hints
}

// Convert country name to ID format
export function countryNameToId(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/['']/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

// Convert ID back to approximate name (for display)
export function idToCountryName(id: string): string {
  return id
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Get country by ID
export function getCountryById(id: string): GeodleCountry | undefined {
  // Find matching country name
  const allNames = getAllCountryNames()
  const targetId = id.toLowerCase()

  const matchedName = allNames.find(name => countryNameToId(name) === targetId)

  if (!matchedName || !hasCountryData(matchedName)) {
    return undefined
  }

  const continent = getContinent(matchedName)
  if (!continent) return undefined

  return {
    id: countryNameToId(matchedName),
    name: matchedName,
    continent,
    hints: generateHints(matchedName, 4),
  }
}

// Get country by name
// If hintTypes provided, use those specific hints (for fairness between players)
export function getCountryByName(name: string, hintTypes?: string[]): GeodleCountry | undefined {
  if (!hasCountryData(name)) {
    return undefined
  }

  const continent = getContinent(name)
  if (!continent) return undefined

  return {
    id: countryNameToId(name),
    name,
    continent,
    hints: generateHints(name, 4, hintTypes),
  }
}

// Get all available country IDs
export function getAllCountryIds(): string[] {
  return getAllCountryNames().map(countryNameToId)
}

// Get random countries for a game round
export function getRandomGameCountries(count: number = 5): GeodleCountry[] {
  const names = getRandomCountries(count)
  return names
    .map(name => getCountryByName(name))
    .filter((c): c is GeodleCountry => c !== undefined)
}

// For backwards compatibility with existing code
export async function fetchCountryById(id: string): Promise<GeodleCountry | undefined> {
  return getCountryById(id)
}

export async function fetchAllCountryIds(): Promise<string[]> {
  return getAllCountryIds()
}

export function isCacheReady(): boolean {
  return true // No async loading needed with local data
}

export async function preloadCountries(): Promise<void> {
  // No-op - data is already bundled
}

// Get a random single country (for backwards compatibility)
export function getRandomCountry(_exclude: string[] = []): GeodleCountry | undefined {
  const countries = getRandomGameCountries(1)
  return countries[0]
}
