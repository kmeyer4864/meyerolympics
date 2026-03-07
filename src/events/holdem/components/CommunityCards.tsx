import type { Card as CardType, BettingRound } from '../types'
import { Card } from './Card'

interface CommunityCardsProps {
  cards: CardType[]
  pot: number
  currentRound: BettingRound
}

export function CommunityCards({ cards, pot, currentRound }: CommunityCardsProps) {
  const roundLabels: Record<BettingRound, string> = {
    preflop: 'Pre-flop',
    flop: 'Flop',
    turn: 'Turn',
    river: 'River',
    showdown: 'Showdown',
  }

  // Create placeholder slots for all 5 community cards
  const cardSlots = Array(5).fill(null).map((_, i) => cards[i] || null)

  return (
    <div className="flex flex-col items-center">
      {/* Round indicator */}
      <div className="mb-2 text-sm text-gray-400 uppercase tracking-wider">
        {roundLabels[currentRound]}
      </div>

      {/* Community cards */}
      <div className="flex gap-2 mb-4">
        {cardSlots.map((card, index) => (
          <div
            key={index}
            className={`
              transition-all duration-300
              ${index < cards.length ? 'scale-100 opacity-100' : 'scale-95 opacity-40'}
            `}
          >
            {card ? (
              <Card card={card} />
            ) : (
              <div className="w-14 h-20 border-2 border-dashed border-navy-600 rounded-lg flex items-center justify-center">
                <span className="text-navy-600 text-xs">
                  {index < 3 ? 'Flop' : index === 3 ? 'Turn' : 'River'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pot display */}
      <div className="flex items-center gap-2 px-6 py-2 bg-navy-800 rounded-full border border-navy-600">
        <span className="text-gray-400">Pot:</span>
        <span className="text-yellow-500 text-xl">🪙</span>
        <span className="font-mono font-bold text-2xl text-white">{pot}</span>
      </div>
    </div>
  )
}
