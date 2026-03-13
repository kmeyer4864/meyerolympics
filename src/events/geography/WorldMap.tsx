import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Custom marker icons
const guessIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <circle cx="12" cy="12" r="10" fill="#FFD700" stroke="#000" stroke-width="2"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

const correctIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <circle cx="12" cy="12" r="10" fill="#22c55e" stroke="#000" stroke-width="2"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

const opponentIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <circle cx="12" cy="12" r="10" fill="#a855f7" stroke="#000" stroke-width="2"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

interface WorldMapProps {
  onLocationSelect: (lat: number, lng: number) => void
  selectedLocation: { lat: number; lng: number } | null
  correctLocation?: { lat: number; lng: number } | null
  opponentGuess?: { lat: number; lng: number } | null
  showCorrect?: boolean
  showOpponent?: boolean
  disabled?: boolean
}

// Component to handle map click events
function MapClickHandler({
  onLocationSelect,
  disabled,
}: {
  onLocationSelect: (lat: number, lng: number) => void
  disabled: boolean
}) {
  useMapEvents({
    click: (e) => {
      if (!disabled) {
        onLocationSelect(e.latlng.lat, e.latlng.lng)
      }
    },
  })
  return null
}

// Component to reset map view when showing result
function MapViewController({
  selectedLocation,
  correctLocation,
  opponentGuess,
  showCorrect,
  showOpponent,
}: {
  selectedLocation: { lat: number; lng: number } | null
  correctLocation: { lat: number; lng: number } | null
  opponentGuess: { lat: number; lng: number } | null
  showCorrect: boolean
  showOpponent: boolean
}) {
  const map = useMap()

  useEffect(() => {
    if ((showCorrect || showOpponent) && selectedLocation) {
      // Collect all points to fit bounds
      const points: [number, number][] = [[selectedLocation.lat, selectedLocation.lng]]

      if (showCorrect && correctLocation) {
        points.push([correctLocation.lat, correctLocation.lng])
      }

      if (showOpponent && opponentGuess) {
        points.push([opponentGuess.lat, opponentGuess.lng])
      }

      if (points.length > 1) {
        const bounds = L.latLngBounds(points)
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 })
      }
    }
  }, [showCorrect, showOpponent, selectedLocation, correctLocation, opponentGuess, map])

  return null
}

export default function WorldMap({
  onLocationSelect,
  selectedLocation,
  correctLocation,
  opponentGuess,
  showCorrect = false,
  showOpponent = false,
  disabled = false,
}: WorldMapProps) {
  const [mapKey, setMapKey] = useState(0)

  // Reset map when starting new location
  useEffect(() => {
    if (!showCorrect && !selectedLocation) {
      setMapKey(k => k + 1)
    }
  }, [showCorrect, selectedLocation])

  return (
    <div className={`w-full aspect-[2/1] rounded-lg overflow-hidden border border-navy-600 ${disabled ? '' : 'cursor-crosshair'}`}>
      <MapContainer
        key={mapKey}
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        maxZoom={18}
        style={{ height: '100%', width: '100%' }}
        className="bg-navy-900"
      >
        {/* Satellite imagery - no labels, no borders, just natural geography */}
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />

        <MapClickHandler onLocationSelect={onLocationSelect} disabled={disabled} />

        <MapViewController
          selectedLocation={selectedLocation}
          correctLocation={correctLocation ?? null}
          opponentGuess={opponentGuess ?? null}
          showCorrect={showCorrect}
          showOpponent={showOpponent}
        />

        {/* Line connecting guess to correct answer */}
        {showCorrect && selectedLocation && correctLocation && (
          <Polyline
            positions={[
              [selectedLocation.lat, selectedLocation.lng],
              [correctLocation.lat, correctLocation.lng],
            ]}
            color="#FFD700"
            weight={3}
            dashArray="10, 10"
          />
        )}

        {/* Line connecting opponent guess to correct answer */}
        {showOpponent && showCorrect && opponentGuess && correctLocation && (
          <Polyline
            positions={[
              [opponentGuess.lat, opponentGuess.lng],
              [correctLocation.lat, correctLocation.lng],
            ]}
            color="#a855f7"
            weight={3}
            dashArray="10, 10"
          />
        )}

        {/* Selected location marker (your guess) */}
        {selectedLocation && (
          <Marker
            position={[selectedLocation.lat, selectedLocation.lng]}
            icon={guessIcon}
          />
        )}

        {/* Opponent guess marker */}
        {showOpponent && opponentGuess && (
          <Marker
            position={[opponentGuess.lat, opponentGuess.lng]}
            icon={opponentIcon}
          />
        )}

        {/* Correct location marker */}
        {showCorrect && correctLocation && (
          <Marker
            position={[correctLocation.lat, correctLocation.lng]}
            icon={correctIcon}
          />
        )}
      </MapContainer>
    </div>
  )
}
