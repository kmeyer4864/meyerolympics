import type { Profile } from '@/lib/database.types'
import type { MatchResult } from '@/events/types'
import PlayerAvatar from '../shared/PlayerAvatar'
import MedalBadge from '../shared/MedalBadge'
import { formatDistance } from '@/events/geography/locations'

interface GuessData {
  locationId: string
  locationName: string
  correctLat: number
  correctLng: number
  guessLat: number
  guessLng: number
  distance: number
}

interface GeographySummaryProps {
  player1Profile: Profile | null
  player2Profile: Profile | null
  player1Result: MatchResult | null
  player2Result: MatchResult | null
  goldWinnerId: string | null
  player1Id: string
  onContinue: () => void
  isLastEvent?: boolean
}

function GuessRow({
  locationName,
  p1Guess,
  p2Guess,
}: {
  locationName: string
  p1Guess?: GuessData
  p2Guess?: GuessData
}) {
  const p1Distance = p1Guess?.distance ?? 0
  const p2Distance = p2Guess?.distance ?? 0
  const p1Closer = p1Distance < p2Distance
  const p2Closer = p2Distance < p1Distance
  const tied = p1Distance === p2Distance

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-4 py-3 border-b border-navy-700 last:border-b-0">
      {/* Player 1 distance */}
      <div className="flex items-center gap-2">
        {p1Guess ? (
          <>
            <span className={`text-lg font-semibold ${
              p1Closer ? 'text-green-400' : tied ? 'text-gold' : 'text-gray-400'
            }`}>
              {formatDistance(p1Distance)}
            </span>
            {p1Closer && <span className="text-green-400 text-sm">Winner</span>}
          </>
        ) : (
          <span className="text-gray-600">-</span>
        )}
      </div>

      {/* Location name in the middle */}
      <div className="text-center px-4">
        <span className="text-sm text-white">{locationName}</span>
      </div>

      {/* Player 2 distance */}
      <div className="flex items-center justify-end gap-2">
        {p2Guess ? (
          <>
            {p2Closer && <span className="text-green-400 text-sm">Winner</span>}
            <span className={`text-lg font-semibold ${
              p2Closer ? 'text-green-400' : tied ? 'text-gold' : 'text-gray-400'
            }`}>
              {formatDistance(p2Distance)}
            </span>
          </>
        ) : (
          <span className="text-gray-600">-</span>
        )}
      </div>
    </div>
  )
}

export default function GeographySummary({
  player1Profile,
  player2Profile,
  player1Result,
  player2Result,
  goldWinnerId,
  player1Id,
  onContinue,
  isLastEvent = false,
}: GeographySummaryProps) {
  const isP1Gold = goldWinnerId === player1Id
  const isTie = goldWinnerId === null

  const p1Guesses = (player1Result?.metadata?.guesses as GuessData[]) || []
  const p2Guesses = (player2Result?.metadata?.guesses as GuessData[]) || []
  const p1AvgDistance = (player1Result?.metadata?.avgDistance as number) ?? 0
  const p2AvgDistance = (player2Result?.metadata?.avgDistance as number) ?? 0
  const p1TotalDistance = (player1Result?.metadata?.totalDistance as number) ?? 0
  const p2TotalDistance = (player2Result?.metadata?.totalDistance as number) ?? 0

  // Build combined list of all locations
  const allLocationIds = new Set<string>()
  p1Guesses.forEach(g => allLocationIds.add(g.locationId))
  p2Guesses.forEach(g => allLocationIds.add(g.locationId))
  const locationIdList = Array.from(allLocationIds)

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <span className="text-5xl">🌍</span>
        <h2 className="mt-4 font-display text-3xl font-bold text-white">
          Geography Results
        </h2>
      </div>

      {/* Player headers with avatars */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 mb-4 pb-4 border-b-2 border-navy-600">
        {/* Player 1 */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <PlayerAvatar profile={player1Profile} size="lg" />
            <div className="absolute -top-1 -right-1">
              <MedalBadge
                type={isTie ? 'gold' : isP1Gold ? 'gold' : 'silver'}
                size="sm"
              />
            </div>
          </div>
          <span className="mt-2 font-medium text-white">
            {player1Profile?.display_name ?? 'Player 1'}
          </span>
        </div>

        {/* Center label */}
        <div className="flex items-center justify-center">
          <span className="text-gray-500 font-display text-xl">Distances</span>
        </div>

        {/* Player 2 */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <PlayerAvatar profile={player2Profile} size="lg" />
            <div className="absolute -top-1 -right-1">
              <MedalBadge
                type={isTie ? 'gold' : !isP1Gold ? 'gold' : 'silver'}
                size="sm"
              />
            </div>
          </div>
          <span className="mt-2 font-medium text-white">
            {player2Profile?.display_name ?? 'Player 2'}
          </span>
        </div>
      </div>

      {/* Guesses comparison */}
      <div className="bg-navy-800/50 rounded-lg p-4 mb-4">
        {locationIdList.length > 0 ? (
          locationIdList.map((locationId) => {
            const p1Guess = p1Guesses.find(g => g.locationId === locationId)
            const p2Guess = p2Guesses.find(g => g.locationId === locationId)
            const locationName = p1Guess?.locationName || p2Guess?.locationName || 'Unknown'
            return (
              <GuessRow
                key={locationId}
                locationName={locationName}
                p1Guess={p1Guess}
                p2Guess={p2Guess}
              />
            )
          })
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-400">No detailed guess data available</p>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 mb-6 text-center">
        <div className="bg-navy-800/50 rounded-lg p-3">
          <div className="text-sm text-gray-500 mb-1">Average</div>
          <div className={`text-2xl font-bold ${
            p1AvgDistance <= p2AvgDistance ? 'text-green-400' : 'text-gray-400'
          }`}>
            {formatDistance(p1AvgDistance)}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Total: {formatDistance(p1TotalDistance)}
          </div>
        </div>

        <div className="flex items-center justify-center">
          <span className="text-gray-600 text-xl">vs</span>
        </div>

        <div className="bg-navy-800/50 rounded-lg p-3">
          <div className="text-sm text-gray-500 mb-1">Average</div>
          <div className={`text-2xl font-bold ${
            p2AvgDistance <= p1AvgDistance ? 'text-green-400' : 'text-gray-400'
          }`}>
            {formatDistance(p2AvgDistance)}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Total: {formatDistance(p2TotalDistance)}
          </div>
        </div>
      </div>

      {/* Winner announcement */}
      <div className="text-center mb-6">
        <p className="text-xl text-gray-300">
          {isTie ? (
            <>It's a tie! Both players earn gold.</>
          ) : (
            <>
              <span className="text-gold font-bold">
                {isP1Gold
                  ? player1Profile?.display_name
                  : player2Profile?.display_name}
              </span>{' '}
              wins the gold!
            </>
          )}
        </p>
      </div>

      {/* Continue button */}
      <button
        onClick={onContinue}
        className="w-full max-w-xs mx-auto px-8 py-4 bg-gold text-navy-950 font-bold text-lg rounded-lg hover:bg-gold-400 transition-colors flex items-center justify-center gap-2"
      >
        {isLastEvent ? 'View Final Results' : 'Continue to Next Event'}
        <span className="text-xl">{isLastEvent ? '🏆' : '→'}</span>
      </button>
    </div>
  )
}
