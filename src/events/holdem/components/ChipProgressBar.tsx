import { WIN_THRESHOLD, STARTING_CHIPS } from '../types'

interface ChipProgressBarProps {
  player1Chips: number
  player2Chips: number
  amIPlayer1: boolean
}

export function ChipProgressBar({ player1Chips, player2Chips, amIPlayer1 }: ChipProgressBarProps) {
  const totalChips = STARTING_CHIPS * 2 // 2000 total
  const myChips = amIPlayer1 ? player1Chips : player2Chips
  const theirChips = amIPlayer1 ? player2Chips : player1Chips

  // Calculate percentages
  const myPercentage = (myChips / totalChips) * 100
  const theirPercentage = (theirChips / totalChips) * 100
  const winThresholdPercentage = (WIN_THRESHOLD / totalChips) * 100 // 80%

  // Determine who's winning
  const myWinProgress = myChips / WIN_THRESHOLD // 0 to 1+ (>1 means won)

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Labels */}
      <div className="flex justify-between text-sm mb-1">
        <div className="flex items-center gap-2">
          <span className="text-gold font-semibold">You</span>
          <span className="text-gray-400">🪙 {myChips}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">🪙 {theirChips}</span>
          <span className="text-gray-300 font-semibold">Opponent</span>
        </div>
      </div>

      {/* Progress bar container */}
      <div className="relative h-6 bg-navy-800 rounded-full overflow-hidden border border-navy-600">
        {/* My progress (from left) */}
        <div
          className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-gold to-yellow-500 transition-all duration-500"
          style={{ width: `${myPercentage}%` }}
        />

        {/* Opponent progress (from right) */}
        <div
          className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-gray-500 to-gray-400 transition-all duration-500"
          style={{ width: `${theirPercentage}%` }}
        />

        {/* Center divider */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-navy-600 transform -translate-x-1/2 z-10" />

        {/* 80% threshold markers */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-green-500 z-20"
          style={{ left: `${winThresholdPercentage}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-green-500 z-20"
          style={{ right: `${winThresholdPercentage}%` }}
        />
      </div>

      {/* Win threshold indicator */}
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{WIN_THRESHOLD} to win</span>
        <span>{WIN_THRESHOLD} to win</span>
      </div>

      {/* Progress towards win */}
      <div className="flex justify-center gap-4 mt-2 text-sm">
        <div className={`${myWinProgress >= 1 ? 'text-green-400' : 'text-gray-400'}`}>
          You: {Math.min(100, Math.round(myWinProgress * 100))}% to victory
        </div>
      </div>
    </div>
  )
}
