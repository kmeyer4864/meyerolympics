import { useState, useCallback } from 'react'

interface CountrySelectMapProps {
  onCountrySelect: (countryId: string) => void
  wrongGuesses: string[]
  correctCountry: string | null
  disabled: boolean
}

// Simplified country data with approximate positions and sizes for visual layout
// This creates a stylized world map grid
interface CountryRegion {
  id: string
  name: string
  x: number  // grid position 0-100
  y: number  // grid position 0-100
  width: number
  height: number
}

const countryRegions: CountryRegion[] = [
  // North America
  { id: 'canada', name: 'Canada', x: 10, y: 10, width: 18, height: 12 },
  { id: 'usa', name: 'United States', x: 10, y: 22, width: 16, height: 10 },
  { id: 'mexico', name: 'Mexico', x: 10, y: 32, width: 8, height: 8 },

  // South America
  { id: 'brazil', name: 'Brazil', x: 22, y: 45, width: 12, height: 14 },
  { id: 'argentina', name: 'Argentina', x: 20, y: 60, width: 8, height: 14 },
  { id: 'peru', name: 'Peru', x: 16, y: 48, width: 6, height: 8 },

  // Europe
  { id: 'uk', name: 'United Kingdom', x: 42, y: 14, width: 4, height: 6 },
  { id: 'france', name: 'France', x: 44, y: 20, width: 5, height: 6 },
  { id: 'spain', name: 'Spain', x: 42, y: 26, width: 5, height: 5 },
  { id: 'germany', name: 'Germany', x: 49, y: 18, width: 4, height: 5 },
  { id: 'italy', name: 'Italy', x: 50, y: 24, width: 4, height: 7 },
  { id: 'greece', name: 'Greece', x: 54, y: 28, width: 4, height: 4 },
  { id: 'norway', name: 'Norway', x: 48, y: 8, width: 4, height: 10 },
  { id: 'iceland', name: 'Iceland', x: 38, y: 8, width: 4, height: 4 },

  // Africa
  { id: 'egypt', name: 'Egypt', x: 54, y: 32, width: 6, height: 6 },
  { id: 'kenya', name: 'Kenya', x: 58, y: 48, width: 5, height: 5 },
  { id: 'south-africa', name: 'South Africa', x: 54, y: 62, width: 6, height: 6 },

  // Asia
  { id: 'russia', name: 'Russia', x: 55, y: 8, width: 30, height: 14 },
  { id: 'china', name: 'China', x: 72, y: 24, width: 12, height: 10 },
  { id: 'india', name: 'India', x: 68, y: 34, width: 8, height: 10 },
  { id: 'japan', name: 'Japan', x: 86, y: 24, width: 4, height: 8 },
  { id: 'south-korea', name: 'South Korea', x: 84, y: 28, width: 3, height: 4 },
  { id: 'thailand', name: 'Thailand', x: 76, y: 38, width: 4, height: 6 },
  { id: 'vietnam', name: 'Vietnam', x: 80, y: 36, width: 3, height: 8 },

  // Oceania
  { id: 'australia', name: 'Australia', x: 78, y: 55, width: 14, height: 12 },
  { id: 'new-zealand', name: 'New Zealand', x: 92, y: 65, width: 4, height: 6 },
]

export default function CountrySelectMap({
  onCountrySelect,
  wrongGuesses,
  correctCountry,
  disabled,
}: CountrySelectMapProps) {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)

  const handleCountryClick = useCallback((countryId: string) => {
    if (disabled) return
    if (wrongGuesses.includes(countryId)) return
    if (correctCountry) return
    onCountrySelect(countryId)
  }, [disabled, wrongGuesses, correctCountry, onCountrySelect])

  const getCountryColor = (countryId: string): string => {
    if (correctCountry === countryId) return '#22c55e' // green-500
    if (wrongGuesses.includes(countryId)) return '#ef4444' // red-500
    if (hoveredCountry === countryId && !disabled) return '#fbbf24' // gold/amber-400
    return '#334155' // slate-700
  }

  const getCountryOpacity = (countryId: string): number => {
    if (correctCountry === countryId) return 1
    if (wrongGuesses.includes(countryId)) return 0.7
    return 1
  }

  const isClickable = (countryId: string): boolean => {
    if (disabled) return false
    if (wrongGuesses.includes(countryId)) return false
    if (correctCountry) return false
    return true
  }

  return (
    <div className="relative w-full aspect-[2/1] bg-navy-900 rounded-xl overflow-hidden border border-navy-600">
      {/* Ocean background */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-800 to-navy-900" />

      {/* Grid lines for visual reference */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        {[...Array(10)].map((_, i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={`${(i + 1) * 10}%`}
            x2="100%"
            y2={`${(i + 1) * 10}%`}
            stroke="white"
            strokeWidth="0.5"
          />
        ))}
        {[...Array(10)].map((_, i) => (
          <line
            key={`v-${i}`}
            x1={`${(i + 1) * 10}%`}
            y1="0"
            x2={`${(i + 1) * 10}%`}
            y2="100%"
            stroke="white"
            strokeWidth="0.5"
          />
        ))}
      </svg>

      {/* Country regions */}
      <svg className="absolute inset-0 w-full h-full">
        {countryRegions.map((country) => (
          <g key={country.id}>
            <rect
              x={`${country.x}%`}
              y={`${country.y}%`}
              width={`${country.width}%`}
              height={`${country.height}%`}
              rx="4"
              fill={getCountryColor(country.id)}
              opacity={getCountryOpacity(country.id)}
              stroke={hoveredCountry === country.id ? '#fbbf24' : '#1e293b'}
              strokeWidth={hoveredCountry === country.id ? '2' : '1'}
              className={`transition-all duration-150 ${
                isClickable(country.id) ? 'cursor-pointer' : 'cursor-not-allowed'
              }`}
              onMouseEnter={() => isClickable(country.id) && setHoveredCountry(country.id)}
              onMouseLeave={() => setHoveredCountry(null)}
              onClick={() => handleCountryClick(country.id)}
            />
            {/* Country label - only show on hover or if already guessed */}
            {(hoveredCountry === country.id || wrongGuesses.includes(country.id) || correctCountry === country.id) && (
              <text
                x={`${country.x + country.width / 2}%`}
                y={`${country.y + country.height / 2}%`}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="10"
                fontWeight="bold"
                className="pointer-events-none select-none"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
              >
                {country.name}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-2 right-2 flex gap-3 text-xs text-gray-400 bg-navy-900/80 px-3 py-1.5 rounded">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-slate-700" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span>Wrong</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>Correct</span>
        </div>
      </div>

      {/* Hover tooltip */}
      {hoveredCountry && isClickable(hoveredCountry) && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-gold text-navy-900 px-3 py-1 rounded font-bold text-sm">
          Click to guess: {countryRegions.find(c => c.id === hoveredCountry)?.name}
        </div>
      )}
    </div>
  )
}

// Export country IDs that are available in the map
export const availableCountryIds = countryRegions.map(c => c.id)
