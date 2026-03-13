import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Load environment variables from .env.local
const envFile = readFileSync('.env.local', 'utf-8')
const env: Record<string, string> = {}
for (const line of envFile.split('\n')) {
  const [key, ...rest] = line.split('=')
  if (key && rest.length) {
    env[key.trim()] = rest.join('=').trim()
  }
}

const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseKey = env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const locations = [
  { id: 'eiffel-tower', name: 'Eiffel Tower', clue: "Built for a world's fair and nearly torn down — it survived only because its height made it a useful radio transmitter", lat: 48.8584, lng: 2.2945, difficulty: 'easy' },
  { id: 'machu-picchu', name: 'Machu Picchu', clue: 'A mountaintop city abandoned so abruptly that its builders left tools mid-task — rediscovered by a Western explorer in 1911', lat: -13.1631, lng: -72.5450, difficulty: 'easy' },
  { id: 'mount-everest', name: 'Mount Everest', clue: 'Its summit rises about 4mm every year as the tectonic plates beneath it slowly continue their collision', lat: 27.9881, lng: 86.9250, difficulty: 'easy' },
  { id: 'grand-canyon', name: 'Grand Canyon', clue: 'A hike from rim to river here passes through two billion years of exposed geological history in a single afternoon', lat: 36.1069, lng: -112.1129, difficulty: 'easy' },
  { id: 'colosseum', name: 'Colosseum', clue: 'This oval arena once flooded its floor to stage mock naval battles for crowds of 50,000 spectators', lat: 41.8902, lng: 12.4922, difficulty: 'easy' },
  { id: 'stonehenge', name: 'Stonehenge', clue: 'Its largest stones were dragged from a quarry 160 miles away by people with no wheels or metal tools — how, nobody fully agrees', lat: 51.1789, lng: -1.8262, difficulty: 'easy' },
  { id: 'niagara-falls', name: 'Niagara Falls', clue: 'Engineers secretly switched these falls completely off in 1969 to study the riverbed — most tourists had no idea', lat: 43.0962, lng: -79.0377, difficulty: 'easy' },
  { id: 'dead-sea', name: 'Dead Sea', clue: 'You physically cannot sink here no matter how hard you try — the water is so saturated with minerals your body simply floats', lat: 31.5590, lng: 35.4732, difficulty: 'easy' },
  { id: 'chichen-itza', name: 'Chichen Itza', clue: 'On two days each year the setting sun casts a shadow that makes a serpent appear to slither down the main pyramid', lat: 20.6843, lng: -88.5678, difficulty: 'medium' },
  { id: 'cappadocia', name: 'Cappadocia', clue: 'Ancient volcanic ash hardened into soft rock that people carved into entire underground cities capable of hiding tens of thousands of residents', lat: 38.6431, lng: 34.8289, difficulty: 'medium' },
  { id: 'okavango-delta', name: 'Okavango Delta', clue: 'An entire river travels over 1,000km only to vanish — it never reaches the sea, instead flooding an inland desert before slowly evaporating', lat: -19.3058, lng: 22.8966, difficulty: 'medium' },
  { id: 'serengeti', name: 'Serengeti', clue: 'Each year 1.5 million large animals travel a circular route of nearly 2,000km in what scientists call the greatest wildlife spectacle on earth', lat: -2.3333, lng: 34.8333, difficulty: 'medium' },
  { id: 'geirangerfjord', name: 'Geirangerfjord', clue: 'Glaciers spent millions of years carving this arm of seawater so deep that enormous ocean liners can sail between sheer mountain walls', lat: 62.1015, lng: 7.2063, difficulty: 'medium' },
  { id: 'pamukkale', name: 'Pamukkale', clue: 'Calcium-rich hot springs cascade down a hillside depositing gleaming white mineral terraces that look like a frozen waterfall from a distance', lat: 37.9137, lng: 29.1189, difficulty: 'medium' },
  { id: 'mount-kilimanjaro', name: 'Mount Kilimanjaro', clue: "Africa's highest peak rises dramatically from flat savanna plains — and the glaciers that have capped it for 11,000 years are nearly gone", lat: -3.0674, lng: 37.3556, difficulty: 'medium' },
  { id: 'halong-bay', name: 'Hạ Long Bay', clue: 'Thousands of limestone islands rise from the sea like the humps of a submerged creature, inspiring a legend that a dragon created them', lat: 20.9101, lng: 107.1839, difficulty: 'medium' },
  { id: 'lake-titicaca', name: 'Lake Titicaca', clue: 'The highest navigable lake on earth, where entire inhabited islands are constructed on floating platforms woven from aquatic reeds', lat: -15.9254, lng: -69.3354, difficulty: 'medium' },
  { id: 'salar-de-uyuni', name: 'Salar de Uyuni', clue: 'After thin rainfall, this vast salt flat becomes so perfectly reflective that pilots have become disoriented unable to tell sky from ground', lat: -20.1338, lng: -67.4891, difficulty: 'hard' },
  { id: 'socotra-island', name: 'Socotra Island', clue: "This island's signature tree looks completely upside-down with an umbrella-shaped canopy — it grows nowhere else on the planet", lat: 12.4634, lng: 53.8237, difficulty: 'hard' },
  { id: 'zhangjiajie', name: 'Zhangjiajie', clue: 'Thousands of sandstone pillars rising vertically from a forested floor were scanned and used as the floating mountains in a famous sci-fi blockbuster', lat: 29.3245, lng: 110.4346, difficulty: 'hard' },
  { id: 'waitomo-caves', name: 'Waitomo Caves', clue: 'The cave ceiling glows like a galaxy because thousands of larvae have strung sticky silk threads using bioluminescent lures to trap insects', lat: -38.2610, lng: 175.1040, difficulty: 'hard' },
  { id: 'richat-structure', name: 'Richat Structure', clue: 'A 50km bullseye clearly visible from orbit that geologists long assumed was a meteor crater — it is actually geological erosion', lat: 21.1240, lng: -11.3980, difficulty: 'hard' },
  { id: 'lake-natron', name: 'Lake Natron', clue: 'This alkaline lake turns animals that fall in to stone — its caustic waters preserve carcasses so perfectly that calcified birds wash onto its shores', lat: -2.4167, lng: 36.0000, difficulty: 'hard' },
  { id: 'valley-of-geysers', name: 'Valley of Geysers', clue: 'The second-largest geyser field on earth sits on a volcanic peninsula so remote it is reachable only by helicopter for most of the year', lat: 54.4395, lng: 160.1167, difficulty: 'hard' },
  { id: 'dallol', name: 'Dallol', clue: "One of the most hostile places on the planet's surface, where acid pools glow neon yellow and chartreuse amid toxic gas vents — all below sea level", lat: 14.2417, lng: 40.2958, difficulty: 'hard' },
]

async function importLocations() {
  console.log(`Importing ${locations.length} locations...`)

  const { data, error } = await supabase
    .from('game_locations')
    .upsert(locations, { onConflict: 'id' })
    .select()

  if (error) {
    console.error('Error importing locations:', error)
    process.exit(1)
  }

  console.log(`Successfully imported ${data?.length ?? 0} locations!`)
}

importLocations()
