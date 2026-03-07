interface MedalBadgeProps {
  type: 'gold' | 'silver' | 'bronze'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  count?: number
  className?: string
}

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-lg',
}

const medalStyles = {
  gold: {
    gradient: 'from-yellow-300 via-yellow-400 to-yellow-600',
    shadow: 'shadow-yellow-500/40',
    text: 'Gold',
  },
  silver: {
    gradient: 'from-gray-200 via-gray-300 to-gray-400',
    shadow: 'shadow-gray-400/40',
    text: 'Silver',
  },
  bronze: {
    gradient: 'from-orange-300 via-orange-400 to-orange-600',
    shadow: 'shadow-orange-500/40',
    text: 'Bronze',
  },
}

export default function MedalBadge({
  type,
  size = 'md',
  showLabel = false,
  count,
  className = '',
}: MedalBadgeProps) {
  const style = medalStyles[type]

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <div className="relative">
        <div
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${style.gradient} shadow-lg ${style.shadow} flex items-center justify-center font-bold text-navy-900 animate-shine`}
        >
          {count !== undefined ? count : type === 'gold' ? '1' : type === 'silver' ? '2' : '3'}
        </div>
        {/* Shine effect overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/30 to-transparent pointer-events-none" />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-gray-400">{style.text}</span>
      )}
    </div>
  )
}

// Medal count display component
interface MedalCountProps {
  golds: number
  silvers: number
  className?: string
}

export function MedalCount({ golds, silvers, className = '' }: MedalCountProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex items-center gap-1.5">
        <MedalBadge type="gold" size="sm" />
        <span className="text-lg font-bold text-gold">{golds}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <MedalBadge type="silver" size="sm" />
        <span className="text-lg font-bold text-silver">{silvers}</span>
      </div>
    </div>
  )
}
