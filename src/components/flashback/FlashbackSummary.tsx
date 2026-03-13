import type { Profile } from '@/lib/database.types'
import type { MatchResult } from '@/events/types'
import type { PlacementResult } from '@/events/flashback/FlashbackGame'
import PlayerAvatar from '../shared/PlayerAvatar'
import MedalBadge from '../shared/MedalBadge'
import { getPuzzleById } from '@/events/flashback/puzzleData'

interface FlashbackSummaryProps {
  player1Profile: Profile | null
  player2Profile: Profile | null
  player1Result: MatchResult | null
  player2Result: MatchResult | null
  goldWinnerId: string | null
  player1Id: string
  onContinue: () => void
  isLastEvent?: boolean
}

function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function PlacementRow({
  p1Placement,
  p2Placement,
  eventIndex,
}: {
  p1Placement?: PlacementResult
  p2Placement?: PlacementResult
  eventIndex: number
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-4 py-2 border-b border-navy-700 last:border-b-0">
      {/* Player 1 placement */}
      <div className="flex items-center gap-2">
        {p1Placement ? (
          <>
            {p1Placement.isCorrect ? (
              <span className="text-green-400 text-lg">✓</span>
            ) : (
              <span className="text-red-400 text-lg">✗</span>
            )}
            <span className="text-gray-400 text-sm">
              {p1Placement.correctYear}
            </span>
          </>
        ) : (
          <span className="text-gray-600">—</span>
        )}
      </div>

      {/* Event description in the middle */}
      <div className="text-center px-4 max-w-xs">
        <span className="text-sm text-white">
          {p1Placement?.eventDescription || p2Placement?.eventDescription || `Event ${eventIndex + 1}`}
        </span>
      </div>

      {/* Player 2 placement */}
      <div className="flex items-center justify-end gap-2">
        {p2Placement ? (
          <>
            <span className="text-gray-400 text-sm">
              {p2Placement.correctYear}
            </span>
            {p2Placement.isCorrect ? (
              <span className="text-green-400 text-lg">✓</span>
            ) : (
              <span className="text-red-400 text-lg">✗</span>
            )}
          </>
        ) : (
          <span className="text-gray-600">—</span>
        )}
      </div>
    </div>
  )
}

export default function FlashbackSummary({
  player1Profile,
  player2Profile,
  player1Result,
  player2Result,
  goldWinnerId,
  player1Id,
  onContinue,
  isLastEvent = false,
}: FlashbackSummaryProps) {
  const isP1Gold = goldWinnerId === player1Id
  const isTie = goldWinnerId === null

  const p1Placements = (player1Result?.metadata?.placements as PlacementResult[]) || []
  const p2Placements = (player2Result?.metadata?.placements as PlacementResult[]) || []
  const p1Strikes = (player1Result?.metadata?.strikes as number) ?? 0
  const p2Strikes = (player2Result?.metadata?.strikes as number) ?? 0
  const p1Time = (player1Result?.metadata?.elapsedMs as number) ?? 0
  const p2Time = (player2Result?.metadata?.elapsedMs as number) ?? 0
  const puzzleId = (player1Result?.metadata?.puzzleId as string) || (player2Result?.metadata?.puzzleId as string)
  const puzzle = puzzleId ? getPuzzleById(puzzleId) : null

  // Build combined placements list (both players have same events)
  const maxPlacements = Math.max(p1Placements.length, p2Placements.length)

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <span className="text-5xl">⏰</span>
        <h2 className="mt-4 font-display text-3xl font-bold text-white">
          Flashback Results
        </h2>
        {puzzle && (
          <p className="text-gold text-lg mt-2">"{puzzle.theme}"</p>
        )}
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
          <span className="text-gray-500 font-display text-xl">Timeline</span>
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

      {/* Placements comparison */}
      <div className="bg-navy-800/50 rounded-lg p-4 mb-4">
        {Array.from({ length: maxPlacements }).map((_, index) => (
          <PlacementRow
            key={index}
            eventIndex={index}
            p1Placement={p1Placements[index]}
            p2Placement={p2Placements[index]}
          />
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 mb-6 text-center">
        <div className="bg-navy-800/50 rounded-lg p-3">
          <div className="text-sm text-gray-500 mb-1">Strikes</div>
          <div className={`text-2xl font-bold ${p1Strikes === 0 ? 'text-gold' : p1Strikes <= p2Strikes ? 'text-green-400' : 'text-red-400'}`}>
            {p1Strikes}
          </div>
          <div className="text-sm text-gray-500 mt-1">{formatTime(p1Time)}</div>
        </div>

        <div className="flex items-center justify-center">
          <span className="text-gray-600 text-xl">vs</span>
        </div>

        <div className="bg-navy-800/50 rounded-lg p-3">
          <div className="text-sm text-gray-500 mb-1">Strikes</div>
          <div className={`text-2xl font-bold ${p2Strikes === 0 ? 'text-gold' : p2Strikes <= p1Strikes ? 'text-green-400' : 'text-red-400'}`}>
            {p2Strikes}
          </div>
          <div className="text-sm text-gray-500 mt-1">{formatTime(p2Time)}</div>
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
