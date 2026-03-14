// Daily puzzle service for Geodle
// Fetches curated puzzles from the database

import { supabase } from '@/lib/supabase'
import type { GeodleDailyPuzzle, GeodlePuzzleCountry } from '@/lib/database.types'
import type { GeodleCountry } from './countryData'
import { countryNameToId } from './countryData'
import { getContinent } from './countryRelations'

export interface DailyPuzzleResult {
  puzzle: GeodleDailyPuzzle | null
  countries: GeodleCountry[]
  error: string | null
}

/**
 * Fetch today's puzzle if one exists.
 * Looks for published or scheduled puzzles for today's date.
 */
export async function getTodaysPuzzle(): Promise<DailyPuzzleResult> {
  const today = new Date().toISOString().split('T')[0]

  // Look for published or scheduled puzzles for today
  const { data, error } = await supabase
    .from('geodle_daily_puzzles')
    .select('*')
    .eq('play_date', today)
    .in('status', ['published', 'scheduled'])
    .single()

  if (error) {
    // No puzzle found for today is not an error - just means use dynamic generation
    if (error.code === 'PGRST116') {
      return { puzzle: null, countries: [], error: null }
    }
    return { puzzle: null, countries: [], error: error.message }
  }

  const puzzle = data as GeodleDailyPuzzle

  // Convert puzzle countries to GeodleCountry format
  const countries = convertPuzzleCountries(puzzle.countries)

  return { puzzle, countries, error: null }
}

/**
 * Fetch a specific puzzle by ID.
 */
export async function getPuzzleById(id: string): Promise<DailyPuzzleResult> {
  const { data, error } = await supabase
    .from('geodle_daily_puzzles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return { puzzle: null, countries: [], error: error.message }
  }

  const puzzle = data as GeodleDailyPuzzle
  const countries = convertPuzzleCountries(puzzle.countries)

  return { puzzle, countries, error: null }
}

/**
 * Convert puzzle country format to game country format.
 * Uses curated hints from the puzzle instead of dynamic generation.
 */
function convertPuzzleCountries(puzzleCountries: GeodlePuzzleCountry[]): GeodleCountry[] {
  return puzzleCountries.map((pc) => {
    const continent = getContinent(pc.name) || 'Unknown'

    return {
      id: countryNameToId(pc.name),
      name: pc.name,
      continent,
      hints: pc.hints,
    }
  })
}

/**
 * Increment the play count for a puzzle.
 * Called when a player starts playing a curated puzzle.
 */
export async function incrementPuzzlePlayCount(puzzleId: string): Promise<void> {
  await supabase.rpc('increment_puzzle_play_count', { puzzle_id: puzzleId })
}

/**
 * Record puzzle completion stats.
 * Called when a player completes a curated puzzle.
 */
export async function recordPuzzleCompletion(
  puzzleId: string,
  totalGuesses: number,
  completed: boolean
): Promise<void> {
  // For now, just increment play count
  // In the future, we could track avg guesses and completion rate via triggers
  console.log('Puzzle completion:', { puzzleId, totalGuesses, completed })
}

/**
 * Check if there's a curated puzzle available for today.
 * Lighter weight than getTodaysPuzzle - just checks existence.
 */
export async function hasTodaysPuzzle(): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0]

  const { count, error } = await supabase
    .from('geodle_daily_puzzles')
    .select('id', { count: 'exact', head: true })
    .eq('play_date', today)
    .in('status', ['published', 'scheduled'])

  if (error) {
    console.warn('Error checking for daily puzzle:', error.message)
    return false
  }

  return (count ?? 0) > 0
}
