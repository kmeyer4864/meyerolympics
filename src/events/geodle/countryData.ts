import { supabase } from '@/lib/supabase'

export interface GeodleCountry {
  id: string
  name: string
  // 6 hints from hardest to easiest
  hints: [string, string, string, string, string, string]
}

// Cache for countries fetched from Supabase
let countriesCache: GeodleCountry[] | null = null
let cacheTimestamp: number = 0
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

// Fetch all countries from Supabase
async function fetchCountriesFromDB(): Promise<GeodleCountry[]> {
  const now = Date.now()

  // Return cached data if still valid
  if (countriesCache && (now - cacheTimestamp) < CACHE_TTL_MS) {
    return countriesCache
  }

  const { data, error } = await supabase
    .from('geodle_countries')
    .select('id, name, hints')
    .eq('enabled', true)

  if (error) {
    console.error('Error fetching geodle countries:', error)
    // Fall back to cache if available
    if (countriesCache) return countriesCache
    return []
  }

  // Convert database rows to GeodleCountry format
  countriesCache = (data || []).map(row => ({
    id: row.id,
    name: row.name,
    hints: row.hints as [string, string, string, string, string, string],
  }))
  cacheTimestamp = now

  return countriesCache
}

// Get a country by ID (async version for game runtime)
export async function fetchCountryById(id: string): Promise<GeodleCountry | undefined> {
  const countries = await fetchCountriesFromDB()
  return countries.find(c => c.id === id)
}

// Get all country IDs (async version for puzzle generation)
export async function fetchAllCountryIds(): Promise<string[]> {
  const countries = await fetchCountriesFromDB()
  return countries.map(c => c.id)
}

// Synchronous version using cache (for compatibility with existing code)
// This should only be called after fetchCountriesFromDB has been called at least once
export function getCountryById(id: string): GeodleCountry | undefined {
  if (!countriesCache) {
    console.warn('getCountryById called before cache populated')
    return undefined
  }
  return countriesCache.find(c => c.id === id)
}

export function getAllCountryIds(): string[] {
  if (!countriesCache) {
    console.warn('getAllCountryIds called before cache populated')
    return []
  }
  return countriesCache.map(c => c.id)
}

export function getAllCountryNames(): string[] {
  if (!countriesCache) {
    console.warn('getAllCountryNames called before cache populated')
    return []
  }
  return countriesCache.map(c => c.name)
}

// Preload countries into cache - call this during app initialization
export async function preloadCountries(): Promise<void> {
  await fetchCountriesFromDB()
}

// For random selection (used by puzzle generation)
export function getRandomCountry(exclude: string[] = []): GeodleCountry | undefined {
  if (!countriesCache || countriesCache.length === 0) {
    console.warn('getRandomCountry called before cache populated')
    return undefined
  }
  const available = countriesCache.filter(c => !exclude.includes(c.id))
  if (available.length === 0) {
    return countriesCache[Math.floor(Math.random() * countriesCache.length)]
  }
  return available[Math.floor(Math.random() * available.length)]
}

// Check if cache is populated
export function isCacheReady(): boolean {
  return countriesCache !== null && countriesCache.length > 0
}
