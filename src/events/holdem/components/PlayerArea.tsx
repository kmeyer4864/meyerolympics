import type { PlayerHandState } from '../types'
import { Card } from './Card'

interface PlayerAreaProps {
  playerState: PlayerHandState
  isOpponent: boolean
  isDealer: boolean
  isActing: boolean
  showCards: boolean
  playerName?: string
}

export function PlayerArea({
  playerState,
  isOpponent,
  isDealer,
  isActing,
  showCards,
  playerName = isOpponent ? 'Opponent' : 'You',
}: PlayerAreaProps) {
  const { holeCards, chips, currentBet, hasFolded, isAllIn } = playerState

  return (
    <div
      className={`
        relative
        p-4 rounded-xl
        ${isActing ? 'bg-gold/10 border-2 border-gold' : 'bg-navy-800/50 border border-navy-700'}
        ${hasFolded ? 'opacity-50' : ''}
        transition-all duration-300
      `}
    >
      {/* Dealer button */}
      {isDealer && (
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-white text-navy-900 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
          D
        </div>
      )}

      {/* Player name and chips */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`font-semibold ${isOpponent ? 'text-gray-300' : 'text-gold'}`}>
            {playerName}
          </span>
          {isActing && (
            <span className="animate-pulse text-gold text-sm">● Acting</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-yellow-500">🪙</span>
          <span className="font-mono font-bold text-white">{chips}</span>
        </div>
      </div>

      {/* Hole cards */}
      <div className="flex justify-center gap-2">
        {holeCards.length > 0 ? (
          <>
            <Card card={holeCards[0]} faceDown={isOpponent && !showCards} />
            <Card card={holeCards[1]} faceDown={isOpponent && !showCards} />
          </>
        ) : (
          <>
            <div className="w-14 h-20 border-2 border-dashed border-navy-600 rounded-lg" />
            <div className="w-14 h-20 border-2 border-dashed border-navy-600 rounded-lg" />
          </>
        )}
      </div>

      {/* Current bet */}
      {currentBet > 0 && (
        <div className="mt-3 text-center">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-navy-700 rounded-full text-sm">
            <span className="text-yellow-500">Bet:</span>
            <span className="font-mono font-bold text-white">{currentBet}</span>
          </span>
        </div>
      )}

      {/* Status indicators */}
      {(hasFolded || isAllIn) && (
        <div className="mt-2 text-center">
          {hasFolded && (
            <span className="text-red-400 font-semibold">FOLDED</span>
          )}
          {isAllIn && (
            <span className="text-gold font-semibold animate-pulse">ALL IN!</span>
          )}
        </div>
      )}
    </div>
  )
}
