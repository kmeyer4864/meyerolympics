import { useEffect, useState, useCallback, useRef } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import L from 'leaflet'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import 'leaflet/dist/leaflet.css'

interface CountryMapProps {
  onCountrySelect: (countryId: string, countryName: string) => void
  wrongGuesses: string[]
  correctCountry: string | null
  disabled: boolean
}

// Country name to ID mapping (lowercase, handle variations)
function normalizeCountryName(name: string): string {
  const normalized = name.toLowerCase().trim()

  // Handle common variations
  const mappings: Record<string, string> = {
    'united states of america': 'usa',
    'united states': 'usa',
    'united kingdom': 'uk',
    'great britain': 'uk',
    'russian federation': 'russia',
    'republic of korea': 'south-korea',
    'korea, republic of': 'south-korea',
    'south korea': 'south-korea',
    "korea, democratic people's republic of": 'north-korea',
    'north korea': 'north-korea',
    'viet nam': 'vietnam',
    'new zealand': 'new-zealand',
    'south africa': 'south-africa',
  }

  return mappings[normalized] || normalized.replace(/\s+/g, '-')
}

// Component to handle country interactions
function CountryLayer({
  data,
  onCountrySelect,
  wrongGuesses,
  correctCountry,
  disabled,
}: {
  data: FeatureCollection
  onCountrySelect: (countryId: string, countryName: string) => void
  wrongGuesses: string[]
  correctCountry: string | null
  disabled: boolean
}) {
  const geoJsonRef = useRef<L.GeoJSON | null>(null)
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)

  const getCountryStyle = useCallback((feature: Feature<Geometry> | undefined) => {
    if (!feature?.properties) return {}

    const countryName = feature.properties.ADMIN || feature.properties.name || ''
    const countryId = normalizeCountryName(countryName)

    const isCorrect = correctCountry === countryId
    const isWrong = wrongGuesses.includes(countryId)
    const isHovered = hoveredCountry === countryId

    let fillColor = '#334155' // slate-700 default
    let fillOpacity = 0.6
    let weight = 1
    let color = '#1e293b' // border color

    if (isCorrect) {
      fillColor = '#22c55e' // green-500
      fillOpacity = 0.8
      weight = 2
      color = '#16a34a'
    } else if (isWrong) {
      fillColor = '#ef4444' // red-500
      fillOpacity = 0.7
      weight = 1
      color = '#dc2626'
    } else if (isHovered && !disabled) {
      fillColor = '#fbbf24' // amber-400 / gold
      fillOpacity = 0.8
      weight = 2
      color = '#f59e0b'
    }

    return {
      fillColor,
      fillOpacity,
      weight,
      color,
      opacity: 1,
    }
  }, [wrongGuesses, correctCountry, hoveredCountry, disabled])

  const onEachCountry = useCallback((feature: Feature<Geometry>, layer: L.Layer) => {
    const countryName = feature.properties?.ADMIN || feature.properties?.name || 'Unknown'
    const countryId = normalizeCountryName(countryName)
    const isWrong = wrongGuesses.includes(countryId)
    const isCorrect = correctCountry === countryId

    // Bind tooltip with country name (only show on hover)
    layer.bindTooltip(countryName, {
      permanent: false,
      direction: 'top',
      className: 'country-tooltip',
    })

    layer.on({
      mouseover: (e) => {
        if (!disabled && !isWrong && !correctCountry) {
          setHoveredCountry(countryId)
          const target = e.target as L.Path
          target.setStyle({
            fillColor: '#fbbf24',
            fillOpacity: 0.8,
            weight: 2,
          })
          target.bringToFront()
        }
      },
      mouseout: (e) => {
        setHoveredCountry(null)
        if (geoJsonRef.current) {
          geoJsonRef.current.resetStyle(e.target)
        }
      },
      click: () => {
        if (!disabled && !isWrong && !isCorrect && !correctCountry) {
          onCountrySelect(countryId, countryName)
        }
      },
    })
  }, [wrongGuesses, correctCountry, disabled, onCountrySelect])

  // Update styles when state changes
  useEffect(() => {
    if (geoJsonRef.current) {
      geoJsonRef.current.setStyle(getCountryStyle as L.StyleFunction)
    }
  }, [wrongGuesses, correctCountry, getCountryStyle])

  return (
    <GeoJSON
      ref={geoJsonRef}
      data={data}
      style={getCountryStyle}
      onEachFeature={onEachCountry}
    />
  )
}

export default function CountryMap({
  onCountrySelect,
  wrongGuesses,
  correctCountry,
  disabled,
}: CountryMapProps) {
  const [countriesData, setCountriesData] = useState<FeatureCollection | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch country boundaries GeoJSON
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        // Using Natural Earth data via CDN (simplified for performance)
        const response = await fetch(
          'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson'
        )
        if (!response.ok) throw new Error('Failed to load map data')
        const data = await response.json()
        setCountriesData(data)
      } catch (err) {
        console.error('Error loading country data:', err)
        setError('Failed to load map. Please refresh the page.')
      } finally {
        setLoading(false)
      }
    }

    fetchCountries()
  }, [])

  if (loading) {
    return (
      <div className="w-full aspect-[2/1] rounded-lg overflow-hidden border border-navy-600 bg-navy-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold mx-auto mb-2"></div>
          <p className="text-gray-400 text-sm">Loading map...</p>
        </div>
      </div>
    )
  }

  if (error || !countriesData) {
    return (
      <div className="w-full aspect-[2/1] rounded-lg overflow-hidden border border-navy-600 bg-navy-900 flex items-center justify-center">
        <div className="text-center text-red-400">
          <p>{error || 'Failed to load map'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full aspect-[2/1] rounded-lg overflow-hidden border border-navy-600">
      <style>{`
        .country-tooltip {
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid #fbbf24;
          border-radius: 4px;
          color: white;
          font-weight: 600;
          padding: 4px 8px;
          font-size: 12px;
        }
        .country-tooltip::before {
          border-top-color: #fbbf24 !important;
        }
      `}</style>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={1}
        maxZoom={6}
        style={{ height: '100%', width: '100%' }}
        className="bg-navy-900"
        worldCopyJump={true}
      >
        {/* Dark base layer - no labels */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
        />

        {/* Country boundaries */}
        <CountryLayer
          data={countriesData}
          onCountrySelect={onCountrySelect}
          wrongGuesses={wrongGuesses}
          correctCountry={correctCountry}
          disabled={disabled}
        />
      </MapContainer>

      {/* Legend */}
      <div className="relative">
        <div className="absolute bottom-2 right-2 flex gap-3 text-xs text-gray-400 bg-navy-900/90 px-3 py-1.5 rounded z-[1000]">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-slate-600" />
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
      </div>
    </div>
  )
}
