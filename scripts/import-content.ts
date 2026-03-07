#!/usr/bin/env npx tsx

/**
 * Content Import Script for Geography Locations and Flashback Puzzles
 *
 * Usage:
 *   npm run import:locations     # Import content/locations.json
 *   npm run import:puzzles       # Import content/puzzles.json
 *   npm run import:all           # Import both
 *
 * Environment variables required:
 *   SUPABASE_URL - Your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Service role key (not anon key, for admin access)
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CONTENT_DIR = resolve(__dirname, '../content')

// Types matching the database schema
interface Location {
  id: string
  name: string
  clue: string
  lat: number
  lng: number
  difficulty: 'easy' | 'medium' | 'hard'
  enabled?: boolean
}

interface TimelineEvent {
  id: string
  description: string
  year: number
}

interface Puzzle {
  id: string
  theme: string
  events: TimelineEvent[]
  enabled?: boolean
}

// Validation helpers
function validateLocation(loc: unknown, index: number): Location {
  const l = loc as Record<string, unknown>
  const errors: string[] = []

  if (typeof l.id !== 'string' || !l.id) errors.push('id must be a non-empty string')
  if (typeof l.name !== 'string' || !l.name) errors.push('name must be a non-empty string')
  if (typeof l.clue !== 'string' || !l.clue) errors.push('clue must be a non-empty string')
  if (typeof l.lat !== 'number' || l.lat < -90 || l.lat > 90) errors.push('lat must be a number between -90 and 90')
  if (typeof l.lng !== 'number' || l.lng < -180 || l.lng > 180) errors.push('lng must be a number between -180 and 180')
  if (!['easy', 'medium', 'hard'].includes(l.difficulty as string)) errors.push('difficulty must be "easy", "medium", or "hard"')

  if (errors.length > 0) {
    throw new Error(`Location at index ${index} (id: ${l.id || 'unknown'}): ${errors.join(', ')}`)
  }

  return {
    id: l.id as string,
    name: l.name as string,
    clue: l.clue as string,
    lat: l.lat as number,
    lng: l.lng as number,
    difficulty: l.difficulty as 'easy' | 'medium' | 'hard',
    enabled: l.enabled !== false, // default to true
  }
}

function validatePuzzle(puzzle: unknown, index: number): Puzzle {
  const p = puzzle as Record<string, unknown>
  const errors: string[] = []

  if (typeof p.id !== 'string' || !p.id) errors.push('id must be a non-empty string')
  if (typeof p.theme !== 'string' || !p.theme) errors.push('theme must be a non-empty string')
  if (!Array.isArray(p.events)) errors.push('events must be an array')

  if (Array.isArray(p.events)) {
    if (p.events.length !== 9) errors.push(`events must contain exactly 9 items, got ${p.events.length}`)

    p.events.forEach((event, eventIndex) => {
      const e = event as Record<string, unknown>
      if (typeof e.id !== 'string' || !e.id) errors.push(`events[${eventIndex}].id must be a non-empty string`)
      if (typeof e.description !== 'string' || !e.description) errors.push(`events[${eventIndex}].description must be a non-empty string`)
      if (typeof e.year !== 'number') errors.push(`events[${eventIndex}].year must be a number`)
    })
  }

  if (errors.length > 0) {
    throw new Error(`Puzzle at index ${index} (id: ${p.id || 'unknown'}): ${errors.join(', ')}`)
  }

  return {
    id: p.id as string,
    theme: p.theme as string,
    events: (p.events as Array<Record<string, unknown>>).map(e => ({
      id: e.id as string,
      description: e.description as string,
      year: e.year as number,
    })),
    enabled: p.enabled !== false, // default to true
  }
}

// Create Supabase client
function getSupabaseClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) {
    throw new Error('SUPABASE_URL or VITE_SUPABASE_URL environment variable is required')
  }
  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required (service role key, not anon key)')
  }

  return createClient(url, key)
}

// Import locations
async function importLocations() {
  const filePath = resolve(CONTENT_DIR, 'locations.json')

  if (!existsSync(filePath)) {
    console.log(`No locations file found at ${filePath}, skipping...`)
    return { imported: 0, skipped: 0 }
  }

  console.log(`Reading locations from ${filePath}...`)
  const raw = readFileSync(filePath, 'utf-8')
  const data = JSON.parse(raw)

  if (!Array.isArray(data)) {
    throw new Error('locations.json must contain an array')
  }

  console.log(`Found ${data.length} locations, validating...`)
  const locations = data.map((loc, index) => validateLocation(loc, index))
  console.log('Validation passed!')

  const supabase = getSupabaseClient()

  console.log('Upserting to Supabase...')
  const { data: result, error } = await supabase
    .from('game_locations')
    .upsert(locations, { onConflict: 'id' })
    .select()

  if (error) {
    throw new Error(`Supabase error: ${error.message}`)
  }

  const imported = result?.length || 0
  console.log(`Successfully imported ${imported} locations!`)
  return { imported, skipped: 0 }
}

// Import puzzles
async function importPuzzles() {
  const filePath = resolve(CONTENT_DIR, 'puzzles.json')

  if (!existsSync(filePath)) {
    console.log(`No puzzles file found at ${filePath}, skipping...`)
    return { imported: 0, skipped: 0 }
  }

  console.log(`Reading puzzles from ${filePath}...`)
  const raw = readFileSync(filePath, 'utf-8')
  const data = JSON.parse(raw)

  if (!Array.isArray(data)) {
    throw new Error('puzzles.json must contain an array')
  }

  console.log(`Found ${data.length} puzzles, validating...`)
  const puzzles = data.map((puzzle, index) => validatePuzzle(puzzle, index))
  console.log('Validation passed!')

  const supabase = getSupabaseClient()

  console.log('Upserting to Supabase...')
  const { data: result, error } = await supabase
    .from('game_puzzles')
    .upsert(puzzles, { onConflict: 'id' })
    .select()

  if (error) {
    throw new Error(`Supabase error: ${error.message}`)
  }

  const imported = result?.length || 0
  console.log(`Successfully imported ${imported} puzzles!`)
  return { imported, skipped: 0 }
}

// Main
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  console.log('='.repeat(50))
  console.log('Content Import Script')
  console.log('='.repeat(50))

  try {
    if (command === 'locations') {
      await importLocations()
    } else if (command === 'puzzles') {
      await importPuzzles()
    } else if (command === 'all' || !command) {
      console.log('\n--- Importing Locations ---')
      await importLocations()
      console.log('\n--- Importing Puzzles ---')
      await importPuzzles()
    } else {
      console.error(`Unknown command: ${command}`)
      console.log('Usage: npx tsx scripts/import-content.ts [locations|puzzles|all]')
      process.exit(1)
    }

    console.log('\n' + '='.repeat(50))
    console.log('Import complete!')
    console.log('='.repeat(50))
  } catch (error) {
    console.error('\nError:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()
