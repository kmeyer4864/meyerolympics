import type { Card as CardType } from '../types'
import { rankToString, suitToSymbol } from '../engine'

interface CardProps {
  card?: CardType
  faceDown?: boolean
  small?: boolean
  highlighted?: boolean
}

export function Card({ card, faceDown = false, small = false, highlighted = false }: CardProps) {
  const sizeClasses = small
    ? 'w-10 h-14 text-sm'
    : 'w-14 h-20 text-lg'

  if (faceDown || !card) {
    return (
      <div
        className={`
          ${sizeClasses}
          bg-gradient-to-br from-navy-600 to-navy-800
          border-2 border-navy-500
          rounded-lg
          flex items-center justify-center
          shadow-md
        `}
      >
        <div className="text-navy-400 text-2xl">🂠</div>
      </div>
    )
  }

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds'
  const colorClass = isRed ? 'text-red-500' : 'text-white'
  const symbol = suitToSymbol(card.suit)
  const rank = rankToString(card.rank)

  return (
    <div
      className={`
        ${sizeClasses}
        bg-white
        border-2 ${highlighted ? 'border-gold' : 'border-gray-300'}
        rounded-lg
        flex flex-col items-center justify-between
        p-1
        shadow-md
        ${highlighted ? 'ring-2 ring-gold ring-opacity-50' : ''}
        transition-all duration-200
      `}
    >
      <div className={`${colorClass} font-bold self-start leading-none`}>
        {rank}
        <span className="block text-xs">{symbol}</span>
      </div>
      <div className={`${colorClass} text-2xl`}>
        {symbol}
      </div>
      <div className={`${colorClass} font-bold self-end leading-none rotate-180`}>
        {rank}
        <span className="block text-xs">{symbol}</span>
      </div>
    </div>
  )
}

interface CardStackProps {
  cards: CardType[]
  faceDown?: boolean
  small?: boolean
  highlightIndices?: number[]
}

export function CardStack({ cards, faceDown = false, small = false, highlightIndices = [] }: CardStackProps) {
  return (
    <div className="flex gap-2">
      {cards.map((card, index) => (
        <Card
          key={`${card.suit}-${card.rank}`}
          card={card}
          faceDown={faceDown}
          small={small}
          highlighted={highlightIndices.includes(index)}
        />
      ))}
    </div>
  )
}
