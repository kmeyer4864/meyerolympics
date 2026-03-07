import type { Profile } from '@/lib/database.types'

interface PlayerAvatarProps {
  profile: Profile | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showName?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-lg',
  lg: 'w-16 h-16 text-2xl',
  xl: 'w-24 h-24 text-4xl',
}

export default function PlayerAvatar({
  profile,
  size = 'md',
  showName = false,
  className = '',
}: PlayerAvatarProps) {
  const initials = profile?.display_name
    ? profile.display_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {profile?.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt={profile.display_name}
          className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-gold/50`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center font-semibold text-white ring-2 ring-gold/50`}
        >
          {initials}
        </div>
      )}
      {showName && profile && (
        <span className="text-sm font-medium text-gray-300 truncate max-w-[120px]">
          {profile.display_name}
        </span>
      )}
    </div>
  )
}
