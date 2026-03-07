import { supabase } from '../../lib/supabase'

export interface TimelineEvent {
  id: string
  description: string
  year: number
}

export interface FlashbackPuzzle {
  id: string
  theme: string
  events: TimelineEvent[] // Exactly 9 events (1 starter + 8 to place)
}

// Cache for fetched puzzles
let cachedPuzzles: FlashbackPuzzle[] | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION_MS = 5 * 60 * 1000 // 5 minutes

// 10 pre-built puzzle sets
export const puzzles: FlashbackPuzzle[] = [
  {
    id: 'puzzle-0',
    theme: '20th Century Milestones',
    events: [
      { id: 'e1', description: 'The Titanic sinks on its maiden voyage', year: 1912 },
      { id: 'e2', description: 'World War I begins', year: 1914 },
      { id: 'e3', description: 'The stock market crashes on Black Tuesday', year: 1929 },
      { id: 'e4', description: 'World War II ends', year: 1945 },
      { id: 'e5', description: 'The first human walks on the moon', year: 1969 },
      { id: 'e6', description: 'The Berlin Wall falls', year: 1989 },
      { id: 'e7', description: 'Nelson Mandela is released from prison', year: 1990 },
      { id: 'e8', description: 'The World Wide Web goes public', year: 1991 },
      { id: 'e9', description: 'The Euro currency is introduced', year: 1999 },
    ],
  },
  {
    id: 'puzzle-1',
    theme: 'US History',
    events: [
      { id: 'e1', description: 'The Declaration of Independence is signed', year: 1776 },
      { id: 'e2', description: 'The US Constitution is ratified', year: 1788 },
      { id: 'e3', description: 'The Louisiana Purchase doubles US territory', year: 1803 },
      { id: 'e4', description: 'The Civil War begins', year: 1861 },
      { id: 'e5', description: 'Abraham Lincoln is assassinated', year: 1865 },
      { id: 'e6', description: 'Women gain the right to vote (19th Amendment)', year: 1920 },
      { id: 'e7', description: 'The attack on Pearl Harbor', year: 1941 },
      { id: 'e8', description: 'Martin Luther King Jr. delivers "I Have a Dream"', year: 1963 },
      { id: 'e9', description: 'The September 11 attacks occur', year: 2001 },
    ],
  },
  {
    id: 'puzzle-2',
    theme: 'Technology & Inventions',
    events: [
      { id: 'e1', description: 'Alexander Graham Bell invents the telephone', year: 1876 },
      { id: 'e2', description: 'The Wright brothers achieve powered flight', year: 1903 },
      { id: 'e3', description: 'The first television is demonstrated', year: 1927 },
      { id: 'e4', description: 'The first electronic computer (ENIAC) is built', year: 1945 },
      { id: 'e5', description: 'The first satellite (Sputnik) is launched', year: 1957 },
      { id: 'e6', description: 'The first email is sent', year: 1971 },
      { id: 'e7', description: 'The first personal computer (Apple II) is released', year: 1977 },
      { id: 'e8', description: 'The iPhone is released', year: 2007 },
      { id: 'e9', description: 'ChatGPT is released to the public', year: 2022 },
    ],
  },
  {
    id: 'puzzle-3',
    theme: 'Pop Culture Moments',
    events: [
      { id: 'e1', description: 'The first "talkie" movie (The Jazz Singer) premieres', year: 1927 },
      { id: 'e2', description: 'Elvis Presley appears on The Ed Sullivan Show', year: 1956 },
      { id: 'e3', description: 'The Beatles appear on The Ed Sullivan Show', year: 1964 },
      { id: 'e4', description: 'Woodstock music festival takes place', year: 1969 },
      { id: 'e5', description: 'Star Wars: A New Hope is released', year: 1977 },
      { id: 'e6', description: 'MTV launches', year: 1981 },
      { id: 'e7', description: 'Michael Jackson releases "Thriller" album', year: 1982 },
      { id: 'e8', description: 'Friends TV series premieres', year: 1994 },
      { id: 'e9', description: 'The final Harry Potter book is released', year: 2007 },
    ],
  },
  {
    id: 'puzzle-4',
    theme: 'Sports History',
    events: [
      { id: 'e1', description: 'The first modern Olympic Games are held in Athens', year: 1896 },
      { id: 'e2', description: 'Babe Ruth hits his 60th home run in a season', year: 1927 },
      { id: 'e3', description: 'Jesse Owens wins 4 gold medals at Berlin Olympics', year: 1936 },
      { id: 'e4', description: 'Jackie Robinson breaks MLB color barrier', year: 1947 },
      { id: 'e5', description: 'Muhammad Ali defeats Sonny Liston for heavyweight title', year: 1964 },
      { id: 'e6', description: 'Miracle on Ice: USA hockey defeats Soviet Union', year: 1980 },
      { id: 'e7', description: 'Michael Jordan wins first NBA Championship', year: 1991 },
      { id: 'e8', description: 'Tiger Woods wins his first Masters', year: 1997 },
      { id: 'e9', description: 'Leicester City wins the Premier League', year: 2016 },
    ],
  },
  {
    id: 'puzzle-5',
    theme: 'Science Discoveries',
    events: [
      { id: 'e1', description: 'Darwin publishes "On the Origin of Species"', year: 1859 },
      { id: 'e2', description: 'Marie Curie discovers radioactivity', year: 1898 },
      { id: 'e3', description: 'Einstein publishes the theory of relativity', year: 1905 },
      { id: 'e4', description: 'Penicillin is discovered', year: 1928 },
      { id: 'e5', description: 'The structure of DNA is discovered', year: 1953 },
      { id: 'e6', description: 'The first heart transplant is performed', year: 1967 },
      { id: 'e7', description: 'Dolly the sheep becomes first cloned mammal', year: 1996 },
      { id: 'e8', description: 'The Human Genome Project is completed', year: 2003 },
      { id: 'e9', description: 'The Higgs boson particle is confirmed', year: 2012 },
    ],
  },
  {
    id: 'puzzle-6',
    theme: 'World Leaders',
    events: [
      { id: 'e1', description: 'Napoleon Bonaparte becomes Emperor of France', year: 1804 },
      { id: 'e2', description: 'Queen Victoria begins her reign', year: 1837 },
      { id: 'e3', description: 'Winston Churchill becomes British Prime Minister', year: 1940 },
      { id: 'e4', description: 'Mahatma Gandhi is assassinated', year: 1948 },
      { id: 'e5', description: 'John F. Kennedy is inaugurated as US President', year: 1961 },
      { id: 'e6', description: 'Margaret Thatcher becomes UK Prime Minister', year: 1979 },
      { id: 'e7', description: 'Mikhail Gorbachev becomes Soviet leader', year: 1985 },
      { id: 'e8', description: 'Barack Obama is inaugurated as US President', year: 2009 },
      { id: 'e9', description: 'Queen Elizabeth II passes away', year: 2022 },
    ],
  },
  {
    id: 'puzzle-7',
    theme: 'Natural Events & Disasters',
    events: [
      { id: 'e1', description: 'Krakatoa volcano erupts', year: 1883 },
      { id: 'e2', description: 'San Francisco earthquake strikes', year: 1906 },
      { id: 'e3', description: 'The Dust Bowl devastates the Great Plains', year: 1935 },
      { id: 'e4', description: 'Atomic bombs are dropped on Japan', year: 1945 },
      { id: 'e5', description: 'The Chernobyl nuclear disaster occurs', year: 1986 },
      { id: 'e6', description: 'Hurricane Katrina strikes New Orleans', year: 2005 },
      { id: 'e7', description: 'The Deepwater Horizon oil spill occurs', year: 2010 },
      { id: 'e8', description: 'Fukushima nuclear disaster occurs', year: 2011 },
      { id: 'e9', description: 'COVID-19 pandemic begins', year: 2020 },
    ],
  },
  {
    id: 'puzzle-8',
    theme: 'Space Exploration',
    events: [
      { id: 'e1', description: 'Sputnik 1 becomes first artificial satellite', year: 1957 },
      { id: 'e2', description: 'Yuri Gagarin becomes first human in space', year: 1961 },
      { id: 'e3', description: 'Neil Armstrong walks on the moon', year: 1969 },
      { id: 'e4', description: 'Voyager 1 is launched', year: 1977 },
      { id: 'e5', description: 'Space Shuttle Challenger disaster', year: 1986 },
      { id: 'e6', description: 'Hubble Space Telescope is deployed', year: 1990 },
      { id: 'e7', description: 'International Space Station begins construction', year: 1998 },
      { id: 'e8', description: 'Mars Curiosity Rover lands successfully', year: 2012 },
      { id: 'e9', description: 'SpaceX Crew Dragon first crewed mission', year: 2020 },
    ],
  },
  {
    id: 'puzzle-9',
    theme: 'Mixed History',
    events: [
      { id: 'e1', description: 'The Eiffel Tower opens in Paris', year: 1889 },
      { id: 'e2', description: 'The Panama Canal opens', year: 1914 },
      { id: 'e3', description: 'The Great Depression begins', year: 1929 },
      { id: 'e4', description: 'India gains independence from Britain', year: 1947 },
      { id: 'e5', description: 'The Cuban Missile Crisis occurs', year: 1962 },
      { id: 'e6', description: 'The Vietnam War ends', year: 1975 },
      { id: 'e7', description: 'Princess Diana dies in a car crash', year: 1997 },
      { id: 'e8', description: 'Facebook is launched', year: 2004 },
      { id: 'e9', description: 'The UK votes for Brexit', year: 2016 },
    ],
  },
]

export function getPuzzleById(id: string): FlashbackPuzzle | null {
  return puzzles.find(p => p.id === id) || null
}

export function getRandomPuzzle(): FlashbackPuzzle {
  const index = Math.floor(Math.random() * puzzles.length)
  return puzzles[index]
}

export function getPuzzleByIndex(index: number): FlashbackPuzzle {
  return puzzles[index % puzzles.length]
}

/**
 * Fetch puzzles from Supabase with fallback to hardcoded data.
 * Results are cached for 5 minutes to reduce database calls.
 */
export async function fetchPuzzles(): Promise<FlashbackPuzzle[]> {
  const now = Date.now()

  // Return cached data if still valid
  if (cachedPuzzles && (now - cacheTimestamp) < CACHE_DURATION_MS) {
    return cachedPuzzles
  }

  try {
    const { data, error } = await supabase
      .from('game_puzzles')
      .select('id, theme, events')
      .eq('enabled', true)

    if (error) {
      console.error('Error fetching puzzles from Supabase:', error)
      return puzzles // Fall back to hardcoded
    }

    if (data && data.length > 0) {
      // Convert database response to FlashbackPuzzle type
      cachedPuzzles = data.map(puzzle => ({
        id: puzzle.id,
        theme: puzzle.theme,
        events: puzzle.events as TimelineEvent[],
      }))
      cacheTimestamp = now
      return cachedPuzzles
    }

    // No data in database, use hardcoded
    return puzzles
  } catch (err) {
    console.error('Failed to fetch puzzles:', err)
    return puzzles // Fall back to hardcoded
  }
}

/**
 * Get all puzzles - combines database and hardcoded content.
 * Prefers database content when available.
 */
export async function getAllPuzzles(): Promise<FlashbackPuzzle[]> {
  const dbPuzzles = await fetchPuzzles()

  // If we got puzzles from DB, use those (they may be the same as hardcoded)
  if (dbPuzzles !== puzzles) {
    return dbPuzzles
  }

  // Fall back to hardcoded
  return puzzles
}

/**
 * Get a random puzzle - async version that fetches from DB first.
 */
export async function getRandomPuzzleAsync(): Promise<FlashbackPuzzle> {
  const allPuzzles = await getAllPuzzles()
  const index = Math.floor(Math.random() * allPuzzles.length)
  return allPuzzles[index]
}

/**
 * Get a puzzle by ID - async version that fetches from DB first.
 */
export async function getPuzzleByIdAsync(id: string): Promise<FlashbackPuzzle | null> {
  const allPuzzles = await getAllPuzzles()
  return allPuzzles.find(p => p.id === id) || null
}

/**
 * Get a puzzle by index - async version that fetches from DB first.
 */
export async function getPuzzleByIndexAsync(index: number): Promise<FlashbackPuzzle> {
  const allPuzzles = await getAllPuzzles()
  return allPuzzles[index % allPuzzles.length]
}

/**
 * Clear the puzzle cache (useful for testing or after imports).
 */
export function clearPuzzleCache(): void {
  cachedPuzzles = null
  cacheTimestamp = 0
}
