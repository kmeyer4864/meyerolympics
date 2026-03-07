export interface Location {
  id: string
  name: string
  clue: string
  lat: number
  lng: number
  difficulty: 'easy' | 'medium' | 'hard'
}

export const locations: Location[] = [
  // Easy - Famous Landmarks
  { id: 'eiffel', name: 'Eiffel Tower', clue: 'Famous iron lattice tower in Paris', lat: 48.8584, lng: 2.2945, difficulty: 'easy' },
  { id: 'statue-liberty', name: 'Statue of Liberty', clue: 'Gift from France in New York Harbor', lat: 40.6892, lng: -74.0445, difficulty: 'easy' },
  { id: 'big-ben', name: 'Big Ben', clue: 'Famous clock tower in London', lat: 51.5007, lng: -0.1246, difficulty: 'easy' },
  { id: 'colosseum', name: 'Colosseum', clue: 'Ancient Roman amphitheater in Italy', lat: 41.8902, lng: 12.4922, difficulty: 'easy' },
  { id: 'great-wall', name: 'Great Wall of China', clue: 'Ancient fortification visible from space', lat: 40.4319, lng: 116.5704, difficulty: 'easy' },
  { id: 'taj-mahal', name: 'Taj Mahal', clue: 'White marble mausoleum in India', lat: 27.1751, lng: 78.0421, difficulty: 'easy' },
  { id: 'sydney-opera', name: 'Sydney Opera House', clue: 'Iconic performing arts venue in Australia', lat: -33.8568, lng: 151.2153, difficulty: 'easy' },
  { id: 'golden-gate', name: 'Golden Gate Bridge', clue: 'Famous red suspension bridge in California', lat: 37.8199, lng: -122.4783, difficulty: 'easy' },
  { id: 'christ-redeemer', name: 'Christ the Redeemer', clue: 'Giant statue overlooking Rio de Janeiro', lat: -22.9519, lng: -43.2105, difficulty: 'easy' },
  { id: 'pyramid-giza', name: 'Great Pyramid of Giza', clue: 'Ancient wonder in the Egyptian desert', lat: 29.9792, lng: 31.1342, difficulty: 'easy' },

  // Easy - World Capitals
  { id: 'tokyo', name: 'Tokyo', clue: 'Capital of Japan, largest city in the world', lat: 35.6762, lng: 139.6503, difficulty: 'easy' },
  { id: 'moscow', name: 'Moscow', clue: 'Capital of Russia, home of the Kremlin', lat: 55.7558, lng: 37.6173, difficulty: 'easy' },
  { id: 'beijing', name: 'Beijing', clue: 'Capital of China, location of the Forbidden City', lat: 39.9042, lng: 116.4074, difficulty: 'easy' },
  { id: 'washington-dc', name: 'Washington D.C.', clue: 'Capital of the United States', lat: 38.9072, lng: -77.0369, difficulty: 'easy' },
  { id: 'cairo', name: 'Cairo', clue: 'Capital of Egypt on the Nile River', lat: 30.0444, lng: 31.2357, difficulty: 'easy' },

  // Medium - Cities
  { id: 'dubai', name: 'Dubai', clue: 'City of skyscrapers in the UAE desert', lat: 25.2048, lng: 55.2708, difficulty: 'medium' },
  { id: 'singapore', name: 'Singapore', clue: 'Island city-state in Southeast Asia', lat: 1.3521, lng: 103.8198, difficulty: 'medium' },
  { id: 'cape-town', name: 'Cape Town', clue: 'South African city beneath Table Mountain', lat: -33.9249, lng: 18.4241, difficulty: 'medium' },
  { id: 'mumbai', name: 'Mumbai', clue: "India's financial capital, formerly Bombay", lat: 19.0760, lng: 72.8777, difficulty: 'medium' },
  { id: 'istanbul', name: 'Istanbul', clue: 'City spanning two continents in Turkey', lat: 41.0082, lng: 28.9784, difficulty: 'medium' },
  { id: 'bangkok', name: 'Bangkok', clue: 'Capital of Thailand, city of temples', lat: 13.7563, lng: 100.5018, difficulty: 'medium' },
  { id: 'buenos-aires', name: 'Buenos Aires', clue: 'Capital of Argentina, tango capital', lat: -34.6037, lng: -58.3816, difficulty: 'medium' },
  { id: 'seoul', name: 'Seoul', clue: 'Capital of South Korea, K-pop central', lat: 37.5665, lng: 126.9780, difficulty: 'medium' },
  { id: 'toronto', name: 'Toronto', clue: 'Canadian city with the CN Tower', lat: 43.6532, lng: -79.3832, difficulty: 'medium' },
  { id: 'amsterdam', name: 'Amsterdam', clue: 'Dutch capital known for canals and bikes', lat: 52.3676, lng: 4.9041, difficulty: 'medium' },

  // Medium - Natural Wonders
  { id: 'grand-canyon', name: 'Grand Canyon', clue: 'Massive gorge carved by the Colorado River', lat: 36.1069, lng: -112.1129, difficulty: 'medium' },
  { id: 'everest', name: 'Mount Everest', clue: "World's highest peak in the Himalayas", lat: 27.9881, lng: 86.9250, difficulty: 'medium' },
  { id: 'victoria-falls', name: 'Victoria Falls', clue: "World's largest waterfall in Africa", lat: -17.9243, lng: 25.8572, difficulty: 'medium' },
  { id: 'amazon-river', name: 'Amazon River Mouth', clue: "World's largest river meets the Atlantic", lat: -0.1500, lng: -49.5000, difficulty: 'medium' },
  { id: 'great-barrier', name: 'Great Barrier Reef', clue: "World's largest coral reef system", lat: -18.2871, lng: 147.6992, difficulty: 'medium' },
  { id: 'niagara', name: 'Niagara Falls', clue: 'Famous waterfalls on US-Canada border', lat: 43.0962, lng: -79.0377, difficulty: 'medium' },
  { id: 'kilimanjaro', name: 'Mount Kilimanjaro', clue: "Africa's highest peak in Tanzania", lat: -3.0674, lng: 37.3556, difficulty: 'medium' },
  { id: 'dead-sea', name: 'Dead Sea', clue: 'Lowest point on Earth, extremely salty', lat: 31.5000, lng: 35.5000, difficulty: 'medium' },

  // Medium - Historical Sites
  { id: 'machu-picchu', name: 'Machu Picchu', clue: 'Ancient Incan citadel in the Peruvian Andes', lat: -13.1631, lng: -72.5450, difficulty: 'medium' },
  { id: 'petra', name: 'Petra', clue: 'Ancient rose-red city carved in rock in Jordan', lat: 30.3285, lng: 35.4444, difficulty: 'medium' },
  { id: 'angkor-wat', name: 'Angkor Wat', clue: 'Largest religious monument in Cambodia', lat: 13.4125, lng: 103.8670, difficulty: 'medium' },
  { id: 'acropolis', name: 'Acropolis', clue: 'Ancient citadel above Athens, Greece', lat: 37.9715, lng: 23.7267, difficulty: 'medium' },
  { id: 'stonehenge', name: 'Stonehenge', clue: 'Prehistoric stone circle in England', lat: 51.1789, lng: -1.8262, difficulty: 'medium' },

  // Hard - Lesser Known Cities
  { id: 'reykjavik', name: 'Reykjavik', clue: "World's northernmost capital city", lat: 64.1466, lng: -21.9426, difficulty: 'hard' },
  { id: 'ulaanbaatar', name: 'Ulaanbaatar', clue: 'Capital of Mongolia', lat: 47.8864, lng: 106.9057, difficulty: 'hard' },
  { id: 'kathmandu', name: 'Kathmandu', clue: 'Capital of Nepal in the Himalayas', lat: 27.7172, lng: 85.3240, difficulty: 'hard' },
  { id: 'addis-ababa', name: 'Addis Ababa', clue: 'Capital of Ethiopia, highest capital in Africa', lat: 9.0320, lng: 38.7480, difficulty: 'hard' },
  { id: 'lima', name: 'Lima', clue: 'Capital of Peru on the Pacific coast', lat: -12.0464, lng: -77.0428, difficulty: 'hard' },
  { id: 'hanoi', name: 'Hanoi', clue: 'Capital of Vietnam', lat: 21.0285, lng: 105.8542, difficulty: 'hard' },
  { id: 'lagos', name: 'Lagos', clue: "Nigeria's largest city", lat: 6.5244, lng: 3.3792, difficulty: 'hard' },
  { id: 'tehran', name: 'Tehran', clue: 'Capital of Iran', lat: 35.6892, lng: 51.3890, difficulty: 'hard' },
  { id: 'bogota', name: 'Bogota', clue: 'Capital of Colombia in the Andes', lat: 4.7110, lng: -74.0721, difficulty: 'hard' },
  { id: 'manila', name: 'Manila', clue: 'Capital of the Philippines', lat: 14.5995, lng: 120.9842, difficulty: 'hard' },

  // Hard - Geographic Features
  { id: 'sahara', name: 'Sahara Desert Center', clue: "World's largest hot desert", lat: 23.4162, lng: 25.6628, difficulty: 'hard' },
  { id: 'antarctica', name: 'South Pole', clue: 'Southernmost point on Earth', lat: -90.0000, lng: 0.0000, difficulty: 'hard' },
  { id: 'mariana', name: 'Mariana Trench', clue: 'Deepest point in the ocean', lat: 11.3493, lng: 142.1996, difficulty: 'hard' },
  { id: 'lake-baikal', name: 'Lake Baikal', clue: "World's deepest and oldest lake in Russia", lat: 53.5587, lng: 108.1650, difficulty: 'hard' },
  { id: 'galapagos', name: 'Galapagos Islands', clue: "Darwin's famous islands off Ecuador", lat: -0.9538, lng: -90.9656, difficulty: 'hard' },
  { id: 'madagascar', name: 'Madagascar', clue: 'Large island nation off African coast', lat: -18.7669, lng: 46.8691, difficulty: 'hard' },
  { id: 'himalayas', name: 'Himalayan Range Center', clue: "World's highest mountain range", lat: 28.5983, lng: 83.9311, difficulty: 'hard' },
  { id: 'bermuda', name: 'Bermuda', clue: 'Island territory in the Atlantic', lat: 32.3078, lng: -64.7505, difficulty: 'hard' },
]

export function getLocationById(id: string): Location | undefined {
  return locations.find(l => l.id === id)
}

export function getLocationsByIds(ids: string[]): Location[] {
  return ids.map(id => getLocationById(id)).filter((l): l is Location => l !== undefined)
}

export function getRandomLocations(count: number): Location[] {
  const shuffled = [...locations].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export function getRandomLocationIds(count: number): string[] {
  return getRandomLocations(count).map(l => l.id)
}

// Calculate distance between two points using Haversine formula
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance in km
}

// Format distance for display
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`
  } else if (km < 100) {
    return `${km.toFixed(1)} km`
  } else {
    return `${Math.round(km).toLocaleString()} km`
  }
}
