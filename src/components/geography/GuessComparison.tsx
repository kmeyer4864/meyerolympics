import { formatDistance } from '@/events/geography/locations'

interface GuessComparisonProps {
  myDistance: number
  opponentDistance: number
  locationName: string
  isLastLocation: boolean
  onNextLocation: () => void
}

export default function GuessComparison({
  myDistance,
  opponentDistance,
  locationName,
  isLastLocation,
  onNextLocation,
}: GuessComparisonProps) {
  const iWon = myDistance < opponentDistance
  const isTie = myDistance === opponentDistance
  const difference = Math.abs(myDistance - opponentDistance)

  return (
    <div className="mt-4 p-4 bg-navy-800 rounded-xl border border-navy-600 animate-fade-in">
      <div className="text-center mb-4">
        <p className="text-gray-400 text-sm mb-1">{locationName}</p>
        <p className="text-lg font-bold">
          {isTie ? (
            <span className="text-yellow-400">It's a tie!</span>
          ) : iWon ? (
            <span className="text-green-400">You were closer!</span>
          ) : (
            <span className="text-red-400">Opponent was closer</span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Your guess */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <div className="w-3 h-3 rounded-full bg-gold" />
            <span className="text-xs text-gray-400">You</span>
          </div>
          <p className={`text-xl font-bold ${
            myDistance < 500 ? 'text-green-400' :
            myDistance < 2000 ? 'text-yellow-400' :
            'text-red-400'
          }`}>
            {formatDistance(myDistance)}
          </p>
        </div>

        {/* Difference */}
        <div className="text-center flex flex-col justify-center">
          {!isTie && (
            <p className="text-sm text-gray-500">
              {iWon ? '-' : '+'}{formatDistance(difference)}
            </p>
          )}
        </div>

        {/* Opponent guess */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-xs text-gray-400">Opponent</span>
          </div>
          <p className={`text-xl font-bold ${
            opponentDistance < 500 ? 'text-green-400' :
            opponentDistance < 2000 ? 'text-yellow-400' :
            'text-red-400'
          }`}>
            {formatDistance(opponentDistance)}
          </p>
        </div>
      </div>

      <button
        onClick={onNextLocation}
        className="w-full px-6 py-3 bg-gold text-navy-900 font-bold rounded-lg hover:bg-gold/90 transition-colors"
      >
        {isLastLocation ? 'See Final Results' : 'Next Location'}
      </button>
    </div>
  )
}
